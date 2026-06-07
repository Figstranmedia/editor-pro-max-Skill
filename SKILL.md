---
name: editor-pro-max
description: >
  AI video editor powered by Remotion. Use when the user wants to create a video,
  TikTok, Instagram Reel, YouTube Short, presentation, testimonial, or promo clip —
  even from a natural language description. Also use for footage editing: removing
  silences, adding animated captions, extracting podcast clips, talking-head edits.
  Trigger when the user shares a YouTube URL and asks for shorts or best moments —
  runs the YouTube → Shorts pipeline automatically.
  Keywords: make a video, create a clip, edit footage, add captions, remove pauses,
  render for TikTok, extract shorts, youtube.com URL, youtu.be URL.
  Renders MP4 via Remotion and exports to the user's project at videos/renders/.
---

# Editor Pro Max — AI Video Creator

You create videos **from the user's project content**. You are operating in **External Project Mode**: the user's project is the context source, and Editor Pro Max (Remotion) is the rendering engine. Videos land back inside the user's project.

---

## Engine requirement

This skill uses the Editor Pro Max rendering engine installed on the user's machine.
The engine must be present at `~/Desktop/editor-pro-max-Skill/` before any work begins.
Step 0 verifies this. Do not proceed without passing Step 0.

---

## Editor Pro Max location

The rendering engine lives at:
```
~/Desktop/editor-pro-max-Skill/
```
`~` expands to the current user's home directory. On macOS: `/Users/<your-username>/`. All shell commands use `~` so they work on any machine with full filesystem access.

---

## Step 0 — MANDATORY: Verify engine is ready (run this first, always)

Before doing anything else, verify the engine exists and has its dependencies installed:

```bash
ls ~/Desktop/editor-pro-max-Skill/node_modules/.bin/remotion 2>/dev/null \
  && echo "ENGINE READY" || echo "ENGINE NOT READY"
```

**If ENGINE NOT READY:**
```bash
cd ~/Desktop/editor-pro-max-Skill && npm install
```
Takes 1-2 min on first run. Do NOT skip — without node_modules Remotion cannot render and ffmpeg fallbacks produce inferior results.

**If the path doesn't exist at all:** you are likely in a sandboxed environment (see above).

**NEVER fall back to ffmpeg drawtext as a substitute for Remotion.** ffmpeg cannot produce:
- Word-by-word caption highlighting (karaoke preset)
- Animated hooks (spring, scale, slideUp)
- Lower thirds with brand colors
- Any animated text overlay

Rendering a 30s clip ≈ 2–5 minutes on a local machine. Expected — do not abort.

---

## Step 1 — Read the user's project

Scan the connected folder to understand the project before writing any video code:

```bash
ls && cat README.md 2>/dev/null
cat package.json 2>/dev/null | head -20
find . -name "*.md" -not -path "*/node_modules/*" | head -10
find . \( -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.mp4" \) | grep -v node_modules | head -20
```

Extract: product name, tagline, key benefit, CTA, color palette, logo path, any existing footage.

---

## Step 2 — Propose & confirm

Based on the context, propose 2–3 video formats, for example:
- TikTok/Reel announcing the product
- YouTube Short demo
- Presentation for investors
- Podcast clip extraction

Confirm with the user: platform, key message, and output folder (default: `videos/renders/`).

---

## Step 3 — Set up the output structure

Create this in the **user's project folder**:

```
{user-project}/
└── videos/
    ├── compositions/    ← generated .tsx files
    ├── assets/          ← media referenced by the video
    └── renders/         ← final MP4 files land here
```

```bash
mkdir -p videos/compositions videos/assets videos/renders
```

---

## Step 4 — Generate the composition

Write `videos/compositions/MyVideo.tsx`. Import from Editor Pro Max using its absolute path:

```tsx
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence, staticFile} from "remotion";

// Editor Pro Max components — adjust path to match installation
import {TikTokVideo} from "~/Desktop/editor-pro-max-Skill/src/templates/social/TikTokVideo";
import {AnimatedTitle} from "~/Desktop/editor-pro-max-Skill/src/components/text/AnimatedTitle";
import {GradientBackground} from "~/Desktop/editor-pro-max-Skill/src/components/backgrounds/GradientBackground";
import {loadDefaultFonts} from "~/Desktop/editor-pro-max-Skill/src/presets/fonts";

loadDefaultFonts();

export const MyVideo: React.FC = () => { ... };
```

> **Simpler alternative**: write a self-contained composition using only `remotion` primitives — no editor-pro-max imports. Then the user just drops it into `editor-pro-max/src/compositions/` and renders from there.

---

## Step 5 — Render to the user's project

### Option A — Copy + render from Editor Pro Max (recommended)

```bash
# 1. Copy the composition into editor-pro-max
cp {user-project}/videos/compositions/MyVideo.tsx \
   ~/Desktop/editor-pro-max-Skill/src/compositions/

# 2. Register it in Root.tsx (add the Composition block)

# 3. Render — output goes back to the user's project
cd ~/Desktop/editor-pro-max-Skill
npx remotion render MyVideo \
  /absolute/path/to/user-project/videos/renders/my-video.mp4
```

Use the helper script for this:
```bash
./scripts/render-external.sh MyVideo /absolute/path/to/user-project my-video.mp4
```

### Option B — Standalone Remotion (no editor-pro-max needed)

```bash
cd {user-project}/videos
npm init remotion@latest .
# drop composition in src/, then:
npx remotion render MyVideo renders/my-video.mp4
```

---

## Platform specs

| Platform | Width | Height | FPS | Duration |
|---|---|---|---|---|
| TikTok | 1080 | 1920 | 30 | ≤60s |
| Instagram Reel | 1080 | 1920 | 30 | ≤90s |
| Instagram Story | 1080 | 1920 | 30 | ≤15s |
| YouTube Short | 1080 | 1920 | 60 | ≤60s |
| YouTube / Presentation | 1920 | 1080 | 30 | any |
| LinkedIn | 1200 | 628 | 30 | ≤10min |
| Square (IG Post / X) | 1080 | 1080 | 30 | ≤140s |

---

## Hook rules (from VIDEO_EDITING_SPECS.md)

The first 3 seconds determine retention. Always follow these:

| Platform | Hook pattern |
|---|---|
| TikTok / Reels | Zoom, bold text 72pt+, trending audio. Never start with a logo or slow fade |
| YouTube / LinkedIn | Statement, question, or value promise. No clickbait |
| Short form (X) | Bold stat or quote, 2–3s max hook |

Pacing reference: 6–15s video → cut every 1.5–2.5s. 15–30s → every 2–3s. 30–60s → every 3–4s.

---

## Ready-made templates

### Social (vertical)

```tsx
<TikTokVideo hook="Did you know?" body="Your key benefit." cta="Download free" />
<InstagramReel headline="Your headline" subtext="Supporting text" brandName="Brand" />
<YouTubeShort title="Title" subtitle="Subtitle" />
```

### Content / Promo (horizontal)

```tsx
<Presentation slides={[{title: "Intro", body: "..."}, {title: "Problem", body: "..."}]} />
<Testimonial quote="Amazing!" author="Jane Doe" role="CEO" />
<Announcement preTitle="Introducing" title="Product" subtitle="Tagline" cta="Learn More" />
```

### Registered compositions (ready to render)

These exist in editor-pro-max and can be rendered immediately:

| ID | Format | Duration | Use for |
|---|---|---|---|
| `YouTubeShortClip` | 1080×1920 | dynamic | YouTube → Shorts pipeline output |
| `PodcastClip` | 1080×1920 | custom | Manual clip extraction |
| `TalkingHeadEdit` | 1920×1080 | custom | Talking head with silence removal |
| `editor-pro-max-promo-master` | 1920×1080 | 90s | YouTube master |
| `editor-pro-max-promo-tiktok` | 1080×1920 | 30s | TikTok / Reel |
| `editor-pro-max-promo-linkedin` | 1200×628 | 45s | LinkedIn |

**`YouTubeShortClip` props:**
```bash
# segmentIndex — which segment from public/segments.json to render (0-based)
--props='{"segmentIndex":0}'

# Optional overrides:
--props='{"segmentIndex":1,"captionPreset":"glow","accentColor":"#ff0050","showHook":false}'
```
Available `captionPreset` values: `classic`, `bold`, `outline`, `glow`, `box`

---

## Building custom compositions

### Animation rules (non-negotiable)
- **Always** use `useCurrentFrame()` — never CSS transitions (causes flickering in Remotion)
- **Always** clamp with `extrapolateRight: "clamp"`
- Use `spring()` for natural motion, `interpolate()` for precise control

```tsx
const frame = useCurrentFrame();
const {fps} = useVideoConfig();

// Fade in
const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});

// Spring scale-up
const progress = spring({fps, frame: frame - 10, config: {damping: 12, stiffness: 100}});
const scale = interpolate(progress, [0, 1], [0.8, 1], {extrapolateRight: "clamp"});

// Enter-hold-exit shorthand
import {enterHoldExit} from "editor-pro-max/src/utils/math";
const opacity = enterHoldExit(frame, 20, 60, 15);

// Scene timing
<Sequence from={0} durationInFrames={90}><Scene1 /></Sequence>
<Sequence from={90} durationInFrames={90}><Scene2 /></Sequence>
```

### Key components

```tsx
// Text
<AnimatedTitle text="Hello" fontSize={72} color="#fff" enterAnimation="slideUp"
  enterDuration={20} holdDuration={60} exitDuration={15} />
<TypewriterText text="Hello!" fontSize={48} typingSpeed={2} cursorColor="#6366f1" />
<LowerThird name="John Doe" title="CEO" accentColor="#6366f1" position="bottomLeft" />
<CaptionOverlay captionsSource="captions.json" preset="bold" highlightColor="#39E508" />
<WordByWordCaption words={[{text:"Hi", startFrame:0, endFrame:15}]} position="bottom" />

// Backgrounds
<GradientBackground colors={["#0f0f23", "#1a1a3e"]} angle={135} animateAngle />
// Gradient presets: GRADIENTS.sunset | ocean | forest | purple | fire | midnight | aurora
<ParticleField count={50} color="rgba(255,255,255,0.3)" speed={0.5} direction="up" />
<GridPattern type="dots" spacing={40} animate />
<ColorWash color="#0a0a0a" />

// Overlays
<ProgressBar color="#6366f1" height={4} position="bottom" />
<Watermark text="@brand" corner="bottomRight" opacity={0.5} />
<CallToAction text="Subscribe" subtext="Turn on notifications" enterDelay={60} />
<CountdownTimer startFrom={150} fontSize={120} label="Starting in" />

// Media
<FitVideo src={staticFile("assets/video.mp4")} fit="cover" volume={0.8} />
<FitImage src={staticFile("photo.jpg")} kenBurns="zoomIn" kenBurnsIntensity={0.1} />
<Slideshow images={[staticFile("1.jpg"), staticFile("2.jpg")]} transitionDuration={15} />
<VideoClip src={staticFile("assets/video.mp4")} trimStartSeconds={5} trimEndSeconds={30} />
<JumpCut src={staticFile("assets/video.mp4")} segments={speechSegments} paddingSeconds={0.1} />
<ImageOverlay src={staticFile("logo.png")} x={60} y={60} width={120} enterAnimation="scale" />
<AudioTrack src={staticFile("music.mp3")} volume={0.15} loop fadeInDurationSeconds={2}
  duckDuringSegments={speechSegments} duckVolume={0.05} />

// Layout
<SplitScreen direction="horizontal" ratio={0.5} gap={4}><Left /><Right /></SplitScreen>
<PictureInPicture main={<FitVideo src="main.mp4" />} pip={<FitVideo src="webcam.mp4" />}
  corner="bottomRight" pipWidth={360} pipHeight={240} />
<SafeArea paddingHorizontal={60} paddingVertical={60}>...</SafeArea>
```

### Transitions

```tsx
import {TransitionSeries} from "@remotion/transitions";
import {TRANSITION_PRESETS} from "../components/transitions/TransitionPresets";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}><Scene1 /></TransitionSeries.Sequence>
  <TransitionSeries.Transition {...TRANSITION_PRESETS.crossfade} />
  <TransitionSeries.Sequence durationInFrames={90}><Scene2 /></TransitionSeries.Sequence>
</TransitionSeries>
```

Available: `crossfade`, `fadeQuick`, `fadeSlow`, `slideLeft`, `slideRight`, `slideUp`, `slideDown`, `wipeLeft`, `wipeRight`, `clockwise`, `cut`

### Presets

- **Colors**: palettes `dark`, `light`, `vibrant`, `warm`, `cool`, `neon`
- **Fonts**: `heading` (Inter), `mono` (JetBrains Mono), `display` (Poppins), `elegant` (Playfair Display). Always call `loadDefaultFonts()`.
- **Easings**: `easeIn`, `easeOut`, `easeInOut`, `bounceOut`, `elastic`, `backOut`, `sharp`, `smooth`, `snappy`

---

## YouTube → Shorts (automated pipeline)

When the user shares a YouTube URL and asks for N shorts/clips, use the single orchestrator:

```bash
cd ~/Desktop/editor-pro-max-Skill

# Full pipeline: download → transcribe → select → print render commands
npx tsx scripts/youtube-to-shorts.ts "<youtube-url>" <count> [max-duration-seconds]

# Examples:
npx tsx scripts/youtube-to-shorts.ts "https://youtube.com/watch?v=XYZ" 3
npx tsx scripts/youtube-to-shorts.ts "https://youtu.be/ABC" 5 60
```

**Prerequisite:** `yt-dlp` must be installed. Check with `yt-dlp --version`.
If missing, tell the user: `brew install yt-dlp` (macOS) or `pip install yt-dlp`.

### What the pipeline does automatically
1. Downloads video → `public/assets/video.mp4`
2. Extracts audio → `public/assets/audio.wav`
3. Transcribes with Whisper → `public/captions.json`
4. Detects silence → `public/silence.json`
5. **Selects best N segments** via Claude Haiku (or heuristics if no API key) → `public/segments.json`
6. Prints ready-to-run render commands

### Rendering the shorts

After the pipeline, render each short by `segmentIndex`:

```bash
# Render short 0
npx remotion render YouTubeShortClip "out/short_0.mp4" --props='{"segmentIndex":0}'

# Render short 1
npx remotion render YouTubeShortClip "out/short_1.mp4" --props='{"segmentIndex":1}'

# Render to user's project folder
npx remotion render YouTubeShortClip "/abs/path/user-project/videos/renders/short_0.mp4" \
  --props='{"segmentIndex":0}'
```

The `YouTubeShortClip` composition auto-reads `public/segments.json` via `calculateMetadata`
and sets the correct duration/trim for each segment. Each short includes:
- Video trimmed to the segment
- Word-level captions synced to the clip offset
- Hook text overlay at the start
- Progress bar + brand watermark

### Skipping steps (re-runs)

The orchestrator skips steps whose output files already exist. To re-run a step, delete its output:
```bash
rm public/captions.json    # re-transcribe
rm public/segments.json    # re-select segments (different count or criteria)
rm public/assets/video.mp4 # re-download (e.g. different URL)
```

### ANTHROPIC_API_KEY for smart selection

If `ANTHROPIC_API_KEY` is set in the environment, segment selection uses Claude Haiku
to pick the most self-contained, hook-worthy moments. Without it, falls back to
a speech-density heuristic (still good, but less context-aware).

---

## Editing existing footage

Run the pipeline first (from inside editor-pro-max, pointing to the user's asset):

```bash
cd ~/Desktop/editor-pro-max-Skill
npx tsx scripts/analyze-video.ts /abs/path/to/user-project/videos/assets/video.mp4
npx tsx scripts/extract-audio.ts /abs/path/to/user-project/videos/assets/video.mp4
npx tsx scripts/transcribe.ts
npx tsx scripts/detect-silence.ts /abs/path/to/user-project/videos/assets/video.mp4
```

Then use editing templates:

```tsx
// All-in-one: silence removal + captions + lower third + CTA
<TalkingHeadEdit
  videoSrc="assets/video.mp4"
  captionsPath="captions.json"
  silencePath="silence.json"
  removeSilence={true}
  showCaptions={true}
  captionPreset="bold"        // classic | bold | outline | glow | box
  speakerName="Rafael"
  speakerTitle="Founder"
  ctaText="Subscribe"
  backgroundMusic="assets/music.mp3"
  musicVolume={0.15}
/>

// Extract a viral clip
<PodcastClip
  videoSrc="assets/podcast.mp4"
  clipStartSeconds={120}
  clipEndSeconds={150}
  captionsPath="captions.json"
  showCaptions={true}
  captionPreset="glow"
  title="Best moment from today"
/>
```

---

## Render commands reference

```bash
# From inside editor-pro-max, render to user's project
npx remotion render MyVideo /abs/path/videos/renders/my-video.mp4

# With overwrite
npx remotion render MyVideo /abs/path/videos/renders/my-video.mp4 --overwrite

# Specific codec
npx remotion render MyVideo out/video.webm --codec=vp8

# ProRes (high quality)
npx remotion render MyVideo out/video.mov --codec=prores --prores-profile=4444

# GIF
npx remotion render MyVideo out/animation.gif --codec=gif

# Still / thumbnail
npx remotion still MyVideo out/thumbnail.png --frame=45

# Batch (multiple platforms)
./scripts/batch-render.sh MyVideo youtube tiktok square

# Helper script (renders to external path)
./scripts/render-external.sh MyVideo /abs/path/to/user-project my-video.mp4
```

---

## Registration template (Root.tsx)

```tsx
import {MyVideo} from "./compositions/MyVideo";

<Composition
  id="MyVideo"
  component={MyVideo}
  durationInFrames={300}     // secondsToFrames(10, 30) = 300
  fps={30}
  width={1080}
  height={1920}              // vertical for TikTok/Reel
  defaultProps={{}}
/>
```

---

## Common mistakes to avoid

- **Never CSS transitions** — always `interpolate()` / `spring()` with `useCurrentFrame()`
- **Always register** compositions in `Root.tsx` before rendering
- **`staticFile()`** for all media paths — relative to `public/` in editor-pro-max
- **User assets** passed as props, not as `staticFile()` paths from the user's project
- **Run the pipeline** before using `CaptionOverlay` or `JumpCut` — they need the JSON files
- **Use `--overwrite`** if re-rendering to avoid interactive prompts
