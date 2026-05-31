# Changelog

All notable changes to Editor Pro Max are documented here.

## [1.2.0] — 2026-05-31 🎬

### Added

- **Promotional Video Suite** — Complete multi-platform promotional video for Editor Pro Max
  - Master version (90s, 1920x1080)
  - TikTok variant (30s, 1080x1920)
  - LinkedIn variant (45s, 1200x628)
  
- **7 Scene Components** (521 lines total)
  - HookScene — 2-second value proposition hook
  - ProblemScene — Pain point cycling with animations
  - SolutionScene — Green success reveal
  - DemoScene — Step-by-step feature demo
  - FeaturesScene — 5 key features cycling
  - StatsScene — Statistics with scale animations
  - CTAScene — Call-to-action with GitHub & website links

- **PROMOTIONAL_VIDEO_SPEC.md** (365 lines)
  - Master script with 7 scenes (90s total)
  - Platform-specific cuts and timing
  - Design specs, audio guidelines, success metrics

- **VIDEO_EDITING_SPECS.md** (467 lines)
  - Professional editing rules (hooks, pacing, transitions)
  - Text sizing by platform and device
  - Brand consistency guidelines
  - Audio mixing and CTA placement
  - Platform-specific engagement checklists
  - Retention curve optimization
  - Pre-render validation checklist

- **External Project Mode** in CLAUDE.md (142 lines)
  - Render to user's project folder instead of editor-pro-max
  - Path resolution for external renders
  - Helper script patterns (render-external.sh)
  - Asset import rules (relative vs absolute)
  - Output location logic and troubleshooting

- **Design System** — src/presets/index.ts
  - Color constants (dark, primary, secondary, success, accent)
  - Typography (fonts, sizes)

### Changed

- **Root.tsx** — Registered "Promotional" folder with 3 compositions
  - editor-pro-max-promo-master
  - editor-pro-max-promo-tiktok
  - editor-pro-max-promo-linkedin

- **README.md** — Clarified Cowork skill vs MCP Server
  - Updated Cowork usage examples
  - Linked to SKILL.md and VIDEO_EDITING_SPECS.md

- **.gitignore** — Added `build/` and `*.skill` artifacts

### Fixed

- MCP Server lifecycle — Added setInterval keep-alive to prevent premature exit
- Package.json URLs — Corrected all repository references to `/editor-pro-max-Skill`
- Missing presets module — Created src/presets/index.ts with design tokens

---

## [1.1.0] — 2026-05-15

### Added

- **GitHub Integration** (MCP tool)
  - Analyze recent commits
  - Auto-suggest video content from repository activity
  
- **Link Analysis** (MCP tool)
  - Web scraping with cheerio + axios
  - Extract design patterns from URLs
  - Brand intelligence detection

- **Multi-Output Platform Support**
  - TikTok (1080x1920, 9:16)
  - Instagram Reel (1080x1920, 9:16)
  - YouTube (1920x1080, 16:9)
  - LinkedIn (1200x628, 1.91:1)
  - Twitter/X (1200x675, 16:9)
  - Facebook (1200x628, 1.91:1)

- **SKILL.md** — Official Cowork skill documentation
  - How Claude uses Editor Pro Max
  - Integration patterns
  - External project rendering

### Changed

- MCP tools expanded from 10 → 12
- CLI argument parsing improved for multi-platform renders

---

## [1.0.0] — 2026-05-01 🚀

### Added

- **MCP Server** with stdio transport
  - 10 core tools (scaffold, generate, edit, render, etc.)
  - Full TypeScript typing
  - JSON schema validation for all tools

- **Remotion Integration**
  - React-based video rendering
  - Hot reload in browser at localhost:3000
  - Multi-platform export (MP4, GIF, WebP)

- **Composition Templates**
  - Social: TikTok, Instagram Reel, YouTube Short
  - Content: Presentation, Testimonial
  - Promo: Announcement, Before/After Demo
  - Editing: Talking Head, Podcast Clip

- **FFmpeg Integration**
  - Audio extraction
  - Silence detection
  - Video analysis
  - Multi-format support

- **Batch Rendering**
  - scripts/batch-render.sh for multi-platform export
  - Automatic resolution scaling
  - Parallel processing support

- **Documentation**
  - MCP_SETUP.md — 4 deployment options (script, npm, PM2, Docker)
  - FFMPEG_INSTALLATION.md — macOS, Linux, Windows guides (bilingual)
  - CLAUDE.md — Motor internal docs with 4 phases

- **Git & GitHub**
  - Semantic commit messages
  - Automated version tracking
  - Skill publication ready

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** — Breaking changes or major new capabilities
- **MINOR** — New features (backwards compatible)
- **PATCH** — Bug fixes and documentation

## Next Steps (v1.3.0 planned)

- Real-time collaboration (multiple editors)
- Advanced audio sync (beat detection)
- AI-powered caption generation
- Batch composition from CSV
- Performance profiling tools
