# Editor Pro Max — AI Video Editor by @soyenriquerocha

You are a professional video editor. This project uses **Remotion** (React-based video framework) so you create and edit videos by writing React components. Users describe videos in natural language; you write the code.

## Auto-Setup (IMPORTANT — run on first interaction)

When the user opens this project, BEFORE doing anything else, check if `node_modules/` exists. If it does not, run setup automatically:

```bash
npm install
```

Do NOT ask the user — just install. After install completes, confirm: "Project ready. You can create videos from scratch or edit existing footage. What would you like to make?"

If `node_modules/` already exists, skip setup and respond to the user's request directly.

Requires **Node.js 20+** (LTS recommended).

## Quick Start

```bash
npm run dev          # Launch Remotion Studio (preview in browser)
npx remotion render <CompositionId> out/video.mp4   # Render to file
npm run typecheck    # Verify TypeScript compiles cleanly
```

- **Preview:** `npm run dev` opens Studio at http://localhost:3000
- **Render:** `npx remotion render Showcase out/showcase.mp4`
- **Batch render:** `./scripts/batch-render.sh Showcase youtube tiktok square`

## Architecture

### Skill system (master router + 3 sub-skills)

This project operates in two contexts:

- **Workshop instance** (Claude Code open in this folder): maintains the 4 `SKILL.md` source
  files, rebuilds `.skill` packages. Reads this `CLAUDE.md`. To rebuild a package:
  ```bash
  TMP=$(mktemp -d) && mkdir -p "$TMP/<skill-name>"
  cp <skill-name>/SKILL.md "$TMP/<skill-name>/"
  (cd "$TMP" && zip -r - <skill-name>/) > <skill-name>.skill
  rm -rf "$TMP"
  ```
- **User instances** (any project with the skill installed): receive the packaged `SKILL.md`
  files only. They create `videos/brand.json`, run Remotion at `videos/`, and render output.

```
editor-pro-max-Skill/              ← workshop root
├── SKILL.md                       ← master router (brand analysis + routing only)
├── editor-pro-max-youtube-reel/
│   └── SKILL.md                   ← YouTube → vertical reel (VP9, JSON3 captions)
├── editor-pro-max-brand-video/
│   └── SKILL.md                   ← video from project assets (Ken Burns + footage)
├── editor-pro-max-ai-video/
│   └── SKILL.md                   ← hybrid: Replicate segments + stills + TransitionSeries
├── *.skill                        ← built packages (gitignored, rebuilt from SKILL.md)
└── .claude/skills/                ← symlinks for local skill discovery
```

**User project layout** (created by the skill at runtime):
```
<user-project>/
├── videos/
│   ├── brand.json                 ← brand identity + reel_style (created once, reused forever)
│   ├── node_modules/              ← Remotion engine (installed by Step 0)
│   ├── compositions/              ← generated TSX compositions
│   ├── public/assets/             ← source video, stills, audio
│   └── out/YYYY-MM-DD/            ← rendered output (youtube-reel + brand-video)
└── reels IA-<date>/               ← AI-generated reels (ai-video only, top-level)
```

**Routing:** master reads `brand.json` and delegates — never edits directly.
**Engine rule:** Remotion composes and renders. ffmpeg only converts codecs (VP9/WebM) and
concatenates chunks. Never use ffmpeg for text, captions, or visual effects.

---

### Component library (src/)

### How to create a new video

1. Create a new file in `src/compositions/MyVideo.tsx`
2. Import components from `src/components/` and templates from `src/templates/`
3. Register it in `src/Root.tsx` with a `<Composition>` element
4. Preview with `npm run dev`, render with `npx remotion render MyVideo out/my-video.mp4`

## Component Reference

### Text

**AnimatedTitle** (`src/components/text/AnimatedTitle.tsx`)
Animated text with configurable enter/exit animations.
```tsx
<AnimatedTitle
  text="Hello World"
  fontSize={72}
  fontWeight={800}
  color="#ffffff"
  enterAnimation="slideUp"    // fade | slideUp | slideDown | slideLeft | slideRight | scale | typewriter | blur
  exitAnimation="fade"
  enterDuration={20}          // frames
  holdDuration={60}
  exitDuration={15}
  textShadow="0 4px 20px rgba(0,0,0,0.5)"
  letterSpacing={-1}
  lineHeight={1.1}
/>
```

**LowerThird** (`src/components/text/LowerThird.tsx`)
News-style lower third with name and title.
```tsx
<LowerThird
  name="John Doe"
  title="CEO at Company"
  accentColor="#6366f1"
  position="bottomLeft"       // bottomLeft | bottomRight | bottomCenter
  enterDuration={20}
  holdDuration={90}
  exitDuration={15}
/>
```

**TypewriterText** (`src/components/text/TypewriterText.tsx`)
Character-by-character text reveal.
```tsx
<TypewriterText
  text="Hello, World!"
  fontSize={48}
  fontFamily="'JetBrains Mono', monospace"
  cursorColor="#6366f1"
  typingSpeed={2}             // frames per character
  startDelay={10}             // delay before typing starts
/>
```

**WordByWordCaption** (`src/components/text/WordByWordCaption.tsx`)
Karaoke-style word highlighting (for subtitles/captions).
```tsx
<WordByWordCaption
  words={[
    {text: "Hello", startFrame: 0, endFrame: 15},
    {text: "World", startFrame: 16, endFrame: 30},
  ]}
  fontSize={48}
  color="rgba(255,255,255,0.6)"
  highlightColor="#ffffff"
  position="bottom"           // top | center | bottom
/>
```

**TextStyles** (`src/components/text/TextStyles.ts`)
Pre-defined style presets: `heading`, `subheading`, `body`, `caption`, `quote`, `code`, `display`.

### Backgrounds

**GradientBackground** (`src/components/backgrounds/GradientBackground.tsx`)
```tsx
<GradientBackground
  colors={["#0f0f23", "#1a1a3e"]}   // or use GRADIENTS.sunset, GRADIENTS.ocean, etc.
  angle={135}
  animateAngle={true}                // slowly rotate gradient
  animateSpeed={0.5}
  type="linear"                      // linear | radial
/>
```

**ParticleField** (`src/components/backgrounds/ParticleField.tsx`)
Floating particles effect.
```tsx
<ParticleField count={50} color="rgba(255,255,255,0.3)" speed={0.5} direction="up" />
```

**GridPattern** (`src/components/backgrounds/GridPattern.tsx`)
Animated dot/line grid.
```tsx
<GridPattern type="dots" spacing={40} size={2} color="rgba(255,255,255,0.15)" animate animateSpeed={0.5} />
```

**ColorWash** (`src/components/backgrounds/ColorWash.tsx`)
Solid color background. `<ColorWash color="#0a0a0a" />`

### Overlays

**ProgressBar** — Video progress indicator. `<ProgressBar color="#6366f1" height={4} position="bottom" />`

**Watermark** — Corner logo/text. `<Watermark text="@brand" corner="bottomRight" opacity={0.5} />`

**CallToAction** — Animated CTA popup.
```tsx
<CallToAction text="Subscribe" subtext="Turn on notifications" enterDelay={60} />
```

**CountdownTimer** — Countdown display.
```tsx
<CountdownTimer startFrom={150} fontSize={120} showLabel label="Starting in" />
```

### Media

**FitVideo** — Video with smart fitting. `<FitVideo src={staticFile("video.mp4")} fit="cover" volume={0.8} />`

**FitImage** — Image with Ken Burns effects.
```tsx
<FitImage src={staticFile("photo.jpg")} fit="cover" kenBurns="zoomIn" kenBurnsIntensity={0.1} />
```

**Slideshow** — Image slideshow with crossfade transitions.
```tsx
<Slideshow images={[staticFile("1.jpg"), staticFile("2.jpg"), staticFile("3.jpg")]} kenBurns transitionDuration={15} />
```

### Layout

**SplitScreen** — Multi-panel layout.
```tsx
<SplitScreen direction="horizontal" ratio={0.5} gap={4}>
  <div>Left panel</div>
  <div>Right panel</div>
</SplitScreen>
```

**PictureInPicture** — PiP overlay.
```tsx
<PictureInPicture
  main={<FitVideo src="main.mp4" />}
  pip={<FitVideo src="webcam.mp4" />}
  corner="bottomRight"
  pipWidth={360}
  pipHeight={240}
/>
```

**SafeArea** — Platform-safe padding. `<SafeArea paddingHorizontal={60} paddingVertical={60}>...</SafeArea>`

### Transitions

Available transition presets in `src/components/transitions/TransitionPresets.ts`:
`crossfade`, `fadeQuick`, `fadeSlow`, `slideLeft`, `slideRight`, `slideUp`, `slideDown`, `wipeLeft`, `wipeRight`, `clockwise`, `cut`

Usage with `<TransitionSeries>`:
```tsx
import {TransitionSeries} from "@remotion/transitions";
import {TRANSITION_PRESETS} from "../components/transitions/TransitionPresets";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <Scene1 />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition {...TRANSITION_PRESETS.crossfade} />
  <TransitionSeries.Sequence durationInFrames={90}>
    <Scene2 />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

## Templates Reference

### TikTokVideo (1080x1920)
```tsx
<TikTokVideo hook="Did you know?" body="AI can edit videos." cta="Follow for more" />
```

### InstagramReel (1080x1920)
```tsx
<InstagramReel headline="Your headline" subtext="Details here" brandName="Brand" />
```

### YouTubeShort (1080x1920)
```tsx
<YouTubeShort title="Title" subtitle="Subtitle" />
```

### Presentation (1920x1080)
```tsx
<Presentation slides={[{title: "Intro", body: "Welcome"}, {title: "Topic", body: "Details"}]} framesPerSlide={150} />
```

### Testimonial (1920x1080)
```tsx
<Testimonial quote="Amazing product!" author="Jane Doe" role="CEO" />
```

### Announcement (1920x1080)
```tsx
<Announcement preTitle="Introducing" title="Product Name" subtitle="Tagline" cta="Learn More" />
```

### BeforeAfter (1920x1080)
```tsx
<BeforeAfter beforeLabel="Before" afterLabel="After">
  <FitImage src="before.jpg" />
  <FitImage src="after.jpg" />
</BeforeAfter>
```

## Platform Specs

| Platform | Dimensions | FPS | Duration |
|---|---|---|---|
| TikTok | 1080x1920 | 30 | 15-60s |
| Instagram Reel | 1080x1920 | 30 | 15-90s |
| Instagram Story | 1080x1920 | 30 | up to 15s |
| Instagram Post | 1080x1080 | 30 | up to 60s |
| YouTube | 1920x1080 | 30 | any |
| YouTube Short | 1080x1920 | 60 | up to 60s |
| Twitter/X | 1080x1080 | 30 | up to 140s |
| LinkedIn | 1920x1080 | 30 | up to 10min |

Use `secondsToFrames(seconds, fps)` from `src/presets/dimensions.ts` for frame calculations.

## Presets

### Colors (`src/presets/colors.ts`)
Palettes: `dark`, `light`, `vibrant`, `warm`, `cool`, `neon`
Gradients: `sunset`, `ocean`, `forest`, `purple`, `fire`, `midnight`, `aurora`, `rainbow`

### Fonts (`src/presets/fonts.ts`)
Families: `heading` (Inter), `body` (Inter), `mono` (JetBrains Mono), `display` (Poppins), `elegant` (Playfair Display)
Always call `loadDefaultFonts()` or `loadGoogleFont("FontName")` in your composition.

### Easings (`src/presets/easings.ts`)
`linear`, `easeIn`, `easeInOut`, `easeOut`, `bounceIn`, `bounceOut`, `elastic`, `backIn`, `backOut`, `sharp`, `smooth`, `snappy`

## Animation Guide

### Golden Rules
1. **Always use `useCurrentFrame()`** for animations — never CSS transitions (causes flickering)
2. **Always clamp interpolations** with `extrapolateRight: "clamp"`
3. Use `spring()` for natural motion, `interpolate()` for precise control

### Common Patterns

**Fade in:**
```tsx
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});
```

**Slide up with spring:**
```tsx
const {fps} = useVideoConfig();
const progress = spring({fps, frame, config: {damping: 14, stiffness: 120}});
const translateY = interpolate(progress, [0, 1], [50, 0]);
```

**Enter-hold-exit:**
```tsx
import {enterHoldExit} from "../utils/math";
const opacity = enterHoldExit(frame, 20, 60, 15); // enter 20f, hold 60f, exit 15f
```

**Timing with Sequences:**
```tsx
<Sequence from={0} durationInFrames={90}>    {/* Scene 1: frames 0-89 */}
<Sequence from={90} durationInFrames={90}>   {/* Scene 2: frames 90-179 */}
<Sequence from={180}>                         {/* Scene 3: frame 180 onwards */}
```

## Rendering Reference

```bash
# Basic render
npx remotion render Showcase out/showcase.mp4

# Specific codec
npx remotion render Showcase out/video.webm --codec=vp8

# Custom dimensions (override composition)
npx remotion render TikTok out/tiktok.mp4 --width=1080 --height=1920

# Render specific frames
npx remotion render Showcase out/clip.mp4 --frames=0-90

# ProRes (high quality)
npx remotion render Showcase out/video.mov --codec=prores --prores-profile=4444

# GIF output
npx remotion render Showcase out/animation.gif --codec=gif

# Still image
npx remotion still Showcase out/thumbnail.png --frame=45

# Batch render for multiple platforms
./scripts/batch-render.sh Showcase youtube tiktok square
```

## Hooks

**useAnimation** — Simplified enter/hold/exit animation state.
```tsx
const {opacity, isEntering, isHolding, isExiting, isVisible} = useAnimation({
  enterDuration: 20, holdDuration: 60, exitDuration: 15, type: "spring"
});
```

**useCaptions** — Convert Whisper output to frame-based captions.
```tsx
import {captionsToWords} from "../hooks/useCaptions";
const words = captionsToWords([{text: "Hello", startMs: 0, endMs: 500}], 30);
```

**useColorScheme** — Get a color palette.
```tsx
const colors = useColorScheme("dark"); // colors.bg, colors.text, colors.accent
```

## Agent Skills

This project has 8 specialized skills installed. They provide deep domain knowledge — use them when relevant:

| Skill | When to use |
|---|---|
| **remotion-best-practices** | Always active — correct Remotion API usage, captions, audio, video, transitions, trimming |
| **motion-designer** | Planning scene composition, timing, pacing, camera movement, visual hierarchy, storytelling flow |
| **awwwards-animations** | Premium animations — GSAP, Framer Motion, Anime.js, Lenis patterns for 60fps award-winning quality |
| **animated-component-libraries** | Building UI components — Magic UI (150+ components) and React Bits (90+ components) references |
| **ffmpeg** | Video/audio processing — format conversion, compression, resizing, audio extraction, filters |
| **explainer-video-guide** | Creating explainer or educational videos — structure, scripting, pacing |
| **remotion-render** | Programmatic rendering pipelines and advanced render configuration |
| **playwright-mcp** | Browsing the web for visual references, style inspiration, screenshots of websites |

### Browsing for Visual References

When the user says things like:
- "Make it look like Apple's product videos"
- "I want the style from this website: [url]"
- "Browse for TikTok caption trends"
- "Find me reference styles for tech presentations"

Use the playwright-mcp skill to browse the web, take screenshots, and extract visual references. Then apply those styles to the Remotion compositions. This runs a headless Chromium browser locally — no extensions needed, no internet accounts required.

## Workflow Tips

- Put user media files (videos, images, audio) in `public/assets/` and reference with `staticFile("assets/filename.ext")`
- Register every composition in `src/Root.tsx` or it won't appear in Studio
- Use `<AbsoluteFill>` for layering (last child renders on top)
- Use `<Sequence from={X} durationInFrames={Y}>` for timing
- Use `<Series>` when scenes play sequentially without overlaps
- For frame math: `secondsToFrames(5, 30)` = 150 frames

---

## Video Editing Workflow

Edit existing videos by running the pipeline, then creating a composition.

### Step 1: Place video in project
Copy your video to `public/assets/video.mp4`

### Step 2: Run the pipeline
```bash
npx tsx scripts/analyze-video.ts public/assets/video.mp4    # → public/video-metadata.json
npx tsx scripts/extract-audio.ts public/assets/video.mp4    # → public/assets/audio.wav
npx tsx scripts/transcribe.ts                                # → public/captions.json (word-level)
npx tsx scripts/detect-silence.ts public/assets/video.mp4   # → public/silence.json
```

### Step 3: Create composition using editing components/templates

### Step 4: Preview and render
```bash
npm run dev                                    # Preview in Studio
npx remotion render TalkingHeadEdit out/edited.mp4  # Export
```

## Editing Components

### VideoClip (`src/components/media/VideoClip.tsx`)
Video with seconds-based trimming. Wraps `Video` from `@remotion/media`.
```tsx
<VideoClip
  src={staticFile("assets/video.mp4")}
  trimStartSeconds={5}      // skip first 5 seconds
  trimEndSeconds={30}       // end at 30 seconds
  fit="cover"
  volume={1}
  playbackRate={1}
/>
```

### CaptionOverlay (`src/components/text/CaptionOverlay.tsx`)
TikTok-style captions with word-level highlighting. Loads captions.json automatically.
```tsx
<CaptionOverlay
  captionsSource="captions.json"
  preset="bold"              // classic | bold | outline | glow | box
  position="bottom"          // top | center | bottom
  fontSize={64}
  highlightColor="#39E508"   // active word color
  textColor="#ffffff"
  combineTokensWithinMs={1200}
  offsetMs={0}               // shift timing for clip extraction
/>
```

### JumpCut (`src/components/media/JumpCut.tsx`)
Auto-assembled video from speech segments — removes silence.
```tsx
<JumpCut
  src={staticFile("assets/video.mp4")}
  segments={[
    {startSeconds: 1.2, endSeconds: 5.4},
    {startSeconds: 6.1, endSeconds: 12.3},
  ]}
  paddingSeconds={0.1}
/>
```

### ImageOverlay (`src/components/media/ImageOverlay.tsx`)
Position an image anywhere with enter/exit animations.
```tsx
<ImageOverlay
  src={staticFile("assets/logo.png")}
  x={60} y={60}
  width={120} height={120}
  enterAnimation="scale"
  exitAnimation="fade"
/>
```

### AudioTrack (`src/components/media/AudioTrack.tsx`)
Background music with fade and speech ducking.
```tsx
<AudioTrack
  src={staticFile("assets/music.mp3")}
  volume={0.15}
  fadeInDurationSeconds={2}
  fadeOutDurationSeconds={3}
  duckDuringSegments={speechSegments}
  duckVolume={0.05}
  loop
/>
```

## Editing Templates

### TalkingHeadEdit
All-in-one talking head video editor.
```tsx
<TalkingHeadEdit
  videoSrc="assets/video.mp4"
  captionsPath="captions.json"
  silencePath="silence.json"
  removeSilence={true}
  showCaptions={true}
  captionPreset="bold"
  title="My Video Title"
  speakerName="John Doe"
  speakerTitle="CEO"
  ctaText="Subscribe"
  backgroundMusic="assets/music.mp3"
  musicVolume={0.15}
/>
```

### PodcastClip
Extract a clip from longer content.
```tsx
<PodcastClip
  videoSrc="assets/podcast.mp4"
  clipStartSeconds={120}
  clipEndSeconds={150}
  captionsPath="captions.json"
  showCaptions={true}
  captionPreset="glow"
  title="Best moment from today's episode"
/>
```

## Editing Hooks

**useVideoMetadata** — Load video metadata from pipeline.
```tsx
const metadata = useVideoMetadata("video-metadata.json");
// metadata.duration, metadata.fps, metadata.width, metadata.height
```

**useTranscription** — Load captions with TikTok-style pages.
```tsx
const {captions, pages, isLoading} = useTranscription("captions.json", 1200);
```

**useSilenceSegments** — Load silence detection results.
```tsx
const data = useSilenceSegments("silence.json");
// data.speechSegments, data.silenceSegments, data.totalDuration
```

## Pipeline Scripts

| Script | Input | Output | Purpose |
|---|---|---|---|
| `scripts/analyze-video.ts` | video path | `public/video-metadata.json` | Extract duration, fps, dimensions |
| `scripts/extract-audio.ts` | video path | `public/assets/audio.wav` | 16kHz WAV for Whisper |
| `scripts/transcribe.ts` | audio.wav | `public/captions.json` | Word-level transcription |
| `scripts/detect-silence.ts` | video path | `public/silence.json` | Find speech/silence segments |
| `scripts/remove-bg.ts` | image path | `*-nobg.png` | AI background removal |

## Editing Utilities (`src/utils/editing.ts`)

```tsx
import {buildCutList, mergeSegments, calculateTotalDuration, offsetCaptions} from "../utils/editing";

// Build cut list from speech segments with padding
const cuts = buildCutList(speechSegments, {paddingSeconds: 0.15, minSegmentSeconds: 0.3});

// Merge adjacent segments separated by small gaps
const merged = mergeSegments(cuts, 0.3);

// Calculate total duration
const totalSeconds = calculateTotalDuration(merged);

// Offset captions for clip extraction
const clipped = offsetCaptions(captions, 5000); // shift by 5 seconds
```

## 🌍 External Project Mode (Cowork Skill Integration)

When invoked by the Cowork skill, Editor Pro Max renders videos to the **user's project**, not to its own `video/output/` folder. This section documents the external project rendering flow.

### Architecture

**Normal mode (internal):**
```
/Users/name/Desktop/editor-pro-max-Skill/
├── src/compositions/    ← Create videos here
├── video/output/        ← Render destination
└── CLAUDE.md            ← This file
```

**External mode (Cowork):**
```
/Users/name/my-project/             ← User's project
├── src/components/                  ← User's components
├── videos/renders/                  ← Render destination (created by Editor Pro Max)
└── (user calls Editor Pro Max)

/Users/name/Desktop/editor-pro-max-Skill/  ← Editor Pro Max stays here
├── src/compositions/
└── (renders to user's videos/renders/)
```

### Rendering to External Path

**Command pattern:**
```bash
# Absolute path (safest)
npx remotion render <CompositionId> /Users/name/my-project/videos/renders/video.mp4

# Relative path from editor-pro-max
npx remotion render <CompositionId> ../../my-project/videos/renders/video.mp4
```

**Helper script (optional):**
```bash
#!/bin/bash
# scripts/render-external.sh
# Usage: ./scripts/render-external.sh MyComposition /path/to/user/project video.mp4

COMPOSITION=$1
PROJECT_PATH=$2
OUTPUT_FILE=$3

# Resolve to absolute path
DEST_DIR="$PROJECT_PATH/videos/renders"
mkdir -p "$DEST_DIR"

# Render
npx remotion render "$COMPOSITION" "$DEST_DIR/$OUTPUT_FILE"
echo "✅ Rendered to: $DEST_DIR/$OUTPUT_FILE"
```

### When Creating Compositions for External Render

1. **Import paths must be relative to editor-pro-max**, not the user's project:
   ```tsx
   // ✅ CORRECT
   import { TikTokVideo } from "../templates/social/TikTokVideo";
   
   // ❌ WRONG (user's project structure)
   import { MyComponent } from "../../my-project/src/components/Custom";
   ```

2. **Media files in compositions use relative paths to editor-pro-max:**
   ```tsx
   // ✅ CORRECT
   <FitImage src={staticFile("assets/logo.png")} />
   
   // ❌ WRONG
   <FitImage src={staticFile("../../my-project/assets/logo.png")} />
   ```

3. **User's assets can be passed as props:**
   ```tsx
   interface MyVideoProps {
     userLogoPath: string; // Passed by skill
     brandColors: string[];
   }
   
   export const MyVideo: React.FC<MyVideoProps> = ({
     userLogoPath,
     brandColors,
   }) => {
     // userLogoPath = user's absolute path
     // Render system handles the asset during render
   };
   ```

### Output Location Resolution

When Cowork skill invokes Editor Pro Max:

1. **Skill provides:**
   - Composition ID: `editor-pro-max-promo-tiktok`
   - Output format: TikTok (1080x1920)
   - User's project path: `/Users/name/my-project/`

2. **Claude (this file) should:**
   - Resolve destination: `/Users/name/my-project/videos/renders/`
   - Create directory if missing
   - Render with absolute path
   - Return absolute path to generated video

3. **Example invocation:**
   ```tsx
   // From SKILL.md (Cowork context)
   // User asked: "Create a TikTok for my product launch"
   
   // Claude generates:
   const renderPath = "/Users/name/my-project/videos/renders";
   await sh(`mkdir -p "${renderPath}"`);
   
   const cmd = `npx remotion render editor-pro-max-promo-tiktok "${renderPath}/product_launch_tiktok.mp4"`;
   await sh(cmd);
   
   // Returns: /Users/name/my-project/videos/renders/product_launch_tiktok.mp4
   ```

### Troubleshooting External Renders

**"No such file or directory"**
- Verify absolute path is correct
- Create `videos/renders/` directory in user's project
- Check file permissions (rwx on directory)

**"staticFile not found"**
- Assets must be in editor-pro-max's `public/assets/`
- User assets are passed as props, not as file paths

**"Output file exists, overwrite?"**
- Use `--overwrite` flag: `npx remotion render ... --overwrite`

### Reference

- **SKILL.md** — How Cowork invokes this flow
- **VIDEO_EDITING_SPECS.md** — Rules that apply regardless of render location
- **Root.tsx** — Composition registry (all compositions registered here)
