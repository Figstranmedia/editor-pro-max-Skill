import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface FeaturesSceneProps {
  variant?: "master" | "tiktok" | "linkedin";
}

const features = [
  { icon: "🧩", title: "25+ COMPONENTS", desc: "Text, backgrounds, overlays, media" },
  { icon: "📋", title: "10 TEMPLATES", desc: "TikTok, Instagram, YouTube, +" },
  { icon: "🤖", title: "AI PIPELINE", desc: "Whisper, FFmpeg, auto-captions" },
  { icon: "📱", title: "6 PLATFORMS", desc: "Optimized dimensions & specs" },
  { icon: "🎨", title: "BRAND CONSISTENCY", desc: "Colors, fonts, style fidelity" },
];

export const FeaturesScene: React.FC<FeaturesSceneProps> = ({
  variant = "master",
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Cycle through features
  const featureDuration = variant === "master" ? 150 : 75;
  const currentFeature = Math.floor(frame / featureDuration);
  const featureProgress = (frame % featureDuration) / featureDuration;

  const scaleY = interpolate(
    featureProgress * 100,
    [0, 20, 80, 100],
    [0, 1, 1, 0.8],
    { extrapolateRight: "clamp" }
  );

  const feature = features[Math.min(currentFeature, features.length - 1)];

  const fontSize = variant === "linkedin" ? 32 : 44;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f23 0%, #1f0f4c 100%)",
        opacity,
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "#e0e7ff",
          fontFamily: "Inter, sans-serif",
          transform: `scaleY(${scaleY})`,
          transformOrigin: "center",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 20 }}>{feature.icon}</div>
        <div style={{ fontSize, fontWeight: "bold", marginBottom: 10 }}>
          {feature.title}
        </div>
        <div style={{ fontSize: fontSize * 0.5, color: "#a0aec0" }}>
          {feature.desc}
        </div>
      </div>
    </AbsoluteFill>
  );
};
