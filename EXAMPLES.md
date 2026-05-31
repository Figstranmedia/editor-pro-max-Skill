# Examples — Real Use Cases

Learn how to use Editor Pro Max for common video creation tasks.

---

## 📱 Example 1: Create a TikTok for a New Feature

**Scenario:** You just launched a new feature and need a 30-second TikTok to announce it.

### Using Cowork Skill

```
In Claude Cowork, ask:

"Create a 30-second TikTok video announcing a new AI video editing feature. 
Include a hook about time-saving, show 3 quick benefits, and end with 
'Try it now at github.com/Figstranmedia/editor-pro-max-Skill'"
```

**Cowork will:**
1. ✅ Scaffold an Editor Pro Max project
2. ✅ Generate React/Remotion code
3. ✅ Create a 1080x1920 (9:16) composition
4. ✅ Return the folder path

**Then you:**
```bash
cd /path/to/project
npm run dev                                    # Preview at localhost:3000
npx remotion render TikTokAnnouncement out/video.mp4  # Export
```

**Result:** 30-second MP4, ready to upload to TikTok ✅

---

## 🎥 Example 2: Edit Podcast Footage & Extract 3 Clips

**Scenario:** You recorded a 45-minute podcast. Need to extract 3 short clips for social media.

### Using Editor Pro Max

```bash
# Preview the base composition
npm run dev
# → Select "Editing" > "PodcastClip"
# → Adjust clipStartSeconds and clipEndSeconds in props
```

**For each clip (e.g., timestamps 5:30-6:00, 12:15-12:45, 38:00-38:30):**

```bash
# Clip 1: Minutes 5:30-6:00 (330s-360s)
npx remotion render PodcastClip out/clip-1.mp4 \
  --props '{"clipStartSeconds":330,"clipEndSeconds":360}'

# Clip 2: Minutes 12:15-12:45 (735s-765s)
npx remotion render PodcastClip out/clip-2.mp4 \
  --props '{"clipStartSeconds":735,"clipEndSeconds":765}'

# Clip 3: Minutes 38:00-38:30 (2280s-2310s)
npx remotion render PodcastClip out/clip-3.mp4 \
  --props '{"clipStartSeconds":2280,"clipEndSeconds":2310}'
```

**Result:** 3 vertical 60-second clips ready for Instagram Reels ✅

---

## 🎯 Example 3: Create 4 Versions of the Same Video

**Scenario:** You have one message but need it in 4 formats: TikTok, Instagram, YouTube, LinkedIn.

### Using Batch Rendering

If you have a composition called `ProductDemo`, use:

```bash
./scripts/batch-render.sh ProductDemo youtube tiktok instagram linkedin
```

**This generates:**
- `ProductDemo-youtube.mp4` (1920x1080, 16:9)
- `ProductDemo-tiktok.mp4` (1080x1920, 9:16)
- `ProductDemo-instagram.mp4` (1080x1920, 9:16)
- `ProductDemo-linkedin.mp4` (1200x628, 1.91:1)

**Result:** 4 platform-optimized videos from one composition ✅

---

## 🎬 Example 4: Create a Testimonial Video

**Scenario:** You want a professional testimonial video with a quote, author name, and company logo.

### Step 1: Preview Template

```bash
npm run dev
# → Select "Content" > "Testimonial"
```

### Step 2: Render with Your Data

```bash
npx remotion render Testimonial out/testimonial.mp4 \
  --props '{
    "quote":"This tool saved us 10 hours per week on video editing.",
    "author":"Jane Doe",
    "role":"Creative Director at Acme Corp"
  }'
```

**Template includes:**
- ✅ 3-second fade-in
- ✅ Professional typography
- ✅ 180 frames @ 30fps (6 seconds)
- ✅ Centered, readable text
- ✅ Matching brand colors

**Result:** Professional testimonial video in seconds ✅

---

## 🎨 Example 5: Custom Composition with Your Brand

**Scenario:** You want to create a custom announcement video with your brand colors, fonts, and messaging.

### Step 1: Update Design Presets

Edit `src/presets/index.ts`:

```tsx
export const COLORS = {
  dark: "#1a1a1a",           // Your bg color
  primary: "#ff6b35",        // Your brand color
  secondary: "#004e89",      // Secondary color
  success: "#1dd1a1",        // Success/CTA color
};

export const FONTS = {
  primary: "Poppins, sans-serif",  // Your font
  sizes: {
    sm: 14,
    md: 16,
    lg: 28,    // Larger for impact
    xl: 40,
    xxl: 64,   // Hero text
  },
};
```

### Step 2: Create Composition

Create `src/compositions/BrandAnnouncement.tsx`:

```tsx
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../presets";

export const BrandAnnouncement: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.primary} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <h1 style={{ fontSize: FONTS.sizes.xxl, color: "white", margin: 0 }}>
        🎉 Introducing
      </h1>
      <h2 style={{ fontSize: FONTS.sizes.xl, color: COLORS.secondary, marginTop: 10 }}>
        Your Amazing Product
      </h2>
      <p style={{ fontSize: FONTS.sizes.lg, color: "white", marginTop: 40 }}>
        Available now at yoursite.com
      </p>
    </AbsoluteFill>
  );
};
```

### Step 3: Register in Root.tsx

```tsx
import { BrandAnnouncement } from "./compositions/BrandAnnouncement";

// In "Promo" Folder:
<Composition
  id="BrandAnnouncement"
  component={BrandAnnouncement}
  durationInFrames={300}
  fps={30}
  width={1920}
  height={1080}
/>
```

### Step 4: Preview & Render

```bash
npm run dev                                      # Preview
npx remotion render BrandAnnouncement out/announce.mp4  # Export
```

**Result:** Professional announcement video with your brand identity ✅

---

## ⚡ Example 6: Quick Social Media Post

**Scenario:** You need a LinkedIn post video in 2 minutes.

### One Command

```bash
npm run dev
# → Select "Promo" > "Announcement"
# → Edit defaultProps in Root.tsx with your message:
#   {
#     "preTitle": "New Release",
#     "title": "Meet Editor Pro Max",
#     "subtitle": "AI-powered video editing",
#     "cta": "Learn More"
#   }
npx remotion render Announcement out/post.mp4 --concurrency=1
```

**That's it.** 45-second professional video ✅

---

## 🎓 Example 7: Editing Existing Video with Captions

**Scenario:** You have a 5-minute interview video. Need to add auto-synced captions.

### Using TalkingHeadEdit

```bash
# 1. Copy your video to media/ folder
cp my-interview.mp4 src/media/my-interview.mp4

# 2. Preview with captions
npm run dev
# → Select "Editing" > "TalkingHeadEdit"
# → Set videoSrc, showCaptions, captionPreset in props

# 3. Render with captions
npx remotion render TalkingHeadEdit out/with-captions.mp4 \
  --props '{"videoSrc":"media/my-interview.mp4","showCaptions":true}'
```

**Features:**
- ✅ Auto caption extraction
- ✅ Adjustable caption size
- ✅ Multiple caption presets (bold, outline, shadow)
- ✅ Synchronized with audio

**Result:** Interview video with professional captions ✅

---

## 🚀 Pro Tips

### Batch Render All Variations

```bash
# Render same composition for all 6 platforms
for platform in youtube tiktok instagram linkedin twitter facebook; do
  npx remotion render MyComposition out/video-$platform.mp4 \
    --props "{\"platform\":\"$platform\"}"
done
```

### Preview Before Rendering

**Always do this:**
1. `npm run dev` → Select composition
2. Check timing, text readability, colors
3. Verify platform dimensions match (1920x1080, 1080x1920, etc.)
4. Then render to file

### Optimize Video Size

```bash
# For web (smaller file, lower bitrate)
npx remotion render MyComposition out/web.mp4 --every-nth-frame=2

# For archive (highest quality)
npx remotion render MyComposition out/archive.mp4 --concurrency=1
```

### Create Thumbnail for Thumbnail

```bash
npx remotion still MyComposition out/thumbnail.png --frame=45
```

---

## 📚 Learn More

- **[SKILL.md](SKILL.md)** — How Cowork skill integration works
- **[VIDEO_EDITING_SPECS.md](VIDEO_EDITING_SPECS.md)** — Professional editing rules
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to add new compositions
- **[CLAUDE.md](CLAUDE.md)** — Internal motor documentation

---

## ❓ Troubleshooting

**Q: Video renders but looks tiny/huge**
A: Check dimensions match your target platform. Edit in Root.tsx.

**Q: Text is unreadable on mobile**
A: Use FONTS.sizes from presets. Follow TEXT SIZING rules in VIDEO_EDITING_SPECS.md.

**Q: Render takes forever**
A: Use `--concurrency=2` flag. Or render in smaller chunks.

**Q: Where's my output file?**
A: By default: `./out/video.mp4`. Check with `ls -lh out/`

---

**Ready to create?** Pick an example above and get started! 🎬
