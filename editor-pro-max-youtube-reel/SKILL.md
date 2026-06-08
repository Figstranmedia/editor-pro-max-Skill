---
name: editor-pro-max-youtube-reel
description: >
  YouTube → vertical Reel sub-skill of editor-pro-max. Downloads a YouTube video, cuts the
  relevant segment, converts to 1080×1920 VP9/WebM (center crop), pulls word-level captions
  from YouTube JSON3 (Whisper fallback), and builds a brand-styled karaoke reel from
  videos/brand.json → reel_style. Renders to videos/out/YYYY-MM-DD/.
  Invoked by the editor-pro-max master after brand analysis and routing.
  Triggers: YouTube URL, youtu.be, "make a reel from this video", "extract a short", reel, clip.
---

# Editor Pro Max — YouTube Reel

Full YouTube → Reel flow. Invoked by the **`editor-pro-max`** master, which has already:
- loaded `videos/brand.json` (including `reel_style`)
- confirmed the request: topic, format (1080×1920), approximate duration

Run the phases below in order. Shared conventions (safe zones, codec rule, chunk render,
report format) live in the master skill — reference them, don't redefine them.

**Prerequisites:** `yt-dlp --version` and `ffmpeg -version` must succeed.
If missing: `brew install yt-dlp ffmpeg`.

---

## Phase 1 — Download the video

```bash
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" \
  --merge-output-format mp4 \
  -o "videos/public/assets/source.mp4" "<youtube-url>"
```

If `videos/public/assets/source.mp4` already exists, skip the download (delete to refetch).

---

## Phase 2 — Suggest relevant segments

**If the user already gave timestamps** (e.g. "from 2:10 to 2:40"), skip this phase and
use their values.

**Otherwise**, inspect the transcript to propose segments. Pull captions first (Phase 4),
read the text, and suggest 1–3 self-contained moments (clear topic, starts on a hook, ends
on a complete thought, 15–45s each). Present them to the user and let them pick before cutting.

---

## Phase 3 — Cut the segment and convert to reel format (VP9/WebM)

Check orientation first:
```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
  -of csv=p=0 "videos/public/assets/source.mp4"
```

**VP9 at 1080×1920 runs at ~0.75× real-time in the sandbox (45s limit).** Always split into
14.5s blocks and concat — never encode the full clip in a single call.

**Landscape (16:9) → vertical 9:16 (center crop + sub-segment per block):**

For a standard 1920×1080 source: `crop=608:1080:656:0` (crop_w=608=1080×9/16, x=656=(1920-608)/2).
For other resolutions use `crop=ih*9/16:ih` (ffmpeg auto-centers).

```bash
# One call per 14.5s block. Replace START, BLOCK_START, N.
# BLOCK_START = START + (block_index * 14.5)
ffmpeg -ss <BLOCK_START> -t 14.5 -i "videos/public/assets/source.mp4" \
  -vf "crop=608:1080:656:0,scale=1080:1920" \
  -c:v libvpx-vp9 -crf 40 -b:v 0 -cpu-used 8 -row-mt 1 -threads 4 \
  -c:a libopus -b:a 96k \
  "videos/public/assets/seg_<N>_block_<B>.webm" -y
```

After all blocks are done, concat losslessly:
```bash
ls videos/public/assets/seg_<N>_block_*.webm | sort -V \
  | sed "s/^/file '/" | sed "s/$/'/" > /tmp/seg_blocks.txt
ffmpeg -f concat -safe 0 -i /tmp/seg_blocks.txt -c copy \
  "videos/public/assets/segment_<N>.webm" -y
rm videos/public/assets/seg_<N>_block_*.webm
```

**If the input is already vertical** (height > width), skip the crop — only scale:
```bash
ffmpeg -ss <BLOCK_START> -t 14.5 -i "videos/public/assets/source.mp4" \
  -vf "scale=1080:1920" \
  -c:v libvpx-vp9 -crf 40 -b:v 0 -cpu-used 8 -row-mt 1 -threads 4 \
  -c:a libopus -b:a 96k \
  "videos/public/assets/seg_<N>_block_<B>.webm" -y
```

The final `segment_<N>.webm` is one seamless clip. In the composition `<Video>` starts at frame 0 — no trimming needed.

---

## Phase 4 — Word-level captions (JSON3 preferred, Whisper fallback)

YouTube auto-captions carry accurate word timestamps and cost no compute. Try them first:

```bash
yt-dlp --write-auto-sub --sub-lang es --sub-format json3 --skip-download \
  -o "videos/public/assets/captions" "<youtube-url>"
# → videos/public/assets/captions.es.json3   (if available)
```

**Parse JSON3 → words.** Each `events[]` has `tStartMs`; each `events[].segs[]` has
`{utf8, tOffsetMs}`. Build a flat word array with absolute time in seconds:

```
for each event in events:
  for each seg in event.segs (skip segs whose utf8 is whitespace/newline):
    word = seg.utf8
    t = (event.tStartMs + (seg.tOffsetMs || 0)) / 1000   // seconds, absolute
```

Then **re-base to the segment**: subtract `START` from every word time so the first word of
the clip sits near t=0. Keep only words within `[START, END]`. Write the result to
`videos/public/captions.json` as `[{text, startMs, endMs}]` (or as `{word, startFrame, endFrame}`
at 30fps — match whatever the composition reads).

Example: if `START=28.70` and JSON3 shows "Vivimos" at `t=28.72s` absolute →
`t_relative = 28.72 - 28.70 = 0.02s` → frame 0 in the composition.
**Always verify the first and last word after re-basing** to confirm the offset is correct
before writing captions.json.

**If JSON3 is unavailable**, tell the user, then fall back to local Whisper:
```bash
# Extract audio of the cut segment, then transcribe
ffmpeg -i "videos/public/assets/segment_<N>.webm" -ar 16000 -ac 1 \
  "videos/public/assets/segment_<N>.wav"
# Run your Whisper transcribe step on the WAV → videos/public/captions.json
```
Whisper output is already segment-relative (no re-basing needed).

---

## Phase 5 — Read reel_style from brand.json

```bash
cat videos/brand.json | jq '{colors: .brand.colors, reel: .reel_style}'
```

**If `reel_style` is missing from brand.json**, create it now with these defaults before continuing:

```json
"reel_style": {
  "hook": false,
  "subtitle_size_proportional": 0.038,
  "subtitle_color_active": "#FFEE00",
  "subtitle_color_inactive": "rgba(255,255,255,0.82)",
  "subtitle_position_bottom_px": 540,
  "progress_bar": false,
  "golden_line": true,
  "bottom_tag": true,
  "video_fit": "cover"
}
```

Bind every edit parameter from `reel_style` (don't hardcode):

| reel_style field | Composition use |
|---|---|
| `hook` | false → omit hook entirely (this flow has no hook) |
| `subtitle_font` / `subtitle_font_weight` | caption font family + weight |
| `subtitle_size_proportional` | `Math.round(width * value)` → px. Functional range: **0.035–0.045** (below 0.035 is illegible on mobile; above 0.045 saturates with long text). Default if missing: **0.038** |
| `subtitle_color_active` | active word color |
| `subtitle_color_inactive` | inactive word color |
| `subtitle_position_bottom_px` | caption container `bottom` offset |
| `progress_bar` | false → omit progress bar |
| `golden_line` | true → render the gold gradient line (Phase 7) |
| `bottom_tag` | true → render the thematic bottom tag (Phase 7) |
| `watermark_text` / `watermark_font` / `watermark_color` | watermark |
| `watermark_position_top_px` | watermark `top` offset |

---

## Phase 6 — Confirm safe zones

Before writing the composition, confirm all elements respect the master's safe zones:
top 260px, bottom 420px, right 120px. The caption at `subtitle_position_bottom_px: 540`
(y≈1380 on 1920) sits inside the safe band — good. Watermark at `top: 340` clears the 260px
header. Bottom tag must stay above the 420px bottom block.

---

## Phase 7 — Build the composition

Write `videos/compositions/<TopicSlug>.tsx`. **ID must use camelCase or hyphens — no underscores** (`ReelYT1` ✓, `reel-yt-1` ✓, `Reel_YT_1` ✗). Layers back-to-front (last child on top):

```tsx
import {
  AbsoluteFill, Sequence, Video, staticFile,
  useCurrentFrame, useVideoConfig, interpolate,
} from "remotion";

// All values from brand.json → reel_style. No magic numbers inline.
const C = { bg: "#020408", primary: "#c9a84c", silver: "#b8c0cc" };
const R = {
  subFont: "Inter, sans-serif", subWeight: 900, subBottom: 540,
  subSizeP: 0.038,           // subtitle_size_proportional — range 0.035–0.045
  subActive: "#FFEE00", subInactive: "rgba(255,255,255,0.82)",
  wmText: "Brand Name", wmFont: "Inter, sans-serif", wmColor: "#ffffff", wmTop: 340,
  goldenLine: true, bottomTag: true,
};

export const MyReel: React.FC<{words: {text:string;startFrame:number;endFrame:number}[]; tag?: string}> = ({words, tag}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const subSize = Math.round(width * R.subSizeP);   // reads from R — change brand.json to restyle

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      {/* 1. Base: pre-cut VP9 clip, native CSS center crop */}
      <Video src={staticFile("assets/segment_0.webm")}
        style={{width: "100%", height: "100%", objectFit: "cover"}} />

      {/* 2. Gradient overlay: fade top + bottom toward background */}
      <AbsoluteFill style={{background:
        `linear-gradient(to bottom, ${C.bg} 0%, transparent 22%, transparent 70%, ${C.bg} 100%)`}} />

      {/* 3. Karaoke captions */}
      <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center",
        paddingLeft: 80, paddingRight: 80, paddingBottom: R.subBottom}}>
        <div style={{fontFamily: R.subFont, fontWeight: R.subWeight, fontSize: subSize,
          textAlign: "center", lineHeight: 1.25, textShadow: "0 2px 8px rgba(0,0,0,0.9)"}}>
          {words.map((w, i) => {
            const active = frame >= w.startFrame && frame < w.endFrame;
            return <span key={i} style={{color: active ? R.subActive : R.subInactive,
              marginRight: 10}}>{w.text}</span>;
          })}
        </div>
      </AbsoluteFill>

      {/* 4. Golden line: between watermark and captions */}
      {R.goldenLine && (
        <div style={{position: "absolute", top: R.wmTop + 44, left: "50%",
          transform: "translateX(-50%)", width: 360, height: 1, opacity: 0.4,
          background: `linear-gradient(to right, ${C.primary}, transparent)`}} />
      )}

      {/* 5. Watermark */}
      <div style={{position: "absolute", top: R.wmTop, width: "100%", textAlign: "center",
        fontFamily: R.wmFont, color: R.wmColor, fontSize: 28, letterSpacing: 1}}>
        {R.wmText}
      </div>

      {/* 6. Bottom tag: uppercase, spaced, thematic */}
      {R.bottomTag && tag && (
        <div style={{position: "absolute", bottom: 420 - 42, width: "100%",
          textAlign: "center", color: C.silver, fontSize: 25, letterSpacing: 6,
          textTransform: "uppercase"}}>{tag}</div>
      )}
    </AbsoluteFill>
  );
};
```

**No hook. No progress bar.** This flow is captions-on-footage with brand chrome.

---

## Phase 8 — Render in chunks → videos/out/YYYY-MM-DD/

Follow the master's chunked rendering (120 frames per bash call). `durationInFrames` =
`ceil(segmentSeconds * 30)`. Concatenate chunks, then clean up.

```bash
DATE=$(date +%Y-%m-%d)
TOPIC="<topic-slug>"
mkdir -p "videos/out/$DATE" videos/chunks
# one bash call per 120-frame chunk → concat → ffmpeg -c copy → videos/out/$DATE/$TOPIC.mp4
```

Report with the master's format (path, duration, size, preview command).

---

## Phase 9 — Persist approved settings

After the user approves the reel, write back any adjustments made this session
(font size, positions, colors, golden_line/bottom_tag toggles) to
`videos/brand.json → reel_style`, and update `lastUpdated`. Next session starts from the
approved look — no repeated tuning.
