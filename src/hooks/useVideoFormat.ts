import {useVideoConfig} from "remotion";
import {BRAND} from "../presets/brand";

export type VideoFormat = "vertical" | "horizontal" | "square";

export interface VideoFormatResult {
  format: VideoFormat;
  safeZone: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  typography: {
    captionSize: number;
    hookSize: number;
    bodySize: number;
    ctaSize: number;
    maxWidth: number;
  };
  brandHighlight: string;
}

// Percentages tuned so that on canonical sizes the values match
// 2026 platform safe zone specs documented in VIDEO_EDITING_SPECS.md §11.
// Vertical (1080×1920): safeBottom=420px, safeTop=260px, safeRight=120px, captionSize=68px, hookSize=96px
// Horizontal (1920×1080): safeBottom=80px, safeTop=80px, captionSize=58px, hookSize=100px
// Square (1080×1080): uniform 108px margins, captionSize=54px, hookSize=80px
const FORMAT_CONFIG = {
  vertical: {
    safeBottom: 0.219,    // 420px @ 1920h
    safeTop:    0.1354,   // 260px @ 1920h
    safeLeft:   0.05,     // 54px  @ 1080w
    safeRight:  0.111,    // 120px @ 1080w
    captionSize: 0.063,   // 68px  @ 1080w
    hookSize:    0.0889,  // 96px  @ 1080w
    bodySize:    0.042,   // 45px  @ 1080w
    ctaSize:     0.037,   // 40px  @ 1080w
    maxWidth:    0.88,    // 950px @ 1080w
  },
  horizontal: {
    safeBottom: 0.074,    // 80px  @ 1080h
    safeTop:    0.074,    // 80px  @ 1080h
    safeLeft:   0.05,     // 96px  @ 1920w
    safeRight:  0.05,     // 96px  @ 1920w
    captionSize: 0.030,   // 58px  @ 1920w
    hookSize:    0.052,   // 100px @ 1920w
    bodySize:    0.025,   // 48px  @ 1920w
    ctaSize:     0.022,   // 42px  @ 1920w
    maxWidth:    0.70,    // 1344px @ 1920w
  },
  square: {
    safeBottom: 0.10,     // 108px @ 1080h
    safeTop:    0.10,     // 108px @ 1080h
    safeLeft:   0.05,     // 54px  @ 1080w
    safeRight:  0.05,     // 54px  @ 1080w
    captionSize: 0.050,   // 54px  @ 1080w
    hookSize:    0.074,   // 80px  @ 1080w
    bodySize:    0.035,   // 38px  @ 1080w
    ctaSize:     0.030,   // 32px  @ 1080w
    maxWidth:    0.80,    // 864px @ 1080w
  },
} as const;

export function useVideoFormat(): VideoFormatResult {
  const {width, height} = useVideoConfig();

  const ratio = width / height;
  const format: VideoFormat = ratio < 0.8 ? "vertical" : ratio > 1.2 ? "horizontal" : "square";

  const c = FORMAT_CONFIG[format];
  const W = width;
  const H = height;

  return {
    format,
    safeZone: {
      top:    Math.round(H * c.safeTop),
      bottom: Math.round(H * c.safeBottom),
      left:   Math.round(W * c.safeLeft),
      right:  Math.round(W * c.safeRight),
    },
    typography: {
      captionSize: Math.round(W * c.captionSize),
      hookSize:    Math.round(W * c.hookSize),
      bodySize:    Math.round(W * c.bodySize),
      ctaSize:     Math.round(W * c.ctaSize),
      maxWidth:    Math.round(W * c.maxWidth),
    },
    brandHighlight: BRAND.colors.primary,
  };
}
