# AoE Historial - Liga de Age of Empires

Una aplicación web para gestionar partidas, rankings y historial de una liga de Age of Empires entre amigos.

## 🚀 Características

- **Sistema de Pirámide**: Ranking jerárquico de jugadores
- **Gestión de Desafíos**: Sistema para desafiar jugadores de niveles superiores
- **Historial de Partidas**: Registro completo de todas las partidas jugadas
- **Partidas Grupales**: Organización de equipos con drag & drop
- **Dashboard en Tiempo Real**: Estadísticas y métricas de jugadores
- **Responsive Design**: Optimizado para desktop y móvil

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **Estado**: React Hooks (useState, useEffect)

## � Quick Start

```bash
# 1. Clonar e instalar
git clone <repository-url>
cd aoe-historial
./setup.sh

# 2. Configurar variables de entorno
# Editar .env.local con tus credenciales de Supabase

# 3. Configurar base de datos
npm run db:setup

# 4. Ejecutar en desarrollo
npm run dev
```

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm
- Cuenta en Supabase

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd aoe-historial
```

### 2. Instalar dependencias

```bash
# Opción 1: Usar el script automático
./setup.sh

# Opción 2: Manual
npm install
# Si hay errores de peer dependencies:
npm install --legacy-peer-deps
```

**Nota:** El proyecto incluye un archivo `.npmrc` que maneja automáticamente los conflictos de dependencias.

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 4. Configurar la base de datos

Ejecuta el script para crear las tablas y datos iniciales:

```bash
npm run db:setup
```

Este comando creará:

- Tabla `users` con los jugadores iniciales
- Tabla `matches` para el historial de partidas
- Tabla `challenges` para los desafíos pendientes
- Datos de prueba con emails de todos los amigos

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

### Tabla `users`

```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- level (INTEGER) -- 1: Rey, 2-4: Niveles de la pirámide
- created_at (TIMESTAMP)
```

### Tabla `matches`

```sql
- id (UUID, PK)
- challenger (VARCHAR)
- challenged (VARCHAR)
- winner (VARCHAR, nullable)
- date (DATE)
- status (VARCHAR) -- 'pending', 'completed', 'cancelled'
- created_at (TIMESTAMP)
```

### Tabla `challenges`

```sql
- id (UUID, PK)
- challenger (VARCHAR)
- challenged (VARCHAR)
- status (VARCHAR) -- 'pending', 'accepted', 'rejected'
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)
```

## 🎮 Jugadores Iniciales

La aplicación viene configurada con los siguientes jugadores:

- **Nivel 1 (Rey)**: Chino
- **Nivel 2**: Ruso, Mosca
- **Nivel 3**: Tincho, Pana, Chaquinha
- **Nivel 4**: Dany, Bicho, Seba, Tata, Mati

Todos con emails `@agepanaderos.com` para pruebas.

## 📱 Funcionalidades

### Dashboard Principal

- Vista de la pirámide de jugadores
- Estadísticas generales
- Botón para crear nuevas partidas

### Sistema de Desafíos

- Los jugadores pueden desafiar a otros del nivel inmediatamente superior
- Desafíos con tiempo de expiración
- Estados: pendiente, aceptado, rechazado

### Gestión de Partidas

- Registro de partidas 1v1
- Partidas grupales con drag & drop para formar equipos
- Historial completo con filtros

### Estadísticas

- Ratio de victorias/derrotas
- Partidas jugadas
- Posición en el ranking
- Historial detallado

## 🚀 Deploy en Netlify

### Opción 1: Deploy Automático

1. Conecta tu repositorio con Netlify
2. Configura las variables de entorno en Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. El deploy se hará automáticamente con cada push

### Opción 2: Deploy Manual

```bash
npm run build
npm run deploy
```

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Ejecutar en desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en producción
npm run lint         # Revisar código con ESLint
npm run lint:fix     # Corregir automáticamente errores de ESLint
npm run type-check   # Verificar tipos de TypeScript
npm run db:setup     # Configurar base de datos inicial
npm run db:reset     # Resetear base de datos
```

## 🧪 Testing

Para probar la aplicación con datos reales:

1. Ejecuta `npm run db:setup` para poblar con datos iniciales
2. Usa los emails configurados para simular usuarios
3. Crea partidas de prueba desde la interfaz

## 🔧 Desarrollo

### Agregar Nuevos Jugadores

1. Agrega el usuario en Supabase o modifica `scripts/setup-database.sql`
2. Actualiza la pirámide inicial en `app/page.tsx`
3. Ejecuta `npm run db:reset && npm run db:setup`

### Estructura de Componentes

```
components/
├── ui/                 # Componentes de shadcn/ui
├── DragDropGroupMatch  # Componente para partidas grupales
├── PlayerCard          # Tarjeta de jugador
└── theme-provider      # Proveedor de temas
```

## 🐛 Solución de Problemas

### Error de conexión a Supabase

- Verifica las credenciales en `.env.local`
- Asegúrate de que el proyecto de Supabase esté activo

### Error en build

- Ejecuta `npm run type-check` para verificar errores de TypeScript
- Revisa `npm run lint` para errores de código

### Problemas con la base de datos

- Ejecuta `npm run db:reset` seguido de `npm run db:setup`

## 📄 Licencia

Este proyecto es para uso privado entre amigos. No está destinado para uso comercial.

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Crea una nueva rama
2. Implementa la funcionalidad
3. Actualiza este README si es necesario
4. Crea un pull request

## 📞 Contacto

Para dudas o sugerencias, contacta al administrador del proyecto.

---

**¡Que comience la batalla en Age of Empires!** ⚔️👑
