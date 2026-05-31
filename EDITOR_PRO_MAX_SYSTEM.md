# Editor Pro Max — Sistema de Generación de Videos con Brand Intelligence

Sistema híbrido (MCP Server + CLI) para crear videos automáticamente respetando la identidad visual y tono de marca del proyecto.

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│ CLI Interactivo (cli/index.ts)                  │
│ • Flujo conversacional                          │
│ • Análisis automático de proyecto                │
│ • Sugerencia de carpetas                        │
│ • Opciones: crear único o automatizar           │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ MCP Server (src/mcp-server/index.ts)            │
│ • Herramientas de análisis de brand             │
│ • Generación de planes de video                 │
│ • Gestión de tareas (únicas/recurrentes)        │
│ • Historial y prevención de repetición          │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ Editor Pro Max + Remotion                       │
│ • Renderizado de videos                         │
│ • Integración con componentes existentes         │
│ • Soporte para greenscreen                      │
└─────────────────────────────────────────────────┘
```

## Flujo de Uso

### 1. Inicialización (Primera vez)

```bash
npm run cli
```

Sistema automáticamente:
- ✅ Detecta tipo de proyecto (Next.js, React, etc)
- ✅ Extrae identidad visual (colores, fuentes)
- ✅ Analiza tone of voice del contenido
- ✅ Sugiere estructura de carpetas
- ✅ Crea carpetas necesarias

### 2. Crear video único

```
¿Qué quieres hacer?
→ Crear un video

Título: "Anuncio de nueva feature"
Descripción: "Presenta la nueva funcionalidad X con entusiasmo"
Plataforma: TikTok (1080x1920)
Duración: 30s
¿Fondo verde? Sí

✓ Tarea creada
Próximo: npm run dev → edita en Remotion Studio
```

### 3. Automatizar videos recurrentes

```
¿Qué quieres hacer?
→ Automatizar videos (1-3/día)

Título: "Social media diario"
Descripción: "Varía según el tema del día"
Plataforma: Instagram
Duración: 15s
¿Fondo verde? No

Frecuencia: 2 videos/día
Tipos de contenido:
  ✓ Tips/tutorial
  ✓ Actualizaciones
  ✓ Testimonios

Horarios: Automático (09:00, 17:00)

✓ Tarea recurrente creada
Videos se generarán automáticamente a los horarios definidos
```

## Estructura de Carpetas

```
proyecto/
├── .editor-pro-max/
│   ├── brand.json          (identidad de marca detectada)
│   ├── config.json         (configuración del sistema)
│   ├── history.json        (historial de videos - auto-generado)
│   └── suggestions.json    (sugerencias de variación - auto-generado)
│
├── videos-input/           (material a editar)
├── videos-output/          (videos finales renderizados)
├── videos-greenscreen/     (versiones con fondo verde)
├── brand-assets/           (logos, paleta, tipografía)
└── references/             (ejemplos de diseño, inspiración)
```

## Herramientas Disponibles (MCP Server)

### `analyze_brand`
Extrae identidad visual del proyecto:
- Colores (desde CSS, Tailwind, Figma)
- Fuentes (Google Fonts, CSS, etc)
- Tone of voice (desde README, contenido)
- Estilo de imagery

```typescript
const brand = await analyzeBrand(projectPath);
// {
//   colors: ["#FF5733", "#2C3E50"],
//   fonts: ["Inter", "Poppins"],
//   toneOfVoice: "profesional-amigable",
//   imagery: "moderno"
// }
```

### `suggest_folder_structure`
Identifica carpetas faltantes y sugiere crear estructura organizada.

### `analyze_project`
Detecta:
- Framework (Next.js, React, Vue, etc)
- Repositorio GitHub
- Package.json y dependencias

### `generate_video_plan`
Crea plan de video respetando brand:
- Dimensiones según plataforma
- Colores de marca a usar
- Fuentes recomendadas
- Estimado de tiempo
- Path de output

### `create_single_task`
Crea tarea única (ejecución inmediata).

### `create_scheduled_task`
Crea tarea recurrente con:
- Frecuencia (1-3 videos/día)
- Tipos de contenido variados
- Horarios definidos

### `get_video_history`
Retorna historial para evitar repetir:
- Videos creados
- Temas tratados
- Sugerencias de variación

## Configuración

### `.editor-pro-max/brand.json`
```json
{
  "colors": ["#FF5733", "#2C3E50"],
  "fonts": ["Inter", "Poppins"],
  "toneOfVoice": "profesional-amigable",
  "imagery": "moderno-minimalista",
  "industry": "tech",
  "language": "español"
}
```

### `.editor-pro-max/config.json`
```json
{
  "defaultFormat": "instagram",
  "defaultDuration": 30,
  "autoCreateFolders": true,
  "preventRepetition": true,
  "defaultSchedule": {
    "frequency": 1,
    "times": ["09:00"]
  }
}
```

## Scripts disponibles

```bash
# Iniciar CLI interactivo
npm run cli

# Iniciar MCP Server
npm run mcp:server

# Crear video único
npm run video:create

# Crear tarea recurrente
npm run video:schedule

# Ver historial
npm run video:init

# Dev: Remotion Studio (paralelo)
npm run dev
```

## Flujo de trabajo recomendado

1. **Primera ejecución:**
   ```bash
   npm run cli          # Análisis inicial + setup
   npm run dev          # Abrir Remotion Studio
   ```

2. **Crear video:**
   ```bash
   npm run cli          # Seguir flujo conversacional
   npm run dev          # Editar en Remotion Studio
   npx remotion render <id> out/video.mp4  # Renderizar
   ```

3. **Automatizar:**
   ```bash
   npm run cli          # Elegir "Automatizar"
   # Sistema ejecutará automáticamente X veces/día
   ```

## Integración con Claude Cowork

El sistema está diseñado para integrarse con Claude Cowork como **skill personalizada**.

Próximas fases:
1. Empaquetar como MCP skill
2. Registrar en Claude Cowork Marketplace
3. Usar desde cualquier proyecto con `/editor-pro-max`

## Publicación en GitHub

Sistema está listo para publicarse como:
- ✅ Open source (MIT License)
- ✅ npm package
- ✅ Claude Cowork skill

Ver: `GITHUB_SETUP.md` para instrucciones.

## Licencia

MIT — Ver LICENSE para detalles.
