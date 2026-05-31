# 🤖 Cowork MCP Server Setup

Guía para activar y usar Video Editor Pro Max Skill en Cowork.

---

## 🚀 OPCIÓN 1: Script wrapper (RECOMENDADO para desarrollo)

Más fácil, con lifecycle management automático.

### Paso 1: Hacer script ejecutable

```bash
chmod +x ~/Desktop/editor-pro-max/start-mcp.sh
```

### Paso 2: Iniciar servidor

```bash
npm run mcp:start
```

El script:
- ✅ Inicia el MCP Server
- ✅ Lo mantiene vivo
- ✅ Lo cierra automáticamente con `Ctrl+C`
- ✅ Guarda logs en `/tmp/editor-pro-max-mcp.log`

---

## 🔧 OPCIÓN 2: npm run directo (Simple)

Si prefieres algo más simple:

```bash
cd ~/Desktop/editor-pro-max
npm run mcp:server
```

Luego en otra terminal, usa Cowork normalmente.

Para detener: `Ctrl+C` en la terminal del servidor.

---

## 📦 OPCIÓN 3: PM2 (Producción/Always-on)

Para que el server corra siempre en background.

### Instalar PM2

```bash
npm install -g pm2
```

### Iniciar con PM2

```bash
cd ~/Desktop/editor-pro-max
pm2 start "npm run mcp:server" --name "editor-pro-max-mcp"
```

### Ver logs

```bash
pm2 logs editor-pro-max-mcp
```

### Detener

```bash
pm2 stop editor-pro-max-mcp
pm2 delete editor-pro-max-mcp
```

### Ver status

```bash
pm2 status
```

**Ventaja:** El server corre en background y sobrevive restarts.

---

## 🐳 OPCIÓN 4: Docker (Para deployment)

Para usar en producción o en múltiples máquinas.

### Crear Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "mcp:server"]
```

### Build y run

```bash
docker build -t editor-pro-max-mcp .
docker run -it editor-pro-max-mcp
```

---

## 🔌 Configurar en Cowork

### `.cowork/settings.json`

```json
{
  "mcpServers": {
    "video-editor-pro-max-skill": {
      "command": "npm",
      "args": ["run", "mcp:server"],
      "cwd": "/Users/rafafigueroa/Desktop/editor-pro-max",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Nota:** Cowork debería detectar y usar esto automáticamente. Si no, usa OPCIÓN 1 o 2.

---

## ✅ Verificar que funciona

### Terminal 1: Iniciar servidor

```bash
npm run mcp:start
```

Deberías ver:

```
🚀 Starting Video Editor Pro Max MCP Server...
📍 The server is now ACTIVE and listening for Cowork connections
Press Ctrl+C to stop the server
```

### Terminal 2: Verificar que Cowork lo detecta

En Cowork, pide algo que use el skill:

```
"Analiza mi proyecto y sugiere qué videos crear"
```

Si funciona, Claude debería usar automáticamente los tools del skill.

---

## 🛠️ Troubleshooting

### "Server not connecting"

1. **Verifica que el servidor está corriendo:**
   ```bash
   ps aux | grep "mcp:server"
   ```

2. **Verifica que npm está instalado:**
   ```bash
   npm --version
   ```

3. **Verifica que estás en la ruta correcta:**
   ```bash
   ls -la ~/Desktop/editor-pro-max/package.json
   ```

4. **Mira los logs:**
   ```bash
   cat /tmp/editor-pro-max-mcp.log
   ```

### "MCP Server crashed"

1. Verifica que FFmpeg está instalado:
   ```bash
   ffmpeg -version
   ```

2. Verifica node_modules:
   ```bash
   cd ~/Desktop/editor-pro-max
   npm install
   ```

3. Check logs:
   ```bash
   npm run mcp:server
   ```

---

## 📊 Comparativa de opciones

| Opción | Setup | Facilidad | Producción | Auto-cleanup |
|--------|-------|-----------|-----------|--------------|
| **1. Script wrapper** | 30s | ⭐⭐⭐⭐⭐ | ❌ | ✅ |
| **2. npm run** | 10s | ⭐⭐⭐⭐ | ❌ | ❌ |
| **3. PM2** | 2 min | ⭐⭐⭐ | ✅ | ✅ |
| **4. Docker** | 5 min | ⭐⭐ | ✅ | ✅ |

**Recomendación:**
- **Desarrollo:** Opción 1 (Script wrapper)
- **Producción:** Opción 3 (PM2) o 4 (Docker)

---

## 🎯 Siguiente paso

Una vez el servidor esté corriendo, en Cowork:

```
"Crea un video para TikTok anunciando [tu feature]"
```

Claude debería automáticamente:
1. ✅ Analizar tu proyecto
2. ✅ Extraer identidad visual
3. ✅ Ver sugerencias de GitHub
4. ✅ Generar multi-output (6 plataformas)
5. ✅ Renderizar videos

---

**¿Preguntas?** Abre un issue en GitHub.
