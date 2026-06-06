#!/usr/bin/env npx tsx
/**
 * Full pipeline: YouTube URL → rendered shorts.
 *
 * Usage: npx tsx scripts/youtube-to-shorts.ts <url> [count] [max-duration]
 *   url:          YouTube video URL
 *   count:        Number of shorts to create (default: 3)
 *   max-duration: Max duration per short in seconds (default: 90)
 *
 * Pipeline:
 *   1. Download video       → public/assets/video.mp4
 *   2. Analyze metadata     → public/video-metadata.json
 *   3. Extract audio        → public/assets/audio.wav
 *   4. Transcribe (Whisper) → public/captions.json
 *   5. Detect silence       → public/silence.json
 *   6. Select segments      → public/segments.json
 *   7. Print render commands
 */
import {execSync} from "child_process";
import {existsSync, readFileSync} from "fs";
import path from "path";
import type {ShortSegment} from "./select-segments";

const url = process.argv[2];
const count = parseInt(process.argv[3] || "3", 10);
const maxDuration = parseFloat(process.argv[4] || "90");

if (!url) {
  console.error("Usage: npx tsx scripts/youtube-to-shorts.ts <youtube-url> [count] [max-duration]");
  console.error("  count:        number of shorts (default: 3)");
  console.error("  max-duration: max seconds per short (default: 90)");
  process.exit(1);
}

const videoPath = path.join("public", "assets", "video.mp4");

function run(label: string, cmd: string) {
  console.log(`\n── ${label}`);
  console.log(`   ${cmd}\n`);
  execSync(cmd, {stdio: "inherit"});
}

function skip(label: string, reason: string) {
  console.log(`\n── ${label} [SKIPPED: ${reason}]`);
}

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   YouTube → Shorts Pipeline              ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\n  URL:      ${url}`);
  console.log(`  Shorts:   ${count}`);
  console.log(`  Max dur:  ${maxDuration}s\n`);

  // Step 1: Download
  if (existsSync(videoPath)) {
    skip("Download", "public/assets/video.mp4 already exists — delete to re-download");
  } else {
    run("Step 1/6: Download video", `npx tsx scripts/fetch-youtube.ts "${url}" video`);
  }

  // Step 2: Analyze
  if (existsSync(path.join("public", "video-metadata.json"))) {
    skip("Analyze", "video-metadata.json already exists");
  } else {
    run("Step 2/6: Analyze metadata", `npx tsx scripts/analyze-video.ts "${videoPath}"`);
  }

  // Step 3: Extract audio
  if (existsSync(path.join("public", "assets", "audio.wav"))) {
    skip("Extract audio", "audio.wav already exists");
  } else {
    run("Step 3/6: Extract audio", `npx tsx scripts/extract-audio.ts "${videoPath}"`);
  }

  // Step 4: Transcribe
  if (existsSync(path.join("public", "captions.json"))) {
    skip("Transcribe", "captions.json already exists");
  } else {
    run("Step 4/6: Transcribe", "npx tsx scripts/transcribe.ts");
  }

  // Step 5: Detect silence
  if (existsSync(path.join("public", "silence.json"))) {
    skip("Detect silence", "silence.json already exists");
  } else {
    run("Step 5/6: Detect silence", `npx tsx scripts/detect-silence.ts "${videoPath}"`);
  }

  // Step 6: Select segments
  run("Step 6/6: Select segments", `npx tsx scripts/select-segments.ts ${count} ${maxDuration}`);

  // Print render commands
  const segmentsPath = path.join("public", "segments.json");
  if (!existsSync(segmentsPath)) {
    console.error("segments.json not created. Pipeline failed.");
    process.exit(1);
  }

  const {segments}: {segments: ShortSegment[]} = JSON.parse(readFileSync(segmentsPath, "utf-8"));

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   Pipeline complete — render commands    ║");
  console.log("╚══════════════════════════════════════════╝\n");

  console.log("Preview all in Studio:");
  console.log("  npm run dev\n");

  console.log("Render individual shorts:");
  segments.forEach((s, i) => {
    const output = `out/short_${i}_${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30)}.mp4`;
    const props = JSON.stringify({segmentIndex: i});
    console.log(`  # Short ${i + 1}: "${s.title}"`);
    console.log(`  npx remotion render YouTubeShortClip "${output}" --props='${props}'\n`);
  });

  console.log("Render all at once:");
  const allCmd = segments.map((s, i) => {
    const output = `out/short_${i}.mp4`;
    return `npx remotion render YouTubeShortClip "${output}" --props='{"segmentIndex":${i}}'`;
  }).join(" && \\\n  ");
  console.log(`  ${allCmd}\n`);
}

main().catch(err => {
  console.error("\nPipeline failed:", err.message);
  process.exit(1);
});
