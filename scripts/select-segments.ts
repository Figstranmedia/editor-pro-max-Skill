#!/usr/bin/env npx tsx
/**
 * Select the best N segments from a video transcript for social media shorts.
 * Uses Claude API (haiku) if ANTHROPIC_API_KEY is set, otherwise uses heuristics.
 *
 * Usage: npx tsx scripts/select-segments.ts <count> [max-duration-seconds]
 * Reads:  public/captions.json, public/silence.json
 * Output: public/segments.json
 */
import {readFileSync, writeFileSync, existsSync} from "fs";
import path from "path";

const count = parseInt(process.argv[2] || "3", 10);
const maxDuration = parseFloat(process.argv[3] || "90");
const minDuration = 25;

interface Caption {
  text: string;
  startMs: number;
  endMs: number;
}

interface SpeechSegment {
  start: number;
  end: number;
}

export interface ShortSegment {
  index: number;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  title: string;
  hook: string;
  reason: string;
  transcript: string;
}

function loadFiles(): {captions: Caption[]; speechSegments: SpeechSegment[]; totalDuration: number} {
  const captionsPath = path.join("public", "captions.json");
  const silencePath = path.join("public", "silence.json");

  if (!existsSync(captionsPath)) {
    console.error("public/captions.json not found. Run transcribe.ts first.");
    process.exit(1);
  }
  if (!existsSync(silencePath)) {
    console.error("public/silence.json not found. Run detect-silence.ts first.");
    process.exit(1);
  }

  const captions: Caption[] = JSON.parse(readFileSync(captionsPath, "utf-8"));
  const silenceData = JSON.parse(readFileSync(silencePath, "utf-8"));

  return {
    captions,
    speechSegments: silenceData.speechSegments,
    totalDuration: silenceData.totalDuration,
  };
}

// Group captions that fall within [startMs, endMs]
function getCaptionsInRange(captions: Caption[], startMs: number, endMs: number): Caption[] {
  return captions.filter(c => c.startMs >= startMs && c.endMs <= endMs);
}

// Build candidate chunks by merging nearby speech segments into windows of minDuration–maxDuration
function buildCandidates(
  speechSegments: SpeechSegment[],
  totalDuration: number,
): Array<{startSeconds: number; endSeconds: number}> {
  const candidates: Array<{startSeconds: number; endSeconds: number}> = [];
  const step = Math.min(maxDuration * 0.5, 30); // sliding window step

  // Strategy 1: natural speech block grouping
  let blockStart = speechSegments[0]?.start ?? 0;
  let blockEnd = speechSegments[0]?.end ?? 0;

  for (let i = 1; i < speechSegments.length; i++) {
    const seg = speechSegments[i];
    const gap = seg.start - blockEnd;

    if (gap < 3 && blockEnd - blockStart < maxDuration) {
      // Merge into current block
      blockEnd = seg.end;
    } else {
      // Emit block if long enough
      if (blockEnd - blockStart >= minDuration) {
        candidates.push({startSeconds: blockStart, endSeconds: Math.min(blockEnd, blockStart + maxDuration)});
      }
      blockStart = seg.start;
      blockEnd = seg.end;
    }
  }
  if (blockEnd - blockStart >= minDuration) {
    candidates.push({startSeconds: blockStart, endSeconds: Math.min(blockEnd, blockStart + maxDuration)});
  }

  // Strategy 2: sliding window over the full video for complete coverage
  for (let start = 0; start + minDuration < totalDuration; start += step) {
    const end = Math.min(start + maxDuration, totalDuration);
    if (end - start >= minDuration) {
      candidates.push({startSeconds: start, endSeconds: end});
    }
  }

  // Deduplicate (remove candidates within 10s of each other)
  const deduped: Array<{startSeconds: number; endSeconds: number}> = [];
  for (const c of candidates) {
    const isDup = deduped.some(d => Math.abs(d.startSeconds - c.startSeconds) < 10);
    if (!isDup) deduped.push(c);
  }

  return deduped;
}

// Heuristic scoring: longer continuous speech + starts/ends cleanly
function scoreHeuristic(captions: Caption[], candidate: {startSeconds: number; endSeconds: number}): number {
  const caps = getCaptionsInRange(captions, candidate.startSeconds * 1000, candidate.endSeconds * 1000);
  if (caps.length === 0) return 0;

  const wordCount = caps.reduce((n, c) => n + c.text.trim().split(/\s+/).length, 0);
  const duration = candidate.endSeconds - candidate.startSeconds;
  const speechDensity = wordCount / duration; // words per second

  // Prefer 45-75s, penalize very short or near-maxDuration
  const durationScore = duration >= 45 && duration <= 75 ? 1.2 : 1.0;

  return speechDensity * durationScore;
}

async function selectWithClaude(
  candidates: Array<{startSeconds: number; endSeconds: number}>,
  captions: Caption[],
): Promise<ShortSegment[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("ANTHROPIC_API_KEY not set — using heuristic selection.");
    return selectHeuristic(candidates, captions);
  }

  // Build candidate summaries for Claude
  const candidateList = candidates.slice(0, 20).map((c, i) => {
    const caps = getCaptionsInRange(captions, c.startSeconds * 1000, c.endSeconds * 1000);
    const text = caps.map(x => x.text).join(" ").trim();
    return `[${i}] ${c.startSeconds.toFixed(1)}s–${c.endSeconds.toFixed(1)}s (${(c.endSeconds - c.startSeconds).toFixed(0)}s):\n${text}`;
  }).join("\n\n");

  const prompt = `You are selecting the best segments from a video transcript to create ${count} standalone social media shorts (TikTok/Reels/Shorts format).

CANDIDATES:
${candidateList}

SELECTION CRITERIA (in order of importance):
1. Self-contained: the segment makes sense without watching the rest of the video
2. Has a clear topic, insight, tip, or story arc
3. Ideally starts with a hook or surprising statement
4. Ends with a conclusion, not mid-sentence
5. Diverse topics (avoid picking 2 segments about the same thing)
6. Duration: 30-90 seconds preferred

Return ONLY valid JSON, no explanation:
{
  "segments": [
    {
      "index": <candidate index number>,
      "title": "<short, catchy title for the short (max 8 words)>",
      "hook": "<the opening hook text (first sentence or question, max 15 words)>",
      "reason": "<one sentence why this is a good short>"
    }
  ]
}

Select exactly ${count} segments.`;

  console.log("Calling Claude (haiku) to select best segments...");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{role: "user", content: prompt}],
    }),
  });

  if (!response.ok) {
    console.warn(`Claude API error (${response.status}) — falling back to heuristics.`);
    return selectHeuristic(candidates, captions);
  }

  const data = await response.json() as {content: Array<{type: string; text: string}>};
  const text = data.content.find(c => c.type === "text")?.text ?? "";

  let parsed: {segments: Array<{index: number; title: string; hook: string; reason: string}>};
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? text);
  } catch {
    console.warn("Could not parse Claude response — falling back to heuristics.");
    return selectHeuristic(candidates, captions);
  }

  return parsed.segments.map((s, i) => {
    const candidate = candidates[s.index] ?? candidates[i];
    const caps = getCaptionsInRange(captions, candidate.startSeconds * 1000, candidate.endSeconds * 1000);
    return {
      index: i,
      startSeconds: candidate.startSeconds,
      endSeconds: candidate.endSeconds,
      durationSeconds: candidate.endSeconds - candidate.startSeconds,
      title: s.title,
      hook: s.hook,
      reason: s.reason,
      transcript: caps.map(c => c.text).join(" ").trim(),
    };
  });
}

function selectHeuristic(
  candidates: Array<{startSeconds: number; endSeconds: number}>,
  captions: Caption[],
): ShortSegment[] {
  const scored = candidates
    .map(c => ({candidate: c, score: scoreHeuristic(captions, c)}))
    .sort((a, b) => b.score - a.score);

  // Pick top N with at least 30s gap between them
  const selected: Array<{startSeconds: number; endSeconds: number}> = [];
  for (const {candidate} of scored) {
    const tooClose = selected.some(s => Math.abs(s.startSeconds - candidate.startSeconds) < 30);
    if (!tooClose) {
      selected.push(candidate);
      if (selected.length >= count) break;
    }
  }

  return selected.map((c, i) => {
    const caps = getCaptionsInRange(captions, c.startSeconds * 1000, c.endSeconds * 1000);
    const text = caps.map(x => x.text).join(" ").trim();
    const firstWords = text.split(/\s+/).slice(0, 8).join(" ");
    return {
      index: i,
      startSeconds: c.startSeconds,
      endSeconds: c.endSeconds,
      durationSeconds: c.endSeconds - c.startSeconds,
      title: `Clip ${i + 1}`,
      hook: firstWords,
      reason: "Selected by speech density and duration heuristic",
      transcript: text,
    };
  });
}

async function main() {
  console.log(`Selecting ${count} best segments (max ${maxDuration}s each)...\n`);

  const {captions, speechSegments, totalDuration} = loadFiles();
  console.log(`  Video: ${totalDuration.toFixed(1)}s total`);
  console.log(`  Captions: ${captions.length} segments`);
  console.log(`  Speech blocks: ${speechSegments.length}`);

  const candidates = buildCandidates(speechSegments, totalDuration);
  console.log(`  Candidates: ${candidates.length}\n`);

  const segments = await selectWithClaude(candidates, captions);

  const outputPath = path.join("public", "segments.json");
  writeFileSync(outputPath, JSON.stringify({segments}, null, 2));

  console.log(`\nSelected ${segments.length} segments → ${outputPath}\n`);
  segments.forEach((s, i) => {
    console.log(`  [${i}] ${s.startSeconds.toFixed(1)}s–${s.endSeconds.toFixed(1)}s (${s.durationSeconds.toFixed(0)}s)`);
    console.log(`       Title: ${s.title}`);
    console.log(`       Hook:  ${s.hook}`);
  });
}

main().catch(err => {
  console.error("Selection failed:", err.message);
  process.exit(1);
});
