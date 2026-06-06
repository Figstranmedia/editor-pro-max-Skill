import React from "react";
import {AbsoluteFill, Sequence, staticFile, CalculateMetadataFunction} from "remotion";
import {VideoClip} from "../components/media/VideoClip";
import {CaptionOverlay, type CaptionPreset} from "../components/text/CaptionOverlay";
import {AnimatedTitle} from "../components/text/AnimatedTitle";
import {ProgressBar} from "../components/overlays/ProgressBar";
import {SafeArea} from "../components/layout/SafeArea";
import {Watermark} from "../components/overlays/Watermark";
import {loadDefaultFonts} from "../presets/fonts";
import {BRAND} from "../presets/brand";

export interface YouTubeShortClipProps extends Record<string, unknown> {
  segmentIndex?: number;
  // Resolved by calculateMetadata — do not set manually
  startSeconds?: number;
  endSeconds?: number;
  title?: string;
  hook?: string;
  videoSrc?: string;
  captionPreset?: CaptionPreset;
  accentColor?: string;
  showCaptions?: boolean;
  showHook?: boolean;
}

interface SegmentsFile {
  segments: Array<{
    index: number;
    startSeconds: number;
    endSeconds: number;
    title: string;
    hook: string;
  }>;
}

export const calculateMetadata: CalculateMetadataFunction<YouTubeShortClipProps> = async ({
  props,
  abortSignal,
}) => {
  const response = await fetch(staticFile("segments.json"), {signal: abortSignal});
  const data: SegmentsFile = await response.json();

  const idx = props.segmentIndex ?? 0;
  const seg = data.segments[idx];
  if (!seg) {
    throw new Error(`Segment index ${idx} not found in segments.json`);
  }

  const durationSeconds = seg.endSeconds - seg.startSeconds;
  const fps = 30;

  return {
    durationInFrames: Math.ceil(durationSeconds * fps),
    defaultOutName: `short_${props.segmentIndex}_${seg.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30)}.mp4`,
    props: {
      ...props,
      startSeconds: seg.startSeconds,
      endSeconds: seg.endSeconds,
      title: seg.title,
      hook: seg.hook,
    },
  };
};

export const YouTubeShortClip: React.FC<YouTubeShortClipProps> = ({
  startSeconds = 0,
  endSeconds = 30,
  title,
  hook,
  videoSrc = "assets/video.mp4",
  captionPreset = "karaoke",
  accentColor = "#6366f1",
  showCaptions = true,
  showHook = true,
}) => {
  loadDefaultFonts();

  const src = staticFile(videoSrc);
  const captionsPath = "captions.json";
  const offsetMs = startSeconds * 1000;

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      {/* Source video trimmed to segment */}
      <VideoClip
        src={src}
        trimStartSeconds={startSeconds}
        trimEndSeconds={endSeconds}
        fit="cover"
      />

      {/* Word-level captions synced to segment */}
      {showCaptions && (
        <CaptionOverlay
          captionsSource={captionsPath}
          preset={captionPreset}
          position="bottom"
          offsetMs={offsetMs}
        />
      )}

      {/* Hook text — centered in frame (2026 Reels standard: dead center, 80-120pt) */}
      {showHook && hook && (
        <Sequence from={0} durationInFrames={75}>
          <AbsoluteFill style={{justifyContent: "center", alignItems: "center", paddingLeft: 60, paddingRight: 60}}>
            <AnimatedTitle
              text={hook}
              fontSize={96}
              fontWeight={900}
              color="#ffffff"
              enterAnimation="scale"
              exitAnimation="fade"
              enterDuration={8}
              holdDuration={55}
              exitDuration={10}
              textShadow={[
                "-3px -3px 0 #000",
                " 3px -3px 0 #000",
                "-3px  3px 0 #000",
                " 3px  3px 0 #000",
                " 0    6px 0 #000",
              ].join(",")}
              letterSpacing={-1}
            />
          </AbsoluteFill>
        </Sequence>
      )}

      {/* Title card at bottom start if no captions */}
      {!showCaptions && title && (
        <Sequence from={0} durationInFrames={75}>
          <SafeArea>
            <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 120}}>
              <AnimatedTitle
                text={title}
                fontSize={38}
                fontWeight={700}
                color="#ffffff"
                enterAnimation="slideUp"
                exitAnimation="fade"
                enterDuration={15}
                holdDuration={45}
                exitDuration={12}
                textShadow="0 2px 12px rgba(0,0,0,0.8)"
              />
            </AbsoluteFill>
          </SafeArea>
        </Sequence>
      )}

      {/* Progress bar */}
      <ProgressBar color={accentColor} height={3} position="bottom" />

      {/* Brand watermark — topLeft to avoid right-side UI action buttons (120px blocked) */}
      <Watermark
        text={BRAND.handle}
        corner="topLeft"
        opacity={0.5}
        fontSize={14}
        color="#ffffff"
        margin={40}
      />
    </AbsoluteFill>
  );
};
