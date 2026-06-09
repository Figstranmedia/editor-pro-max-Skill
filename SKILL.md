---
name: editor-pro-max
description: >
  AI video editor powered by Remotion — master router. Reads the project's brand identity,
  then delegates to a specialized sub-skill based on the request. Three flows:
  YouTube → Reel (editor-pro-max-youtube-reel), brand video from own assets
  (editor-pro-max-brand-video), and AI-generated video via Replicate
  (editor-pro-max-ai-video). The master only does brand analysis and routing —
  no editing logic lives here.
  Triggers: create a video, make a reel, TikTok, Instagram Reel, YouTube Short,
  extract shorts, youtube.com or youtu.be URL, add captions, remove silences, edit footage,
  generate AI video clips via Replicate.
---

# Editor Pro Max — Master Router

You produce brand-aligned videos **from the user's project content**. Remotion is installed
self-contained inside the user's project at `videos/` — no external engine required.
Most videos render to `videos/out/YYYY-MM-DD/topic.mp4` inside the project.
**Exception:** `editor-pro-max-ai-video` renders to a top-level `reels IA-<date>/` folder
so AI-generated reels are instantly identifiable and separate from edited material.

**This master skill does exactly two things, then hands off:**
1. **Brand analysis** — load or create `videos/brand.json` (always first, no exception)
2. **Routing** — read the request, delegate to the matching sub-skill

The master never executes an editing step. The sub-skills own the full produce-and-render
flow. Shared conventions (safe zones, codec rule, chunk render, report format) are
documented at the bottom of this file — sub-skills reference them, the master does not run them.

---

## Step 0 — MANDATORY: Verify Remotion in user's project

Run both checks before anything else:

```bash
# 1. Engine
ls videos/node_modules/.bin/remotion 2>/dev/null \
  && echo "ENGINE READY" || echo "ENGINE NOT READY"

# 2. Brand context
ls videos/brand.json 2>/dev/null \
  && echo "BRAND LOADED" || echo "BRAND NOT FOUND"
```

**If BRAND LOADED:** this is a returning session — read `videos/brand.json` directly
and skip the full project scan in Step 1. Brand identity is already known.

**If BRAND NOT FOUND:** this is a new project — Step 1 will scan and create it.

**If ENGINE NOT READY:** create the setup and install:

```bash
mkdir -p videos/src videos/compositions videos/out videos/assets videos/public videos/public/generated

cat > videos/package.json << 'EOF'
{
  "name": "videos",
  "version": "1.0.0",
  "scripts": {
    "render": "remotion render",
    "studio": "remotion studio"
  },
  "dependencies": {
    "remotion": "^4.0.0",
    "@remotion/transitions": "^4.0.0",
    "@remotion/media-utils": "^4.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
EOF

cd videos && npm install
```

**If ENGINE READY:** proceed directly — no install needed.

`videos/node_modules/` is created once and reused across all future sessions.

**NEVER fall back to ffmpeg drawtext.** ffmpeg cannot produce animated captions, karaoke
word highlighting, spring-animated hooks, or lower thirds. Use chunked rendering (Shared
conventions) for long renders — do not attempt a single render call for more than ~120 frames.

---

## Step 1 — Analyze project brand

**First:** check if `videos/brand.json` already exists:

```bash
cat videos/brand.json 2>/dev/null
```

**If it exists:** load it directly and skip the scan below. Only re-scan if the user
explicitly asks to update the brand profile.

**If it doesn't exist:** scan the project and create it:

```bash
ls
cat README.md 2>/dev/null | head -40
find . \( -name "*.json" -o -name "*.md" \) -not -path "*/node_modules/*" | head -10
find . \( -name "*.png" -o -name "*.jpg" -o -name "*.svg" \) | grep -v node_modules | head -20
find . \( -name "*.mp4" -o -name "*.mov" \) | grep -v node_modules | head -10
```

Extract brand identity and write `videos/brand.json` (one file per project, reused forever).
The `reel_style` section holds per-project edit preferences — values below are neutral
defaults; a real project overrides them (e.g. brand watermark, gold accent line):

```json
{
  "brand": {
    "name": "Project name",
    "tagline": "...",
    "colors": {
      "background": "#000000",
      "primary": "#ffffff",
      "accent": "#6366f1",
      "text": "#ffffff",
      "silver": "#b8c0cc"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter",
      "weights": [400, 700, 900]
    },
    "tone": "professional, direct, no exclamation marks",
    "logo": "assets/logo.png"
  },
  "assets": {
    "images": ["assets/photo.jpg"],
    "footage": ["assets/video.mp4"],
    "generated": []
  },
  "preferences": {
    "defaultFormat": "vertical",
    "minDuration": "10s",
    "maxDuration": "60s"
  },
  "engine": {
    "ready": true,
    "remotionVersion": "4.0.0",
    "chunkSize": 120
  },
  "reel_style": {
    "hook": false,
    "subtitle_font": "Inter, sans-serif",
    "subtitle_font_weight": 900,
    "subtitle_size_proportional": 0.038,
    "subtitle_color_active": "#FFEE00",
    "subtitle_color_inactive": "rgba(255,255,255,0.82)",
    "subtitle_position_bottom_px": 540,
    "progress_bar": false,
    "golden_line": false,
    "bottom_tag": false,
    "watermark_text": "Brand Name",
    "watermark_font": "Inter, sans-serif",
    "watermark_color": "#ffffff",
    "watermark_position_top_px": 340,
    "video_fit": "cover"
  },
  "lastUpdated": "<set dynamically: date +%Y-%m-%d>"
}
```

All sub-skills read from `videos/brand.json` — brand identity, available assets,
engine config, and `reel_style` — so every session starts with full project context
without re-scanning.

---

## Step 2 — Route to the matching sub-skill

The master decides where to send the request. It does not edit.

**If the request is clear:** state your interpretation in one line, then invoke the
sub-skill via the Skill tool. **If ambiguous:** ask exactly ONE confirmation question,
then route.

| Request signal | Route to sub-skill | Output |
|---|---|---|
| YouTube / youtu.be URL, "reel from this video", "extract shorts" | **`editor-pro-max-youtube-reel`** | `videos/out/YYYY-MM-DD/` |
| "use my images/footage", project assets, testimonial, presentation | **`editor-pro-max-brand-video`** | `videos/out/YYYY-MM-DD/` |
| "generate with AI", "make footage from scratch", Replicate | **`editor-pro-max-ai-video`** | `reels IA-<date>/` (top-level) |

> **Routing to `editor-pro-max-ai-video`:** ensure the project has a `videos/.env.local`
> with `REPLICATE_API_TOKEN=<token>`. The sub-skill loads it automatically — no manual
> `source` needed. Copy from `editor-pro-max-Skill/.env.local` if starting a new project.

**Tiebreaker — brand-video vs ai-video:**
If the user describes a video without mentioning YouTube or AI/Replicate:
- User has images or footage in the project → **`editor-pro-max-brand-video`**
- Content doesn't exist yet in the project → **`editor-pro-max-ai-video`**
- Not clear → ask exactly ONE question: *"¿Tienes imágenes o footage para este video, o quieres que lo genere con IA?"*

**Handoff contract** — every sub-skill receives:
- `videos/brand.json` already loaded (brand + `reel_style`)
- The confirmed request: topic, platform/format, approximate duration

Each sub-skill runs its full flow and reports back through the master's report format
(Shared conventions). `editor-pro-max-ai-video` reports its own path (`reels IA-<date>/`).

> If a sub-skill is not yet installed, tell the user which one is missing and stop —
> do not silently fall back to inline editing in the master.

---

## Shared conventions (referenced by all sub-skills)

These rules are documented once here. Sub-skills apply them — the master only describes them.

### Safe zones (1080×1920 vertical)
- Top **260px** blocked (status bar + platform header)
- Bottom **420px** blocked (likes, comments, username, audio strip)
- Right **120px** blocked (action buttons)
- All text and graphics stay inside these boundaries. Full spec: `VIDEO_EDITING_SPECS.md`.

### Codec rule (non-negotiable)
Chromium headless has no H.264 on Linux ARM64. `<Video src="clip.mp4" />` fails with
`DEMUXER_ERROR_NO_SUPPORTED_STREAMS`. **Every clip must be VP9/WebM before compositing.**
Never substitute images + audio for a clip the user asked for.

### Chunked rendering (120 frames per bash call)
Render in chunks of **120 frames**, one bash call per chunk, to stay within the sandbox
time limit. Files persist between calls — chunks accumulate in `videos/chunks/`.

```bash
DATE=$(date +%Y-%m-%d)
TOPIC="my-reel"             # ← slug: lowercase, hyphens, no spaces
OUT="videos/out/$DATE"
mkdir -p "$OUT" videos/chunks
```

Issue ONE call per chunk (do NOT loop or parallelize — each call must stay short):

```bash
cd videos && npx remotion render MyReel "./chunks/chunk_0.mp4" --frames=0-119   --overwrite
cd videos && npx remotion render MyReel "./chunks/chunk_1.mp4" --frames=120-239 --overwrite
cd videos && npx remotion render MyReel "./chunks/chunk_2.mp4" --frames=240-359 --overwrite
# ...continue until the final frame; last chunk ends at TOTAL_FRAMES-1
```

Concatenate:

```bash
# Redefine — bash calls are stateless; variables from prior call are gone
DATE=$(date +%Y-%m-%d)
TOPIC="my-reel"   # ← must match the slug used in the chunk calls
ls videos/chunks/chunk_*.mp4 | sort -V | sed "s/^/file '/" | sed "s/$/'/" > /tmp/chunks.txt
ffmpeg -f concat -safe 0 -i /tmp/chunks.txt -c copy "videos/out/$DATE/$TOPIC.mp4" -y
rm -rf videos/chunks/
```

**Chunk count:** 10s = 300f → 3 chunks · 30s = 900f → 8 chunks · 60s = 1800f → 15 chunks.
Each 120-frame chunk renders in ~20–30s.

### Composition registration
```tsx
// videos/src/index.tsx
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";
registerRoot(RemotionRoot);
```
```tsx
// videos/src/Root.tsx
import { Composition } from "remotion";
import { MyReel } from "../compositions/MyReel";

export const RemotionRoot = () => (
  <>
    <Composition id="MyReel" component={MyReel}
      durationInFrames={900} fps={30} width={1080} height={1920} />
  </>
);
```

**Composition ID rule:** Remotion rejects IDs with underscores — use camelCase or hyphens only.
`ReelYT1` ✓ · `reel-yt-1` ✓ · `Reel_YT_1` ✗ (fails silently or errors in Root.tsx)

### Remotion primitives (self-contained — no engine imports)
| Primitive | Import | Use for |
|---|---|---|
| `AbsoluteFill` | `remotion` | Full-canvas layer (last child on top) |
| `Sequence` | `remotion` | Timing segments |
| `spring()` | `remotion` | Natural motion |
| `interpolate()` | `remotion` | Precise value mapping (always `extrapolateRight: "clamp"`) |
| `Audio` / `Video` / `Img` | `remotion` | Media |
| `staticFile()` | `remotion` | Reference files in `videos/public/` |

Always animate with `useCurrentFrame()` — never CSS transitions (flickering).

### Report format (used by sub-skills on completion)
```
✓ Rendered: videos/out/2026-06-07/my-reel.mp4 (32s, 41MB)      ← youtube-reel / brand-video
✓ Rendered: "reels IA-2026-06-07/my-topic.mp4" (20s, 28MB)     ← ai-video
  Preview: cd videos && npx remotion studio
```

### Persistent learning
After the user approves a result, the active sub-skill updates `videos/brand.json`
(`reel_style` and `lastUpdated`) with any adjustments validated in the session. The next
session starts from the approved settings — no repeated tuning cycle.
