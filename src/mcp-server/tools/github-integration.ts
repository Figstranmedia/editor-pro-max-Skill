import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface GitHubChange {
  type: "added" | "modified" | "deleted";
  file: string;
  size?: number;
  description?: string;
}

export interface VideoSuggestion {
  title: string;
  description: string;
  type: "feature" | "bugfix" | "release" | "documentation" | "refactor";
  priority: "high" | "medium" | "low";
  suggestedLength: number;
}

/**
 * Analiza cambios en el repo y sugiere videos
 */
export async function analyzeRecentChanges(
  projectRoot: string
): Promise<{
  changes: GitHubChange[];
  suggestions: VideoSuggestion[];
  lastCommit: string;
}> {
  const changes: GitHubChange[] = [];
  const suggestions: VideoSuggestion[] = [];

  try {
    // Obtener últimos commits
    const lastCommitHash = execSync("git log -1 --format=%H", {
      cwd: projectRoot,
      encoding: "utf-8"
    }).trim();

    const lastCommitMessage = execSync("git log -1 --format=%B", {
      cwd: projectRoot,
      encoding: "utf-8"
    }).trim();

    // Obtener archivos cambiados en el último commit
    const changedFiles = execSync("git diff-tree --no-commit-id --name-status -r HEAD", {
      cwd: projectRoot,
      encoding: "utf-8"
    })
      .trim()
      .split("\n");

    // Procesar cambios
    changedFiles.forEach(line => {
      const [type, file] = line.split(/\t+/);
      if (file) {
        changes.push({
          type: (type as "A" | "M" | "D").replace("A", "added").replace("M", "modified").replace("D", "deleted") as any,
          file,
          description: getFileDescription(file)
        });
      }
    });

    // Generar sugerencias basadas en cambios y mensaje de commit
    suggestions.push(...generateVideoSuggestions(changes, lastCommitMessage));

    return {
      changes,
      suggestions,
      lastCommit: lastCommitHash
    };
  } catch (error) {
    // No es un repo git
    return {
      changes: [],
      suggestions: [],
      lastCommit: ""
    };
  }
}

/**
 * Analiza archivos específicos (package.json, README, etc)
 */
export async function analyzeProjectUpdates(projectRoot: string): Promise<{
  newDependencies?: string[];
  versionBumps?: { package: string; old: string; new: string }[];
  readmeUpdated?: boolean;
  newFeatures?: string[];
}> {
  const analysis: any = {};

  // Verificar si hay cambios en package.json
  try {
    const pkgPath = path.join(projectRoot, "package.json");
    if (fs.existsSync(pkgPath)) {
      // Lógica para comparar versiones
      analysis.newDependencies = [];
      analysis.versionBumps = [];
    }
  } catch (e) {
    // Ignorar
  }

  // Verificar si README fue actualizado
  try {
    const readmePath = path.join(projectRoot, "README.md");
    const gitLog = execSync("git log --oneline -n 5", {
      cwd: projectRoot,
      encoding: "utf-8"
    });

    analysis.readmeUpdated = gitLog.includes("README") || gitLog.includes("readme");
  } catch (e) {
    // Ignorar
  }

  return analysis;
}

function getFileDescription(filePath: string): string {
  if (filePath.includes("README")) return "Documentation update";
  if (filePath.includes("package.json")) return "Dependency or version change";
  if (filePath.includes("src/")) return "Code change";
  if (filePath.includes("test")) return "Test update";
  if (filePath.includes("config")) return "Configuration change";
  return "File update";
}

function generateVideoSuggestions(
  changes: GitHubChange[],
  commitMessage: string
): VideoSuggestion[] {
  const suggestions: VideoSuggestion[] = [];

  // Detectar tipo de cambio desde el mensaje de commit
  const messageLC = commitMessage.toLowerCase();

  if (messageLC.includes("feat:") || messageLC.includes("feature")) {
    suggestions.push({
      title: "New Feature Announcement",
      description:
        "Announce the new feature to your audience. Show what problem it solves.",
      type: "feature",
      priority: "high",
      suggestedLength: 30
    });
  }

  if (messageLC.includes("fix:") || messageLC.includes("bug")) {
    suggestions.push({
      title: "Bug Fix Explained",
      description: "Explain the bug and how you fixed it (great for devs/users)",
      type: "bugfix",
      priority: "medium",
      suggestedLength: 15
    });
  }

  if (messageLC.includes("release") || messageLC.includes("v1.")) {
    suggestions.push({
      title: "Release Announcement",
      description: "Announce your release with key features and improvements",
      type: "release",
      priority: "high",
      suggestedLength: 45
    });
  }

  if (
    changes.some(c => c.file.includes("README") || c.file.includes("docs"))
  ) {
    suggestions.push({
      title: "Documentation Tutorial",
      description: "Create a video walkthrough of your new documentation",
      type: "documentation",
      priority: "medium",
      suggestedLength: 60
    });
  }

  // Default suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      title: "What's New This Week",
      description: "Show what you've been working on",
      type: "feature",
      priority: "medium",
      suggestedLength: 30
    });
  }

  return suggestions;
}

/**
 * Obtiene el README del proyecto para context
 */
export async function getProjectReadme(projectRoot: string): Promise<string> {
  const readmePath = path.join(projectRoot, "README.md");

  if (fs.existsSync(readmePath)) {
    return fs.readFileSync(readmePath, "utf-8").slice(0, 2000); // Primeros 2000 chars
  }

  return "";
}
