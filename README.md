# 🏆 AoE Panaderos - Sistema de Liga y Desafíos

Sistema completo de gestión de liga para Age of Empires con ranking por pirámide, desafíos y estadísticas en tiempo real.

## ✨ Características Principales

- **🏛️ Sistema de Pirámide**: 4 niveles jerárquicos con reglas de ascenso/descenso
- **⚔️ Desafíos Individuales**: Sistema completo de retos entre jugadores
- **👥 Partidas Grupales**: Organización de equipos con drag & drop
- **📊 Estadísticas Avanzadas**: Métricas mensuales y análisis de rendimiento
- **🔄 Tiempo Real**: Actualizaciones automáticas de rankings y stats
- **📱 Responsive**: Diseño optimizado para desktop y móvil
- **🔐 Autenticación**: Sistema de login con contraseñas personalizadas

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **Base de Datos**: Supabase (PostgreSQL) + Prisma ORM
- **Deployment**: Netlify (Static Export)
- **Estado**: React Context + Custom Hooks optimizados

## 🚀 Quick Start

```bash
# 1. Clonar e instalar
git clone <repository-url>
cd aoe-historial
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 3. Configurar base de datos
npm run db:push
npm run db:seed

# 4. Ejecutar en desarrollo
npm run dev
```

### 📋 Configuración de Variables de Entorno

```env
# Supabase
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[db]?pgbouncer=true"
DIRECT_URL="postgresql://[user]:[password]@[host]:[port]/[db]"

# Para desarrollo local también puedes usar:
# DATABASE_URL="file:./dev.db"
```

## 🎮 Usuarios de Prueba

El sistema incluye usuarios predefinidos para testing:

| Usuario  | Email                | Contraseña | Nivel |
| -------- | -------------------- | ---------- | ----- |
| Tincho   | olimpomn@hotmail.com | tincho9    | 3     |
| Martu    | olimpomn@gmail.com   | martu10    | 3     |
| TestUser | test@example.com     | test11     | 4     |

## 🏗️ Arquitectura del Sistema

### Sistema de Pirámide

1. **El lechero** (Rey) - ELO 1400+
2. **Protesis Ok** - ELO 1300-1399
3. **Construyo mas atras** - ELO 1100-1299 (inicial)
4. **manco juga a otra cosa** - ELO 0-1099

### Reglas de Desafíos

- ✅ Se puede desafiar al mismo nivel o 1 nivel superior
- ✅ Ganar a nivel superior = intercambio de posiciones
- ✅ 2 victorias consecutivas en mismo nivel = ascenso
- ✅ 1 derrota vs inferior O 2 derrotas consecutivas = descenso

### Performance Optimizada

- **Backend Processing**: Cálculos pesados en servidor
- **Endpoints Específicos**: `/api/stats/monthly-optimized`, `/api/challenges-optimized`
- **Caching Inteligente**: React Query patterns en hooks personalizados
- **Static Export**: Build optimizado para Netlify

## � Estructura de la Base de Datos

### Tablas Principales

```sql
-- Usuarios y Autenticación
users: id, name, alias, email, level, elo, wins, losses, streak

-- Sistema de Desafíos
challenges: id, challenger, challenged, status, type, expires_at

-- Historial de Partidas
matches: id, winnerId, loserId, completedAt, type

-- Partidas Grupales
group_matches: id, team1, team2, winning_team, completedAt

-- Historial de Cambios
level_changes: id, userId, oldLevel, newLevel, reason, createdAt
elo_history: id, userId, oldElo, newElo, matchId, createdAt
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run start            # Servidor de producción

# Base de Datos
npm run db:push          # Aplicar schema a DB
npm run db:seed          # Poblar con datos de prueba
npm run db:studio        # Abrir Prisma Studio
npm run db:generate      # Generar cliente Prisma

# Calidad de Código
npm run lint             # Verificar código
npm run lint:fix         # Corregir errores automáticamente
npm run type-check       # Verificar tipos TypeScript
```

## 🚀 Deploy en Netlify

### Configuración Automática

1. Conectar repositorio en Netlify
2. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
3. Variables de entorno:
   ```
   DATABASE_URL=tu-database-url
   DIRECT_URL=tu-database-url
   ```

### Características del Deploy

- ✅ Static Export optimizado
- ✅ Routing automático con `netlify.toml`
- ✅ Caching headers configurados
- ✅ Build automático en cada push

## 📱 Funcionalidades Detalladas

### Dashboard Principal

- 🏛️ Pirámide visual con 4 niveles
- 📈 Widgets de estadísticas mensuales
- ⚡ Actualizaciones en tiempo real
- 🎯 Sugerencias de desafíos inteligentes

### Sistema de Desafíos

- 🎯 Validación automática de reglas
- ⏰ Expiración automática (48h para aceptar)
- 🏆 Procesamiento automático de resultados
- 📊 Historial completo de desafíos

### Partidas Grupales

- 👥 Drag & drop para formar equipos
- ⚖️ Balanceado automático por ELO
- 🏆 Resultados por equipos
- 📈 Estadísticas grupales

### Estadísticas Avanzadas

- 🏆 Top ganadores del mes
- 📈 Mejor racha actual
- 🎯 Ratio de aceptación de desafíos
- 📊 Métricas de rendimiento personalizadas

## � Desarrollo y Mantenimiento

### Estructura del Proyecto

```
aoe-historial/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes optimizadas
│   ├── settings/          # Página de configuración
│   └── info/              # Información del sistema
├── components/            # Componentes React
│   ├── sections/          # Secciones principales
│   └── ui/                # Componentes base (shadcn/ui)
├── hooks/                 # Custom hooks optimizados
├── lib/                   # Servicios y utilidades
│   ├── services/          # Servicios de datos
│   └── auth-client.ts     # Sistema de autenticación
├── prisma/               # ORM y migraciones
└── public/               # Assets estáticos
```

### Performance y Optimizaciones

- **Backend Processing**: Cálculos pesados movidos al servidor
- **Hooks Optimizados**: `useMonthlyStatsOptimized`, `usePendingChallengesOptimized`
- **Endpoints Específicos**: APIs targeted para cada funcionalidad
- **React Patterns**: useMemo, useCallback para evitar re-renders
- **Static Export**: Build optimizado para mejor rendimiento

### Agregar Nuevos Jugadores

1. Usar Prisma Studio: `npm run db:studio`
2. O modificar `prisma/seed.ts` y ejecutar `npm run db:seed`

### Troubleshooting Común

```bash
# Reset completo de base de datos
npm run db:push --force-reset
npm run db:seed

# Regenerar cliente Prisma
npm run db:generate

# Verificar tipos
npm run type-check

# Limpiar y reinstalar
rm -rf node_modules .next
npm install
```

## 📞 Soporte y Contacto

- **Repositorio**: `aoe-challanges` (branch: main)
- **Owner**: martuuu
- **Deployment**: Netlify automático
- **Database**: Supabase PostgreSQL

## 📄 Licencia

Proyecto privado para uso entre amigos. No destinado para uso comercial.

---

**🏆 ¡Que gane el mejor panadero! 🍞⚔️**
