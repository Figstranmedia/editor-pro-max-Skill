---
name: editor-pro-max
description: >
  AI video editor powered by Remotion. Creates brand-aligned videos from any project's
  content, or extracts viral shorts from YouTube URLs. 7-step workflow: verify engine →
  analyze brand (colors, typography, logo, style) → gather visual assets (existing images
  or Replicate AI generation) → apply 2026 editing rules → compose with Remotion →
  render to videos/YYYY-MM-DD/ inside the user's project.
  Triggers: create a video, make a reel, TikTok, Instagram Reel, YouTube Short,
  extract shorts, youtube.com or youtu.be URL, add captions, remove silences, edit footage.
---

# Editor Pro Max — AI Video Editor

You produce brand-aligned videos **from the user's project content**. The rendering engine
(Remotion) lives at `~/Desktop/editor-pro-max-Skill/`. All videos render back into the
user's project at `videos/YYYY-MM-DD/topic.mp4`.

---

## Step 0 — MANDATORY: Verify Remotion in user's project

Check if the user's project already has a `videos/` Remotion setup:

```bash
ls videos/node_modules/.bin/remotion 2>/dev/null \
  && echo "ENGINE READY" || echo "ENGINE NOT READY"
```

**If ENGINE NOT READY:** create the setup and install:

```bash
mkdir -p videos/compositions videos/out videos/assets videos/public

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
word highlighting, spring-animated hooks, or lower thirds. If Remotion is slow, let it
finish — a 30s clip takes 2–5 min locally. Do not abort.

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

Extract brand identity and write `videos/brand.json` (one file per project, reused forever):

```json
{
  "name": "Project name",
  "tagline": "...",
  "colors": {
    "background": "#000000",
    "primary": "#ffffff",
    "accent": "#6366f1",
    "text": "#ffffff"
  },
  "typography": {
    "heading": "Inter",
    "body": "Inter",
    "weights": [400, 700, 900]
  },
  "tone": "professional, direct, no exclamation marks",
  "logo": "assets/logo.png",
  "footage": ["assets/video.mp4"],
  "images": ["assets/photo.jpg"]
}
```

All subsequent steps read brand values from `videos/brand.json` — colors, fonts, tone,
assets — so every video is automatically on-brand without re-scanning the project.

---

## Step 2 — Understand the request → choose mode

Based on the request, follow one of two paths:

### Mode A — Brand video (informational, promotional, testimonial)
The user wants a video from their own content: images, text, footage, or a concept described
in natural language. → Continue to Step 3A.

### Mode B — YouTube → Shorts
The user shared a YouTube URL and wants N shorts extracted from it.
→ Skip to Step 3B.

---

## Step 3A — Gather visual assets (Mode A)

**First:** check if the project already has images that match the brand:
```bash
find . -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | grep -v node_modules
```

**If images exist:** use them. Copy needed assets:
```bash
mkdir -p videos/assets
cp path/to/image.png videos/assets/
```

**If images are needed and don't exist:** offer to generate with Replicate.
To generate an image via Replicate (requires `REPLICATE_API_TOKEN` in environment):
```bash
curl -s -X POST https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "<brand-aligned description>",
      "aspect_ratio": "9:16",
      "output_format": "jpg"
    }
  }' | jq -r '.urls.get'
# Poll the returned URL until status = "succeeded", then download the output image
```

Describe the image prompt using brand colors, tone, and visual style extracted in Step 1.

---

## Step 3B — YouTube → Shorts pipeline (Mode B)

```bash
cd ~/Desktop/editor-pro-max-Skill

# Full pipeline: download → transcribe → select best segments → print render commands
npx tsx scripts/youtube-to-shorts.ts "<youtube-url>" <count> [max-duration-seconds]
```

**Prerequisite:** `yt-dlp --version` must succeed. If missing: `brew install yt-dlp`.

> **SANDBOX MODE:** This step requires terminal access. Output the commands above for the user to run manually from `~/Desktop/editor-pro-max-Skill`.

The pipeline automatically:
1. Downloads video → `public/assets/video.mp4`
2. Extracts audio → `public/assets/audio.wav`
3. Transcribes with Whisper → `public/captions.json`
4. Detects silence → `public/silence.json`
5. Selects best N segments via Claude Haiku (or heuristics if no `ANTHROPIC_API_KEY`) → `public/segments.json`
6. Prints render commands for each short

**Re-run a specific step** by deleting its output file:
```bash
rm public/segments.json   # re-select (different count or criteria)
rm public/captions.json   # re-transcribe
```

---

## Step 4 — Apply editing rules

Before writing any composition code, apply the rules from `VIDEO_EDITING_SPECS.md`.
Key rules to check for every video:

**Safe zones (1080×1920 vertical):**
- Bottom 420px: blocked (Instagram/TikTok UI — likes, comments, username)
- Top 260px: blocked (status bar + platform header)
- Right 120px: blocked (action buttons)
- All text and graphics must stay within these boundaries

**Typography (proportional to canvas):**
- Caption text: ~6.3% of canvas width (≈68px on 1080w)
- Hook text: ~8.9% of canvas width (≈96px on 1080w) — dead center
- Body/lower thirds: ~4.2% of canvas width

**Hook (first 3s):**
- Dead center of frame
- Bold weight (900), thick black outline for legibility on any background
- Scale or slideUp animation, 2.5s max

**Caption preset for Reels/Shorts:**
- Use `karaoke` preset: 5-direction black outline, yellow `#FFEE00` word highlight
- Position: `bottom`, respects 420px safe zone automatically

**Pacing:**
- 15–30s reel → cut every 2–3s
- 30–60s reel → cut every 3–4s

---

## Step 5 — Build the composition

Write the composition at `videos/compositions/MyVideo.tsx`. Use only Remotion core —
no external engine dependencies. Read brand values from `videos/brand.json`:

```tsx
import {
  AbsoluteFill, Sequence, staticFile,
  useCurrentFrame, useVideoConfig,
  spring, interpolate, Audio, Video, Img
} from "remotion";

// Brand colors come from videos/brand.json (loaded at build time or passed as props)
const BRAND = {
  bg: "#020408",       // colors.background
  primary: "#c9a84c",  // colors.primary
  accent: "#a78bfa",   // colors.accent
  text: "#d4dde8",     // colors.text
};
```

**Animation rules (non-negotiable):**
- Always `useCurrentFrame()` — never CSS transitions (causes flickering)
- Always clamp: `extrapolateRight: "clamp"`
- Use `spring()` for natural motion, `interpolate()` for precise control
- Safe zone values from Step 4 — apply as constants, not hardcoded guesses

**Create Root entry if it doesn't exist** (`videos/src/index.tsx`):
```tsx
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";
registerRoot(RemotionRoot);
```

Register each new composition in `videos/src/Root.tsx`:
```tsx
import { Composition } from "remotion";
import { MyVideo } from "../compositions/MyVideo";

export const RemotionRoot = () => (
  <>
    <Composition id="MyVideo" component={MyVideo}
      durationInFrames={900} fps={30} width={1080} height={1920} />
  </>
);

---

## Step 6 — Render to user's project

Output folder uses the current date and a short topic slug:

```bash
DATE=$(date +%Y-%m-%d)
TOPIC="reel-brand-launch"   # ← slug from content: lowercase, hyphens, no spaces
mkdir -p "videos/$DATE"

cd videos
npx remotion render MyVideo "../videos/$DATE/$TOPIC.mp4" --overwrite
```

**For YouTube → Shorts:**
```bash
DATE=$(date +%Y-%m-%d)
mkdir -p "videos/$DATE"

cd videos
npx remotion render YouTubeShortClip "../videos/$DATE/short_0.mp4" \
  --props='{"segmentIndex":0}' --overwrite

npx remotion render YouTubeShortClip "../videos/$DATE/short_1.mp4" \
  --props='{"segmentIndex":1}' --overwrite
```

**Platform specs:**

| Platform | Width | Height | FPS |
|---|---|---|---|
| TikTok / Instagram Reel / YouTube Short | 1080 | 1920 | 30 |
| YouTube / Presentation / LinkedIn | 1920 | 1080 | 30 |
| Square (IG Post / X) | 1080 | 1080 | 30 |

> `videos/node_modules/` is created once on first use and reused across all future
> sessions — subsequent renders skip the install step entirely.

---

## Step 7 — Confirm and report

After render completes, report back:
```
✓ Rendered: videos/2026-06-07/reel-brand-launch.mp4 (57s, 55MB)
  Preview: npx remotion studio  (from ~/Desktop/editor-pro-max-Skill)
```

If multiple files rendered, list all paths with duration and size.

---

## Ready-made templates (skip Step 5 for fast output)

```tsx
// Vertical social
<TikTokVideo hook="Did you know?" body="Key benefit." cta="Follow for more" />
<InstagramReel headline="Headline" subtext="Details" brandName="Brand" />
<YouTubeShort title="Title" subtitle="Subtitle" />

// Horizontal content
<Presentation slides={[{title:"Intro", body:"..."}, {title:"Problem", body:"..."}]} />
<Testimonial quote="Amazing!" author="Jane Doe" role="CEO" />
<Announcement preTitle="Introducing" title="Product" subtitle="Tagline" cta="Learn More" />

// Editing
<TalkingHeadEdit videoSrc="assets/video.mp4" captionsPath="captions.json"
  silencePath="silence.json" removeSilence={true} showCaptions={true}
  captionPreset="bold" speakerName="Rafael" speakerTitle="Founder" ctaText="Subscribe" />

<PodcastClip videoSrc="assets/podcast.mp4" clipStartSeconds={120} clipEndSeconds={150}
  captionsPath="captions.json" showCaptions={true} captionPreset="glow" />
```

---

## Component reference (appendix)

| Component | Import path | Use for |
|---|---|---|
| `AnimatedTitle` | `src/components/text/AnimatedTitle` | Titles, hooks, headlines |
| `CaptionOverlay` | `src/components/text/CaptionOverlay` | Word-level captions (needs `captions.json`) |
| `LowerThird` | `src/components/text/LowerThird` | Speaker name + title bar |
| `TypewriterText` | `src/components/text/TypewriterText` | Code/mono reveal |
| `GradientBackground` | `src/components/backgrounds/GradientBackground` | Animated gradients |
| `ParticleField` | `src/components/backgrounds/ParticleField` | Floating particles |
| `FitImage` | `src/components/media/FitImage` | Images with Ken Burns |
| `FitVideo` | `src/components/media/FitVideo` | Video fill |
| `VideoClip` | `src/components/media/VideoClip` | Trimmed video segment |
| `JumpCut` | `src/components/media/JumpCut` | Auto silence removal |
| `AudioTrack` | `src/components/media/AudioTrack` | Background music + ducking |
| `ProgressBar` | `src/components/overlays/ProgressBar` | Video progress indicator |
| `Watermark` | `src/components/overlays/Watermark` | Corner brand handle |
| `CallToAction` | `src/components/overlays/CallToAction` | Animated CTA popup |
| `SplitScreen` | `src/components/layout/SplitScreen` | Two-panel layout |
| `SafeArea` | `src/components/layout/SafeArea` | Platform-safe padding |
| `useVideoFormat` | `src/hooks/useVideoFormat` | Proportional safe zones + font sizes |
| `AudioVisualization` | `src/components/overlays/AudioVisualization` | Audio bars/waveform/circle |
