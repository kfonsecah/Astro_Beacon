# Phase 19: Critical Bug Fixes - Research

**Researched:** 2026-05-04
**Domain:** React Native / TanStack Query / Zustand — corrección de bugs de integración store-hook y paginación infinita
**Confidence:** HIGH (todos los bugs verificados directamente en el codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Bug 1 — Trip Activation**
- D-01: El fix va en `src/hooks/useTrips.ts`, no en `trips.tsx` — la responsabilidad de conectar la respuesta de la API al store pertenece al hook, no a la pantalla
- D-02: `useStartTrip.onSuccess` recibe `(updatedTrip: Viaje, variables, context)` — el primer argumento es el `Viaje` retornado por `tripService.start()` — usar este objeto para `setActiveTrip`
- D-03: `useCompleteTrip.onSuccess` y `useAbortTrip.onSuccess` deben llamar `useTripStore.getState().setActiveTrip(null)`
- D-04: NO agregar TripStore como dependencia directa de `useTrips.ts` a nivel de import del módulo — llamar via `useTripStore.getState()` (patrón ya establecido en el proyecto)

**Bug 2 — Double setAuth**
- D-05: Remover únicamente las líneas 238-240 de `login.tsx` donde se llama `useAuthStore.getState().setAuth(response.accessToken, response.refreshToken, response.user)` manualmente
- D-06: Mantener intacto el resto del flujo de login
- D-07: El `router.replace('/(tabs)/dashboard')` en `login.tsx` se mantiene — la navegación sigue siendo responsabilidad de la pantalla, no del hook

**Bug 3 — Paginación**
- D-08: Usar el patrón exacto de `resources.tsx` como referencia: estado local `allItems`, `useEffect` que acumula via `existingIds Set` para deduplicar, `hasMore` calculado con `data?.total`
- D-09: Reset completo en `onRefresh`: limpiar el estado local, volver a `page = 1`, llamar `refetch()`
- D-10: Para `bestiary.tsx` el estado es `allSpecies: Especie[]`; para `logbook.tsx` es `allEntries: BitacoraEntradaResponse[]`; para `trips.tsx` es `allTrips: Viaje[]` — tipar correctamente con los DTOs existentes

### Claude's Discretion
- Orden exacto de operaciones dentro de `onSuccess` de `useStartTrip` (invalidateQueries antes o después de setActiveTrip)
- Nombre exacto de la variable de estado local en cada pantalla

### Deferred Ideas (OUT OF SCOPE)
- Persistir `activeTrip` en TripStore via Zustand persist (actualmente no persiste entre reinicios de la app)
- Completar un viaje desde el mapa (botón "COMPLETAR VIAJE")
</user_constraints>

---

## Summary

La Fase 19 corrige tres bugs discretos descubiertos en auditoría post-fase-17. El primero es una desconexión arquitectural en `useStartTrip`: el hook llama al servicio correctamente pero nunca propaga el resultado al `TripStore`, dejando todo el trabajo de la Fase 17 (GPS tracking, oxygen countdown) como dead code. El segundo es una doble escritura al `AuthStore` durante el login, causada por un `setAuth` manual en `login.tsx` que duplica el que ya hace `useLogin.onSuccess`. El tercero es un bug de acumulación de páginas en tres pantallas que resetean la lista en vez de extenderla.

Los tres bugs están completamente diagnosticados. El codebase ya tiene todos los patrones correctos implementados en otros archivos — el trabajo consiste en aplicar esos patrones a los archivos incorrectos. No se requiere ninguna dependencia nueva ni cambio arquitectural.

**Primary recommendation:** Aplicar cambios quirúrgicos y mínimos. Cada fix es un `diff` pequeño. Verificar con los patrones ya existentes en `resources.tsx`, `map.tsx` y `useAuth.ts` como referencia.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Conectar respuesta API al TripStore | Hook (`useTrips.ts`) | — | El hook es el único punto que conoce tanto la respuesta de la API como el contrato del store |
| Navegación post-login | Pantalla (`login.tsx`) | — | La pantalla decide el destino de navegación; el hook no debe tener acoplamiento al router |
| Actualización de AuthStore | Hook (`useAuth.ts`) | — | El hook `onSuccess` es el lugar canónico; la pantalla no debe duplicarlo |
| Acumulación de páginas | Pantalla (cada screen) | — | El estado local de UI pertenece al componente, no al hook de datos |

---

## Standard Stack

### Core (ya instalado — sin cambios)
| Library | Version verificada | Propósito | Relevancia al fix |
|---------|-------------------|-----------|-------------------|
| `@tanstack/react-query` | v5.x | Server state + mutaciones | `useMutation.onSuccess` recibe el valor de retorno como primer arg [VERIFIED: codebase] |
| `zustand` | v4.x | Client state (TripStore, AuthStore) | `useTripStore.getState()` — acceso imperativo fuera de componentes React [VERIFIED: codebase] |

**Installation:** No se requiere instalar nada nuevo. [VERIFIED: codebase — package.json existente]

---

## Architecture Patterns

### System Architecture Diagram

```
trips.tsx (UI)
    │ mutate({ id })
    ▼
useStartTrip() [useTrips.ts]
    │ mutationFn → tripService.start(id)
    │                    │
    │                    ▼
    │             API: POST /trips/:id/start
    │                    │
    │             returns Viaje (activo)
    │
    ├─ onSuccess(updatedTrip) ──► useTripStore.getState().setActiveTrip(updatedTrip)
    │                                    │
    │                                    ▼
    │                              TripStore.activeTrip = Viaje
    │
    └─ queryClient.invalidateQueries(['trips'])
             │
             ▼
       map.tsx useEffect watches activeTrip?.status
             │ (activo) ──► startGpsTracking() + startOxygenCountdown()
```

```
login.tsx handleLogin
    │ mutateAsync({ email, password })
    ▼
useLogin() [useAuth.ts]
    │ mutationFn → authService.login()
    │
    ├─ onSuccess(data) ──► useAuthStore.getState().setAuth(...)  ← ÚNICA llamada correcta
    │
    └─ returns LoginResponse
         │
         ▼ (vuelve al await en login.tsx)
    [ANTES]: login.tsx llamaba setAuth() de nuevo aquí  ← ELIMINAR ESTO
    [DESPUÉS]: login.tsx solo llama router.replace(...)
```

### Recommended Project Structure (sin cambios)
```
src/
├── hooks/
│   ├── useTrips.ts        # MODIFICAR: agregar setActiveTrip en onSuccess
│   └── useAuth.ts         # NO tocar (ya correcto)
├── stores/
│   └── trip.store.ts      # NO tocar (ya correcto)
app/
├── (auth)/
│   └── login.tsx          # MODIFICAR: remover líneas 238-240
└── (tabs)/
    ├── bestiary.tsx        # MODIFICAR: agregar acumulación
    ├── logbook.tsx         # MODIFICAR: agregar acumulación
    ├── resources.tsx       # NO tocar (patrón correcto de referencia)
    └── map.tsx             # NO tocar (patrón correcto de referencia)
app/
└── trips.tsx              # MODIFICAR: agregar acumulación
```

### Pattern 1: onSuccess con setActiveTrip (TanStack Query v5)

En TanStack Query v5, `useMutation` pasa el valor de retorno de `mutationFn` como primer argumento de `onSuccess`. El tipo es inferido del `Promise<T>` del `mutationFn`.

```typescript
// Source: VERIFIED — codebase src/hooks/useTrips.ts + trip.store.ts
// ANTES (bug):
export function useStartTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { notes?: string } }) =>
      tripService.start(id, data),
    onSuccess: (_, { id }) => {  // _ ignora updatedTrip — BUG
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
    },
  });
}

// DESPUÉS (fix):
export function useStartTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { notes?: string } }) =>
      tripService.start(id, data),
    onSuccess: (updatedTrip, { id }) => {  // captura el Viaje retornado
      useTripStore.getState().setActiveTrip(updatedTrip);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
    },
  });
}
```

### Pattern 2: setActiveTrip(null) en complete/abort

```typescript
// Source: VERIFIED — codebase src/stores/trip.store.ts (setActiveTrip acepta null)
// DESPUÉS (fix para useCompleteTrip y useAbortTrip):
onSuccess: (_, { id }) => {
  useTripStore.getState().setActiveTrip(null);  // limpia el estado activo
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
  queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
},
```

### Pattern 3: Acumulación de páginas (patrón resources.tsx)

```typescript
// Source: VERIFIED — codebase app/(tabs)/resources.tsx:16-46
// Aplicar MISMO patrón a bestiary.tsx, logbook.tsx, trips.tsx

const [page, setPage] = useState(1);
const [allItems, setAllItems] = useState<T[]>([]);  // T = Especie | BitacoraEntradaResponse | Viaje
const [hasMore, setHasMore] = useState(true);

const { data, isLoading, error, refetch } = useHook(page, limit);

useEffect(() => {
  const newItems = data?.items ?? [];
  if (newItems.length > 0) {
    setAllItems(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const filtered = newItems.filter(r => !existingIds.has(r.id));
      return filtered.length > 0 ? [...prev, ...filtered] : prev;
    });
    setHasMore((data?.total ?? 0) > allItems.length + newItems.length);
  }
}, [data]);

const loadMore = () => {
  if (hasMore && !isLoading) {
    setPage(p => p + 1);
  }
};

const onRefresh = async () => {
  setPage(1);
  setAllItems([]);
  setHasMore(true);
  await refetch();
};

// FlatList usa: data={allItems}
```

### Pattern 4: Remover doble setAuth en login.tsx

```typescript
// Source: VERIFIED — codebase app/(auth)/login.tsx:238-241 y src/hooks/useAuth.ts:9-11

// ANTES (bug — líneas 238-241 de login.tsx):
const response = await loginMutation.mutateAsync({ email, password });
useAuthStore.getState().setAuth(response.accessToken, response.refreshToken, response.user);  // ELIMINAR
router.replace('/(tabs)/dashboard');

// DESPUÉS (fix):
await loginMutation.mutateAsync({ email, password });
// setAuth ya fue llamado por useLogin.onSuccess antes de llegar aquí
router.replace('/(tabs)/dashboard');
```

### Anti-Patterns to Avoid

- **Ignorar el primer argumento de onSuccess:** `(_, variables)` descarta el dato retornado por la API. Siempre nombrar el primer arg cuando se necesita.
- **Sincronizar stores desde la pantalla:** Llamar `setAuth` o `setActiveTrip` desde el componente de pantalla en lugar del hook rompe la separación de responsabilidades.
- **Reasignar data?.items directamente:** `data={data?.items}` en FlatList no acumula — reemplaza. Siempre usar estado local + useEffect para paginación incremental.
- **Reset de acumulación sin limpiar `page`:** Si se llama `setAllItems([])` pero no `setPage(1)`, TanStack Query no refetches página 1.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deduplicación en acumulación | Lógica propia de merge | `Set` de IDs + filter (ya en resources.tsx) | El patrón existente ya maneja duplicados correctamente |
| Acceso al store fuera de React | Import directo del estado | `useTripStore.getState()` | Patrón oficial de Zustand para callbacks/efectos fuera del render cycle |

**Key insight:** El codebase ya tiene los patrones correctos. No hay que inventar nada — solo copiar y adaptar.

---

## Common Pitfalls

### Pitfall 1: `_` en onSuccess ignora el updatedTrip
**What goes wrong:** TanStack Query v5 pasa el valor de retorno de `mutationFn` como primer arg de `onSuccess`. Si se usa `_` se descarta silenciosamente.
**Why it happens:** Código copiado del patrón de `useUpdateTrip` donde el retorno no se necesitaba.
**How to avoid:** Nombrar `updatedTrip` (o el tipo apropiado) en lugar de `_`.
**Warning signs:** `useTripStore.activeTrip` siempre null después de iniciar viaje.

[VERIFIED: codebase — `useStartTrip` línea 54 usa `(_, { id })` actualmente]

### Pitfall 2: Orden de operaciones en onSuccess
**What goes wrong:** Si `invalidateQueries` se llama antes de `setActiveTrip`, el refetch de la lista puede ocurrir antes de que el store esté actualizado, generando una condición de carrera UI mínima.
**Why it happens:** El orden no está especificado por TanStack Query.
**How to avoid:** Llamar `setActiveTrip` primero, luego `invalidateQueries` (es el orden que el usuario percibe más coherente). Esta es un área de discreción del agente.
**Warning signs:** Banner de viaje activo aparece con delay.

### Pitfall 3: onRefresh sin reset de `hasMore`
**What goes wrong:** Si `hasMore` queda en `false` del ciclo anterior y el usuario hace pull-to-refresh, `loadMore` no funciona en el siguiente scroll.
**Why it happens:** Reset incompleto al refrescar.
**How to avoid:** En `onRefresh`: `setPage(1)`, `setAllItems([])`, `setHasMore(true)`, `refetch()`.

[VERIFIED: codebase — resources.tsx:41-46 tiene el reset correcto completo]

### Pitfall 4: `useCallback` en onRefresh pierde dependencias
**What goes wrong:** `logbook.tsx` y `bestiary.tsx` usan `useCallback` en `onRefresh` sin las nuevas dependencias de estado (setter functions de useState son estables — no hay problema). Pero si el `onRefresh` nuevo necesita llamar `setAllItems`, el linter lo pedirá en deps.
**Why it happens:** Las funciones setter de `useState` son referencias estables en React, por lo que se pueden omitir de `useCallback` deps sin problema.
**How to avoid:** Incluir `refetch` en deps (ya está) — los setters de estado no necesitan incluirse.

### Pitfall 5: `trips.tsx` usa `data` directamente en variables locales
**What goes wrong:** `trips.tsx` actualmente hace `const trips = (data?.items || []) as Viaje[]` y pasa `data={trips}` al FlatList. Después del fix, el FlatList debe usar `allTrips` (el estado acumulado), no `trips`.
**Why it happens:** La variable local `trips` se refactoriza pero puede quedar referenciada en algún punto.
**How to avoid:** Buscar todas las ocurrencias de `data?.items` en cada archivo modificado después del fix.

[VERIFIED: codebase — trips.tsx:95, bestiary.tsx:63, logbook.tsx:47]

---

## Code Examples

### Estado actual verificado de los bugs

**Bug 1 — useStartTrip (línea 54 de useTrips.ts):**
```typescript
// ACTUAL (buggy) — VERIFIED
onSuccess: (_, { id }) => {
  // _ descarta el Viaje retornado. TripStore nunca actualizado.
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
  queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
},
```

**Bug 2 — login.tsx (línea 240):**
```typescript
// ACTUAL (buggy) — VERIFIED
const response = await loginMutation.mutateAsync({ email, password });
useAuthStore.getState().setAuth(response.accessToken, response.refreshToken, response.user); // ← DUPLICADO
router.replace('/(tabs)/dashboard');
```

El hook `useLogin` en `useAuth.ts` línea 9-11 ya llama `setAuth`:
```typescript
// useAuth.ts — VERIFIED — CORRECTO
onSuccess: (data) => {
  useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user);
},
```

**Bug 3 — bestiary.tsx (línea 63):**
```typescript
// ACTUAL (buggy) — VERIFIED
const species = (data?.items || []) as Especie[];
// FlatList data={species} → reemplaza página anterior con cada fetch
```

**Mismo bug en logbook.tsx (línea 47):**
```typescript
// ACTUAL (buggy) — VERIFIED
const entries = (data?.items || []) as BitacoraEntradaResponse[];
```

**Mismo bug en trips.tsx (línea 95):**
```typescript
// ACTUAL (buggy) — VERIFIED
const trips = (data?.items || []) as Viaje[];
```

### Patrón correcto de referencia (resources.tsx:16-46) — VERIFIED

Ver sección "Pattern 3" arriba. Este es el código exacto a replicar.

### Import necesario para useTrips.ts

```typescript
// Agregar al inicio de useTrips.ts
import { useTripStore } from '../stores/trip.store';
// (o @/stores/trip.store según alias del proyecto)
```

Verificar el alias correcto en el proyecto:
- `map.tsx` usa `@/stores/trip.store` — VERIFIED en map.tsx:6

---

## State of the Art

| Old Approach | Current Approach | Relevancia |
|--------------|------------------|------------|
| TanStack Query v4: onSuccess recibe `(data, variables, context)` | TanStack Query v5: mismo signature, primer arg es el dato retornado | Sin cambio funcional; confirmar que el tipo es `Viaje` inferido desde `tripService.start()` |

**No hay cambios de API relevantes para estos fixes.**

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `tripService.start()` retorna `Promise<Viaje>` (tipo del primer arg en onSuccess) | Pattern 1 | Si retorna otro tipo, el tipado de `updatedTrip` sería incorrecto — bajo riesgo, el CONTEXT.md lo confirma explícitamente |
| A2 | Los setters de `useState` (`setAllItems`, `setPage`, etc.) son referencias estables y no necesitan incluirse en `useCallback` deps | Common Pitfalls | Es comportamiento documentado de React, riesgo muy bajo |

---

## Open Questions

1. **Orden de operaciones en useStartTrip.onSuccess**
   - Qué sabemos: D-04 dice usar `useTripStore.getState().setActiveTrip()`, pero no especifica si antes o después de `invalidateQueries`
   - Qué está claro: Ambos son síncronos desde la perspectiva del evento (invalidateQueries schedula un refetch, no lo ejecuta síncronamente)
   - Recomendación: `setActiveTrip` primero para que map.tsx reaccione inmediatamente, luego invalidateQueries. El Pitfall 2 documenta el razonamiento.

2. **`useCallback` en onRefresh de bestiary/logbook/trips**
   - Qué sabemos: Los tres archivos usan `useCallback` para `onRefresh`
   - Qué está claro: Al agregar `setAllItems`, `setHasMore` — estos son setters de useState, referencias estables, no hay que agregarlos a deps
   - Recomendación: Mantener `[refetch]` como única dep, igual que resources.tsx

---

## Environment Availability

Step 2.6: SKIPPED — fase de corrección de código puro. No hay dependencias externas nuevas. Todos los packages necesarios ya están instalados.

---

## Validation Architecture

nyquist_validation no está configurado (config.json no existe). Tratar como enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No detectado — proyecto React Native/Expo sin framework de tests configurado |
| Config file | Ninguno encontrado |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map

No hay IDs de requirements formales para esta fase (deuda técnica). Los criterios de éxito son verificaciones manuales/smoke:

| Criterio | Verificación | Tipo |
|----------|-------------|------|
| Iniciar viaje activa GPS + O2 en map.tsx | Iniciar viaje en trips.tsx, navegar a tab Mapa, verificar banner y contador | Manual smoke |
| Completar/abortar limpia TripStore | Después de viaje activo, completar/abortar, verificar que banner desaparece en map.tsx | Manual smoke |
| setAuth llamado una vez | Console.log temporal en setAuth + verificar un solo log en login exitoso | Manual smoke |
| Scroll en bestiary carga pág 2 sin perder pág 1 | Scroll al fondo, verificar que items de pág 1 siguen visibles | Manual smoke |

### Wave 0 Gaps
- No hay infrastructure de tests que crear — los fixes son cambios de código, la verificación es manual.

---

## Security Domain

Esta fase no introduce endpoints, autenticación nueva, inputs de usuario, ni cryptografía. Los fixes son internos a la lógica de estado y UI. No aplica análisis ASVS.

---

## Sources

### Primary (HIGH confidence)
- `src/hooks/useTrips.ts` — estado actual de useStartTrip, useCompleteTrip, useAbortTrip verificado directamente [VERIFIED: codebase]
- `app/(auth)/login.tsx:238-241` — doble llamada a setAuth verificada en línea 240 [VERIFIED: codebase]
- `app/(tabs)/bestiary.tsx:63`, `app/(tabs)/logbook.tsx:47`, `app/trips.tsx:95` — asignación directa de `data?.items` sin acumulación [VERIFIED: codebase]
- `app/(tabs)/resources.tsx:16-46` — patrón correcto de acumulación, referencia canónica [VERIFIED: codebase]
- `app/(tabs)/map.tsx:6,134` — patrón correcto de `useTripStore.getState()` fuera de render [VERIFIED: codebase]
- `src/stores/trip.store.ts` — `setActiveTrip(trip: Viaje | null)` acepta null, inicializa oxygenRemaining [VERIFIED: codebase]
- `src/hooks/useAuth.ts:9-11` — `useLogin.onSuccess` ya llama `setAuth` correctamente [VERIFIED: codebase]

### Secondary (MEDIUM confidence)
- TanStack Query v5 — `onSuccess(data, variables, context)`: primer arg es el retorno de `mutationFn` [ASSUMED — comportamiento estándar, consistente con código existente en useUpdateTrip]
- Zustand `getState()` — acceso imperativo fuera del render cycle [ASSUMED — documentado, consistente con uso existente en api.ts]

---

## Metadata

**Confidence breakdown:**
- Diagnóstico de bugs: HIGH — todos verificados directamente en codebase con líneas exactas
- Patrones de fix: HIGH — patrón de referencia existe y funciona (resources.tsx, map.tsx)
- Tipos y signatures: HIGH — DTOs verificados (Viaje, Especie, BitacoraEntradaResponse)
- Riesgos de regresión: LOW — cambios quirúrgicos, sin cambios de UI ni de API

**Research date:** 2026-05-04
**Valid until:** 2026-06-04 (código estable, sin dependencias externas cambiantes)
