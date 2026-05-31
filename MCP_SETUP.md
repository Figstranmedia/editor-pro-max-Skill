# 🤖 MCP Server Configuration

Guía oficial para integrar Video Editor Pro Max Skill con Claude Cowork via MCP (Model Context Protocol).

---

## Quick Start

### 1. Start the MCP Server

```bash
cd ~/Desktop/editor-pro-max
npm run mcp:start
```

Expected output:
```
🚀 Starting Video Editor Pro Max MCP Server...
📍 The server is now ACTIVE and listening for Cowork connections
Press Ctrl+C to stop the server
```

### 2. In Cowork, use the skill

```
"Analiza mi proyecto y sugiere qué videos crear"
```

Cowork automatically detects and connects to the MCP Server.

---

## Available MCP Tools (12 tools)

### **Project Analysis**

#### `analyze_brand`
Extracts brand identity from project files (colors, fonts, tone of voice).

**Input:**
```json
{
  "projectPath": "/Users/rafafigueroa/some-project"
}
```

**Output:**
```json
{
  "colors": ["#FF5733", "#3498DB"],
  "fonts": ["Inter", "Playfair Display"],
  "toneOfVoice": "professional-technical",
  "imagery": "minimalist"
}
```

---

#### `analyze_project`
Detects project framework (Next.js, React, Vue, etc) and GitHub repository info.

**Input:**
```json
{
  "projectPath": "/Users/rafafigueroa/some-project"
}
```

**Output:**
```json
{
  "framework": "Next.js",
  "packageManager": "npm",
  "hasGit": true,
  "githubUrl": "https://github.com/username/repo"
}
```

---

#### `suggest_folder_structure`
Suggests necessary folders for organizing videos, references, and assets.

**Input:**
```json
{
  "projectPath": "/Users/rafafigueroa/some-project"
}
```

**Output:**
```json
{
  "suggested": [
    "videos/templates",
    "videos/renders",
    "videos/references",
    "assets/brand"
  ]
}
```

---

#### `create_folders`
Creates the suggested folder structure with `.gitkeep` files.

**Input:**
```json
{
  "projectPath": "/Users/rafafigueroa/some-project",
  "folders": ["videos/templates", "videos/renders"]
}
```

---

### **Video Creation & Management**

#### `generate_video_plan`
Generates a detailed plan for creating a video while respecting brand identity.

**Input:**
```json
{
  "projectPath": "/Users/rafafigueroa/some-project",
  "title": "Feature Launch Announcement",
  "description": "Announce new Stripe integration with focus on payment simplicity",
  "format": "tiktok",
  "duration": 15,
  "greenscreen": false
}
```

**Output:**
```json
{
  "plan": {
    "title": "Feature Launch Announcement",
    "scenes": [
      { "type": "intro", "duration": 3, "text": "New in..." },
      { "type": "demo", "duration": 10, "text": "Stripe integration" }
    ],
    "brandColors": ["#FF5733"],
    "musicSuggestion": "upbeat-tech"
  }
}
```

---

#### `create_single_task`
Creates a one-time video task (not recurring).

**Input:**
```json
{
  "projectPath": "/Users/rafafigueroa/some-project",
  "title": "Feature Launch",
  "description": "Stripe integration announcement",
  "format": "tiktok",
  "duration": 15,
  "greenscreen": false
}
```

**Output:**
```json
{
  "taskId": "video_001_20260530",
  "status": "created",
  "videoPath": "~/Desktop/editor-pro-max/videos/renders/video_001_20260530.mp4"
}
```

---

#### `create_scheduled_task`
Creates recurring video tasks (1-3 per day with content variety).

**Input:**
```json
{
  "projectPath": "/Users/rafafigueroa/some-project",
  "title": "Daily Social Content",
  "description": "Automated daily tips and updates",
  "format": "instagram",
  "duration": 20,
  "greenscreen": false,
  "frequency": 2,
  "contentTypes": ["tips", "updates", "testimonials"],
  "schedules": ["09:00", "18:00"]
}
```

**Output:**
```json
{
  "taskId": "scheduled_001_20260530",
  "frequency": 2,
  "nextRun": "2026-05-30 09:00",
  "history": []
}
```

---

#### `get_video_history`
Retrieves all previously created videos to avoid repetition.

**Input:**
```json
{
  "projectPath": "/Users/rafafigueroa/some-project"
}
```

**Output:**
```json
{
  "totalVideos": 5,
  "videos": [
    { "taskId": "video_001", "title": "Feature Launch", "date": "2026-05-28" },
    { "taskId": "video_002", "title": "Tutorial", "date": "2026-05-29" }
  ]
}
```

---

### **GitHub Integration**

#### `analyze_github_changes`
Analyzes recent commits and auto-suggests video content based on commit messages.

**Input:**
```json
{
  "projectPath": "/Users/rafafigueroa/some-project"
}
```

**Output:**
```json
{
  "recentCommits": [
    {
      "message": "feat: Add Stripe integration",
      "type": "feature",
      "suggestedVideo": "Feature Launch Announcement"
    },
    {
      "message": "fix: Payment retry logic",
      "type": "bugfix",
      "suggestedVideo": "Behind the Scenes: Bug Fix"
    }
  ]
}
```

---

### **URL Analysis & Competitive Intelligence**

#### `analyze_link`
Scrapes and analyzes a URL to extract design patterns, colors, fonts, tone.

**Input:**
```json
{
  "url": "https://stripe.com"
}
```

**Output:**
```json
{
  "colors": ["#0066FF", "#FFFFFF"],
  "fonts": ["Helvetica Neue", "Courier"],
  "toneOfVoice": "professional-technical",
  "imageUrl": "https://stripe.com/og-image.png",
  "typography": {
    "headings": "large, sans-serif",
    "body": "medium, sans-serif"
  }
}
```

---

### **Multi-Platform Optimization**

#### `generate_multi_output`
Generates optimization plan to adapt a single video into 6 platform formats.

**Input:**
```json
{
  "title": "Feature Launch",
  "description": "New Stripe integration",
  "duration": 30
}
```

**Output:**
```json
{
  "videoId": "multi_001",
  "platforms": [
    {
      "platform": "tiktok",
      "dimensions": "1080x1920",
      "maxDuration": 180,
      "file": "video_tiktok.mp4"
    },
    {
      "platform": "instagram",
      "dimensions": "1080x1080",
      "maxDuration": 60,
      "file": "video_instagram.mp4"
    },
    {
      "platform": "youtube",
      "dimensions": "1920x1080",
      "maxDuration": 600,
      "file": "video_youtube.mp4"
    },
    {
      "platform": "linkedin",
      "dimensions": "1200x628",
      "maxDuration": 120,
      "file": "video_linkedin.mp4"
    },
    {
      "platform": "twitter",
      "dimensions": "1200x675",
      "maxDuration": 140,
      "file": "video_twitter.mp4"
    },
    {
      "platform": "facebook",
      "dimensions": "1200x628",
      "maxDuration": 240,
      "file": "video_facebook.mp4"
    }
  ]
}
```

---

#### `get_platform_recommendations`
Gets platform-specific recommendations (best times, hashtag count, CTAs).

**Input:**
```json
{
  "platform": "tiktok"
}
```

**Output:**
```json
{
  "platform": "tiktok",
  "bestTimes": ["19:00", "20:00", "21:00"],
  "hashtagCount": 8,
  "cta": "Follow for more tips",
  "captionLength": 150,
  "music": "trending-upbeat"
}
```

---

## Integration Methods

### Option 1: Script Wrapper (Recommended for Development)

```bash
npm run mcp:start
```

The script:
- ✅ Starts the MCP Server
- ✅ Keeps it alive
- ✅ Auto-closes with `Ctrl+C`
- ✅ Logs to `/tmp/editor-pro-max-mcp.log`

---

### Option 2: Direct npm (Simple)

```bash
cd ~/Desktop/editor-pro-max
npm run mcp:server
```

Keep this terminal open. In another terminal, use Cowork normally.

Stop with: `Ctrl+C`

---

### Option 3: PM2 (Production/Always-on)

Install PM2:
```bash
npm install -g pm2
```

Start:
```bash
pm2 start "npm run mcp:server" --name "editor-pro-max-mcp"
```

View logs:
```bash
pm2 logs editor-pro-max-mcp
```

Stop:
```bash
pm2 stop editor-pro-max-mcp
```

---

### Option 4: Docker (Cloud Deployment)

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "mcp:server"]
```

Build and run:
```bash
docker build -t editor-pro-max-mcp .
docker run -it editor-pro-max-mcp
```

---

## Cowork Configuration

If Cowork doesn't auto-detect the server, manually configure:

**File:** `~/.cowork/settings.json`

```json
{
  "mcpServers": {
    "editor-pro-max": {
      "command": "npm",
      "args": ["run", "mcp:server"],
      "cwd": "/Users/rafafigueroa/Desktop/editor-pro-max",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

Then restart Cowork.

---

## Troubleshooting

### Server won't start

```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm install
cd ~/Desktop/editor-pro-max
npm install

# Check FFmpeg (required dependency)
ffmpeg -version
```

See [FFMPEG_INSTALLATION.md](FFMPEG_INSTALLATION.md) for setup.

---

### Server crashes after startup

Check logs:
```bash
cat /tmp/editor-pro-max-mcp.log
```

Common causes:
1. **FFmpeg not installed** → See FFmpeg guide
2. **node_modules outdated** → `npm install`
3. **Port conflict** → Change port in code (default: stdio transport)

---

### Cowork doesn't detect server

1. Verify server is running:
   ```bash
   ps aux | grep "mcp:server"
   ```

2. Check Cowork settings in `~/.cowork/settings.json`

3. Restart Cowork completely (quit + reopen)

4. Check server logs:
   ```bash
   tail -f /tmp/editor-pro-max-mcp.log
   ```

---

## Next Steps

1. ✅ Start the MCP Server: `npm run mcp:start`
2. ✅ Open Cowork and request: *"Analiza mi proyecto"*
3. ✅ Claude uses the skill automatically
4. ✅ Request videos: *"Crea 3 videos para TikTok"*

---

**Questions?** Open an issue on GitHub.
