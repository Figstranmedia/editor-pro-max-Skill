import axios from "axios";
import * as cheerio from "cheerio";

export interface LinkAnalysis {
  url: string;
  title?: string;
  description?: string;
  colors?: {
    dominant: string[];
    accent: string[];
  };
  typography?: {
    headings?: string;
    body?: string;
  };
  toneOfVoice?: string;
  imagery?: string;
  contentThemes?: string[];
}

/**
 * Analiza una URL y extrae brand identity
 */
export async function analyzeLink(url: string): Promise<LinkAnalysis> {
  const analysis: LinkAnalysis = {
    url,
    colors: { dominant: [], accent: [] },
    typography: {}
  };

  try {
    // Obtener HTML
    const { data: html } = await axios.get(url, {
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const $ = cheerio.load(html);

    // Extraer título y descripción
    analysis.title = $("title").text() || $('meta[property="og:title"]').attr("content");
    analysis.description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content");

    // Extraer colores del CSS y atributos de estilo
    analysis.colors = extractColors($);

    // Extraer tipografía
    analysis.typography = extractTypography($);

    // Analizar tono desde contenido
    analysis.toneOfVoice = analyzeTone($);

    // Detectar tipo de imagery
    analysis.imagery = detectImagery($);

    // Extraer temas principales
    analysis.contentThemes = extractThemes($);
  } catch (error) {
    console.error(`Error analizando ${url}:`, error instanceof Error ? error.message : String(error));
  }

  return analysis;
}

function extractColors(
  $: cheerio.CheerioAPI
): { dominant: string[]; accent: string[] } {
  const colors = {
    dominant: new Set<string>(),
    accent: new Set<string>()
  };

  // Extraer de estilos inline
  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    const colorMatch = style.match(/#[0-9A-Fa-f]{6}/g);
    if (colorMatch) {
      colorMatch.forEach(color => colors.dominant.add(color));
    }
  });

  // Extraer de etiquetas de estilo
  $("style").each((_, el) => {
    const styleText = $(el).text();
    const colorMatches = styleText.match(/#[0-9A-Fa-f]{6}/g);
    if (colorMatches) {
      colorMatches.forEach(color => colors.dominant.add(color));
    }
  });

  // Limitar a top 3
  return {
    dominant: Array.from(colors.dominant).slice(0, 3),
    accent: Array.from(colors.accent).slice(0, 2)
  };
}

function extractTypography(
  $: cheerio.CheerioAPI
): { headings?: string; body?: string } {
  const typography: { headings?: string; body?: string } = {};

  // Buscar Google Fonts en head
  const googleFonts = $('link[href*="fonts.googleapis.com"]');
  if (googleFonts.length > 0) {
    googleFonts.each((_, el) => {
      const href = $(el).attr("href") || "";
      const fontMatch = href.match(/family=([^&]+)/);
      if (fontMatch) {
        typography.headings = fontMatch[1].replace(/\+/g, " ");
      }
    });
  }

  // Extraer de CSS font-family
  $("style").each((_, el) => {
    const styleText = $(el).text();
    const fontMatches = styleText.match(/font-family:\s*['"]?([^;'"]+)['"]?/i);
    if (fontMatches && !typography.body) {
      typography.body = fontMatches[1].trim();
    }
  });

  return typography;
}

function analyzeTone($: cheerio.CheerioAPI): string {
  const text = $.text().toLowerCase();

  // Palabras clave para detectar tono
  const toneKeywords = {
    "profesional-corporativo": [
      "enterprise",
      "solución",
      "implementación",
      "eficiencia",
      "transformación"
    ],
    "creativo-playful": ["fun", "awesome", "love", "magic", "beautiful", "amazing"],
    "técnico-directo": [
      "api",
      "framework",
      "library",
      "code",
      "developer",
      "technical"
    ],
    educacional: ["learn", "tutorial", "guide", "course", "education", "knowledge"],
    casual: ["hey", "let's", "you're", "we're", "cool", "check out"]
  };

  for (const [tone, keywords] of Object.entries(toneKeywords)) {
    const matches = keywords.filter(kw => text.includes(kw)).length;
    if (matches >= 2) {
      return tone;
    }
  }

  return "profesional-amigable"; // Default
}

function detectImagery($: cheerio.CheerioAPI): string {
  const images = $("img").length;
  const videos = $("video").length;
  const illustrations = $('img[alt*="illustration"], img[alt*="icon"]').length;

  if (illustrations > images / 2) {
    return "ilustrativo-minimalista";
  }
  if (videos > 0) {
    return "video-centric";
  }
  if (images > 5) {
    return "photography-heavy";
  }

  return "minimalista";
}

function extractThemes($: cheerio.CheerioAPI): string[] {
  const themes = new Set<string>();

  // Extraer de headings
  $("h1, h2, h3").each((_, el) => {
    const text = $(el).text().toLowerCase();
    if (text.includes("product")) themes.add("producto");
    if (text.includes("service")) themes.add("servicios");
    if (text.includes("about")) themes.add("empresa");
    if (text.includes("blog")) themes.add("contenido");
    if (text.includes("community")) themes.add("comunidad");
  });

  return Array.from(themes);
}

/**
 * Compara 2 links y sugiere mejoras
 */
export async function compareLinks(url1: string, url2: string): Promise<{
  url1Analysis: LinkAnalysis;
  url2Analysis: LinkAnalysis;
  suggestions: string[];
}> {
  const analysis1 = await analyzeLink(url1);
  const analysis2 = await analyzeLink(url2);

  const suggestions: string[] = [];

  // Comparar colores
  if (analysis2.colors?.dominant && analysis1.colors?.dominant) {
    if (analysis2.colors.dominant.length > analysis1.colors.dominant.length) {
      suggestions.push(
        "Tu competencia usa más colores. Considera expandir tu paleta."
      );
    }
  }

  // Comparar tipografía
  if (
    analysis2.typography?.headings &&
    analysis1.typography?.headings &&
    analysis2.typography.headings !== analysis1.typography.headings
  ) {
    suggestions.push(
      `Competencia usa "${analysis2.typography.headings}". Considera este estilo.`
    );
  }

  return {
    url1Analysis: analysis1,
    url2Analysis: analysis2,
    suggestions
  };
}
