# 🎬 FFmpeg Installation Guide

Editor Pro Max requiere FFmpeg instalado en tu sistema para:
- Extracción de audio (`extract-audio.ts`)
- Detección de silencio (`detect-silence.ts`)
- Análisis de video (`analyze-video.ts`)
- Transcripción con Whisper (`transcribe.ts`)

---

## 🍎 macOS

### Opción 1: Homebrew (RECOMENDADO)

```bash
brew install ffmpeg
```

Verifica:
```bash
ffmpeg -version
```

### Opción 2: MacPorts
```bash
sudo port install ffmpeg
```

### Opción 3: Compilar desde código
```bash
brew install ffmpeg --HEAD
```

---

## 🐧 Linux

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### Fedora/RHEL
```bash
sudo dnf install ffmpeg
```

### Arch Linux
```bash
sudo pacman -S ffmpeg
```

Verifica:
```bash
ffmpeg -version
```

---

## 🪟 Windows

### Opción 1: Chocolatey (RECOMENDADO)
```bash
choco install ffmpeg
```

### Opción 2: Scoop
```bash
scoop install ffmpeg
```

### Opción 3: Descargar binarios
1. Ve a https://ffmpeg.org/download.html
2. Descarga binarios para Windows
3. Extrae a `C:\ffmpeg\`
4. Agrega `C:\ffmpeg\bin` al PATH:
   - Busca "Environment Variables" en Windows
   - Edita PATH y agrega `C:\ffmpeg\bin`

Verifica:
```bash
ffmpeg -version
```

---

## ✅ Verificar instalación

En cualquier sistema, ejecuta:

```bash
ffmpeg -version
ffprobe -version
```

Deberías ver versiones de FFmpeg y FFprobe.

---

## 🔧 Troubleshooting

### "ffmpeg: command not found"

**Macintosh:**
```bash
# Si usaste Homebrew:
brew link ffmpeg

# O verifica dónde está:
which ffmpeg
```

**Linux:**
```bash
# Reinstala:
sudo apt-get remove ffmpeg
sudo apt-get install ffmpeg

# Verifica PATH:
echo $PATH
```

**Windows:**
```bash
# Verifica que PATH contiene:
echo %PATH%

# Si no, agrégalo manualmente (Restart cmd después)
```

---

## 📋 Dependencias opcionales

Para features avanzadas:

```bash
# Audio processing avanzado
brew install libfdk-aac

# Subtítulos mejorados
brew install libass

# Hardware acceleration
brew install x264 x265
```

---

## 🚀 Verificar que Editor Pro Max puede usar FFmpeg

Una vez instalado FFmpeg, prueba:

```bash
cd ~/Desktop/editor-pro-max

# Test 1: Extracción de audio
npx tsx scripts/extract-audio.ts --help

# Test 2: Detección de silencio  
npx tsx scripts/detect-silence.ts --help

# Si no ves errores, ¡listo!
```

---

## ❌ Si algo falla

1. **Verifica ffmpeg:**
   ```bash
   ffmpeg -version
   ffprobe -version
   ```

2. **Verifica que está en PATH:**
   ```bash
   which ffmpeg  # macOS/Linux
   where ffmpeg  # Windows
   ```

3. **Verifica permisos:**
   ```bash
   ls -la $(which ffmpeg)  # Debe tener permisos x
   ```

4. **Re-instala si necesario:**
   ```bash
   # macOS
   brew uninstall ffmpeg && brew install ffmpeg
   
   # Linux
   sudo apt-get remove ffmpeg && sudo apt-get install ffmpeg
   ```

---

## 📚 Recursos

- FFmpeg oficial: https://ffmpeg.org
- FFmpeg wiki: https://trac.ffmpeg.org/wiki
- FFmpeg documentation: https://ffmpeg.org/documentation.html

---

**¿Problemas?** Abre un issue en GitHub con:
- Tu sistema operativo
- Salida de `ffmpeg -version`
- Error exacto que recibiste
