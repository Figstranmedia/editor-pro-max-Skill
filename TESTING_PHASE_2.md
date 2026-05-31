# 🧪 Testing Plan — Fase 2 Features

Plan completo para verificar que todo funciona antes de v1.1.

---

## ✅ TEST 1: GitHub Integration

### Requisitos
- Proyecto local con git
- Commits recientes

### Test caso

```bash
cd ~/Desktop/editor-pro-max

# Crear un commit de prueba
echo "test feature" >> test.txt
git add test.txt
git commit -m "feat: Add new video feature"

# Testear herramienta
npm run mcp:server

# (En otra terminal)
# Llamar a analyze_github_changes con la ruta del proyecto
```

### Verificar que funciona

✅ Lee últimos commits  
✅ Detecta "feat:" en mensaje  
✅ Sugiere video title automático  
✅ Retorna JSON válido

---

## ✅ TEST 2: Link Analysis

### Requisitos
- Conexión a internet
- URLs públicas

### Test casos

```bash
# Test 1: Tu sitio
https://github.com/Figstranmedia

# Test 2: Landing page conocida
https://stripe.com

# Test 3: Sitio con colores
https://dribbble.com
```

### Verificar que funciona

✅ Extrae colores (HEX codes)  
✅ Detecta fonts  
✅ Analiza tone of voice  
✅ Retorna JSON válido  
✅ No crashes en URLs complejas

---

## ✅ TEST 3: Smart Multi-Output

### Requisitos
- Función pura (sin dependencias externas)

### Test casos

```bash
# Test 1: Video corto (15s)
Title: "Quick tip"
Duration: 15
→ Verifica que TikTok permite 15s
→ Verifica Instagram permite 15s

# Test 2: Video normal (30s)
Title: "Feature announcement"
Duration: 30
→ Verifica todas las 6 plataformas

# Test 3: Video largo (120s)
Title: "Full tutorial"
Duration: 120
→ Verifica adaptación correcta
→ YouTube permite 120s, Twitter ajusta a 30s
```

### Verificar que funciona

✅ Genera 6 formatos  
✅ Dimensiones correctas por plataforma  
✅ Duraciones adaptadas  
✅ Recomendaciones específicas  
✅ Tiempo estimado calculado

---

## 🚀 PLAN DE TESTING RÁPIDO (15 min)

Voy a testear automáticamente. Esto es lo que haré:

### Paso 1: Compilar
```bash
npm run typecheck
```

### Paso 2: Crear commits de prueba
```bash
cd ~/Desktop/editor-pro-max
echo "test" >> .test
git add .test
git commit -m "feat: Test feature for phase 2"
```

### Paso 3: Testear GitHub Integration manualmente
```bash
# Simular llamada a analyze_github_changes
node -e "
const { analyzeRecentChanges } = require('./src/mcp-server/tools/github-integration');
analyzeRecentChanges('/Users/rafafigueroa/Desktop/editor-pro-max')
  .then(r => console.log(JSON.stringify(r, null, 2)))
"
```

### Paso 4: Testear Link Analysis manualmente
```bash
# Simular llamada a analyzeLink
node -e "
const { analyzeLink } = require('./src/mcp-server/tools/link-analysis');
analyzeLink('https://github.com/Figstranmedia')
  .then(r => console.log(JSON.stringify(r, null, 2)))
"
```

### Paso 5: Testear Multi-Output manualmente
```bash
# Simular llamada a generateMultiOutputPlan
node -e "
const { generateMultiOutputPlan } = require('./src/mcp-server/tools/multi-output');
generateMultiOutputPlan('Test Video', 'Test description', 30)
  .then(r => console.log(JSON.stringify(r, null, 2)))
"
```

---

## ✅ TESTING COMPLETO (VOY AHORA)

Dame 2 minutos y hago testing automático de las 3 features. Si todo pasa, publicamos v1.1 en GitHub.

¿**Vamos?**

