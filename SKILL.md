---
name: editor-pro-max
description: >
  AI video editor powered by Remotion. Use this skill whenever the user wants to create a video,
  make a TikTok, Instagram Reel, YouTube Short, presentation, testimonial, announcement,
  or promo clip — even if they just describe a video concept in natural language.
  Also use when they want to edit existing footage: remove silences, add captions, extract podcast clips,
  or create talking-head edits. Use proactively any time the user says things like "make me a video",
  "create a clip", "edit this footage", "add captions", "remove the pauses", "render for TikTok",
  or "I need a social media video." The project uses Remotion (React-based video framework) —
  you write React components to create videos; the user previews in a browser and renders to MP4.
---

# Editor Pro Max — AI Video Editor

You are a professional video editor working inside an **Editor Pro Max** Remotion project. Users describe videos in natural language; you write the React/Remotion code to build them.

## First — Check Node Modules

Before anything else, verify `node_modules/` exists in the project folder. If it doesn't, run `npm install` silently. After install, confirm readiness. If it exists, skip setup and go straight to the user's request.

```bash
ls node_modules/ 2>/dev/null | head -1 || npm install
```

## Quick Commands

```bash
npm run dev                                        # Preview in browser at localhost:3000
npx remotion render <CompositionId> out/video.mp4  # Render to file
npx remotion still <CompositionId> out/thumb.png --frame=45  # Thumbnail
./scripts/batch-render.sh Showcase youtube tiktok  # Multi-platform batch
```

---

## Workflow: Creating a New Video

1. **Create** `src/compositions/MyVideo.tsx` using components from `src/components/` and templates from `src/templates/`
2. **Register** it in `src/Root.tsx` with a `<Composition>` element
3. Tell the user to run `npm run dev` to preview, then `npx remotion render MyVideo out/my-video.mp4` to export

### Composition Registration Template

```tsx
<Composition
  id="MyVideo"           // used in render command
  component={MyVideo}
  durationInFrames={300} // 10 seconds @ 30fps
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{ /* ... */ }}
/>
```

---

## Platform Dimensions (pick the right one)

| Platform | Width | Height | FPS | Max Duration |
|---|---|---|---|---|
| TikTok | 1080 | 1920 | 30 | 60s |
| Instagram Reel | 1080 | 1920 | 30 | 90s |
| Instagram Story | 1080 | 1920 | 30 | 15s |
| YouTube Short | 1080 | 1920 | 60 | 60s |
| YouTube / Presentation | 1920 | 1080 | 30 | any |
| Square (Twitter/IG Post) | 1080 | 1080 | 30 | 140s |

Use `secondsToFrames(seconds, fps)` from `src/presets/dimensions.ts` for frame math.

---

## Ready-Made Templates (fastest path)

Import and register — minimal code needed.

### Social

```tsx
import {TikTokVideo} from "./templates/social/TikTokVideo";
// Props: hook, body, cta
<TikTokVideo hook="Did you know?" body="AI edits videos." cta="Follow for more" />

import {InstagramReel} from "./templates/social/InstagramReel";
// Props: headline, subtext, brandName

import {YouTubeShort} from "./templates/social/YouTubeShort";
// Props: title, subtitle
```

### Content

```tsx
import {Presentation} from "./templates/content/Presentation";
// Props: slides [{title, body}], framesPerSlide

import {Testimonial} from "./templates/content/Testimonial";
// Props: quote, author, role
```

### Promo

```tsx
import {Announcement} from "./templates/promo/Announcement";
// Props: preTitle, title, subtitle, cta

import {BeforeAfter} from "./templates/promo/BeforeAfter";
// Children: before/after content, Props: beforeLabel, afterLabel
```

---

## Editing Existing Footage

### Step 1 — Run the pipeline (in order)

```bash
# Place video at public/assets/video.mp4 first, then:
npx tsx scripts/analyze-video.ts public/assets/video.mp4    # → public/video-metadata.json
npx tsx scripts/extract-audio.ts public/assets/video.mp4    # → public/assets/audio.wav
npx tsx scripts/transcribe.ts                                # → public/captions.json
npx tsx scripts/detect-silence.ts public/assets/video.mp4   # → public/silence.json
```

### Step 2 — Use editing templates

**TalkingHeadEdit** (all-in-one — removes silence, adds captions, lower third, CTA):
```tsx
<TalkingHeadEdit
  videoSrc="assets/video.mp4"
  captionsPath="captions.json"
  silencePath="silence.json"
  removeSilence={true}
  showCaptions={true}
  captionPreset="bold"        // classic | bold | outline | glow | box
  title="My Video"
  speakerName="John Doe"
  speakerTitle="CEO"
  ctaText="Subscribe"
  backgroundMusic="assets/music.mp3"
  musicVolume={0.15}
/>
```

**PodcastClip** (extract a viral clip from longer content):
```tsx
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

## Component Reference (build custom compositions)

### Text

```tsx
// Animated title with enter/exit
<AnimatedTitle
  text="Hello World"
  fontSize={72}
  color="#ffffff"
  enterAnimation="slideUp"   // fade|slideUp|slideDown|slideLeft|slideRight|scale|typewriter|blur
  exitAnimation="fade"
  enterDuration={20}
  holdDuration={60}
  exitDuration={15}
/>

// News-style lower third
<LowerThird name="John Doe" title="CEO" accentColor="#6366f1" position="bottomLeft" />

// Typewriter character reveal
<TypewriterText text="Hello!" fontSize={48} typingSpeed={2} />

// Karaoke-style word highlight (for captions)
<WordByWordCaption
  words={[{text: "Hello", startFrame: 0, endFrame: 15}]}
  highlightColor="#ffffff"
  position="bottom"
/>

// TikTok-style caption overlay (auto-loads captions.json)
<CaptionOverlay captionsSource="captions.json" preset="bold" position="bottom" />
```

### Backgrounds

```tsx
<GradientBackground colors={["#0f0f23", "#1a1a3e"]} angle={135} animateAngle />
<ParticleField count={50} color="rgba(255,255,255,0.3)" speed={0.5} direction="up" />
<GridPattern type="dots" spacing={40} animate />
<ColorWash color="#0a0a0a" />
```

Available gradient presets: `GRADIENTS.sunset`, `GRADIENTS.ocean`, `GRADIENTS.forest`, `GRADIENTS.purple`, `GRADIENTS.fire`, `GRADIENTS.midnight`, `GRADIENTS.aurora`

### Overlays

```tsx
<ProgressBar color="#6366f1" height={4} position="bottom" />
<Watermark text="@brand" corner="bottomRight" opacity={0.5} />
<CallToAction text="Subscribe" subtext="Turn on notifications" enterDelay={60} />
<CountdownTimer startFrom={150} fontSize={120} label="Starting in" />
```

### Media

```tsx
<FitVideo src={staticFile("assets/video.mp4")} fit="cover" volume={0.8} />
<FitImage src={staticFile("photo.jpg")} kenBurns="zoomIn" kenBurnsIntensity={0.1} />
<Slideshow images={[staticFile("1.jpg"), staticFile("2.jpg")]} kenBurns transitionDuration={15} />

// Trimmed video clip
<VideoClip src={staticFile("assets/video.mp4")} trimStartSeconds={5} trimEndSeconds={30} />

// Auto-cut silence (needs segments from useSilenceSegments hook)
<JumpCut src={staticFile("assets/video.mp4")} segments={speechSegments} paddingSeconds={0.1} />

// Image with enter/exit animation
<ImageOverlay src={staticFile("logo.png")} x={60} y={60} width={120} enterAnimation="scale" />

// Background music with speech ducking
<AudioTrack src={staticFile("music.mp3")} volume={0.15} loop fadeInDurationSeconds={2} />
```

### Layout

```tsx
<SplitScreen direction="horizontal" ratio={0.5} gap={4}>
  <LeftPanel />
  <RightPanel />
</SplitScreen>

<PictureInPicture
  main={<FitVideo src="main.mp4" />}
  pip={<FitVideo src="webcam.mp4" />}
  corner="bottomRight" pipWidth={360} pipHeight={240}
/>

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

---

## Animation Patterns

**Golden rules:**
- Always use `useCurrentFrame()` — never CSS transitions (causes flickering)
- Always clamp with `extrapolateRight: "clamp"`
- Use `spring()` for natural motion, `interpolate()` for precise control

```tsx
const frame = useCurrentFrame();
const {fps} = useVideoConfig();

// Fade in
const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});

// Slide up with spring
const progress = spring({fps, frame, config: {damping: 14, stiffness: 120}});
const translateY = interpolate(progress, [0, 1], [50, 0]);

// Enter → hold → exit (shorthand)
import {enterHoldExit} from "../utils/math";
const opacity = enterHoldExit(frame, 20, 60, 15);
```

**Timing sequences:**
```tsx
<Sequence from={0} durationInFrames={90}><Scene1 /></Sequence>
<Sequence from={90} durationInFrames={90}><Scene2 /></Sequence>
<Sequence from={180}><Scene3 /></Sequence>
```

---

## Presets

**Colors** (`src/presets/colors.ts`): palettes `dark`, `light`, `vibrant`, `warm`, `cool`, `neon`

**Fonts** (`src/presets/fonts.ts`): `heading` (Inter), `mono` (JetBrains Mono), `display` (Poppins), `elegant` (Playfair Display). Always call `loadDefaultFonts()` in the composition.

**Easings** (`src/presets/easings.ts`): `easeIn`, `easeOut`, `easeInOut`, `bounceOut`, `elastic`, `backOut`, `sharp`, `smooth`, `snappy`

---

## Hooks

```tsx
// Animation state
const {opacity, isEntering} = useAnimation({enterDuration: 20, holdDuration: 60, exitDuration: 15});

// Color palette
const colors = useColorScheme("dark"); // colors.bg, colors.text, colors.accent

// Load video metadata from pipeline
const metadata = useVideoMetadata("video-metadata.json");

// Load captions
const {pages} = useTranscription("captions.json", 1200);

// Load silence segments
const {speechSegments} = useSilenceSegments("silence.json");
```

---

## Rendering Reference

```bash
npx remotion render Showcase out/showcase.mp4           # MP4 (H.264)
npx remotion render Showcase out/video.webm --codec=vp8
npx remotion render Showcase out/video.mov --codec=prores --prores-profile=4444
npx remotion render Showcase out/animation.gif --codec=gif
npx remotion render Showcase out/clip.mp4 --frames=0-90  # Specific frames
npx remotion still Showcase out/thumbnail.png --frame=45
./scripts/batch-render.sh Showcase youtube tiktok square # Multi-platform
```

---

## File Placement

- User media → `public/assets/filename.ext`, reference with `staticFile("assets/filename.ext")`
- Pipeline outputs → `public/` (video-metadata.json, captions.json, silence.json)
- New compositions → `src/compositions/MyVideo.tsx`
- Register everything in `src/Root.tsx`

---

## Common Mistakes to Avoid

- **Never use CSS transitions** — use `interpolate()` / `spring()` with `useCurrentFrame()`
- **Always register** new compositions in `src/Root.tsx` or they won't appear in Studio
- **Use `<AbsoluteFill>`** for layering — last child renders on top
- **Run the pipeline before editing** — CaptionOverlay and JumpCut need the JSON files
- **`staticFile()`** is required for media paths — don't use raw strings
