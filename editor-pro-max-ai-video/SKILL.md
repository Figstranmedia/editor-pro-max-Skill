---
name: editor-pro-max-ai-video
description: >
  Hybrid AI video — sub-skill of editor-pro-max. Replicate generates the motion segments
  (max 3, the expensive part); project stills fill the gaps with Ken Burns; a TransitionSeries
  stitches everything with crossfades/slides ("effects between videos"); brand chrome
  (watermark, captions, golden line, bottom tag) sits on top. Reuses same-day segments to
  save API cost. Renders to a top-level "reels IA-<date>/" folder in the project.
  Invoked by the editor-pro-max master after brand analysis and routing.
  Triggers: "generate with AI", "make footage from scratch", Replicate, text-to-video,
  AI video, cinematic background from a prompt, hybrid AI + stills montage.
---

# Editor Pro Max — AI Video (Hybrid)

**Replicate produces the segments; Editor Pro Max edits them.** This flow generates **up to 3**
short video segments with Replicate (the costly part), interleaves them with **project stills**
animated by Ken Burns (free, already in the project), and assembles the whole thing with a
`TransitionSeries` — the transitions are your "effects between videos". Brand chrome goes on top.

Invoked by the **`editor-pro-max`** master, which has already loaded `videos/brand.json` and
confirmed the request (topic, format, duration). Shared conventions (safe zones, codec rule,
chunk render, report format) live in the master — reference them.

**Prerequisite check:**
```bash
# Load token from project .env.local if not already in environment
[ -z "$REPLICATE_API_TOKEN" ] && [ -f "videos/.env.local" ] && source videos/.env.local
[ -z "$REPLICATE_API_TOKEN" ] && [ -f ".env.local" ] && source .env.local

[ -n "$REPLICATE_API_TOKEN" ] && echo "Token OK" || echo "ERROR: REPLICATE_API_TOKEN not set — create videos/.env.local with REPLICATE_API_TOKEN=<token>"
ffmpeg -version > /dev/null 2>&1 && echo "ffmpeg OK" || echo "ERROR: ffmpeg not found — brew install ffmpeg"
```

**Engine rule (non-negotiable):** Remotion is the editor. ffmpeg is only a codec conversion
utility — it converts Replicate's `.mp4` output to VP9/WebM so Chromium can read it, and
concatenates rendered chunks. **Never use ffmpeg for compositing, text, captions, watermarks,
or any visual effect** — that is the shortcut this skill is explicitly designed to prevent.
All visual assembly happens in Remotion TSX.

Target timeline (vertical reel, ~30s):
```
[Video seg 1] →xfade→ [Still + Ken Burns] →xfade→
[Video seg 2] →xfade→ [Still + Ken Burns] →xfade→
[Video seg 3] →xfade→ [Still + Ken Burns]
```
6 visual blocks, **only 3 Replicate generations**.

---

## Phase 1 — Plan the segments and build the prompts

```bash
cat videos/brand.json | jq '{colors: .brand.colors, tone: .brand.tone, images: .assets.images}'
```

Break the topic into a short visual arc of **at most 3 motion segments** (one prompt each).
Each prompt is a cinematic shot built from brand identity:
- Visual style: colors, tone, aesthetic from `brand.json`
- Motion: slow cinematic pan, atmospheric — **no text in frame**
- Aspect ratio: `9:16` for reels, `16:9` for horizontal
- Duration: 5–6s per segment (typical model output)

Example arc (dark spiritual palette, 3 segments):
```
1. Slow drift through deep space nebula, dark cosmic background #020408, golden
   particle light #c9a84c, ethereal, no text, photorealistic, 8K
2. Light forming into a luminous human silhouette, golden glow #c9a84c on near-black,
   slow reveal, no text, cinematic
3. Golden light expanding to fill the frame, soft particles, transcendent, no text, 8K
```

Decide how many stills you'll interleave (usually segments − 1, or one per segment for a
6-block montage) and note which `assets.images` you'll use (Phase 4.5).

---

## Phase 2 — Reuse check (before spending API budget)

```bash
ls videos/public/generated/ 2>/dev/null
```
For each planned segment, if `<topic>-seg<N>-YYYYMMDD.webm` already exists, reuse it and skip
that generation. Only generate the segments that are missing.

---

## Phase 3 — Generate each segment via Replicate (one call per segment)

Run this **once per segment** (N = 1, 2, 3). Do NOT parallelize — each call polls to completion.

```bash
N=1                                  # ← segment index
PROMPT="<brand-aligned prompt for segment N>"

PREDICTION=$(curl -s -X POST \
  https://api.replicate.com/v1/models/minimax/video-01/predictions \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"input\": {\"prompt\": \"$PROMPT\", \"duration\": 6}}")

PREDICTION_URL=$(echo "$PREDICTION" | jq -r '.urls.get')

while true; do
  STATUS=$(curl -s -H "Authorization: Bearer $REPLICATE_API_TOKEN" "$PREDICTION_URL")
  STATE=$(echo "$STATUS" | jq -r '.status')
  echo "Segment $N: $STATE"
  if [ "$STATE" = "succeeded" ]; then OUTPUT_URL=$(echo "$STATUS" | jq -r '.output'); break;
  elif [ "$STATE" = "failed" ]; then echo "Segment $N failed"; exit 1; fi
  sleep 5
done
# Persist URL — Phase 4 runs in a separate bash call and cannot read this variable
echo "$OUTPUT_URL" > "/tmp/replicate_seg_${N}.txt"
echo "Segment $N URL saved"
```

**Alternative models** (same polling pattern):
- `wan-video/wan2.1-t2v-480p` — fast, abstract/atmospheric, cheaper
- `kwaivgi/kling-v1-5-pro` — high quality, slower
- `stability-ai/stable-video-diffusion` — image-to-video (pass a reference image)

---

## Phase 4 — Download + convert each segment to VP9/WebM

The Replicate URL expires in 24–48h — download immediately. Run **once per segment**:

```bash
N=1
TOPIC="<topic-slug>"
DATE=$(date +%Y%m%d)
OUTPUT_URL=$(cat "/tmp/replicate_seg_${N}.txt")
curl -L "$OUTPUT_URL" -o "videos/public/generated/${TOPIC}-seg${N}-${DATE}.mp4"

# VP9/WebM is mandatory (master codec rule). 9:16 vertical:
ffmpeg -i "videos/public/generated/${TOPIC}-seg${N}-${DATE}.mp4" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" \
  -c:v libvpx-vp9 -crf 40 -b:v 0 -cpu-used 8 -row-mt 1 -threads 4 \
  -c:a libopus -b:a 96k \
  "videos/public/generated/${TOPIC}-seg${N}-${DATE}.webm" -y
```

For **16:9 horizontal**, swap the filter to `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080`.
Record each `.webm` under `brand.json → assets.generated`.

---

## Phase 4.5 — Select project stills to interleave

```bash
cat videos/brand.json | jq -r '.assets.images[]'
```

Pick the stills that match the topic (one per gap between segments). Copy them where the
composition can read them:
```bash
mkdir -p videos/public/assets
cp <path/to/still.jpg> videos/public/assets/
```
If there aren't enough project stills, you may generate a still image via Replicate
(`black-forest-labs/flux-schnell`, `aspect_ratio: 9:16`) — **ask the user first**, same as
the brand-video flow. Otherwise reduce the number of interleaved stills.

---

## Phase 5 — Build the hybrid composition (TransitionSeries)

Write `videos/compositions/<TopicSlug>.tsx`. **ID must use camelCase or hyphens — no underscores.**
Alternate generated video segments and Ken Burns stills inside a `TransitionSeries`. The
transitions are the "effects between videos".

```tsx
import {
  AbsoluteFill, Img, Video, staticFile,
  useCurrentFrame, useVideoConfig, interpolate,
} from "remotion";
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";

// All visual values come from brand.json — no magic numbers inline.
const C = { bg: "#020408", primary: "#c9a84c", silver: "#b8c0cc" };
const XFADE = 18;                         // transition length in frames
const SEG = 150;                          // ~5s video segment @30fps
const STILL = 120;                        // ~4s still @30fps

// Ken Burns still: slow zoom + pan, length-aware
const KenBurns: React.FC<{src: string; dur: number}> = ({src, dur}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, dur], [1, 1.12], {extrapolateRight: "clamp"});
  const x = interpolate(frame, [0, dur], [0, -40], {extrapolateRight: "clamp"});
  return (
    <Img src={src} style={{width: "100%", height: "100%", objectFit: "cover",
      transform: `scale(${scale}) translateX(${x}px)`}} />
  );
};

export const HybridReel: React.FC = () => {
  const fadeT = {presentation: fade(), timing: linearTiming({durationInFrames: XFADE})};
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      {/* Background: video segments interleaved with stills, crossfaded */}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SEG}>
          <Video src={staticFile("generated/topic-seg1-YYYYMMDD.webm")}
            style={{width: "100%", height: "100%", objectFit: "cover"}} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...fadeT} />
        <TransitionSeries.Sequence durationInFrames={STILL}>
          <KenBurns src={staticFile("assets/still1.jpg")} dur={STILL} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...fadeT} />
        <TransitionSeries.Sequence durationInFrames={SEG}>
          <Video src={staticFile("generated/topic-seg2-YYYYMMDD.webm")}
            style={{width: "100%", height: "100%", objectFit: "cover"}} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...fadeT} />
        <TransitionSeries.Sequence durationInFrames={STILL}>
          <KenBurns src={staticFile("assets/still2.jpg")} dur={STILL} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...fadeT} />
        <TransitionSeries.Sequence durationInFrames={SEG}>
          <Video src={staticFile("generated/topic-seg3-YYYYMMDD.webm")}
            style={{width: "100%", height: "100%", objectFit: "cover"}} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Brand chrome goes here — see Phase 6 (overlays sit above the TransitionSeries) */}
    </AbsoluteFill>
  );
};
```

**Register in Root.tsx** (master's shared conventions show the full pattern):
```tsx
// videos/src/Root.tsx
import { HybridReel } from "../compositions/HybridReel";
<Composition id="HybridReel" component={HybridReel}
  durationInFrames={618} fps={30} width={1080} height={1920} />
```
`durationInFrames` must match the calculated total below.

**Total duration** = sum of every `Sequence` minus `(transitions × XFADE)`.
Example above: `3×150 + 2×120 − 4×18 = 618` frames ≈ 20.6s. Use this for `durationInFrames`
in Root.tsx. Other transitions: `slide()`, `wipe()` from `@remotion/transitions/slide|wipe`.

---

## Phase 6 — Apply brand chrome from reel_style

Overlay the same chrome as the youtube-reel flow, as `AbsoluteFill` layers **above** the
`TransitionSeries`. Read `brand.json → reel_style`: watermark (`watermark_text` / `_font` /
`_color` / `_position_top_px`), `golden_line`, `bottom_tag`, `progress_bar` (omit if false),
and captions.

Captions: **karaoke** if there's a voiceover with word timings; otherwise an **inline `<div>`
caption per segment** (one short phrase, `brand.typography.body`, white with soft shadow,
fade/slideUp via `interpolate(frame, [0, 15], [0, 1])`). Do NOT import a CaptionBlock component
— implement inline. All elements respect the master's safe zones (top 260 / bottom 420 / right 120).

---

## Phase 7 — Render in chunks → "reels IA-<date>/"

Follow the master's chunked rendering (120 frames per bash call). **Output for this flow is a
top-level `reels IA-<date>/` folder** (not `videos/out/`), so generated reels are easy to find.
The space in the folder name means **every path must be quoted**.

```bash
# Run from the project root — OUT is relative to CWD
DATE=$(date +%Y-%m-%d)
TOPIC="<topic-slug>"            # slug: lowercase, hyphens, no spaces
OUT="reels IA-$DATE"           # ← top-level in the project root
mkdir -p "$OUT" videos/chunks
```

**External project mode:** if the master routed to an external project, prefix with its
absolute path — `OUT="$PROJECT_PATH/reels IA-$DATE"` — and render with `--overwrite` against
that absolute destination. Create the folder before concatenating.

Render the chunks into `videos/chunks/` (one bash call each), then concatenate into `"$OUT"`:

```bash
ls videos/chunks/chunk_*.mp4 | sort -V | sed "s/^/file '/" | sed "s/$/'/" > /tmp/chunks.txt
ffmpeg -f concat -safe 0 -i /tmp/chunks.txt -c copy "$OUT/$TOPIC.mp4" -y
rm -rf videos/chunks/
```

Report with the master's format, quoting the final path: `"reels IA-<date>/<topic>.mp4"`.

---

## Phase 8 — Persist approved settings

After approval, write validated adjustments back to `videos/brand.json → reel_style` and
update `lastUpdated`. Generated segments stay in `videos/public/generated/` for reuse
(`<topic>-seg<N>-YYYYMMDD.webm`), so a re-run the same day spends no API budget.
