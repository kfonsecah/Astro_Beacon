# Phase 19: Critical Bug Fixes - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Corregir dos bugs críticos que dejan features completas como dead code y que rompen la paginación infinita en tres pantallas.

**Bug 1 — Trip Activation desconectado del TripStore:**
`useStartTrip` nunca llama `useTripStore.getState().setActiveTrip()`. Como resultado, `activeTrip` en el TripStore siempre es `null`, lo que significa que el indicador de viaje activo, el rastreo GPS en tiempo real y el countdown de oxígeno en `map.tsx` nunca se activan. Toda la Fase 17 Plans 03-04 es dead code funcionalmente.

**Bug 2 — Double setAuth en login:**
`useLogin` hook (`src/hooks/useAuth.ts:10`) llama `setAuth` en su `onSuccess`. `login.tsx:240` también llama `useAuthStore.getState().setAuth(...)` manualmente después del `mutateAsync`. El store se actualiza dos veces por login.

**Bug 3 — Paginación sin acumulación en Bestiary, Logbook, Trips:**
`bestiary.tsx`, `logbook.tsx` y `trips.tsx` asignan `data?.items` directamente sin acumular páginas. Al hacer scroll al final y cargar página 2, los items de página 1 desaparecen. `resources.tsx` y `map.tsx` tienen el patrón correcto con estado local de acumulación.

**In scope:**
- `useStartTrip.onSuccess` → llamar `setActiveTrip(updatedTrip)`
- `useCompleteTrip.onSuccess` y `useAbortTrip.onSuccess` → llamar `setActiveTrip(null)`
- Remover la llamada manual duplicada a `setAuth` en `login.tsx`
- Agregar estado local de acumulación a `bestiary.tsx`, `logbook.tsx`, `trips.tsx`

**Out of scope:**
- NO modificar `TripStore` (ya está correcto)
- NO cambiar la UI de ninguna pantalla
- NO tocar servicios ni hooks de dominio
</domain>

<decisions>
## Implementation Decisions

### Bug 1 — Trip Activation

- **D-01:** El fix va en `src/hooks/useTrips.ts`, no en `trips.tsx` — la responsabilidad de conectar la respuesta de la API al store pertenece al hook, no a la pantalla
- **D-02:** `useStartTrip.onSuccess` recibe `(updatedTrip: Viaje, variables, context)` — el primer argumento es el `Viaje` retornado por `tripService.start()` (ya tipado como `Promise<Viaje>`) — usar este objeto para `setActiveTrip`
- **D-03:** `useCompleteTrip.onSuccess` y `useAbortTrip.onSuccess` deben llamar `useTripStore.getState().setActiveTrip(null)` para limpiar el estado al terminar o abortar un viaje
- **D-04:** NO agregar TripStore como dependencia directa de `useTrips.ts` a nivel de import del módulo — llamar via `useTripStore.getState()` (patrón ya establecido en el proyecto para acceso fuera de componentes React)

### Bug 2 — Double setAuth

- **D-05:** Remover únicamente las líneas 238-240 de `login.tsx` donde se llama `useAuthStore.getState().setAuth(response.accessToken, response.refreshToken, response.user)` manualmente
- **D-06:** Mantener intacto el resto del flujo de login — solo eliminar la llamada duplicada
- **D-07:** El `router.replace('/(tabs)/dashboard')` en `login.tsx` se mantiene — la navegación sigue siendo responsabilidad de la pantalla, no del hook

### Bug 3 — Paginación

- **D-08:** Usar el patrón exacto de `resources.tsx` como referencia: estado local `allItems`, `useEffect` que acumula via `existingIds Set` para deduplicar, `hasMore` calculado con `data?.total`
- **D-09:** Reset completo en `onRefresh`: limpiar el estado local, volver a `page = 1`, llamar `refetch()`
- **D-10:** Para `bestiary.tsx` el estado es `allSpecies: Especie[]`; para `logbook.tsx` es `allEntries: BitacoraEntradaResponse[]`; para `trips.tsx` es `allTrips: Viaje[]` — tipar correctamente con los DTOs existentes

### The Agent's Discretion
- Orden exacto de operaciones dentro de `onSuccess` de `useStartTrip` (invalidateQueries antes o después de setActiveTrip)
- Nombre exacto de la variable de estado local en cada pantalla
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Archivos a modificar directamente
- `src/hooks/useTrips.ts` — `useStartTrip`, `useCompleteTrip`, `useAbortTrip` — agregar setActiveTrip calls
- `app/(auth)/login.tsx` — remover llamada duplicada a setAuth (lineas ~238-240)
- `app/(tabs)/bestiary.tsx` — agregar acumulación de páginas
- `app/(tabs)/logbook.tsx` — agregar acumulación de páginas
- `app/trips.tsx` — agregar acumulación de páginas

### Patrón de referencia (correcto)
- `app/(tabs)/resources.tsx` — implementación correcta de paginación con acumulación (usar como modelo exacto)
- `app/(tabs)/map.tsx` — otro ejemplo correcto con `suppliesList` state

### Store a conectar
- `src/stores/trip.store.ts` — `setActiveTrip(trip: Viaje | null)`, `startOxygenCountdown`, `stopOxygenCountdown`

### Hook de auth (para entender el double call)
- `src/hooks/useAuth.ts` — `useLogin` ya llama `setAuth` en `onSuccess` (línea 10)
- `src/stores/auth.store.ts` — `setAuth` method

### Tipos necesarios
- `src/types-dtos/viaje.dto.ts` — `Viaje` type
- `src/types-dtos/especie.dto.ts` — `Especie` type
- `src/types-dtos/bitacora.dto.ts` — `BitacoraEntradaResponse` type

### Requirements
- `.planning/REQUIREMENTS.md` — No hay requirements específicos para estos bugs (son deuda técnica descubierta en auditoría)
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Patrón de acumulación** (`resources.tsx:16-33`) — copiar estructura exacta: estado local, useEffect con Set para deduplicar, loadMore, onRefresh con reset
- **`useTripStore.getState()`** — ya se usa en `map.tsx:134` para llamar `startOxygenCountdown` — mismo patrón para `setActiveTrip`
- **`tripService.start()` retorna `Promise<Viaje>`** — el `onSuccess` de `useMutation` recibe este valor como primer argumento automáticamente

### Established Patterns
- Acceso a stores Zustand fuera de componentes React: `useStoreName.getState().method()` (ver `api.ts:40`, `api.ts:96`)
- Acumulación de páginas: `useEffect` watching `data?.items` + Set de IDs existentes para deduplicar
- Reset de paginación: `setPage(1)`, limpiar estado local, `refetch()`

### Integration Points
- `useStartTrip` en `trips.tsx` → al éxito, `TripStore.setActiveTrip(updatedTrip)` activa GPS tracking y oxygen countdown en `map.tsx`
- `useCompleteTrip` / `useAbortTrip` → al éxito, `TripStore.setActiveTrip(null)` desactiva los indicadores
- `bestiary.tsx` / `logbook.tsx` / `trips.tsx` → FlatList ya tiene `onEndReached={loadMore}` configurado, solo falta que `loadMore` use el estado acumulado

### Gotchas conocidos
- `useStartTrip` actualmente recibe `(updatedTrip, { id })` en `onSuccess` — el `_` del código actual debe reemplazarse por `updatedTrip` para capturar la respuesta
- El `page` state en cada pantalla es correcto — solo falta el estado de acumulación
- `trips.tsx` tiene `keyExtractor={(item, index) => item.id || trip-${index}}` — funciona correctamente con acumulación
</code_context>

<specifics>
## Specific Ideas

- Después del fix, iniciar un viaje en `trips.tsx` debe hacer aparecer inmediatamente el banner "VIAJE ACTIVO - Rastreo GPS activo" y el counter O2 en `map.tsx` sin necesidad de refrescar
- El countdown de oxígeno se inicia desde `map.tsx` via `useEffect` que ya existe (`map.tsx:130-142`) — este useEffect reacciona a `activeTrip?.status === 'activo'`, que ahora SI será true después del fix
- Para testear: iniciar un viaje, ir al tab Mapa, verificar que aparece el indicador y el O2 counter
</specifics>

<deferred>
## Deferred Ideas

- Persistir `activeTrip` en TripStore via Zustand persist (actualmente no persiste entre reinicios de la app) — deferido a milestone posterior
- Completar un viaje desde el mapa (botón "COMPLETAR VIAJE") — no está en scope de este fix
</deferred>

---
*Phase: 19-critical-bug-fixes*
*Context gathered: 2026-05-04*
