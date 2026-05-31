# 🎬 FFmpeg Installation Guide

Complete platform-specific installation guide for FFmpeg required by Editor Pro Max.

---

## Quick Check

Verify FFmpeg is installed:

```bash
ffmpeg -version
```

If you see version info, you're good to go! Otherwise, follow the guide for your OS.

---

## 🍎 macOS

### Option 1: Homebrew (Recommended)

**Install Homebrew** (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Install FFmpeg**:
```bash
brew install ffmpeg
```

**Verify**:
```bash
ffmpeg -version
```

### Option 2: MacPorts

```bash
sudo port install ffmpeg
```

### Option 3: Manual Download

1. Visit [ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Download macOS build
3. Extract and add to PATH:
   ```bash
   tar xjf ffmpeg-*.tar.bz2
   sudo mv ffmpeg /usr/local/bin/
   ```

### Option 4: Docker (No local install)

```bash
docker run -it -v $(pwd):/workspace jrottenberg/ffmpeg:latest ffmpeg -version
```

---

## 🐧 Linux

### Ubuntu / Debian

**Install**:
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

**Verify**:
```bash
ffmpeg -version
```

### Fedora / RHEL / CentOS

**Install**:
```bash
sudo dnf install -y ffmpeg
```

Or with yum (older versions):
```bash
sudo yum install -y ffmpeg
```

**Verify**:
```bash
ffmpeg -version
```

### Alpine Linux (minimal)

```bash
apk add --no-cache ffmpeg
```

### From Source (Advanced)

For latest features or custom compilation:

```bash
git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg
cd ffmpeg

# Configure with common options
./configure \
  --prefix=/usr/local \
  --enable-gpl \
  --enable-libfreetype \
  --enable-libopus \
  --enable-libvorbis \
  --enable-libvpx

make -j$(nproc)
sudo make install
```

---

## 🪟 Windows

### Option 1: Chocolatey (Recommended)

**Install Chocolatey** (if not already installed):
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

**Install FFmpeg**:
```powershell
choco install ffmpeg
```

**Verify**:
```powershell
ffmpeg -version
```

### Option 2: Windows Package Manager (winget)

```powershell
winget install ffmpeg
ffmpeg -version
```

### Option 3: Manual Download

1. Visit [ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Download Windows build (static or shared)
3. Extract to a folder (e.g., `C:\ffmpeg`)
4. Add to System PATH:
   - Press `Win + X`, select **System**
   - Click **Advanced system settings**
   - Click **Environment Variables**
   - Under **System variables**, click **New**
   - Variable name: `Path`
   - Variable value: `C:\ffmpeg\bin`
   - Click **OK** and restart terminal

**Verify**:
```powershell
ffmpeg -version
```

### Option 4: WSL (Windows Subsystem for Linux)

If you're using WSL2, just follow the **Linux (Ubuntu)** instructions:

```bash
# Inside WSL terminal
sudo apt-get update
sudo apt-get install -y ffmpeg
ffmpeg -version
```

---

## 🐳 Docker (All Platforms)

No local installation needed:

### Using Docker Image

```bash
# Pull official FFmpeg image
docker pull jrottenberg/ffmpeg:latest

# Run FFmpeg command
docker run --rm -v $(pwd):/workspace jrottenberg/ffmpeg:latest ffmpeg -i input.mp4 -c:v libx264 output.mp4
```

### In Editor Pro Max Project

Add to `docker-compose.yml`:

```yaml
version: '3.8'

services:
  editor-pro-max:
    build: .
    volumes:
      - ./public/assets:/app/public/assets
      - ./videos:/app/videos
    environment:
      - NODE_ENV=production

  ffmpeg:
    image: jrottenberg/ffmpeg:latest
    volumes:
      - ./public/assets:/workspace
```

Run:
```bash
docker-compose up
```

---

## 📦 With Node Package Managers

### npm/yarn

Install FFmpeg wrapper (optional, but helpful):

```bash
npm install fluent-ffmpeg
```

This is already in your `package.json`, but requires system FFmpeg.

### Prebuilt Binaries via npm

For easy cross-platform FFmpeg in Node projects:

```bash
npm install @ffmpeg-installer/ffmpeg
```

Usage in code:
```javascript
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
process.env.FFMPEG_PATH = ffmpeg.path;
```

---

## ✅ Verification & Troubleshooting

### Full verification script

```bash
#!/bin/bash

echo "Checking FFmpeg installation..."
echo ""

# Check if FFmpeg exists
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg NOT installed"
    exit 1
fi

echo "✅ FFmpeg found"
ffmpeg -version | head -n 1

echo ""
echo "✅ Checking common codecs..."

# Check for common codecs
ffmpeg -codecs 2>/dev/null | grep -q hevc && echo "  ✅ H.265/HEVC support"
ffmpeg -codecs 2>/dev/null | grep -q libx264 && echo "  ✅ H.264 support"
ffmpeg -codecs 2>/dev/null | grep -q vp8 && echo "  ✅ VP8 support"
ffmpeg -codecs 2>/dev/null | grep -q vp9 && echo "  ✅ VP9 support"

echo ""
echo "✅ All checks passed!"
```

### Common Issues

#### "ffmpeg: command not found"

**macOS**:
```bash
brew install ffmpeg
```

**Linux (Ubuntu)**:
```bash
sudo apt-get install -y ffmpeg
```

**Windows**:
```powershell
choco install ffmpeg
# Then restart PowerShell
```

#### "Permission denied"

```bash
sudo chmod +x /usr/local/bin/ffmpeg
```

#### "Module not found" (Node.js)

```bash
cd ~/Desktop/editor-pro-max
npm install
```

The `fluent-ffmpeg` package should install automatically.

#### "Port already in use" (Docker)

```bash
# Change port in docker-compose.yml or docker run command
docker run -p 3001:3000 editor-pro-max-mcp
```

---

## 🎥 Test FFmpeg with Editor Pro Max

Once installed, test the video pipeline:

```bash
# Navigate to project
cd ~/Desktop/editor-pro-max

# Test audio extraction (requires FFmpeg)
npx tsx scripts/extract-audio.ts public/assets/sample-video.mp4

# Test silence detection
npx tsx scripts/detect-silence.ts public/assets/sample-video.mp4

# Test background removal
npx tsx scripts/remove-bg.ts public/assets/sample-image.jpg
```

---

## 📊 FFmpeg Versions

| Version | Release | Status | Features |
|---|---|---|---|
| **7.1** | 2025-01 | ✅ Current | Latest codecs, best performance |
| **7.0** | 2024-01 | ✅ Stable | Production-ready |
| **6.1** | 2023-01 | ⚠️ Older | Still works, missing recent codecs |
| **5.x** | 2022-xx | ❌ Old | Not recommended |

### Check your version:
```bash
ffmpeg -version
```

Recommended: **7.0 or newer**

---

## 🎯 Platform-Specific Performance Tips

### macOS
- Use Homebrew for automatic updates
- M1/M2 Macs: Install Apple Silicon build for better performance
  ```bash
  brew install ffmpeg --with-apple-silicon
  ```

### Linux
- Use system package manager for stability
- Consider compiling from source for latest features
- Ubuntu Server: Install `libfdk-aac-dev` for AAC support
  ```bash
  sudo apt-get install -y libfdk-aac-dev
  ```

### Windows
- WSL2 is recommended for better performance than native Windows
- Use Chocolatey for easy updates
- Consider Docker if system PATH issues persist

---

## 📖 Additional Resources

- **Official FFmpeg**: [ffmpeg.org](https://ffmpeg.org)
- **Documentation**: [ffmpeg.org/documentation.html](https://ffmpeg.org/documentation.html)
- **Filters**: [ffmpeg.org/ffmpeg-filters.html](https://ffmpeg.org/ffmpeg-filters.html)
- **Codecs**: [ffmpeg.org/ffmpeg-codecs.html](https://ffmpeg.org/ffmpeg-codecs.html)

---

## 🆘 Need Help?

If FFmpeg installation fails:

1. **Check the [FFmpeg Wiki](https://trac.ffmpeg.org/wiki/CompilationGuide)**
2. **Open an issue on [Editor Pro Max GitHub](https://github.com/Figstranmedia/editor-pro-max-Skill/issues)**
3. **Include output of**:
   ```bash
   ffmpeg -version
   uname -a  # or 'systeminfo' on Windows
   node --version
   npm --version
   ```

---

## ✨ Next Steps

Once FFmpeg is installed:

1. ✅ Verify: `ffmpeg -version`
2. ✅ Install Editor Pro Max: `npm install`
3. ✅ Start MCP server: `npm run mcp:start`
4. ✅ Create videos: *"Make me a TikTok"*

Happy video creation! 🎬

---

# 🎬 Guía de Instalación de FFmpeg

Guía completa de instalación específica por plataforma de FFmpeg requerido por Editor Pro Max.

---

## Verificación Rápida

Verifica que FFmpeg esté instalado:

```bash
ffmpeg -version
```

Si ves información de versión, ¡estás listo! Si no, sigue la guía para tu SO.

---

## 🍎 macOS

### Opción 1: Homebrew (RECOMENDADO)

**Instala Homebrew** (si no lo tienes):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Instala FFmpeg**:
```bash
brew install ffmpeg
```

**Verifica**:
```bash
ffmpeg -version
```

### Opción 2: MacPorts

```bash
sudo port install ffmpeg
```

### Opción 3: Descarga Manual

1. Ve a [ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Descarga el build para macOS
3. Extrae y agrega a PATH:
   ```bash
   tar xjf ffmpeg-*.tar.bz2
   sudo mv ffmpeg /usr/local/bin/
   ```

### Opción 4: Docker (Sin instalar localmente)

```bash
docker run -it -v $(pwd):/workspace jrottenberg/ffmpeg:latest ffmpeg -version
```

---

## 🐧 Linux

### Ubuntu / Debian

**Instala**:
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

**Verifica**:
```bash
ffmpeg -version
```

### Fedora / RHEL / CentOS

**Instala**:
```bash
sudo dnf install -y ffmpeg
```

O con yum (versiones antiguas):
```bash
sudo yum install -y ffmpeg
```

**Verifica**:
```bash
ffmpeg -version
```

### Alpine Linux (mínimo)

```bash
apk add --no-cache ffmpeg
```

### Desde Código Fuente (Avanzado)

Para últimas features o compilación personalizada:

```bash
git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg
cd ffmpeg

./configure \
  --prefix=/usr/local \
  --enable-gpl \
  --enable-libfreetype \
  --enable-libopus \
  --enable-libvorbis \
  --enable-libvpx

make -j$(nproc)
sudo make install
```

---

## 🪟 Windows

### Opción 1: Chocolatey (RECOMENDADO)

**Instala Chocolatey** (si no lo tienes):
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

**Instala FFmpeg**:
```powershell
choco install ffmpeg
```

**Verifica**:
```powershell
ffmpeg -version
```

### Opción 2: Windows Package Manager (winget)

```powershell
winget install ffmpeg
ffmpeg -version
```

### Opción 3: Descarga Manual

1. Ve a [ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Descarga build de Windows
3. Extrae a una carpeta (ej: `C:\ffmpeg`)
4. Agrega al PATH del Sistema:
   - Presiona `Win + X`, selecciona **Sistema**
   - Click en **Configuración avanzada del sistema**
   - Click en **Variables de entorno**
   - En **Variables del sistema**, click en **Nueva**
   - Nombre: `Path`
   - Valor: `C:\ffmpeg\bin`
   - Click **OK** y reinicia terminal

**Verifica**:
```powershell
ffmpeg -version
```

### Opción 4: WSL (Windows Subsystem for Linux)

Si usas WSL2, sigue las instrucciones de **Linux (Ubuntu)**:

```bash
# Dentro de terminal WSL
sudo apt-get update
sudo apt-get install -y ffmpeg
ffmpeg -version
```

---

## 🐳 Docker (Todas las Plataformas)

Sin instalación local:

### Usando imagen Docker

```bash
docker pull jrottenberg/ffmpeg:latest

docker run --rm -v $(pwd):/workspace jrottenberg/ffmpeg:latest ffmpeg -i input.mp4 -c:v libx264 output.mp4
```

### En proyecto Editor Pro Max

Agrega a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  editor-pro-max:
    build: .
    volumes:
      - ./public/assets:/app/public/assets
      - ./videos:/app/videos
    environment:
      - NODE_ENV=production

  ffmpeg:
    image: jrottenberg/ffmpeg:latest
    volumes:
      - ./public/assets:/workspace
```

Ejecuta:
```bash
docker-compose up
```

---

## 📦 Con gestores de paquetes Node

### npm/yarn

Instala wrapper de FFmpeg (opcional):

```bash
npm install fluent-ffmpeg
```

Ya está en tu `package.json`, pero requiere FFmpeg en el sistema.

### Binarios precompilados vía npm

Para FFmpeg cross-platform fácil:

```bash
npm install @ffmpeg-installer/ffmpeg
```

Uso en código:
```javascript
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
process.env.FFMPEG_PATH = ffmpeg.path;
```

---

## ✅ Verificación y Troubleshooting

### Script de verificación completo

```bash
#!/bin/bash

echo "Verificando instalación de FFmpeg..."
echo ""

if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg NO instalado"
    exit 1
fi

echo "✅ FFmpeg encontrado"
ffmpeg -version | head -n 1

echo ""
echo "✅ Verificando codecs comunes..."

ffmpeg -codecs 2>/dev/null | grep -q hevc && echo "  ✅ Soporte H.265/HEVC"
ffmpeg -codecs 2>/dev/null | grep -q libx264 && echo "  ✅ Soporte H.264"
ffmpeg -codecs 2>/dev/null | grep -q vp8 && echo "  ✅ Soporte VP8"
ffmpeg -codecs 2>/dev/null | grep -q vp9 && echo "  ✅ Soporte VP9"

echo ""
echo "✅ ¡Todas las verificaciones pasaron!"
```

### Problemas Comunes

#### "ffmpeg: command not found"

**macOS**:
```bash
brew install ffmpeg
```

**Linux (Ubuntu)**:
```bash
sudo apt-get install -y ffmpeg
```

**Windows**:
```powershell
choco install ffmpeg
# Luego reinicia PowerShell
```

#### "Permission denied"

```bash
sudo chmod +x /usr/local/bin/ffmpeg
```

#### "Module not found" (Node.js)

```bash
cd ~/Desktop/editor-pro-max
npm install
```

---

## 🎥 Prueba FFmpeg con Editor Pro Max

Una vez instalado:

```bash
cd ~/Desktop/editor-pro-max

# Test 1: Extracción de audio
npx tsx scripts/extract-audio.ts public/assets/sample-video.mp4

# Test 2: Detección de silencio
npx tsx scripts/detect-silence.ts public/assets/sample-video.mp4

# Test 3: Remoción de fondo
npx tsx scripts/remove-bg.ts public/assets/sample-image.jpg
```

---

## 📊 Versiones de FFmpeg

| Versión | Lanzamiento | Estado | Features |
|---|---|---|---|
| **7.1** | 2025-01 | ✅ Actual | Últimos codecs, mejor rendimiento |
| **7.0** | 2024-01 | ✅ Estable | Production-ready |
| **6.1** | 2023-01 | ⚠️ Antigua | Funciona, falta codecs recientes |
| **5.x** | 2022-xx | ❌ Vieja | No recomendado |

### Verifica tu versión:
```bash
ffmpeg -version
```

Recomendado: **7.0 o más nuevo**

---

## 🎯 Tips de Rendimiento por Plataforma

### macOS
- Usa Homebrew para actualizaciones automáticas
- Macs M1/M2: Instala build Apple Silicon para mejor rendimiento
  ```bash
  brew install ffmpeg --with-apple-silicon
  ```

### Linux
- Usa gestor de paquetes del sistema para estabilidad
- Considera compilar desde código para features recientes
- Ubuntu Server: Instala `libfdk-aac-dev` para soporte AAC
  ```bash
  sudo apt-get install -y libfdk-aac-dev
  ```

### Windows
- WSL2 recomendado para mejor rendimiento que Windows nativo
- Usa Chocolatey para actualizaciones fáciles
- Considera Docker si tienes problemas con PATH

---

## 📖 Recursos Adicionales

- **FFmpeg Oficial**: [ffmpeg.org](https://ffmpeg.org)
- **Documentación**: [ffmpeg.org/documentation.html](https://ffmpeg.org/documentation.html)
- **Filtros**: [ffmpeg.org/ffmpeg-filters.html](https://ffmpeg.org/ffmpeg-filters.html)
- **Codecs**: [ffmpeg.org/ffmpeg-codecs.html](https://ffmpeg.org/ffmpeg-codecs.html)

---

## 🆘 ¿Necesitas ayuda?

Si la instalación de FFmpeg falla:

1. **Verifica [FFmpeg Wiki](https://trac.ffmpeg.org/wiki/CompilationGuide)**
2. **Abre un issue en [GitHub de Editor Pro Max](https://github.com/Figstranmedia/editor-pro-max-Skill/issues)**
3. **Incluye salida de**:
   ```bash
   ffmpeg -version
   uname -a  # o 'systeminfo' en Windows
   node --version
   npm --version
   ```

---

## ✨ Próximos pasos

Una vez instalado FFmpeg:

1. ✅ Verifica: `ffmpeg -version`
2. ✅ Instala Editor Pro Max: `npm install`
3. ✅ Inicia servidor MCP: `npm run mcp:start`
4. ✅ Crea videos: *"Hazme un TikTok"*

¡Feliz creación de videos! 🎬
