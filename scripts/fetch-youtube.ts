#!/usr/bin/env npx tsx
/**
 * Download a YouTube video using yt-dlp.
 * Usage: npx tsx scripts/fetch-youtube.ts <url> [output-name]
 * Output: public/assets/<output-name>.mp4 (default: video.mp4)
 *
 * Requires yt-dlp installed: brew install yt-dlp  OR  pip install yt-dlp
 */
import {execSync} from "child_process";
import {existsSync, mkdirSync, renameSync, readdirSync} from "fs";
import path from "path";

const url = process.argv[2];
const outputName = process.argv[3] || "video";

if (!url) {
  console.error("Usage: npx tsx scripts/fetch-youtube.ts <youtube-url> [output-name]");
  console.error("  output-name: filename without extension (default: video)");
  process.exit(1);
}

// Verify yt-dlp is installed
try {
  execSync("yt-dlp --version", {stdio: "pipe"});
} catch {
  console.error("yt-dlp not found. Install it with:");
  console.error("  brew install yt-dlp      (macOS)");
  console.error("  pip install yt-dlp       (Python)");
  console.error("  https://github.com/yt-dlp/yt-dlp#installation");
  process.exit(1);
}

const assetsDir = path.join("public", "assets");
if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir, {recursive: true});
}

const outputTemplate = path.join(assetsDir, `${outputName}.%(ext)s`);
const finalPath = path.join(assetsDir, `${outputName}.mp4`);

console.log(`Downloading: ${url}`);
console.log(`Output: ${finalPath}\n`);

// Download: prefer 1080p MP4, merge to MP4, single video (no playlist)
const cmd = [
  "yt-dlp",
  `-f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[ext=mp4]/best"`,
  "--merge-output-format mp4",
  "--no-playlist",
  "--no-warnings",
  `--output "${outputTemplate}"`,
  `"${url}"`,
].join(" ");

try {
  execSync(cmd, {stdio: "inherit"});
} catch {
  console.error("\nDownload failed. Check that the URL is valid and the video is public.");
  process.exit(1);
}

// Rename if yt-dlp saved with a different extension
if (!existsSync(finalPath)) {
  const files = readdirSync(assetsDir).filter(f => f.startsWith(outputName) && f.endsWith(".mp4"));
  if (files.length > 0) {
    renameSync(path.join(assetsDir, files[0]), finalPath);
  } else {
    console.error("Could not find the downloaded file. Check public/assets/.");
    process.exit(1);
  }
}

console.log(`\nDownloaded: ${finalPath}`);
console.log("Next: npx tsx scripts/analyze-video.ts " + finalPath);
