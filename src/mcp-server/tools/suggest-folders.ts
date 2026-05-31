import * as fs from "fs";
import * as path from "path";

export interface FolderSuggestion {
  missing: string[];
  recommendations: Record<string, string>;
  questions: string[];
}

export async function suggestFolderStructure(
  projectRoot: string
): Promise<FolderSuggestion> {
  const requiredFolders = [
    "videos-input",
    "videos-output",
    "videos-greenscreen",
    "brand-assets",
    "references"
  ];

  const missing: string[] = [];

  // Verificar qué carpetas no existen
  requiredFolders.forEach(folder => {
    const folderPath = path.join(projectRoot, folder);
    if (!fs.existsSync(folderPath)) {
      missing.push(folder);
    }
  });

  const recommendations: Record<string, string> = {
    "videos-input": "Material que quieres editar (videos, audios)",
    "videos-output": "Videos generados (se crean automáticamente)",
    "videos-greenscreen": "Versiones con fondo verde para post-edición",
    "brand-assets": "Logos, paleta de colores, tipografía",
    "references": "Ejemplos de diseño, inspiración, screenshots"
  };

  const questions = [
    "¿Tienes archivos de marca en Figma o como archivos locales?",
    "¿Prefieres una carpeta por tipo de video (social, promo, etc)?",
    "¿Quieres guardar videos en bruto antes de renderizar?"
  ];

  return {
    missing,
    recommendations,
    questions
  };
}

export async function createFolderStructure(
  projectRoot: string,
  folders: string[]
): Promise<{ created: string[]; failed: string[] }> {
  const created: string[] = [];
  const failed: string[] = [];

  for (const folder of folders) {
    const folderPath = path.join(projectRoot, folder);

    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        created.push(folder);
      }
    } catch (error) {
      failed.push(folder);
    }
  }

  // Crear .gitkeep en cada carpeta para que se trackee en git
  created.forEach(folder => {
    const gitkeepPath = path.join(projectRoot, folder, ".gitkeep");
    try {
      fs.writeFileSync(gitkeepPath, "");
    } catch (e) {
      // Ignorar error
    }
  });

  return { created, failed };
}

export async function analyzeProjectStructure(projectRoot: string): Promise<{
  hasNextJS: boolean;
  hasGitHub: boolean;
  gitRepoUrl?: string;
  packageJson?: Record<string, any>;
  framework?: string;
}> {
  const analysis = {
    hasNextJS: false,
    hasGitHub: false,
    gitRepoUrl: undefined as string | undefined,
    packageJson: undefined as Record<string, any> | undefined,
    framework: undefined as string | undefined
  };

  // Verificar package.json
  const pkgPath = path.join(projectRoot, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      analysis.packageJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

      // Detectar framework
      if (analysis.packageJson && analysis.packageJson.dependencies) {
        const deps = analysis.packageJson.dependencies;
        if (deps["next"]) {
          analysis.hasNextJS = true;
          analysis.framework = "next";
        } else if (deps["react"]) {
          analysis.framework = "react";
        } else if (deps["vue"]) {
          analysis.framework = "vue";
        }
      }
    } catch (e) {
      // Parse error
    }
  }

  // Verificar .git y obtener repo URL
  const gitPath = path.join(projectRoot, ".git");
  if (fs.existsSync(gitPath)) {
    analysis.hasGitHub = true;

    try {
      const configPath = path.join(gitPath, "config");
      const gitConfig = fs.readFileSync(configPath, "utf-8");
      const urlMatch = gitConfig.match(/url = (.+)/);
      if (urlMatch) {
        analysis.gitRepoUrl = urlMatch[1];
      }
    } catch (e) {
      // No se pudo leer config
    }
  }

  return analysis;
}
