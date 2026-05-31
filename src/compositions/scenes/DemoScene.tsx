import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface DemoSceneProps {
  variant?: "master" | "tiktok" | "linkedin";
}

const demoSteps = [
  { title: "CODE GENERATION", subtitle: "Claude writes React/Remotion" },
  { title: "PREVIEW IN BROWSER", subtitle: "Remotion Studio in real-time" },
  { title: "10 TEMPLATES", subtitle: "TikTok, Instagram, YouTube, ..." },
  { title: "RENDER FOR ANY PLATFORM", subtitle: "6 formats, one click" },
];

export const DemoScene: React.FC<DemoSceneProps> = ({ variant = "master" }) => {
  const frame = useCurrentFrame();

  // Progress through demo steps
  const stepDuration = variant === "master" ? 150 : variant === "linkedin" ? 60 : 75;
  const currentStep = Math.floor(frame / stepDuration);
  const stepProgress = (frame % stepDuration) / stepDuration;

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scaleIn = interpolate(
    stepProgress * 100,
    [0, 30, 70, 100],
    [0.8, 1, 1, 0.95],
    { extrapolateRight: "clamp" }
  );

  const currentDemoStep = demoSteps[Math.min(currentStep, demoSteps.length - 1)];

  const fontSize = variant === "tiktok" ? 52 : variant === "linkedin" ? 44 : 56;

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
          textAlign: "center",
          color: "#6366f1",
          fontFamily: "JetBrains Mono, monospace",
          fontSize,
          fontWeight: "bold",
          transform: `scale(${scaleIn})`,
          transition: "none",
        }}
      >
        <div style={{ fontSize: fontSize * 0.8, color: "#a0aec0", marginBottom: 15 }}>
          {`[${currentStep + 1}/${demoSteps.length}]`}
        </div>
        <div>{currentDemoStep.title}</div>
        <div style={{ fontSize: fontSize * 0.5, color: "#cbd5e1", marginTop: 10 }}>
          {currentDemoStep.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
