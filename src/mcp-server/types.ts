// Tipos compartidos para el sistema de generación de videos

export interface BrandIdentity {
  colors: string[];
  fonts: string[];
  toneOfVoice: string;
  imagery: string;
  language: string;
}

export interface ProjectContext {
  type: "nextjs" | "react" | "static" | "wordpress" | "other";
  name: string;
  description: string;
  industry: string;
  brand: BrandIdentity;
  paths: {
    root: string;
    outputs: string;
    greenscreen: string;
    references: string;
  };
}

export interface VideoTask {
  id: string;
  title: string;
  description: string;
  type: "single" | "scheduled";
  format: "tiktok" | "instagram" | "youtube" | "custom";
  duration: number;
  greenscreen: boolean;
  createdAt: Date;
  status: "pending" | "rendering" | "completed" | "failed";
}

export interface ScheduledTask extends VideoTask {
  type: "scheduled";
  frequency: 1 | 2 | 3; // vids per day
  contentTypes: string[];
  schedule: string[]; // horarios (HH:mm)
}

export interface BrandAssets {
  logos?: string[];
  fonts?: {
    name: string;
    family: string;
    weight: string;
  }[];
  colorPalette?: {
    name: string;
    hex: string;
  }[];
}

export interface VideoConfig {
  projectPath: string;
  brand: BrandIdentity;
  outputFolder: string;
  greenscreenFolder: string;
  referenceFolder: string;
  history: string[];
  lastUsedAssets: BrandAssets;
}
