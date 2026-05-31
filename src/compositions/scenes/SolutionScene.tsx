import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

interface SolutionSceneProps {
  variant?: "master" | "tiktok" | "linkedin";
}

export const SolutionScene: React.FC<SolutionSceneProps> = ({
  variant = "master",
}) => {
  const frame = useCurrentFrame();

  // Wipe transition from right
  const slideX = interpolate(frame, [0, 45], [100, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fontSize = variant === "tiktok" ? 64 : variant === "linkedin" ? 48 : 56;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f23 0%, #1a3a52 100%)",
        opacity,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "#10b981",
          fontFamily: "Inter, sans-serif",
          fontSize,
          fontWeight: "bold",
          transform: `translateX(${slideX}%)`,
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontSize: fontSize * 0.7, color: "#a0aec0", marginBottom: 20 }}>
          ✓ PROBLEM SOLVED
        </div>
        <div>Just Describe What You Want</div>
        <div style={{ fontSize: fontSize * 0.6, color: "#a0aec0", marginTop: 20 }}>
          Claude generates the code
        </div>
      </div>
    </AbsoluteFill>
  );
};
