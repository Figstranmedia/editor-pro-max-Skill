import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

interface CTASceneProps {
  variant?: "master" | "tiktok" | "linkedin";
}

export const CTAScene: React.FC<CTASceneProps> = ({ variant = "master" }) => {
  const frame = useCurrentFrame();

  // Fade in
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Scale effect
  const scale = interpolate(frame, [0, 60], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const fontSize =
    variant === "tiktok"
      ? 52
      : variant === "linkedin"
        ? 48
        : 96;

  const secondaryFontSize =
    variant === "tiktok"
      ? 28
      : variant === "linkedin"
        ? 24
        : 42;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
        opacity,
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          transform: `scale(${scale})`,
          lineHeight: 1.2,
        }}
      >
        {/* Main CTA */}
        <div style={{ fontSize, fontWeight: "bold", marginBottom: 20 }}>
          CREATE VIDEOS
        </div>
        <div style={{ fontSize, fontWeight: "bold", marginBottom: 40 }}>
          WITH AI
        </div>

        {/* Links */}
        <div style={{ fontSize: secondaryFontSize, color: "#f0f9ff", marginBottom: 10 }}>
          github.com/Figstranmedia/editor-pro-max-Skill
        </div>
        <div style={{ fontSize: secondaryFontSize, color: "#f0f9ff" }}>
          raffaelfigueroamusic.com/lab
        </div>

        {/* Footer (master & linkedin) */}
        {variant !== "tiktok" && (
          <div
            style={{
              fontSize: secondaryFontSize * 0.6,
              color: "#e0e7ff",
              marginTop: 30,
            }}
          >
            Start creating professional videos today →
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
