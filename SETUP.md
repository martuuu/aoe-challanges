# 🎮 AOE Panaderos - Sistema de Ranking y Desafíos

Sistema de gestión de partidas y ranking para la liga de Age of Empires.

## 📋 Características

- ✅ **Sistema de Autenticación** con contraseñas hardcodeadas para testing
- ✅ **Ranking ELO** con 4 niveles de competencia
- ✅ **Desafíos Individuales** y sugerencias
- ✅ **Partidas Grupales** con equipos
- ✅ **Historial Completo** de matches y cambios de nivel
- ✅ **Base de Datos** PostgreSQL con Prisma ORM

## 🚀 Setup para Desarrollo

### Prerrequisitos

- Node.js 18+
- PostgreSQL (local o Supabase)
- npm o yarn

### Instalación

1. **Clonar el repositorio**

```bash
git clone [url-del-repo]
cd aoe-historial
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar `.env` con tus datos:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/aoe_historial"
DIRECT_URL="postgresql://usuario:password@localhost:5432/aoe_historial"
```

4. **Configurar la base de datos**

```bash
# Crear y aplicar migraciones
npm run db:migrate

# Generar cliente Prisma
npm run db:generate

# Poblar con datos de testing
npm run db:seed
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

## 🔑 Credenciales de Testing

El sistema incluye 3 usuarios para testing:

| Usuario  | Email                | Contraseña |
| -------- | -------------------- | ---------- |
| Tincho   | olimpomn@hotmail.com | tincho9    |
| Martu    | olimpomn@gmail.com   | martu10    |
| TestUser | test@example.com     | test11     |

## 🏗️ Setup para Producción

### Con Supabase

1. **Crear proyecto en Supabase**

   - Ir a [supabase.com](https://supabase.com)
   - Crear nuevo proyecto
   - Obtener URL y keys

2. **Configurar variables de entorno**

```env
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[db]?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://[user]:[password]@[host]:[port]/[db]"
NEXT_PUBLIC_SUPABASE_URL="https://[tu-proyecto].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[tu-anon-key]"
```

3. **Desplegar database**

```bash
npm run db:push
npm run db:seed
```

### Con Railway/Vercel

1. **Conectar repositorio**
2. **Configurar variables de entorno**
3. **Configurar build commands**:
   - Build: `npm run build`
   - Start: `npm start`

## 📊 Estructura de Base de Datos

### Tablas Principales

- **users**: Información de jugadores
- **challenges**: Desafíos entre jugadores
- **matches**: Resultados de partidas
- **group_matches**: Partidas grupales
- **level_changes**: Historial de cambios de nivel
- **elo_history**: Historial de cambios ELO

### Sistema de Niveles

1. **El lechero** (Rey) - ELO 1400+
2. **Protesis Ok** - ELO 1300-1399
3. **Construyo mas atras** - ELO 1100-1299 (inicial)
4. **manco juga a otra cosa** - ELO 0-1099

## 🎯 Reglas del Sistema

### Desafíos

- Solo se puede desafiar al mismo nivel o 1 nivel superior
- Los jugadores están obligados a aceptar desafíos de niveles inferiores
- Los desafíos expiran en 48 horas para ser aceptados
- Una vez aceptados, tienen 1 semana para concretar el partido

### Cambios de Nivel

- **Descenso**: 1 derrota vs nivel inferior O 2 derrotas consecutivas mismo nivel
- **Ascenso**: 2 victorias mismo nivel + 1 victoria vs superior

### Sistema ELO

- ELO inicial: 1200 puntos
- Factor K: 32 (ajustable)
- Redistribución automática de niveles según ELO

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run start        # Servidor producción
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Aplicar schema a DB
npm run db:migrate   # Crear migración
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Poblar DB con datos test
```

## 📁 Estructura del Proyecto

```
aoe-historial/
├── app/                    # Next.js App Router
├── components/             # Componentes UI
│   ├── sections/          # Secciones de página
│   └── ui/                # Componentes base
├── hooks/                 # Custom hooks React
├── lib/                   # Utilidades y servicios
│   ├── services/          # Servicios de API
│   ├── auth-prisma.ts     # Sistema auth con DB
│   ├── prisma.ts          # Cliente Prisma
│   └── ranking-system.ts  # Lógica ELO y niveles
├── prisma/                # Schema y migraciones
│   ├── schema.prisma      # Definición tablas
│   └── seed.ts            # Datos iniciales
└── public/                # Assets estáticos
```

## 🐛 Troubleshooting

### Error: "useAuth must be used within an AuthProvider"

- El AuthProvider está configurado en `app/layout.tsx`
- Asegúrate de que todos los componentes estén dentro del layout

### Error de conexión a DB

- Verificar variables de entorno
- Comprobar que PostgreSQL esté ejecutándose
- Verificar permisos de usuario en DB

### Prisma Client no generado

```bash
npm run db:generate
```

## 📞 Soporte

Para problemas o preguntas, contactar al administrador del proyecto.

---

**¡Que gane el mejor panadero! 🍞👑**
