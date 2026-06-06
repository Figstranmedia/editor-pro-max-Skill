import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {
  useWindowedAudioData,
  visualizeAudio,
  visualizeAudioWaveform,
  createSmoothSvgPath,
  type AudioData,
} from "@remotion/media-utils";

export type AudioVisualizationVariant = "bars" | "waveform" | "circle";

export interface AudioVisualizationProps {
  src: string;
  variant?: AudioVisualizationVariant;
  barCount?: number;
  color?: string;
  secondaryColor?: string;
  height?: number;
  mirror?: boolean;
  position?: "top" | "bottom" | "center";
  offsetX?: number;
  offsetY?: number;
  opacity?: number;
  style?: React.CSSProperties;
}

export const AudioVisualization: React.FC<AudioVisualizationProps> = ({
  src,
  variant = "bars",
  barCount = 64,
  color = "#6366f1",
  secondaryColor,
  height = 120,
  mirror = false,
  position = "bottom",
  offsetX = 0,
  offsetY = 60,
  opacity = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const {audioData, dataOffsetInSeconds} = useWindowedAudioData({
    src,
    frame,
    fps,
    windowInSeconds: 30,
  });

  const positionStyles: React.CSSProperties =
    position === "center"
      ? {top: "50%", left: offsetX, right: offsetX, transform: "translateY(-50%)"}
      : position === "top"
        ? {top: offsetY, left: offsetX, right: offsetX}
        : {bottom: offsetY, left: offsetX, right: offsetX};

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    ...positionStyles,
    height,
    opacity,
    ...style,
  };

  if (!audioData) {
    return <div style={containerStyle} />;
  }

  if (variant === "bars") {
    return (
      <BarsVisualization
        frame={frame}
        fps={fps}
        audioData={audioData}
        dataOffsetInSeconds={dataOffsetInSeconds}
        barCount={barCount}
        color={color}
        secondaryColor={secondaryColor}
        height={height}
        mirror={mirror}
        containerStyle={containerStyle}
        width={width}
      />
    );
  }

  if (variant === "waveform") {
    return (
      <WaveformVisualization
        frame={frame}
        fps={fps}
        audioData={audioData}
        dataOffsetInSeconds={dataOffsetInSeconds}
        barCount={barCount}
        color={color}
        height={height}
        mirror={mirror}
        containerStyle={containerStyle}
        width={width}
      />
    );
  }

  return (
    <CircleVisualization
      frame={frame}
      fps={fps}
      audioData={audioData}
      dataOffsetInSeconds={dataOffsetInSeconds}
      barCount={barCount}
      color={color}
      secondaryColor={secondaryColor}
      height={height}
      containerStyle={containerStyle}
    />
  );
};

interface SharedVizProps {
  frame: number;
  fps: number;
  audioData: NonNullable<AudioData>;
  dataOffsetInSeconds: number;
  barCount: number;
  color: string;
  height: number;
  containerStyle: React.CSSProperties;
}

function BarsVisualization({
  frame,
  fps,
  audioData,
  dataOffsetInSeconds,
  barCount,
  color,
  secondaryColor,
  height,
  mirror,
  containerStyle,
  width,
}: SharedVizProps & {secondaryColor?: string; mirror: boolean; width: number}) {
  const samples = nearestPowerOfTwo(barCount);
  const frequencies = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: samples,
    optimizeFor: "speed",
    dataOffsetInSeconds,
  });

  const gradientId = `av-bars-grad-${frame}`;
  const fillColor = secondaryColor
    ? `url(#${gradientId})`
    : color;

  return (
    <div style={containerStyle}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {secondaryColor && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>
        )}
        {frequencies.map((value, i) => {
          const barW = width / frequencies.length;
          const x = i * barW;
          const barH = value * height * (mirror ? 0.5 : 1);
          const y = mirror ? height / 2 - barH : height - barH;

          return (
            <React.Fragment key={i}>
              <rect
                x={x + 1}
                y={y}
                width={Math.max(barW - 2, 1)}
                height={barH}
                fill={fillColor}
                rx={2}
              />
              {mirror && (
                <rect
                  x={x + 1}
                  y={height / 2}
                  width={Math.max(barW - 2, 1)}
                  height={barH}
                  fill={fillColor}
                  rx={2}
                />
              )}
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
}

function WaveformVisualization({
  frame,
  fps,
  audioData,
  dataOffsetInSeconds,
  barCount,
  color,
  height,
  mirror,
  containerStyle,
  width,
}: SharedVizProps & {mirror: boolean; width: number}) {
  const samples = nearestPowerOfTwo(barCount);
  const waveform = visualizeAudioWaveform({
    fps,
    frame,
    audioData,
    numberOfSamples: samples,
    windowInSeconds: 0.05,
    dataOffsetInSeconds,
  });

  const midY = height / 2;
  const amplitude = mirror ? midY * 0.9 : height * 0.9;

  const points = waveform.map((y, i) => ({
    x: (i / (waveform.length - 1)) * width,
    y: midY + y * amplitude,
  }));

  const path = createSmoothSvgPath({points});

  const mirrorPoints = waveform.map((y, i) => ({
    x: (i / (waveform.length - 1)) * width,
    y: midY - y * amplitude,
  }));
  const mirrorPath = createSmoothSvgPath({points: mirrorPoints});

  return (
    <div style={containerStyle}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <path d={path} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
        {mirror && (
          <path d={mirrorPath} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeOpacity={0.5} />
        )}
      </svg>
    </div>
  );
}

function CircleVisualization({
  frame,
  fps,
  audioData,
  dataOffsetInSeconds,
  barCount,
  color,
  secondaryColor,
  height,
  containerStyle,
}: SharedVizProps & {secondaryColor?: string}) {
  const samples = nearestPowerOfTwo(barCount);
  const frequencies = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: samples,
    optimizeFor: "speed",
    dataOffsetInSeconds,
  });

  const cx = height / 2;
  const cy = height / 2;
  const innerR = height * 0.2;
  const maxBarH = height * 0.25;

  return (
    <div style={{...containerStyle, left: "50%", right: "auto", width: height, transform: "translateX(-50%)"}}>
      <svg width={height} height={height}>
        {frequencies.map((value, i) => {
          const angle = (i / frequencies.length) * 2 * Math.PI - Math.PI / 2;
          const barH = innerR + value * maxBarH;
          const x1 = cx + Math.cos(angle) * innerR;
          const y1 = cy + Math.sin(angle) * innerR;
          const x2 = cx + Math.cos(angle) * barH;
          const y2 = cy + Math.sin(angle) * barH;
          const barColor = secondaryColor
            ? interpolateColor(color, secondaryColor, value)
            : color;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={barColor}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
        <circle cx={cx} cy={cy} r={innerR * 0.7} fill={color} opacity={0.15} />
      </svg>
    </div>
  );
}

function nearestPowerOfTwo(n: number): number {
  return Math.pow(2, Math.round(Math.log2(n)));
}

function interpolateColor(colorA: string, colorB: string, t: number): string {
  const parseHex = (hex: string) => {
    const clean = hex.replace("#", "");
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  };
  if (!colorA.startsWith("#") || !colorB.startsWith("#")) return colorA;
  const a = parseHex(colorA);
  const b = parseHex(colorB);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

