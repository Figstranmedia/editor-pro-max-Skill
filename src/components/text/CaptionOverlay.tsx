import React, {useEffect, useMemo, useState} from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  delayRender,
  continueRender,
  cancelRender,
} from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";
import {useVideoFormat} from "../../hooks/useVideoFormat";

export type CaptionPreset = "classic" | "bold" | "outline" | "glow" | "box" | "karaoke";

export interface CaptionOverlayProps {
  captionsSource: string;
  preset?: CaptionPreset;
  position?: "top" | "center" | "bottom";
  fontSize?: number;        // if omitted, auto-calculated from canvas width
  fontFamily?: string;
  highlightColor?: string;
  textColor?: string;
  combineTokensWithinMs?: number;
  offsetMs?: number;
  style?: React.CSSProperties;
}

const PRESET_STYLES: Record<CaptionPreset, {
  bg: string;
  shadow: string;
  stroke: string;
  highlightBg: string;
}> = {
  classic: {
    bg: "transparent",
    shadow: "2px 2px 4px rgba(0,0,0,0.8)",
    stroke: "none",
    highlightBg: "transparent",
  },
  bold: {
    bg: "transparent",
    shadow: "0 4px 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.9)",
    stroke: "none",
    highlightBg: "transparent",
  },
  outline: {
    bg: "transparent",
    shadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
    stroke: "none",
    highlightBg: "transparent",
  },
  glow: {
    bg: "transparent",
    shadow: "0 0 20px rgba(99,102,241,0.8), 0 0 40px rgba(99,102,241,0.4)",
    stroke: "none",
    highlightBg: "transparent",
  },
  box: {
    bg: "rgba(0,0,0,0.75)",
    shadow: "none",
    stroke: "none",
    highlightBg: "rgba(99,102,241,0.9)",
  },
  // Dominant 2026 Reels/TikTok style: thick black outline + yellow/green word highlight
  karaoke: {
    bg: "transparent",
    shadow: [
      "-3px -3px 0 #000",
      " 3px -3px 0 #000",
      "-3px  3px 0 #000",
      " 3px  3px 0 #000",
      " 0px  4px 0 #000",
    ].join(","),
    stroke: "none",
    highlightBg: "transparent",
  },
};

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  captionsSource,
  preset = "bold",
  position = "bottom",
  fontSize,
  fontFamily = FONT_FAMILIES.heading,
  highlightColor = "#FFEE00",
  textColor = "#ffffff",
  combineTokensWithinMs = 800,
  offsetMs = 0,
  style,
}) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading captions"));
  const {fps} = useVideoConfig();

  const format = useVideoFormat();
  const resolvedFontSize = fontSize ?? format.typography.captionSize;
  const {safeZone, typography} = format;

  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  useEffect(() => {
    fetch(staticFile(captionsSource))
      .then((r) => r.json())
      .then((data: Caption[]) => {
        // Apply offset if extracting a clip
        const adjusted = offsetMs
          ? data.map((c) => ({
              ...c,
              startMs: c.startMs - offsetMs,
              endMs: c.endMs - offsetMs,
            }))
          : data;
        setCaptions(adjusted.filter((c) => c.startMs >= 0));
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [captionsSource, offsetMs, handle]);

  const pages = useMemo(() => {
    if (!captions) return [];
    const result = createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: combineTokensWithinMs,
    });
    return result.pages;
  }, [captions, combineTokensWithinMs]);

  if (!captions) return null;

  const positionStyles: React.CSSProperties = {
    top:    {top: safeZone.top},
    center: {top: "50%", transform: "translateY(-50%)"},
    bottom: {bottom: safeZone.bottom},
  }[position];

  const presetStyle = PRESET_STYLES[preset];

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        ...positionStyles,
        ...style,
      }}
    >
      {pages.map((page, index) => {
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const nextStart = pages[index + 1]?.startMs ?? page.startMs + combineTokensWithinMs;
        const endFrame = Math.round((nextStart / 1000) * fps);
        const duration = endFrame - startFrame;

        if (duration <= 0) return null;

        return (
          <Sequence key={index} from={startFrame} durationInFrames={duration}>
            <CaptionPage
              page={page}
              fontSize={resolvedFontSize}
              fontFamily={fontFamily}
              textColor={textColor}
              highlightColor={highlightColor}
              presetStyle={presetStyle}
              preset={preset}
              maxWidth={typography.maxWidth}
            />
          </Sequence>
        );
      })}
    </div>
  );
};

interface CaptionPageProps {
  page: TikTokPage;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  highlightColor: string;
  presetStyle: typeof PRESET_STYLES[CaptionPreset];
  preset: CaptionPreset;
  maxWidth: number;
}

const CaptionPage: React.FC<CaptionPageProps> = ({
  page,
  fontSize,
  fontFamily,
  textColor,
  highlightColor,
  presetStyle,
  preset,
  maxWidth,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const currentTimeMs = (frame / fps) * 1000;
  const absoluteTimeMs = page.startMs + currentTimeMs;

  return (
    <div
      style={{
        textAlign: "center",
        maxWidth,
        padding: preset === "box" ? "12px 20px" : 0,
        borderRadius: preset === "box" ? 8 : 0,
        backgroundColor: preset === "box" ? presetStyle.bg : "transparent",
      }}
    >
      <span
        style={{
          fontSize,
          fontFamily,
          fontWeight: preset === "karaoke" ? 900 : 800,
          lineHeight: 1.25,
          whiteSpace: "pre",
          letterSpacing: preset === "karaoke" ? "0.01em" : "normal",
        }}
      >
        {page.tokens.map((token, i) => {
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;

          return (
            <span
              key={i}
              style={{
                color: isActive ? highlightColor : textColor,
                textShadow: presetStyle.shadow,
                backgroundColor: isActive && preset === "box"
                  ? presetStyle.highlightBg
                  : "transparent",
                borderRadius: preset === "box" ? 4 : 0,
                padding: preset === "box" ? "2px 4px" : 0,
              }}
            >
              {token.text}
            </span>
          );
        })}
      </span>
    </div>
  );
};
