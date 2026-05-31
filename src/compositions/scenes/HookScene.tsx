import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";

interface HookSceneProps {
  variant?: "master" | "tiktok" | "linkedin";
}

export const HookScene: React.FC<HookSceneProps> = ({ variant = "master" }) => {
  const frame = useCurrentFrame();

  // Zoom in animation (0-60 frames = 2 seconds @ 30fps)
  const scale = interpolate(frame, [0, 60], [0.8, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Opacity fade in
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fontSize = variant === "tiktok" ? 80 : variant === "linkedin" ? 56 : 72;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)",
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          lineHeight: 1.4,
        }}
      >
        <div style={{ fontSize, marginBottom: 20 }}>DESCRIBE A VIDEO</div>
        <div style={{ fontSize: fontSize * 0.6, margin: "15px 0" }}>↓</div>
        <div style={{ fontSize, marginBottom: 20 }}>AI GENERATES IT</div>
        <div style={{ fontSize: fontSize * 0.6, margin: "15px 0" }}>↓</div>
        <div style={{ fontSize }}>READY TO POST</div>
      </div>
    </AbsoluteFill>
  );
};
