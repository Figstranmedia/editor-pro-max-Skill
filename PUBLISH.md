# Publishing to npm

Guía oficial para publicar `editor-pro-max-skill` a npm (Claude Cowork Skill).

---

## 🚀 Publicar una nueva versión

### Paso 1: Asegúrate que todo está committeado

```bash
git status
# Debe estar limpio (no hay cambios sin commitear)
```

### Paso 2: Incrementa la versión

```bash
# Opción A: Patch release (1.0.0 → 1.0.1)
npm version patch

# Opción B: Minor release (1.0.0 → 1.1.0)
npm version minor

# Opción C: Major release (1.0.0 → 2.0.0)
npm version major
```

**Esto automáticamente:**
- ✅ Actualiza `package.json` version
- ✅ Crea un commit
- ✅ Crea un git tag (v1.0.1, v1.1.0, etc)

### Paso 3: Push con tags

```bash
git push origin main --tags
```

### Paso 4: GitHub Actions publica automáticamente ✨

Simplemente espera 1-2 minutos. GitHub Actions:
1. Detecta el nuevo tag
2. Corre `npm ci`
3. Corre `npm publish`
4. Crea un Release automático en GitHub

---

## ✅ Verificar que se publicó

Después de 2-3 minutos, chequea:

```bash
# En terminal
npm view editor-pro-max-skill

# O en web
https://www.npmjs.com/package/editor-pro-max-skill
```

---

## 📝 Ejemplo práctico

```bash
# Estás en main, todo committeado
git status
# On branch main, working tree clean ✓

# Quieres publicar v1.0.1
npm version patch
# v1.0.0 → v1.0.1
# Crea commit + tag automáticamente

# Push
git push origin main --tags

# GitHub Actions toma la acción...
# ✨ En 2 minutos:
# https://npmjs.com/package/editor-pro-max (actualizado)
```

---

## 🔍 Ver el progreso en GitHub

1. Ve a: https://github.com/Figstranmedia/editor-pro-max-Skill/actions
2. Click en el workflow que se está ejecutando
3. Verás logs en tiempo real

---

## ❌ Troubleshooting

### "npm ERR! 403 Forbidden"
- Verifica que `NPM_TOKEN` está en GitHub Secrets
- Verifica que el token tiene permisos de write

### "npm ERR! You must be authenticated to this scope"
- Tu token no tiene permisos para `@figstranmedia/*`
- Regenera el token con permisos "Read and write"

### "Tag already exists"
- No puedes usar el mismo tag dos veces
- Usa `npm version patch` para incrementar automáticamente

---

## 📚 Más información

- npm versioning: https://docs.npmjs.com/cli/v8/commands/npm-version
- Publishing to npm: https://docs.npmjs.com/packages-and-modules/publishing-a-package

---

**¡Listo! Ahora puedes publicar en cualquier momento con 3 comandos.** 🚀
