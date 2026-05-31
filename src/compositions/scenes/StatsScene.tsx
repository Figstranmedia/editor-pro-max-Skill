import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface StatsSceneProps {
  variant?: "master" | "tiktok" | "linkedin";
}

const stats = [
  { number: "25+", label: "COMPONENTS" },
  { number: "10", label: "TEMPLATES" },
  { number: "6", label: "PLATFORMS" },
  { number: "0", label: "API KEYS" },
  { number: "∞", label: "POSSIBILITIES" },
];

export const StatsScene: React.FC<StatsSceneProps> = ({ variant = "master" }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Show stats based on variant
  const visibleStats =
    variant === "tiktok" ? stats.slice(0, 3) : variant === "linkedin" ? [] : stats;

  const statDuration = 60 / visibleStats.length;

  const fontSize = variant === "tiktok" ? 48 : 56;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a3e 0%, #0f3460 100%)",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: variant === "tiktok" ? 20 : 40,
          flexWrap: "wrap",
          justifyContent: "center",
          padding: 40,
        }}
      >
        {visibleStats.map((stat, index) => {
          const statFrame = frame - index * statDuration;
          const scaleIn = interpolate(
            statFrame,
            [0, 15],
            [0.5, 1],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={index}
              style={{
                textAlign: "center",
                color: "#10b981",
                fontFamily: "Inter, sans-serif",
                transform: `scale(${scaleIn})`,
                opacity: interpolate(statFrame, [0, 40], [0, 1], {
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <div style={{ fontSize, fontWeight: "bold" }}>{stat.number}</div>
              <div style={{ fontSize: fontSize * 0.5, color: "#a0aec0", marginTop: 5 }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
