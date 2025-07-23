# Refactorización de Estadísticas - useStats Centralizado

## Problema Anterior

La aplicación tenía múltiples endpoints y hooks para estadísticas:

- `/api/stats/user` - Estadísticas de usuarios
- `/api/stats/monthly` - Estadísticas mensuales
- `/api/users/{id}/stats` - Estadísticas específicas de usuario
- `/api/users/{id}/ranking` - Ranking de usuario
- Múltiples hooks que hacían llamadas separadas

Esto resultaba en:

- ❌ Múltiples consultas a la base de datos
- ❌ Código duplicado en diferentes hooks
- ❌ Mayor complejidad de mantenimiento
- ❌ Peor rendimiento por múltiples requests
- ❌ Inconsistencias entre diferentes estadísticas

## Solución Nueva

Implementamos un hook centralizado `useStats` que:

- ✅ Hace **una sola consulta** para traer todos los datos necesarios
- ✅ Procesa estadísticas **localmente** en el frontend
- ✅ Cachea los datos para evitar re-fetch innecesarios
- ✅ Proporciona todas las estadísticas a partir de los mismos datos
- ✅ Es más eficiente y mantenible

## Arquitectura Nueva

### Endpoint Principal

- **`/api/stats/all`** - Un único endpoint que trae:
  - Todos los usuarios con sus datos básicos
  - Todos los matches con información completa
  - Todos los challenges con sus relaciones

### Hook Centralizado

- **`useStats`** - Hook principal que:
  - Fetch de datos una sola vez
  - Procesa estadísticas con `useMemo` para optimización
  - Expone funciones para diferentes tipos de estadísticas

### Hooks Refactorizados

Todos los hooks existentes ahora usan `useStats` internamente:

- `useMonthlyStats()` → Usa `getMonthlyStats` de `useStats`
- `useUserMainStats(userId)` → Usa `getUserMainStats(userId)` de `useStats`
- `usePendingChallenges(userId)` → Usa `getPendingChallenges(userId)` de `useStats`
- `useAcceptedChallenges()` → Usa `getAcceptedChallenges` de `useStats`
- `useRecentHistory()` → Usa `getRecentHistory` de `useStats`

## Beneficios

### Rendimiento

- **1 request** en lugar de 3-5 requests por página
- **Caché compartido** entre todos los hooks
- **Procesamiento local** evita cálculos en el servidor

### Mantenimiento

- **Código centralizado** para procesamiento de estadísticas
- **Fácil de modificar** estadísticas sin cambiar endpoints
- **Consistencia** garantizada entre diferentes vistas

### Escalabilidad

- **Fácil agregar nuevas estadísticas** sin nuevos endpoints
- **Filtros dinámicos** por fechas, usuarios, etc.
- **Reutilización** de la misma data para diferentes propósitos

## Ejemplo de Uso

```typescript
// Antes - Múltiples hooks y requests
function Dashboard() {
  const { stats: monthlyStats } = useMonthlyStats() // Request 1
  const { stats: userStats } = useUserMainStats(userId) // Request 2 + 3 + 4
  const { challenges } = usePendingChallenges(userId) // Request 5

  // ...
}

// Después - Un solo request compartido
function Dashboard() {
  const { stats: monthlyStats } = useMonthlyStats() // Usa datos cacheados
  const { stats: userStats } = useUserMainStats(userId) // Usa datos cacheados
  const { challenges } = usePendingChallenges(userId) // Usa datos cacheados

  // Todos usan los mismos datos del hook useStats interno
}
```

## Datos Disponibles

El hook `useStats` expone:

### Raw Data

- `rawData.users` - Todos los usuarios
- `rawData.matches` - Todos los matches
- `rawData.challenges` - Todos los challenges

### Estadísticas Procesadas

- `getUserMainStats(userId)` - Estadísticas principales de usuario
- `getMonthlyStats` - Estadísticas del mes actual
- `getPendingChallenges(userId)` - Desafíos pendientes por usuario
- `getAcceptedChallenges` - Todos los desafíos aceptados
- `getRecentHistory` - Historial reciente de matches y challenges

### Estados

- `isLoading` - Estado de carga
- `error` - Errores
- `refetch()` - Función para recargar datos

## Migración

✅ **Completado** - Todos los hooks existentes han sido refactorizados
✅ **Compatible** - La API pública de los hooks permanece igual
✅ **Sin Breaking Changes** - Los componentes no necesitan cambios

Los componentes existentes pueden seguir usando los hooks como antes, pero ahora son más eficientes internamente.
