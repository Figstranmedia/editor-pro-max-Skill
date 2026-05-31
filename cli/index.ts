#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import * as path from "path";
import * as fs from "fs";
import {
  analyzeBrand,
  extractBrandAssets
} from "../src/mcp-server/tools/analyze-brand.js";
import {
  suggestFolderStructure,
  createFolderStructure,
  analyzeProjectStructure
} from "../src/mcp-server/tools/suggest-folders.js";
import {
  generateVideoPlan,
  createVideoTask,
  createScheduledTask,
  saveTaskHistory,
  getVideoHistory,
  suggestVideoVariation
} from "../src/mcp-server/tools/video-generator.js";

async function main() {
  console.clear();
  console.log(chalk.bold.cyan("🎬 Editor Pro Max — Video Generator"));
  console.log(chalk.gray("AI-powered video creation with brand intelligence\n"));

  // Obtener ruta del proyecto
  const projectRoot = process.cwd();

  // Fase 1: Analizar proyecto y brand
  console.log(chalk.bold("📍 Analizando proyecto..."));
  const projectAnalysis = await analyzeProjectStructure(projectRoot);
  const brand = await analyzeBrand(projectRoot);

  console.log(chalk.green("✓ Análisis completado\n"));

  // Mostrar lo que detectó
  if (projectAnalysis.framework) {
    console.log(chalk.yellow(`Framework detectado: ${projectAnalysis.framework}`));
  }
  if (projectAnalysis.hasGitHub) {
    console.log(chalk.yellow(`Repositorio GitHub: ${projectAnalysis.gitRepoUrl}`));
  }

  console.log(chalk.yellow(`Identidad de marca detectada:`));
  console.log(chalk.gray(`  Colores: ${brand.colors.join(", ") || "No detectados"}`));
  console.log(chalk.gray(`  Fuentes: ${brand.fonts.join(", ") || "No detectadas"}`));
  console.log(chalk.gray(`  Tono: ${brand.toneOfVoice}\n`));

  // Fase 2: Sugerir carpetas
  const folderSuggestion = await suggestFolderStructure(projectRoot);

  if (folderSuggestion.missing.length > 0) {
    console.log(chalk.bold("📁 Carpetas recomendadas:"));
    folderSuggestion.missing.forEach(folder => {
      console.log(
        chalk.gray(`  • ${folder} — ${folderSuggestion.recommendations[folder]}`)
      );
    });

    const { createFolders } = await inquirer.prompt([
      {
        type: "confirm",
        name: "createFolders",
        message: "¿Crear estas carpetas ahora?",
        default: true
      }
    ]);

    if (createFolders) {
      const { created, failed } = await createFolderStructure(
        projectRoot,
        folderSuggestion.missing
      );
      console.log(chalk.green(`✓ ${created.length} carpeta(s) creada(s)\n`));
    }
  }

  // Fase 3: Menú principal
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "¿Qué quieres hacer?",
      choices: [
        { name: "Crear un video", value: "create" },
        { name: "Automatizar videos (1-3/día)", value: "schedule" },
        { name: "Ver historial", value: "history" },
        { name: "Salir", value: "exit" }
      ]
    }
  ]);

  if (action === "exit") {
    console.log(chalk.gray("Hasta luego!"));
    process.exit(0);
  }

  if (action === "history") {
    const history = await getVideoHistory(projectRoot);
    console.log(chalk.bold("\n📋 Historial de videos:"));
    history.completed.forEach((title, i) => {
      console.log(chalk.gray(`  ${i + 1}. ${title}`));
    });
    console.log();
    return main();
  }

  // Fase 4: Crear video
  if (action === "create" || action === "schedule") {
    const { videoTitle, videoDescription, format, duration, greenscreen } =
      await inquirer.prompt([
        {
          type: "input",
          name: "videoTitle",
          message: "¿Título del video?"
        },
        {
          type: "input",
          name: "videoDescription",
          message: "¿Descripción/contenido?"
        },
        {
          type: "list",
          name: "format",
          message: "¿Plataforma/formato?",
          choices: ["TikTok (1080x1920)", "Instagram (1080x1080)", "YouTube (1920x1080)"],
          filter: (val: string) => val.split(" ")[0].toLowerCase()
        },
        {
          type: "number",
          name: "duration",
          message: "¿Duración en segundos? (ej: 30)",
          default: 30
        },
        {
          type: "confirm",
          name: "greenscreen",
          message: "¿Fondo verde (chroma key)?",
          default: false
        }
      ]);

    // Generar plan
    console.log(chalk.bold("\n📝 Generando plan de video..."));

    const plan = {
      title: videoTitle,
      description: videoDescription,
      format,
      duration,
      greenscreen,
      brandColors: brand.colors.slice(0, 3),
      brandFonts: brand.fonts.slice(0, 2),
      tone: brand.toneOfVoice
    };

    console.log(chalk.green("✓ Plan generado\n"));
    console.log(chalk.yellow("Plan de ejecución:"));
    console.log(chalk.gray(`  Formato: ${format}`));
    console.log(chalk.gray(`  Duración: ${duration}s`));
    console.log(chalk.gray(`  Colores marca: ${plan.brandColors.join(", ")}`));
    console.log(chalk.gray(`  Tono: ${plan.tone}`));
    console.log(chalk.gray(`  Greenscreen: ${greenscreen ? "Sí" : "No"}\n`));

    if (action === "create") {
      // Crear tarea única
      const task = await createVideoTask(projectRoot, {
        title: videoTitle,
        description: videoDescription,
        format: format as "tiktok" | "instagram" | "youtube" | "custom",
        duration,
        greenscreen
      });

      await saveTaskHistory(projectRoot, task);

      console.log(chalk.green(`✓ Tarea creada: ${task.id}`));
      console.log(chalk.cyan(
        `\nPróximo paso: ejecuta 'npm run dev' en otra terminal`
      ));
      console.log(chalk.cyan(`para editar el video en Remotion Studio.\n`));
    } else if (action === "schedule") {
      // Crear tarea recurrente
      const { frequency, contentTypes, schedules } = await inquirer.prompt([
        {
          type: "list",
          name: "frequency",
          message: "¿Cuántos videos por día?",
          choices: ["1 video/día", "2 videos/día", "3 videos/día"],
          filter: (val: string) => parseInt(val[0])
        },
        {
          type: "checkbox",
          name: "contentTypes",
          message: "¿Tipos de contenido (marca variedad)?",
          choices: [
            "Introducción de producto",
            "Tips/tutorial",
            "Testimonios",
            "Actualización de features",
            "Behind the scenes",
            "Preguntas frecuentes"
          ],
          validate: (answer: string[]) => answer.length > 0
        },
        {
          type: "list",
          name: "schedules",
          message: "¿Distribuir automáticamente?",
          choices: ["Automático (sistema elige horarios)", "Horarios personalizados"],
          filter: (val: string) => (val.includes("Auto") ? "auto" : "custom")
        }
      ]);

      const finalSchedules =
        schedules === "auto"
          ? distributeSchedules(frequency as 1 | 2 | 3)
          : await getCustomSchedules(frequency as 1 | 2 | 3);

      const scheduledTask = await createScheduledTask(
        projectRoot,
        {
          title: videoTitle,
          description: videoDescription,
          format: format as "tiktok" | "instagram" | "youtube" | "custom",
          duration,
          greenscreen
        },
        frequency as 1 | 2 | 3,
        contentTypes,
        finalSchedules
      );

      await saveTaskHistory(projectRoot, scheduledTask);

      console.log(chalk.green(`✓ Tarea recurrente creada`));
      console.log(chalk.gray(`  Frecuencia: ${frequency} video(s)/día`));
      console.log(chalk.gray(`  Horarios: ${finalSchedules.join(", ")}`));
      console.log(chalk.gray(`  Contenido variado: ${contentTypes.join(", ")}\n`));
    }
  }
}

function distributeSchedules(frequency: 1 | 2 | 3): string[] {
  const schedules = {
    1: ["09:00"],
    2: ["09:00", "17:00"],
    3: ["09:00", "14:00", "18:00"]
  };
  return schedules[frequency];
}

async function getCustomSchedules(frequency: 1 | 2 | 3): Promise<string[]> {
  const schedules: string[] = [];

  for (let i = 0; i < frequency; i++) {
    const { time } = await inquirer.prompt([
      {
        type: "input",
        name: "time",
        message: `Horario video ${i + 1} (HH:mm):`,
        default: "09:00"
      }
    ]);
    schedules.push(time);
  }

  return schedules;
}

main().catch(console.error);
