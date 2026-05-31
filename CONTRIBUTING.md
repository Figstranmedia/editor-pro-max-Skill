# Contributing to Editor Pro Max

Thanks for interest in contributing! This guide shows how to set up the project and add new features.

## 🚀 Quick Setup

```bash
git clone https://github.com/Figstranmedia/editor-pro-max-Skill.git
cd editor-pro-max-Skill
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## 📁 Project Structure

```
src/
├── Root.tsx                    # Composition registry
├── compositions/               # Video templates
│   ├── PromoVideoMaster.tsx    # Master promotional video
│   ├── Showcase.tsx            # Example showcase
│   └── scenes/                 # Promotional video scenes
├── templates/
│   ├── social/                 # TikTok, Instagram, YouTube templates
│   ├── content/                # Presentations, testimonials
│   ├── promo/                  # Announcements, promos
│   └── editing/                # Video editing (captions, silence removal)
└── presets/
    └── index.ts                # Colors, fonts, design tokens
```

## 🎬 Adding a New Composition

1. **Create component** in `src/compositions/MyVideo.tsx`:

```tsx
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS, FONTS } from "../presets";

export const MyVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Your composition here */}
    </AbsoluteFill>
  );
};
```

2. **Register in Root.tsx**:

```tsx
import { MyVideo } from "./compositions/MyVideo";

// In the appropriate Folder:
<Composition
  id="my-video"
  component={MyVideo}
  durationInFrames={300}
  fps={30}
  width={1920}
  height={1080}
/>
```

3. **Test** with `npm run dev` → select composition in UI

4. **Render** with `npx remotion render my-video out/video.mp4`

## 📐 Follow the Specs

**Before writing any video code, read:**
- [VIDEO_EDITING_SPECS.md](VIDEO_EDITING_SPECS.md) — Editing rules, pacing, typography
- [SKILL.md](SKILL.md) — Integration with Claude Cowork

These specs ensure:
- ✅ Consistent pacing across platforms
- ✅ Readable text on all devices
- ✅ Professional transitions and timing
- ✅ Proper CTA placement

## 🎨 Design System

Use these constants from `src/presets/index.ts`:

```tsx
// Colors
COLORS.dark       // #0f0f0f
COLORS.primary    // #6366f1
COLORS.success    // #10b981
COLORS.accent     // #f59e0b

// Fonts
FONTS.primary     // "Inter, sans-serif"
FONTS.sizes.lg    // 24px
FONTS.sizes.xxl   // 48px
```

## 🧪 Testing Your Work

```bash
# Preview in browser (hot reload)
npm run dev

# Render to MP4
npx remotion render <composition-id> out/video.mp4

# Create thumbnail at frame 45
npx remotion still <composition-id> out/thumb.png --frame=45

# Batch render multiple platforms
./scripts/batch-render.sh MyVideo youtube tiktok instagram
```

## 📝 Commit Messages

Use semantic commits:

```
feat: Add new composition type
fix: Correct timing in DemoScene
docs: Update editing specifications
chore: Update dependencies
```

## 🔍 Code Style

- **TypeScript strict mode** — all types explicit
- **No prop drilling** — use design tokens from `presets`
- **Comments only for WHY** — not WHAT (code should be self-documenting)
- **Platform variants** — support master, tiktok, linkedin props when relevant

## 🚢 Publishing Your Changes

1. Create a feature branch:
   ```bash
   git checkout -b feat/my-feature
   ```

2. Make commits with clear messages

3. Test everything: `npm run dev` + render to MP4

4. Push and create a PR:
   ```bash
   git push origin feat/my-feature
   ```

5. Describe what your feature does and why

## ❓ Questions?

- Read [SKILL.md](SKILL.md) for Claude Cowork integration
- Check [VIDEO_EDITING_SPECS.md](VIDEO_EDITING_SPECS.md) for professional guidelines
- Look at existing compositions in `src/compositions/` for patterns

**Let's build great videos together!** 🎬
