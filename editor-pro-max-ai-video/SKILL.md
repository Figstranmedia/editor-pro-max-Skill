---
name: editor-pro-max-ai-video
description: >
  AI-generated video — sub-skill of editor-pro-max. Builds a brand-aligned prompt, generates
  motion footage via Replicate (minimax/video-01 or equivalent), downloads it to
  videos/public/generated/, and composites brand chrome on top. Reuses a same-day clip for
  the same topic to save API cost. Renders to videos/out/YYYY-MM-DD/.
  Invoked by the editor-pro-max master after brand analysis and routing.
  Triggers: "generate with AI", "make footage from scratch", Replicate, text-to-video,
  AI video, cinematic background from a prompt.
---

# Editor Pro Max — AI Video

Generate footage with AI, then build a reel from it. Invoked by the **`editor-pro-max`**
master, which has already loaded `videos/brand.json` and confirmed the request (topic,
format, duration). Shared conventions (safe zones, codec rule, chunk render, report format)
live in the master — reference them.

**Prerequisite:** `REPLICATE_API_TOKEN` in the environment (`.env.local`).

---

## Phase 1 — Build the generation prompt from brand.json

```bash
cat videos/brand.json | jq '{colors: .brand.colors, tone: .brand.tone}'
```

Compose a cinematic prompt from brand identity:
- Visual style: colors, tone, aesthetic from `brand.json`
- Motion: slow cinematic pan, atmospheric — **no text in frame**
- Aspect ratio: 9:16 for reels, 16:9 for horizontal
- Duration: 5–10s (typical model output)

Example (dark spiritual palette):
```
Slow cinematic drift through deep space nebula, dark cosmic background #020408,
golden particle light #c9a84c, ethereal atmosphere, no text, photorealistic, 8K
```

---

## Phase 2 — Reuse check (before spending API budget)

```bash
ls videos/public/generated/ 2>/dev/null
```
If a clip for the same topic + same day exists (`<topic>-YYYYMMDD.*`), reuse it and skip
generation. Otherwise continue.

---

## Phase 3 — Generate via Replicate

```bash
PREDICTION=$(curl -s -X POST \
  https://api.replicate.com/v1/models/minimax/video-01/predictions \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"input\": {\"prompt\": \"<brand-aligned prompt>\", \"duration\": 6}}")

PREDICTION_URL=$(echo $PREDICTION | jq -r '.urls.get')

while true; do
  STATUS=$(curl -s -H "Authorization: Bearer $REPLICATE_API_TOKEN" "$PREDICTION_URL")
  STATE=$(echo $STATUS | jq -r '.status')
  echo "Status: $STATE"
  if [ "$STATE" = "succeeded" ]; then OUTPUT_URL=$(echo $STATUS | jq -r '.output'); break;
  elif [ "$STATE" = "failed" ]; then echo "Generation failed"; exit 1; fi
  sleep 5
done
# Persist URL — Phase 4 runs in a separate bash call and cannot read this variable
echo "$OUTPUT_URL" > /tmp/replicate_output_url.txt
echo "URL saved for Phase 4"
```

**Alternative models** (same polling pattern):
- `wan-video/wan2.1-t2v-480p` — fast, abstract/atmospheric
- `kwaivgi/kling-v1-5-pro` — high quality, slower
- `stability-ai/stable-video-diffusion` — image-to-video (pass a reference image)

---

## Phase 4 — Download (never use the URL directly — it expires in 24–48h)

```bash
OUTPUT_URL=$(cat /tmp/replicate_output_url.txt)
TOPIC="<topic-slug>"
DATE=$(date +%Y%m%d)
curl -L "$OUTPUT_URL" -o "videos/public/generated/${TOPIC}-${DATE}.mp4"
```

**Convert to VP9/WebM** before compositing (master codec rule):
```bash
ffmpeg -i "videos/public/generated/${TOPIC}-${DATE}.mp4" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" \
  -c:v libvpx-vp9 -deadline realtime -cpu-used 8 -b:v 1500k \
  -c:a libvorbis -q:a 4 "videos/public/generated/${TOPIC}-${DATE}.webm"
```
Record the new file under `brand.json → assets.generated`.

---

## Phase 5 — Build the composition

Write `videos/compositions/<TopicSlug>.tsx` with the generated clip as the base layer:

```tsx
<Video src={staticFile("generated/<topic>-<YYYYMMDD>.webm")}
  style={{width: "100%", height: "100%", objectFit: "cover"}} />
```

A short generated clip is usually looped or slowed to cover the full reel duration
(set `playbackRate` < 1 or repeat via sequences).

---

## Phase 6 — Apply brand chrome from reel_style

Same overlay components as the other flows — read `brand.json → reel_style`: watermark,
`golden_line`, `bottom_tag`, captions (karaoke if there's a voiceover with word timings,
otherwise static CaptionBlock). Respect the master's safe zones (top 260 / bottom 420 / right 120).

---

## Phase 7 — Render in chunks → videos/out/YYYY-MM-DD/

Follow the master's chunked rendering (120 frames per bash call), concatenate, clean up,
and report with the master's format.

---

## Phase 8 — Persist approved settings

After approval, write validated adjustments back to `videos/brand.json → reel_style` and
update `lastUpdated`. The generated clip stays in `videos/public/generated/` for reuse.
