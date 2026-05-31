import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

interface ProblemSceneProps {
  variant?: "master" | "tiktok" | "linkedin";
}

const painPoints = [
  "Hours dragging clips on timeline",
  "Complex color grading",
  "Adding text overlays manually",
  "Exporting takes forever",
  "Multiple formats = multiple renders",
];

const linkedinPainPoints = [
  "Content teams spend 10+ hours editing per week",
  "Manual process = high labor costs",
  "Scaling content is nearly impossible",
  "Brand consistency gets lost in revisions",
  "Time-to-market delays",
];

export const ProblemScene: React.FC<ProblemSceneProps> = ({
  variant = "master",
}) => {
  const frame = useCurrentFrame();
  const points = variant === "linkedin" ? linkedinPainPoints : painPoints;

  // Fade in
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Show different pain points based on frame
  let currentText = "";
  let showIndex = 0;

  if (variant === "master") {
    // Master: 240 frames (8s), 48 frames per point (1.6s each)
    showIndex = Math.floor(frame / 48);
  } else if (variant === "tiktok") {
    // TikTok: 60 frames (2s), all 5 points in quick succession
    showIndex = Math.floor((frame / 60) * 5);
  } else {
    // LinkedIn: 150 frames (5s), 30 frames per point
    showIndex = Math.floor(frame / 30);
  }

  currentText = points[Math.min(showIndex, points.length - 1)] || points[0];

  const textOpacity = interpolate(
    frame % (variant === "master" ? 48 : variant === "linkedin" ? 30 : 12),
    [0, 10, 35, 45],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  const fontSize = variant === "tiktok" ? 56 : variant === "linkedin" ? 48 : 56;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a3e 0%, #2d1b4e 100%)",
        opacity,
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "#ff6b6b",
          fontFamily: "Inter, sans-serif",
          fontSize,
          fontWeight: "600",
          maxWidth: "80%",
          lineHeight: 1.5,
          opacity: textOpacity,
        }}
      >
        {currentText}
      </div>
    </AbsoluteFill>
  );
};
