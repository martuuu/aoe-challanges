# Problemas y Soluciones

## 🔧 Problemas de Instalación

### Error: ERESOLVE unable to resolve dependency tree

**Síntomas:**

```
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from vaul@0.9.9
```

**Causa:** Conflictos de versiones entre React 19 y algunas dependencias que aún no han actualizado sus peer dependencies.

**Solución:**

1. **Opción 1 (Recomendada):** Usar `--legacy-peer-deps`

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Opción 2:** El proyecto ya incluye un archivo `.npmrc` con `legacy-peer-deps=true`, por lo que `npm install` debería funcionar automáticamente.

3. **Opción 3:** Usar pnpm que maneja mejor los conflictos:
   ```bash
   pnpm install
   ```

### Error con date-fns y react-day-picker

**Síntomas:**

```
peer date-fns@"^2.28.0 || ^3.0.0" from react-day-picker@8.10.1
Found: date-fns@4.1.0
```

**Solución:** Ya está resuelto en el `package.json` actualizado:

- `react-day-picker` actualizado a `^9.4.3`
- `date-fns` en versión `^4.1.0`

## 🚀 Problemas de Desarrollo

### Error: Cannot find module 'next'

**Causa:** TypeScript no puede encontrar las dependencias.

**Solución:**

```bash
# Limpiar cache e instalar de nuevo
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error en build

**Síntomas:** Errores de TypeScript durante el build.

**Solución:**

```bash
# Verificar tipos
npm run type-check

# Si hay errores, revisar el código
npm run lint
```

### Problemas con Supabase

**Síntomas:** Error de conexión a la base de datos.

**Soluciones:**

1. Verificar variables de entorno en `.env.local`
2. Asegurar que el proyecto de Supabase esté activo
3. Probar conexión:
   ```bash
   npm run db:setup
   ```

## 🌐 Problemas de Deploy

### Error en Netlify Build

**Síntomas:** Build falla en Netlify.

**Soluciones:**

1. Verificar variables de entorno en Netlify Dashboard
2. Asegurar que `netlify.toml` esté configurado correctamente
3. Verificar que `next.config.mjs` tenga `output: 'export'`

### Error de rutas en Netlify

**Síntomas:** 404 en rutas después del deploy.

**Solución:** El `netlify.toml` ya incluye las reglas de redirección necesarias.

## 📱 Problemas de Funcionamiento

### Datos no se cargan

**Causa:** Problemas con Supabase o variables de entorno.

**Soluciones:**

1. Verificar `.env.local`:
   ```bash
   cat .env.local
   ```
2. Verificar conexión a Supabase:
   ```bash
   npm run db:setup
   ```
3. Verificar en navegador que las variables estén disponibles (deben empezar con `NEXT_PUBLIC_`)

### Componentes no se renderizan

**Causa:** Problemas de hidratación o imports.

**Soluciones:**

1. Verificar que todos los componentes UI estén importados correctamente
2. Revisar la consola del navegador por errores
3. Verificar que `ThemeProvider` esté configurado en `layout.tsx`

## 🔍 Comandos de Diagnóstico

### Verificar instalación

```bash
npm ls --depth=0
```

### Verificar tipos

```bash
npm run type-check
```

### Verificar lint

```bash
npm run lint
```

### Limpiar cache

```bash
rm -rf .next node_modules package-lock.json
npm install --legacy-peer-deps
```

### Probar build

```bash
npm run build
```

## 📞 Obtener Ayuda

### Logs útiles

- Build logs: `npm run build`
- Dev logs: `npm run dev`
- Netlify logs: En Netlify Dashboard > Deploys
- Supabase logs: En Supabase Dashboard > Logs

### Información del sistema

```bash
node --version
npm --version
git --version
```

### Estado del proyecto

```bash
npm run type-check
npm run lint
```

## 🔄 Reset Completo

Si nada funciona, reset completo:

```bash
# 1. Limpiar todo
rm -rf node_modules package-lock.json .next

# 2. Reinstalar
npm install --legacy-peer-deps

# 3. Regenerar base de datos
npm run db:reset
npm run db:setup

# 4. Probar
npm run dev
```
