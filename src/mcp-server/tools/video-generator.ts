import * as fs from "fs";
import * as path from "path";
import { VideoTask, ScheduledTask, ProjectContext } from "../types";

export interface VideoRequest {
  title: string;
  description: string;
  format: "tiktok" | "instagram" | "youtube" | "custom";
  duration: number;
  greenscreen: boolean;
  references?: {
    images?: string[];
    videos?: string[];
    webLink?: string;
  };
}

export interface VideoGenPlan {
  title: string;
  description: string;
  suggestedDimensions: {
    width: number;
    height: number;
    duration: number;
  };
  brandConsiderations: {
    colors: string[];
    fonts: string[];
    toneOfVoice: string;
  };
  estimatedTime: string;
  greenscreenOption: boolean;
  outputPath: string;
}

export async function generateVideoPlan(
  context: ProjectContext,
  request: VideoRequest
): Promise<VideoGenPlan> {
  const dimensions = getFormatDimensions(request.format, request.duration);

  const outputPath = path.join(
    context.paths.outputs,
    `video_${Date.now()}.mp4`
  );

  const plan: VideoGenPlan = {
    title: request.title,
    description: request.description,
    suggestedDimensions: dimensions,
    brandConsiderations: {
      colors: context.brand.colors.slice(0, 3),
      fonts: context.brand.fonts.slice(0, 2),
      toneOfVoice: context.brand.toneOfVoice
    },
    estimatedTime: "2-5 minutos",
    greenscreenOption: request.greenscreen,
    outputPath
  };

  return plan;
}

export async function createVideoTask(
  projectRoot: string,
  request: VideoRequest
): Promise<VideoTask> {
  const task: VideoTask = {
    id: `task_${Date.now()}`,
    title: request.title,
    description: request.description,
    type: "single",
    format: request.format,
    duration: request.duration,
    greenscreen: request.greenscreen,
    createdAt: new Date(),
    status: "pending"
  };

  return task;
}

export async function createScheduledTask(
  projectRoot: string,
  request: VideoRequest,
  frequency: 1 | 2 | 3,
  contentTypes: string[],
  schedules: string[]
): Promise<ScheduledTask> {
  const task: ScheduledTask = {
    id: `scheduled_${Date.now()}`,
    title: request.title,
    description: request.description,
    type: "scheduled",
    format: request.format,
    duration: request.duration,
    greenscreen: request.greenscreen,
    createdAt: new Date(),
    status: "pending",
    frequency,
    contentTypes,
    schedule: schedules
  };

  return task;
}

export async function saveTaskHistory(
  projectRoot: string,
  task: VideoTask | ScheduledTask
): Promise<void> {
  const historyPath = path.join(projectRoot, ".editor-pro-max", "history.json");

  let history: (VideoTask | ScheduledTask)[] = [];

  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
  }

  history.push(task);

  // Crear directorio si no existe
  const dir = path.dirname(historyPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

export async function getVideoHistory(projectRoot: string): Promise<{
  completed: string[];
  themes: string[];
}> {
  const historyPath = path.join(projectRoot, ".editor-pro-max", "history.json");

  const completed: string[] = [];
  const themes: string[] = [];

  if (fs.existsSync(historyPath)) {
    const history = JSON.parse(fs.readFileSync(historyPath, "utf-8"));

    history.forEach((task: VideoTask) => {
      completed.push(task.title);
      themes.push(task.description);
    });
  }

  return { completed, themes };
}

function getFormatDimensions(
  format: string,
  duration: number
): { width: number; height: number; duration: number } {
  const dimensions: Record<string, { width: number; height: number }> = {
    tiktok: { width: 1080, height: 1920 },
    instagram: { width: 1080, height: 1080 },
    youtube: { width: 1920, height: 1080 },
    custom: { width: 1920, height: 1080 }
  };

  const dim = dimensions[format] || dimensions.custom;

  return {
    ...dim,
    duration
  };
}

export async function suggestVideoVariation(
  history: { completed: string[]; themes: string[] },
  currentRequest: VideoRequest
): Promise<string[]> {
  // Sugerir variaciones basadas en lo que ya se ha creado
  const suggestions: string[] = [];

  const recentThemes = history.themes.slice(-5);

  // Si el tema es muy similar, sugerir variaciones
  if (recentThemes.some(theme => theme.toLowerCase().includes("producto"))) {
    suggestions.push("Tips sobre el producto");
    suggestions.push("Testimonio de usuario");
    suggestions.push("Comparativa con competencia");
  }

  if (recentThemes.some(theme => theme.toLowerCase().includes("tutorial"))) {
    suggestions.push("Tutorial avanzado");
    suggestions.push("Casos de uso");
    suggestions.push("Troubleshooting");
  }

  return suggestions;
}
