import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS, FONTS } from "../presets";
import {
  HookScene,
  ProblemScene,
  SolutionScene,
  DemoScene,
  FeaturesScene,
  StatsScene,
  CTAScene,
} from "./scenes";

/**
 * Editor Pro Max — Master Promotional Video
 * 90 seconds, multi-platform (YouTube master)
 * Used to generate TikTok (30s), YouTube (90s), LinkedIn (45s) versions
 */

export const PromoVideoMaster: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* SCENE 1: HOOK (0-2s = 0-60 frames) */}
      <Sequence from={0} durationInFrames={60}>
        <HookScene />
      </Sequence>

      {/* SCENE 2: PROBLEM (2-10s = 60-300 frames) */}
      <Sequence from={60} durationInFrames={240}>
        <ProblemScene />
      </Sequence>

      {/* SCENE 3: SOLUTION REVEAL (10-15s = 300-450 frames) */}
      <Sequence from={300} durationInFrames={150}>
        <SolutionScene />
      </Sequence>

      {/* SCENE 4: CODE GENERATION & DEMO (15-35s = 450-1050 frames) */}
      <Sequence from={450} durationInFrames={600}>
        <DemoScene />
      </Sequence>

      {/* SCENE 5: FEATURES HIGHLIGHT (35-60s = 1050-1800 frames) */}
      <Sequence from={1050} durationInFrames={750}>
        <FeaturesScene />
      </Sequence>

      {/* SCENE 6: STATS (60-70s = 1800-2100 frames) */}
      <Sequence from={1800} durationInFrames={300}>
        <StatsScene />
      </Sequence>

      {/* SCENE 7: CTA & CLOSING (70-90s = 2100-2700 frames) */}
      <Sequence from={2100} durationInFrames={600}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * TikTok Version (30s, 1080x1920)
 * Hook + Problem (quick) + Solution + Demo (short) + Stats (quick) + CTA
 */
export const PromoVideoTikTok: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* HOOK (2s) */}
      <Sequence from={0} durationInFrames={60}>
        <HookScene variant="tiktok" />
      </Sequence>

      {/* PROBLEM (2s - single pain point) */}
      <Sequence from={60} durationInFrames={60}>
        <ProblemScene variant="tiktok" />
      </Sequence>

      {/* SOLUTION + DEMO (10s - condensed) */}
      <Sequence from={120} durationInFrames={300}>
        <SolutionScene variant="tiktok" />
      </Sequence>

      {/* STATS (2s - top 3) */}
      <Sequence from={420} durationInFrames={60}>
        <StatsScene variant="tiktok" />
      </Sequence>

      {/* CTA (2s - bold, punchy) */}
      <Sequence from={480} durationInFrames={420}>
        <CTAScene variant="tiktok" />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * LinkedIn Version (45s, 1200x628)
 * Problem (professional) + Solution + Demo + Features (business value) + CTA
 */
export const PromoVideoLinkedIn: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* HOOK (2s) */}
      <Sequence from={0} durationInFrames={60}>
        <HookScene variant="linkedin" />
      </Sequence>

      {/* PROBLEM (5s - professional pain points) */}
      <Sequence from={60} durationInFrames={150}>
        <ProblemScene variant="linkedin" />
      </Sequence>

      {/* SOLUTION (3s) */}
      <Sequence from={210} durationInFrames={90}>
        <SolutionScene variant="linkedin" />
      </Sequence>

      {/* DEMO (8s - code generation + preview) */}
      <Sequence from={300} durationInFrames={240}>
        <DemoScene variant="linkedin" />
      </Sequence>

      {/* FEATURES (10s - business value focus) */}
      <Sequence from={540} durationInFrames={300}>
        <FeaturesScene variant="linkedin" />
      </Sequence>

      {/* CTA (17s - professional, detailed) */}
      <Sequence from={840} durationInFrames={510}>
        <CTAScene variant="linkedin" />
      </Sequence>
    </AbsoluteFill>
  );
};
