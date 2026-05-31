import { BrandIdentity, BrandAssets } from "../types";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

export async function analyzeBrand(projectRoot: string): Promise<BrandIdentity> {
  const brand: BrandIdentity = {
    colors: [],
    fonts: [],
    toneOfVoice: "profesional",
    imagery: "moderno",
    language: "español"
  };

  // 1. Buscar colores en CSS/Tailwind
  try {
    brand.colors = await extractColors(projectRoot);
  } catch (e) {
    console.log("No se encontraron colores en CSS");
  }

  // 2. Buscar fuentes
  try {
    brand.fonts = await extractFonts(projectRoot);
  } catch (e) {
    console.log("No se encontraron fuentes");
  }

  // 3. Analizar tone of voice desde README o contenido
  try {
    brand.toneOfVoice = await analyzeToneOfVoice(projectRoot);
  } catch (e) {
    console.log("No se pudo analizar tone of voice");
  }

  return brand;
}

async function extractColors(projectRoot: string): Promise<string[]> {
  const colors = new Set<string>();

  // Buscar archivos CSS/SCSS/Tailwind
  const patterns = [
    "**/*.css",
    "**/*.scss",
    "tailwind.config.*",
    "**/theme.json"
  ];

  for (const pattern of patterns) {
    const files = findFilesRecursive(projectRoot, pattern);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      // Regex para HEX colors
      const hexMatch = content.match(/#[0-9A-Fa-f]{6}/g);
      if (hexMatch) {
        hexMatch.forEach(color => colors.add(color));
      }
    }
  }

  return Array.from(colors).slice(0, 5); // Top 5 colores
}

async function extractFonts(projectRoot: string): Promise<string[]> {
  const fonts = new Set<string>();

  // Buscar en HTML, CSS, Google Fonts imports
  const htmlFiles = findFilesRecursive(projectRoot, "**/*.html");
  const cssFiles = findFilesRecursive(projectRoot, "**/*.css");

  [...htmlFiles, ...cssFiles].forEach(file => {
    const content = fs.readFileSync(file, "utf-8");

    // Google Fonts: family=FontName
    const googleFonts = content.match(/family=([^&"]+)/g);
    if (googleFonts) {
      googleFonts.forEach(match => {
        const font = match.replace("family=", "");
        fonts.add(font);
      });
    }

    // CSS font-family declarations
    const fontFamilyMatch = content.match(/font-family:\s*['"]?([^;'"]+)['"]?/gi);
    if (fontFamilyMatch) {
      fontFamilyMatch.forEach(match => {
        const font = match.replace(/font-family:\s*['"]?/i, "").replace(/['"]?/g, "").trim();
        fonts.add(font);
      });
    }
  });

  return Array.from(fonts);
}

async function analyzeToneOfVoice(projectRoot: string): Promise<string> {
  // Analizar README o contenido principal
  const readmeFile = findFilesRecursive(projectRoot, "README.md")[0];

  if (readmeFile) {
    const content = fs.readFileSync(readmeFile, "utf-8");

    // Patrones simples para detectar tono
    if (content.toLowerCase().includes("enterprise") || content.toLowerCase().includes("profesional")) {
      return "profesional-corporativo";
    }
    if (content.toLowerCase().includes("fun") || content.toLowerCase().includes("creative")) {
      return "creativo-amigable";
    }
    if (content.toLowerCase().includes("technical") || content.toLowerCase().includes("developer")) {
      return "técnico-directo";
    }
  }

  return "profesional-amigable";
}

function findFilesRecursive(dir: string, pattern: string): string[] {
  const results: string[] = [];

  try {
    const files = fs.readdirSync(dir, { recursive: true });
    files.forEach(file => {
      const filePath = typeof file === "string" ? path.join(dir, file) : file.toString();

      // Simple pattern matching
      if (pattern.includes("*")) {
        const regex = new RegExp(pattern.replace(/\*/g, ".*"));
        if (regex.test(filePath)) {
          results.push(filePath);
        }
      }
    });
  } catch (e) {
    // Directorio no existe
  }

  return results;
}

export async function extractBrandAssets(projectRoot: string): Promise<BrandAssets> {
  const assets: BrandAssets = {
    logos: [],
    fonts: [],
    colorPalette: []
  };

  // Buscar logos
  const imagePatterns = ["**/logo*", "**/brand*", "**/assets/images/*"];
  imagePatterns.forEach(pattern => {
    const files = findFilesRecursive(projectRoot, pattern);
    assets.logos = [...(assets.logos || []), ...files];
  });

  return assets;
}
