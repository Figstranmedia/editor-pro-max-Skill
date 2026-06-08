---
name: editor-pro-max-brand-video
description: >
  Brand video from own assets — sub-skill of editor-pro-max. Builds a video from images,
  footage, or audio that already live in the user's project. Uses Ken Burns for stills,
  Video component for footage, and applies brand chrome from videos/brand.json (watermark, golden
  line, bottom tag, static caption blocks). Renders to videos/out/YYYY-MM-DD/.
  Invoked by the editor-pro-max master after brand analysis and routing.
  Triggers: "use my images", "from my footage", testimonial, presentation, slideshow,
  project assets, brand video.
---

# Editor Pro Max — Brand Video

Build a video from assets that already exist in the project. Invoked by the
**`editor-pro-max`** master, which has already loaded `videos/brand.json` and confirmed the
request (topic, format, duration). Shared conventions (safe zones, codec rule, chunk render,
report format) live in the master — reference them.

---

## Phase 1 — Scan available assets

```bash
find . \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | grep -v node_modules
find . \( -name "*.mp4" -o -name "*.mov" \) | grep -v node_modules
find . \( -name "*.mp3" -o -name "*.wav" \) | grep -v node_modules
```

Cross-reference with `brand.json → assets` (images / footage / generated).

---

## Phase 2 — Select assets for the topic

Pick the stills/footage that match the confirmed topic. Copy what you need into the
working folder:

```bash
mkdir -p videos/public/assets
cp <path/to/asset> videos/public/assets/
```

**Footage must be VP9/WebM** before compositing (master codec rule). Convert any `.mp4`:
```bash
ffmpeg -i "videos/public/assets/clip.mp4" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" \
  -c:v libvpx-vp9 -deadline realtime -cpu-used 8 -b:v 1500k \
  -c:a libvorbis -q:a 4 "videos/public/assets/clip.webm"
```

---

## Phase 3 — Fill gaps with Replicate (ask first)

If the topic needs a visual that doesn't exist in the project, **ask the user** before
generating. With approval, generate a still via Replicate (`REPLICATE_API_TOKEN` required):

```bash
curl -s -X POST https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"input":{"prompt":"<brand-aligned description>","aspect_ratio":"9:16","output_format":"jpg"}}' \
  | jq -r '.urls.get'
# Poll until status = "succeeded", download the image into videos/public/assets/
```
Build the prompt from `brand.json` colors, tone, and visual style.

---

## Phase 4 — Build the composition

Write `videos/compositions/<TopicSlug>.tsx`.

- **Still images →** Ken Burns (animated zoom + pan with `interpolate` on `useCurrentFrame()`).
- **Footage →** `<Video src={staticFile("assets/clip.webm")} objectFit="cover" />`.
- **Multiple scenes →** sequence them with `<Sequence from=… durationInFrames=…>`.

Ken Burns pattern (still):
```tsx
const frame = useCurrentFrame();
const scale = interpolate(frame, [0, durationInFrames], [1, 1.12], {extrapolateRight: "clamp"});
const x = interpolate(frame, [0, durationInFrames], [0, -40], {extrapolateRight: "clamp"});
<Img src={staticFile("assets/photo.jpg")}
  style={{width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${scale}) translateX(${x}px)`}} />
```

---

## Phase 5 — Apply brand chrome from reel_style

Same overlay components as the youtube-reel flow, with **one difference**: captions are
**inline `<div>` text per scene** (no word-level timing), not karaoke word-highlighting.
Read `brand.json → reel_style` for:

- watermark (`watermark_text` / `watermark_font` / `watermark_color` / `watermark_position_top_px`)
- `golden_line` (gold gradient line) and `bottom_tag` (uppercase spaced thematic label)
- `progress_bar` (omit if false)

Inline caption div: one line or short phrase per scene, font from `brand.typography.body`,
white with a soft shadow, positioned at `subtitle_position_bottom_px`, fade/slideUp via
`interpolate(frame, [0, 15], [0, 1])`. Do NOT import or reference a CaptionBlock component
— implement inline with a `<div>` and Remotion's `interpolate`.
All elements respect the master's safe zones (top 260 / bottom 420 / right 120).

---

## Phase 6 — Render in chunks → videos/out/YYYY-MM-DD/

Follow the master's chunked rendering (120 frames per bash call), concatenate, clean up,
and report with the master's format.

---

## Phase 7 — Persist approved settings

After approval, write any validated adjustments back to `videos/brand.json → reel_style`
and update `lastUpdated`. Next session starts from the approved look.
