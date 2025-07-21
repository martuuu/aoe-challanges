# Guía de Deployment

## 🚀 Deploy en Netlify

### Configuración Inicial

1. **Conectar Repositorio**

   - Ve a [Netlify](https://netlify.com)
   - Click en "New site from Git"
   - Conecta tu repositorio de GitHub

2. **Configuración de Build**

   ```
   Build command: npm run netlify
   Publish directory: out
   ```

3. **Variables de Entorno**
   En Netlify Dashboard > Site settings > Environment variables, agrega:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

### Deploy Manual

Si prefieres hacer deploy manual:

```bash
# Construir para producción
npm run build

# Subir la carpeta 'out' a Netlify manualmente
```

## 🗄️ Configuración de Supabase

### 1. Crear Proyecto

1. Ve a [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que se inicialice

### 2. Obtener Credenciales

En Project Settings > API:

- `Project URL` = NEXT_PUBLIC_SUPABASE_URL
- `anon public` = NEXT_PUBLIC_SUPABASE_ANON_KEY
- `service_role` = SUPABASE_SERVICE_ROLE_KEY (para scripts)

### 3. Configurar Base de Datos

```bash
# Una vez que tengas las credenciales en .env.local
npm run db:setup
```

### 4. Configurar RLS (Row Level Security)

En Supabase Dashboard > Authentication > Policies, puedes configurar políticas de seguridad si es necesario.

## 🔧 Troubleshooting

### Error de Build en Netlify

- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Netlify Dashboard

### Error de Conexión a Supabase

- Verifica las URLs y keys
- Asegúrate de que el proyecto de Supabase esté activo

### Problemas de Routing

- Next.js con `output: 'export'` genera archivos estáticos
- Netlify maneja automáticamente el routing con la configuración en `netlify.toml`

## 📈 Monitoreo

### Logs de Netlify

- Build logs: Netlify Dashboard > Deploys
- Function logs: Netlify Dashboard > Functions

### Analytics de Supabase

- Usage: Supabase Dashboard > Settings > Usage
- Logs: Supabase Dashboard > Logs

## 🔄 CI/CD

Con la configuración actual:

1. Haz commit a tu rama principal
2. Netlify detecta automáticamente el cambio
3. Ejecuta el build y deploy automáticamente

### Configuración de Ramas

Puedes configurar diferentes ramas para staging/production en Netlify Dashboard.

## 🛡️ Seguridad

### Variables de Entorno

- Nunca commitees archivos `.env` al repositorio
- Usa solo las variables que empiecen con `NEXT_PUBLIC_` en el frontend
- El `service_role_key` solo se usa en scripts de backend

### Supabase RLS

Si necesitas más seguridad, configura Row Level Security en Supabase:

```sql
-- Ejemplo: Solo permitir lectura de usuarios
CREATE POLICY "Public users are viewable by everyone"
ON users FOR SELECT
USING (true);
```

## 📊 Performance

### Optimizaciones incluidas

- Static export para mejor rendimiento
- Imágenes optimizadas (unoptimized para Netlify)
- Cache headers configurados en Netlify
- Tree shaking automático de Next.js

### Métricas

- Lighthouse score: Ejecuta audit en Chrome DevTools
- Netlify Analytics: Disponible en el dashboard
