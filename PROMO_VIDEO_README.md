# 🎬 Editor Pro Max — Promotional Video Implementation

This directory contains the complete specification and structure for creating a professional promotional video for the Editor Pro Max skill.

---

## 📁 Files Overview

### **PROMOTIONAL_VIDEO_SPEC.md**
Master specification document with:
- Scene-by-scene breakdown (7 scenes, 90 seconds master)
- Platform-specific cuts (TikTok 30s, YouTube 90s, LinkedIn 45s)
- Design specifications (colors, typography, transitions)
- Audio guidelines (music, voiceover, sound effects)
- Engagement targets and metrics
- Pre-render checklist

### **PromoVideoMaster.tsx**
Main Remotion composition with:
- Master video composition (90s, 1920x1080 for YouTube)
- TikTok version (30s, 1080x1920)
- LinkedIn version (45s, 1200x628)
- Scene sequencing and timing

### **scenes/index.ts**
Scene component exports (to be implemented):
- HookScene (2s)
- ProblemScene (8s in master, configurable)
- SolutionScene (5s)
- DemoScene (20s - code generation + preview)
- FeaturesScene (25s - components, templates, capabilities)
- StatsScene (10s - key metrics)
- CTAScene (20s - call-to-action)

---

## 🚀 Quick Start

### 1. **Set up the scenes** (create individual files)

Each scene file should follow this pattern:

```typescript
// src/compositions/scenes/HookScene.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface SceneProps {
  variant?: "master" | "tiktok" | "linkedin";
}

export const HookScene: React.FC<SceneProps> = ({ variant = "master" }) => {
  const frame = useCurrentFrame();

  // Zoom in animation
  const scale = interpolate(frame, [0, 60], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: variant === "tiktok" ? 80 : 72,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        transform: `scale(${scale})`,
      }}
    >
      <div>
        <div>DESCRIBE A VIDEO</div>
        <div style={{ margin: "20px 0" }}>↓</div>
        <div>AI GENERATES IT</div>
        <div style={{ margin: "20px 0" }}>↓</div>
        <div>READY TO POST</div>
      </div>
    </AbsoluteFill>
  );
};
```

### 2. **Register compositions in Root.tsx**

```typescript
<Composition
  id="editor-pro-max-promo-master"
  component={PromoVideoMaster}
  durationInFrames={2700}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{}}
/>

<Composition
  id="editor-pro-max-promo-tiktok"
  component={PromoVideoTikTok}
  durationInFrames={900}
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{}}
/>

<Composition
  id="editor-pro-max-promo-linkedin"
  component={PromoVideoLinkedIn}
  durationInFrames={1350}
  fps={30}
  width={1200}
  height={628}
  defaultProps={{}}
/>
```

### 3. **Preview in Remotion Studio**

```bash
npm run dev
# Open http://localhost:3000
# Select "editor-pro-max-promo-master", "editor-pro-max-promo-tiktok", or "editor-pro-max-promo-linkedin"
# Preview the video in real-time
```

### 4. **Render videos**

```bash
# YouTube (90s, 1920x1080)
npx remotion render editor-pro-max-promo-master out/promo_youtube.mp4

# TikTok (30s, 1080x1920)
npx remotion render editor-pro-max-promo-tiktok out/promo_tiktok.mp4

# LinkedIn (45s, 1200x628)
npx remotion render editor-pro-max-promo-linkedin out/promo_linkedin.mp4
```

---

## 🎨 Key Design Rules (from VIDEO_EDITING_SPECS.md)

✅ **Hook (2s):** Zoom effect, bold text, immediate impact
✅ **Pacing:** Medium (2-3s shots for YouTube), Fast (1-1.5s for TikTok)
✅ **Transitions:** Zoom (hook), Wipe (problem→solution), Fade (between scenes)
✅ **Text Sizing:**
  - YouTube: 72pt headlines
  - TikTok: 80pt+ (vertical reading)
  - LinkedIn: 56pt (smaller screen)
✅ **Colors:** #6366f1 (indigo), #0f0f23 (dark blue), #10b981 (emerald)
✅ **Audio:** Uplifting tech music (120-130 BPM), optional voiceover
✅ **CTA:** Clear, actionable ("Get started: github.com/Figstranmedia/editor-pro-max-Skill")

---

## 📊 Scene Breakdown & Timing

| Scene | Master | TikTok | LinkedIn | Key Content |
|---|---|---|---|---|
| Hook | 2s (0-60) | 2s (0-60) | 2s (0-60) | "Describe → AI Generates → Ready to Post" |
| Problem | 8s (60-300) | 2s (60-120) | 5s (60-210) | Manual editing pain points |
| Solution | 5s (300-450) | Inline | 3s (210-300) | Problem solved reveal |
| Demo | 20s (450-1050) | 10s (120-420) | 8s (300-540) | Code generation + preview + templates |
| Features | 25s (1050-1800) | Skip | 10s (540-840) | Components, templates, capabilities |
| Stats | 10s (1800-2100) | 2s (420-480) | Skip | Key metrics |
| CTA | 20s (2100-2700) | 2s (480-900) | 17s (840-1350) | Call-to-action, links, closing |

---

## 💡 Implementation Notes

### Scene Dependencies
- All scenes need access to `COLORS` and `FONTS` from `src/presets/`
- Use `useCurrentFrame()` for animations
- Use `interpolate()` for smooth transitions
- Use `spring()` for natural motion

### Platform Variants
- Each scene accepts `variant` prop: "master" | "tiktok" | "linkedin"
- Adjust font sizes, duration, and content based on variant
- TikTok: No voiceover, trending audio required
- YouTube: Full voiceover, educational
- LinkedIn: Professional, business-focused

### Animation Best Practices
- Use `extrapolateRight: "clamp"` to prevent animation overshoot
- Duration should match scene timing (don't animate beyond scene duration)
- Keep animations smooth (0.3-0.8s transitions per VIDEO_EDITING_SPECS)

---

## ✅ Pre-Launch Checklist

- ⬜ All 7 scenes implemented and tested
- ⬜ Master composition (90s) renders correctly
- ⬜ TikTok version (30s) optimized for mobile viewing
- ⬜ LinkedIn version (45s) professional and business-focused
- ⬜ Font sizes legible on target devices
- ⬜ Color palette matches brand (#6366f1, #0f0f23, #10b981)
- ⬜ Transitions smooth (0.3-0.8s)
- ⬜ Audio synced and levels correct
- ⬜ CTA links valid and clickable
- ⬜ All compositions registered in Root.tsx
- ⬜ Rendered videos tested on respective platforms

---

## 🎥 Next Steps

1. **Implement Scene Components:** Create individual scene files in `src/compositions/scenes/`
2. **Register in Root.tsx:** Add composition entries
3. **Preview & Iterate:** Use `npm run dev` to preview and refine
4. **Render:** Export final MP4s for each platform
5. **Post & Measure:** Launch on TikTok, YouTube, LinkedIn and track engagement

---

## 📚 References

- **PROMOTIONAL_VIDEO_SPEC.md** — Full technical specification
- **VIDEO_EDITING_SPECS.md** — Editing rules (hook, pacing, transitions, text sizing, engagement)
- **SKILL.md** — Skill documentation and usage
- [Remotion Docs](https://www.remotion.dev/docs) — Framework reference

---

**Status:** Specification Complete, Ready for Implementation
**Created:** May 31, 2026
**Version:** 1.0
