# Phase 28: Missions Page - Context

**Gathered:** 2026-06-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Pantalla dedicada a misiones/expediciones — el "log" de misiones del astronauta. Separa el concepto de "misión" (expedición planificada con historial) del flujo de viaje activo que maneja `/trips`. Muestra historial completo, misión activa con monitoreo en tiempo real, y permite planear nuevas expediciones.

</domain>

<decisions>
## Implementation Decisions

### Page Purpose
- **D-01:** Pantalla de "log" de misiones — historial completo + misión activa + planear nueva
- **D-02:** Separada conceptualmente de `/trips` (que maneja la lógica de viaje activo con GPS y simulación)
- **D-03:** Ruta: `app/missions/index.tsx` (usar `missions` como slug en inglés para consistencia con `log-resource`)

### Content & Layout
- **D-04:** Header tipo panel de control con estado de misión activa (si existe):
  - Nombre/destino de la misión
  - Oxígeno restante en tiempo real (via `useTripStore`)
  - Tiempo transcurrido
  - Botón "COMPLETAR" (visible solo si hay misión activa)
- **D-05:** Lista de misiones pasadas (completadas/abortadas) con stats clave por card:
  - Duración, recursos usados, distancia
  - Usar `useTrips(page, limit, status)` filtrando por completado/abortado
  - FlatList con paginación + pull-to-refresh
  - HUD aesthetic consistente con el resto del diseño (sin border-radius, monospace)
- **D-06:** Si no hay misiones pasadas: EmptyState "SIN REGISTROS DE MISIÓN"

### Navigation
- **D-07:** Ambos:
  1. Tab dedicado en `app/(tabs)/_layout.tsx` con ícono (ej. `rocket` / `flag`) — hace la feature descubrible
  2. Botón "EXPEDICIÓN" en dashboard (`app/(tabs)/dashboard.tsx`) redirige a esta pantalla en vez de `/trips` — flujo principal en contexto

### Interactions: Sin Misión Activa
- **D-08:** Botón prominente "INICIAR EXPEDICIÓN" → flujo que usa `useCreateTrip` (viaje nuevo) o redirige a pantalla de planeación
- **D-09:** El flujo de iniciar expedición debe navegar al formulario de creación (`app/(app)/missions/new` o similar) con campos: destino (lat/lng), presupuesto de oxígeno, notas

### Interactions: Con Misión Activa
- **D-10:** Panel de control con monitoreo en tiempo real: oxígeno restante (via `useTripStore.oxygenRemaining`)
- **D-11:** Botón "COMPLETAR MISIÓN" → llama `useCompleteTrip`
- **D-12:** Cancelar misión activa: confirmación tipo Alert (acción destructiva) → llama `useAbortTrip`

### Interactions: Misiones Pasadas
- **D-13:** Tap en misión pasada → pantalla de detalle read-only (`app/missions/[id].tsx`)
- **D-14:** No hay acción inline de cancelar en misiones pasadas — solo visualización

### the agent's Discretion
- Implementación exacta del panel de control (layout de métricas, diseño responsivo)
- Posición del tab en la barra de tabs (recomendado: entre Recursos y Bitácora, o al final)
- Animaciones de transición al crear/completar misión
- Si se reusa la ruta `/trips` existente o se crea una completamente nueva para el detalle

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tab Layout
- `app/(tabs)/_layout.tsx` — Dónde añadir el nuevo tab de Missions
- `app/(tabs)/dashboard.tsx` — Dónde actualizar el botón "EXPEDICIÓN" de `/trips` a missions

### Hooks existentes (listos para usar)
- `src/hooks/useTrips.ts` — `useTrips(page, limit, status)`, `useCreateTrip()`, `useCompleteTrip()`, `useAbortTrip()`
- `src/stores/trip.store.ts` — `useTripStore` con `activeTrip`, `oxygenRemaining`, `setActiveTrip`

### Tipos
- `src/types-dtos/viaje.dto.ts` — `Viaje { id, astronautId, destination, status, startedAt, completedAt, oxygenBudgeted, oxygenConsumed, resourcesCollected, notes }`, `CreateViajeDTO`, `ViajeResumen`

### Referencia visual existente
- `app/trips.tsx` — Pantalla existente de viajes: patrón de cards con status color map, badges, layout HUD
- `app/(tabs)/bestiary.tsx` — Patrón de FlatList + Swipeable + pull-to-refresh (referencia de interacciones)
- `app/(tabs)/resources.tsx` — Patrón de FlatList con paginación, pull-to-refresh

### Design System
- `src/constants/colors.ts` — `tripPlanificado`, `tripActivo`, `tripCompletado`, `tripAbortado`
- `src/theme/dark.ts`, `src/theme/light.ts` — Tokens del tema

</canonical_refs>

<code_context>
## Existing Code Insights

### Trip status color pattern (de trips.tsx)
```ts
const statusColorMap: Record<string, string> = {
  planificado: colors.tripPlanificado,
  activo: colors.tripActivo,
  completado: colors.tripCompletado,
  abortado: colors.tripAbortado,
};
```

### Active trip state management
```ts
const activeTrip = useTripStore(state => state.activeTrip);
const oxygenRemaining = useTripStore(state => state.oxygenRemaining);
// useCompleteTrip({ id: activeTrip.id })
// useAbortTrip({ id: activeTrip.id })
```

### Trip list query pattern
```ts
const { data, isLoading, refetch } = useTrips(page, limit, status);
// status puede ser 'completado' | 'abortado' para filtrar misiones pasadas
```

### Tab entry pattern (de _layout.tsx)
```tsx
<Tabs.Screen
  name="missions"  // nuevo archivo app/(tabs)/missions.tsx
  options={{
    title: "Misiones",
    tabBarIcon: ({ color, size, focused }) => (
      <Ionicons name={focused ? "flag" : "flag-outline"} size={size} color={color} />
    ),
  }}
/>
```

### Dashboard expedition button (a actualizar)
En `app/(tabs)/dashboard.tsx`, cambiar `router.push("/trips")` a `router.push("/missions")`

</code_context>

<specifics>
## Specific Ideas

- La pantalla principal debe sentir que estás viendo el "cuaderno de bitácora de expediciones" del astronauta — misma estética HUD que el resto
- El botón de completar/cancelar debe sentirse significativo (confirmación con Alert explicando consecuencias: oxígeno restante no usado se pierde, etc.)
- Separar "misión activa" (panel) de "historial" (lista) con un divisor visual claro

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 28-missions-page*
*Context gathered: 2026-06-11*
