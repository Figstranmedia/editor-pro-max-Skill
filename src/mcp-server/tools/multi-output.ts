export interface MultiOutputTask {
  baseTitle: string;
  baseDescription: string;
  outputs: OutputFormat[];
  estimatedTime: string;
  renderingStrategy: "parallel" | "sequential";
}

export interface OutputFormat {
  platform: "tiktok" | "instagram" | "youtube" | "linkedin" | "twitter" | "facebook";
  dimensions: {
    width: number;
    height: number;
  };
  duration: number;
  aspectRatio: string;
  fileSize: string;
  recommendations: string[];
}

/**
 * Genera plan de multi-output a partir de una tarea
 */
export async function generateMultiOutputPlan(
  title: string,
  description: string,
  baseDuration: number = 30
): Promise<MultiOutputTask> {
  const outputs = getOptimalFormats(baseDuration);

  return {
    baseTitle: title,
    baseDescription: description,
    outputs,
    estimatedTime: estimateRenderTime(outputs),
    renderingStrategy: "parallel"
  };
}

/**
 * Obtiene formatos óptimos según duración y contenido
 */
function getOptimalFormats(baseDuration: number): OutputFormat[] {
  const formats: OutputFormat[] = [];

  // TikTok
  formats.push({
    platform: "tiktok",
    dimensions: { width: 1080, height: 1920 },
    duration: Math.min(baseDuration, 60),
    aspectRatio: "9:16",
    fileSize: "50-150MB",
    recommendations: [
      "Hook fuerte en primeros 3 segundos",
      "Subtítulos grandes y legibles",
      "Colores vibrantes",
      "Transiciones rápidas"
    ]
  });

  // Instagram Reel
  formats.push({
    platform: "instagram",
    dimensions: { width: 1080, height: 1920 },
    duration: Math.min(baseDuration, 90),
    aspectRatio: "9:16",
    fileSize: "50-150MB",
    recommendations: [
      "Cuadrado es más versátil",
      "Musica sincronizada",
      "Llamada a acción al final",
      "Hashtags en caption"
    ]
  });

  // YouTube Short
  formats.push({
    platform: "youtube",
    dimensions: { width: 1080, height: 1920 },
    duration: Math.min(baseDuration, 60),
    aspectRatio: "9:16",
    fileSize: "50-150MB",
    recommendations: [
      "Custom thumbnail (1280x720)",
      "SEO keywords en description",
      "Timestamps si es tutorial",
      "End screen con suscripción"
    ]
  });

  // LinkedIn Post (horizontal)
  if (baseDuration <= 120) {
    formats.push({
      platform: "linkedin",
      dimensions: { width: 1200, height: 628 },
      duration: Math.min(baseDuration, 120),
      aspectRatio: "16:9",
      fileSize: "100-200MB",
      recommendations: [
        "Tono profesional",
        "Subtítulos bilingües",
        "Conclusión clara",
        "CTA profesional"
      ]
    });
  }

  // Twitter/X
  formats.push({
    platform: "twitter",
    dimensions: { width: 1200, height: 675 },
    duration: Math.min(baseDuration, 30),
    aspectRatio: "16:9",
    fileSize: "30-100MB",
    recommendations: [
      "Mensaje corto y directo",
      "Impactante visualmente",
      "Subtítulos obligatorios",
      "Thread para más contexto"
    ]
  });

  return formats;
}

/**
 * Estima tiempo total de renderizado
 */
function estimateRenderTime(outputs: OutputFormat[]): string {
  // Cada video toma ~2-3 min de renderizado en máquina local
  const estimatedMinutes = outputs.length * 2.5;

  if (estimatedMinutes < 1) {
    return "< 1 minuto";
  } else if (estimatedMinutes < 60) {
    return `${Math.ceil(estimatedMinutes)} minutos`;
  } else {
    const hours = Math.ceil(estimatedMinutes / 60);
    return `${hours} hora${hours > 1 ? "s" : ""}`;
  }
}

/**
 * Adapta un video base para múltiples plataformas
 */
export async function adaptVideoForPlatforms(
  baseVideoPath: string,
  platforms: (typeof OutputFormat.prototype.platform)[] = [
    "tiktok",
    "instagram",
    "youtube"
  ]
): Promise<{
  adaptations: {
    platform: string;
    outputPath: string;
    adjustments: string[];
  }[];
  totalTime: string;
}> {
  const adaptations = [];

  for (const platform of platforms) {
    const format = getOptimalFormats(30).find(f => f.platform === platform);

    if (format) {
      adaptations.push({
        platform,
        outputPath: `./outputs/${platform}_${Date.now()}.mp4`,
        adjustments: format.recommendations
      });
    }
  }

  return {
    adaptations,
    totalTime: estimateRenderTime(adaptations as any)
  };
}

/**
 * Recomendaciones específicas por platform
 */
export function getPlatformRecommendations(
  platform: OutputFormat["platform"]
): {
  bestTime: string;
  hashtagCount: number;
  captions: boolean;
  music: boolean;
  cta: string;
} {
  const recommendations: Record<any, any> = {
    tiktok: {
      bestTime: "6pm-11pm",
      hashtagCount: 3,
      captions: true,
      music: true,
      cta: "Sígueme para más"
    },
    instagram: {
      bestTime: "11am-1pm, 7pm-9pm",
      hashtagCount: 20,
      captions: true,
      music: true,
      cta: "Visita el link en bio"
    },
    youtube: {
      bestTime: "4pm-6pm",
      hashtagCount: 10,
      captions: true,
      music: true,
      cta: "Suscríbete para más"
    },
    linkedin: {
      bestTime: "8am-10am, 5pm-6pm",
      hashtagCount: 5,
      captions: true,
      music: false,
      cta: "Comparte tu opinión"
    },
    twitter: {
      bestTime: "9am-12pm",
      hashtagCount: 2,
      captions: false,
      music: false,
      cta: "Dale RT"
    },
    facebook: {
      bestTime: "1pm-4pm",
      hashtagCount: 5,
      captions: true,
      music: true,
      cta: "Comparte con tu red"
    }
  };

  return recommendations[platform] || recommendations.instagram;
}

/**
 * Batching de renderizado optimizado
 */
export async function planRenderingBatch(
  videoSpecs: MultiOutputTask[]
): Promise<{
  batches: {
    batch: number;
    videos: string[];
    estimatedTime: string;
  }[];
  totalEstimate: string;
}> {
  const batches = [];
  let batchNum = 1;
  let videoCounter = 0;
  let currentBatch: string[] = [];

  for (const spec of videoSpecs) {
    // Máximo 3 videos por batch (para no sobrecargar)
    if (currentBatch.length >= 3) {
      batches.push({
        batch: batchNum,
        videos: currentBatch,
        estimatedTime: `${currentBatch.length * 3} minutos`
      });
      batchNum++;
      currentBatch = [];
    }

    currentBatch.push(spec.baseTitle);
    videoCounter++;
  }

  // Agregar último batch
  if (currentBatch.length > 0) {
    batches.push({
      batch: batchNum,
      videos: currentBatch,
      estimatedTime: `${currentBatch.length * 3} minutos`
    });
  }

  const totalMinutes = videoCounter * 3;
  const totalEstimate =
    totalMinutes < 60
      ? `${totalMinutes} minutos`
      : `${Math.ceil(totalMinutes / 60)} horas`;

  return {
    batches,
    totalEstimate
  };
}
