#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { analyzeBrand } from "./tools/analyze-brand.js";
import {
  suggestFolderStructure,
  createFolderStructure,
  analyzeProjectStructure
} from "./tools/suggest-folders.js";
import {
  createVideoTask,
  createScheduledTask,
  saveTaskHistory,
  getVideoHistory
} from "./tools/video-generator.js";

const server = new Server(
  {
    name: "editor-pro-max-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Definir herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_brand",
        description:
          "Analiza la identidad de marca del proyecto (colores, fuentes, tone of voice)",
        inputSchema: {
          type: "object" as const,
          properties: {
            projectPath: {
              type: "string",
              description: "Ruta del proyecto a analizar"
            }
          },
          required: ["projectPath"]
        }
      },
      {
        name: "suggest_folder_structure",
        description:
          "Sugiere carpetas necesarias para organizar videos y referencias",
        inputSchema: {
          type: "object" as const,
          properties: {
            projectPath: {
              type: "string",
              description: "Ruta del proyecto"
            }
          },
          required: ["projectPath"]
        }
      },
      {
        name: "create_folders",
        description: "Crea las carpetas sugeridas",
        inputSchema: {
          type: "object" as const,
          properties: {
            projectPath: {
              type: "string",
              description: "Ruta del proyecto"
            },
            folders: {
              type: "array",
              items: { type: "string" },
              description: "Lista de carpetas a crear"
            }
          },
          required: ["projectPath", "folders"]
        }
      },
      {
        name: "analyze_project",
        description:
          "Analiza el tipo de proyecto (Next.js, React, etc) y detecta repo de GitHub",
        inputSchema: {
          type: "object" as const,
          properties: {
            projectPath: {
              type: "string",
              description: "Ruta del proyecto"
            }
          },
          required: ["projectPath"]
        }
      },
      {
        name: "generate_video_plan",
        description:
          "Genera un plan para crear un video respetando la identidad de marca",
        inputSchema: {
          type: "object" as const,
          properties: {
            projectPath: {
              type: "string",
              description: "Ruta del proyecto"
            },
            title: {
              type: "string",
              description: "Título del video"
            },
            description: {
              type: "string",
              description: "Descripción/contenido del video"
            },
            format: {
              type: "string",
              enum: ["tiktok", "instagram", "youtube", "custom"],
              description: "Formato/plataforma del video"
            },
            duration: {
              type: "number",
              description: "Duración en segundos"
            },
            greenscreen: {
              type: "boolean",
              description: "Si necesita fondo verde"
            }
          },
          required: ["projectPath", "title", "description", "format", "duration"]
        }
      },
      {
        name: "create_single_task",
        description: "Crea una tarea de video única (no recurrente)",
        inputSchema: {
          type: "object" as const,
          properties: {
            projectPath: {
              type: "string",
              description: "Ruta del proyecto"
            },
            title: {
              type: "string",
              description: "Título del video"
            },
            description: {
              type: "string",
              description: "Descripción del video"
            },
            format: {
              type: "string",
              enum: ["tiktok", "instagram", "youtube", "custom"]
            },
            duration: {
              type: "number"
            },
            greenscreen: {
              type: "boolean"
            }
          },
          required: ["projectPath", "title", "description", "format", "duration"]
        }
      },
      {
        name: "create_scheduled_task",
        description: "Crea una tarea de video recurrente (1-3 veces/día)",
        inputSchema: {
          type: "object" as const,
          properties: {
            projectPath: {
              type: "string"
            },
            title: {
              type: "string"
            },
            description: {
              type: "string"
            },
            format: {
              type: "string",
              enum: ["tiktok", "instagram", "youtube", "custom"]
            },
            duration: {
              type: "number"
            },
            greenscreen: {
              type: "boolean"
            },
            frequency: {
              type: "number",
              enum: [1, 2, 3],
              description: "Videos por día"
            },
            contentTypes: {
              type: "array",
              items: { type: "string" },
              description: "Tipos de contenido a variar"
            },
            schedules: {
              type: "array",
              items: { type: "string" },
              description: "Horarios en formato HH:mm"
            }
          },
          required: [
            "projectPath",
            "title",
            "format",
            "duration",
            "frequency",
            "contentTypes",
            "schedules"
          ]
        }
      },
      {
        name: "get_video_history",
        description: "Obtiene el historial de videos creados para evitar repetición",
        inputSchema: {
          type: "object" as const,
          properties: {
            projectPath: {
              type: "string"
            }
          },
          required: ["projectPath"]
        }
      }
    ]
  };
});

// Manejar llamadas a herramientas
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      case "analyze_brand":
        result = await analyzeBrand(args.projectPath);
        break;

      case "suggest_folder_structure":
        result = await suggestFolderStructure(args.projectPath);
        break;

      case "create_folders":
        result = await createFolderStructure(args.projectPath, args.folders);
        break;

      case "analyze_project":
        result = await analyzeProjectStructure(args.projectPath);
        break;

      case "generate_video_plan":
        // Simulado por ahora - se conectaría con generateVideoPlan
        result = {
          message: "Plan generado",
          format: args.format,
          duration: args.duration,
          greenscreen: args.greenscreen
        };
        break;

      case "create_single_task":
        result = await createVideoTask(args.projectPath, args);
        break;

      case "create_scheduled_task":
        result = await createScheduledTask(
          args.projectPath,
          args,
          args.frequency,
          args.contentTypes,
          args.schedules
        );
        break;

      case "get_video_history":
        result = await getVideoHistory(args.projectPath);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${errorMessage}`
        }
      ],
      isError: true
    };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Editor Pro Max MCP Server iniciado");
}

main().catch(console.error);
