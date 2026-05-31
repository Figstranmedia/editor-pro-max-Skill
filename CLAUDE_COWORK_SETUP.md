# Instalación en Claude Cowork

Guía para instalar Editor Pro Max como skill en Claude Cowork.

## Fase 1: Como MCP Server local

### 1. Clonar/descargar el proyecto

```bash
git clone https://github.com/tu-usuario/editor-pro-max.git
cd editor-pro-max
npm install
```

### 2. Configurar en Claude Cowork

En tu archivo `.claude/settings.json`:

```json
{
  "mcpServers": {
    "editor-pro-max": {
      "command": "npm",
      "args": ["run", "mcp:server"],
      "cwd": "/ruta/a/editor-pro-max"
    }
  }
}
```

### 3. Iniciar el proyecto

```bash
cd tu-proyecto/
editor-pro-max cli
```

Sistema detectará automáticamente:
- ✅ Tipo de proyecto
- ✅ Identidad de marca
- ✅ Carpetas existentes
- ✅ Oportunidades de mejora

---

## Fase 2: Como skill publicada (futuro)

Una vez que sea skill oficial:

```bash
# Instalación única
cowork install editor-pro-max

# En cualquier proyecto:
/editor-pro-max create "Anuncio de nueva feature"
/editor-pro-max schedule "social media diario" --frequency 2 --times "09:00,17:00"
/editor-pro-max history
```

---

## Uso desde Claude Cowork

### Crear video único

```
User: "Necesito un video para TikTok sobre la nueva feature"

Claude Code con Editor Pro Max:
1. Analiza proyecto automáticamente
2. Extrae identidad visual
3. Sugiere plan de video
4. Crea composición en Remotion
5. Renderiza a MP4
```

### Automatizar videos

```
User: "Crea 2 videos diarios para Instagram, variando entre tips y testimonios"

Claude Code:
1. Configura tarea recurrente
2. Define horarios automáticamente (09:00, 17:00)
3. Registra en historial
4. Ejecuta automáticamente a los horarios
```

### Analizar proyecto

```
User: "Analiza mi proyecto y sugiere qué videos podría crear"

Claude Code:
1. Detecta tipo de proyecto (Next.js)
2. Extrae brand (colores, fuentes, tone)
3. Analiza contenido existente
4. Sugiere ideas de videos alineadas con marca
```

---

## Configuración avanzada

### Personalizar horarios

```bash
editor-pro-max schedule \
  --frequency 3 \
  --times "08:30,14:00,18:45" \
  --contentTypes "tips,testimonios,updates"
```

### Exportar con greenscreen

```bash
editor-pro-max create \
  --title "My Video" \
  --greenscreen \
  --output "./videos-greenscreen/"
```

### Usar referencias externas

```bash
editor-pro-max create \
  --title "Product Demo" \
  --references "./references/design-inspiration/" \
  --webLink "https://competitor.com/demo"
```

---

## Requisitos

- Node.js 20+
- Claude Cowork instalado
- Proyecto con package.json

---

## Troubleshooting

### MCP Server no inicia

```bash
# Verificar que compila
npm run typecheck

# Ejecutar MCP directamente
npm run mcp:server
```

### Carpetas no se crean

```bash
# Verificar permisos
ls -la .editor-pro-max/

# Crear manualmente
mkdir -p videos-output videos-greenscreen references brand-assets
```

### Brand no se detecta

Crear archivo manual `.editor-pro-max/brand.json`:

```json
{
  "colors": ["#FF5733", "#2C3E50"],
  "fonts": ["Inter", "Poppins"],
  "toneOfVoice": "profesional-amigable"
}
```

---

## Documentación completa

Ver `EDITOR_PRO_MAX_SYSTEM.md` para detalles técnicos.
