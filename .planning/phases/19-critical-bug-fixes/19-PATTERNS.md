# Phase 19: Critical Bug Fixes - Pattern Map

**Mapped:** 2026-05-04
**Files analyzed:** 5 (archivos a modificar)
**Analogs found:** 5 / 5

---

## File Classification

| Archivo a modificar | Role | Data Flow | Analog más cercano | Calidad del match |
|---------------------|------|-----------|-------------------|-------------------|
| `src/hooks/useTrips.ts` | hook (mutation) | request-response | `src/hooks/useAuth.ts` | exact — mismo patrón `useStore.getState().method()` en `onSuccess` |
| `app/(auth)/login.tsx` | screen | request-response | `src/hooks/useAuth.ts` | exact — el hook ya hace el setAuth correcto |
| `app/(tabs)/bestiary.tsx` | screen/component | CRUD paginado | `app/(tabs)/resources.tsx` | exact — mismo patrón de acumulación con estado local |
| `app/(tabs)/logbook.tsx` | screen/component | CRUD paginado | `app/(tabs)/resources.tsx` | exact — mismo patrón de acumulación con estado local |
| `app/trips.tsx` | screen/component | CRUD paginado | `app/(tabs)/resources.tsx` | exact — mismo patrón de acumulación con estado local |

---

## Pattern Assignments

### `src/hooks/useTrips.ts` (hook mutation, request-response)

**Analog:** `src/hooks/useAuth.ts` + `app/(tabs)/map.tsx` (lineas 134, 136, 140)

**Estado actual — Bug confirmado** (`src/hooks/useTrips.ts` lineas 54-57):
```typescript
// useStartTrip — BUGGY: el primer argumento `_` descarta el Viaje retornado
onSuccess: (_, { id }) => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
  queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
},
```

**Patron de referencia — acceso a store fuera del render** (`app/(tabs)/map.tsx` lineas 134, 136, 140):
```typescript
useTripStore.getState().startOxygenCountdown(oxygenRate);
// ...
useTripStore.getState().stopOxygenCountdown();
// ...
useTripStore.getState().stopOxygenCountdown();
```

**Patron de referencia — setAuth en onSuccess** (`src/hooks/useAuth.ts` lineas 6-13):
```typescript
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginDTO) => authService.login(data),
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user);
    },
  });
}
```

**Patron a aplicar — useStartTrip corregido:**
```typescript
// CAMBIO: renombrar `_` por `updatedTrip`, agregar setActiveTrip ANTES de invalidateQueries
onSuccess: (updatedTrip, { id }) => {
  useTripStore.getState().setActiveTrip(updatedTrip);
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
  queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
},
```

**Patron a aplicar — useCompleteTrip y useAbortTrip (mismo cambio):**
```typescript
// Estado actual (lineas 66-70 y 78-82) — BUGGY: no llama setActiveTrip(null)
onSuccess: (_, { id }) => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
  queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
},

// CORREGIDO: agregar setActiveTrip(null) para limpiar el store al terminar/abortar
onSuccess: (_, { id }) => {
  useTripStore.getState().setActiveTrip(null);
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
  queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
},
```

**Import necesario** — agregar al bloque de imports de `src/hooks/useTrips.ts` (linea 1-3):
```typescript
// Agregar esta linea (usar alias @/ que ya usa el proyecto — confirmado en map.tsx linea 6)
import { useTripStore } from '@/stores/trip.store';
```

**Metodo del store** (`src/stores/trip.store.ts` lineas 11, 28-32):
```typescript
// Signature del método — acepta Viaje | null
setActiveTrip: (trip: Viaje | null) => void;

// Implementación — inicializa oxygenRemaining desde trip.oxygenBudgeted
setActiveTrip: (trip) => set({
  activeTrip: trip,
  oxygenRemaining: trip?.oxygenBudgeted || 0,
  startTime: trip ? Date.now() : null,
}),
```

---

### `app/(auth)/login.tsx` (screen, request-response)

**Analog:** `src/hooks/useAuth.ts` lineas 9-11 (la llamada correcta que ya existe)

**Estado actual — Bug confirmado** (`app/(auth)/login.tsx` lineas 238-240):
```typescript
const handleLogin = useCallback(async () => {
  if (!email.trim() || isAuthenticating) return;
  setIsAuthenticating(true);
  try {
    const response = await loginMutation.mutateAsync({ email, password });
    // LINEA 240 — DUPLICADA: setAuth ya fue llamado por useLogin.onSuccess antes de llegar aqui
    useAuthStore.getState().setAuth(response.accessToken, response.refreshToken, response.user);
    router.replace('/(tabs)/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    setIsAuthenticating(false);
  }
}, [email, password, isAuthenticating, loginMutation]);
```

**Patron correcto en useAuth.ts** (lineas 9-11):
```typescript
onSuccess: (data) => {
  useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user);
},
```

**Fix a aplicar — eliminar SOLO la linea 240:**
```typescript
// ANTES (lineas 237-242):
const response = await loginMutation.mutateAsync({ email, password });
useAuthStore.getState().setAuth(response.accessToken, response.refreshToken, response.user); // ELIMINAR ESTA LINEA
router.replace('/(tabs)/dashboard');

// DESPUES:
await loginMutation.mutateAsync({ email, password });
// setAuth ya fue llamado por useLogin.onSuccess — no necesita la variable response
router.replace('/(tabs)/dashboard');
```

**Nota:** La variable `response` ya no se necesita al eliminar la linea duplicada. Si no se usa en ningún otro lugar del bloque `try`, la asignacion `const response = ...` se puede simplificar a `await loginMutation.mutateAsync(...)`.

---

### `app/(tabs)/bestiary.tsx` (screen, CRUD paginado)

**Analog:** `app/(tabs)/resources.tsx` lineas 15-46

**Estado actual — Bug confirmado** (`app/(tabs)/bestiary.tsx` lineas 27-41 y 63):
```typescript
// Estado actual (solo tiene page, sin estado de acumulacion):
const [page, setPage] = useState(1);
const limit = 20;
// ...
// loadMore usa totalPages en vez de data?.total:
const loadMore = () => {
  if (data && page < data.totalPages) {
    setPage(prev => prev + 1);
  }
};
// onRefresh no resetea lista acumulada (porque no existe):
const onRefresh = useCallback(() => {
  setPage(1);
  refetch();
}, [refetch]);
// LINEA 63 — BUG: asigna directamente, reemplaza pagina anterior:
const species = (data?.items || []) as Especie[];
// FlatList usa data={species} — pierde pagina 1 cuando carga pagina 2
```

**Patron correcto** (`app/(tabs)/resources.tsx` lineas 15-46):
```typescript
const [page, setPage] = useState(1);
const [allResources, setAllResources] = useState<Recurso[]>([]);
const [hasMore, setHasMore] = useState(true);

const { data, isLoading, error, refetch } = useResources(page, 10);

useEffect(() => {
  const newItems = data?.items ?? [];
  if (newItems.length > 0) {
    setAllResources(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const filtered = newItems.filter(r => !existingIds.has(r.id));
      return filtered.length > 0 ? [...prev, ...filtered] : prev;
    });
    setHasMore((data?.total ?? 0) > allResources.length + newItems.length);
  }
}, [data]);

const loadMore = () => {
  if (hasMore && !isLoading && allResources.length < (data?.total ?? 0)) {
    setPage(p => p + 1);
  }
};

const onRefresh = async () => {
  setPage(1);
  setAllResources([]);
  setHasMore(true);
  await refetch();
};
// FlatList usa: data={allResources}
```

**Adaptacion para bestiary.tsx** — sustituir tipos y nombres:
```typescript
// Import agregar: useEffect (ya tiene useState, useCallback)
import { useState, useCallback, useEffect } from "react";

// Estado local acumulado (tipo especifico de bestiary):
const [allSpecies, setAllSpecies] = useState<Especie[]>([]);
const [hasMore, setHasMore] = useState(true);

// useEffect de acumulacion — sustituir `r` por `s` para claridad:
useEffect(() => {
  const newItems = data?.items ?? [];
  if (newItems.length > 0) {
    setAllSpecies(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const filtered = newItems.filter(s => !existingIds.has(s.id));
      return filtered.length > 0 ? [...prev, ...filtered] : prev;
    });
    setHasMore((data?.total ?? 0) > allSpecies.length + newItems.length);
  }
}, [data]);

// loadMore — usar hasMore + allSpecies.length en vez de totalPages:
const loadMore = () => {
  if (hasMore && !isFetching && allSpecies.length < (data?.total ?? 0)) {
    setPage(p => p + 1);
  }
};

// onRefresh — reset completo (hacer async para await refetch):
const onRefresh = useCallback(async () => {
  setPage(1);
  setAllSpecies([]);
  setHasMore(true);
  await refetch();
}, [refetch]);

// Eliminar linea 63: const species = (data?.items || []) as Especie[];
// FlatList: cambiar data={species} → data={allSpecies}
```

---

### `app/(tabs)/logbook.tsx` (screen, CRUD paginado)

**Analog:** `app/(tabs)/resources.tsx` lineas 15-46

**Estado actual — Bug confirmado** (`app/(tabs)/logbook.tsx` lineas 11-25 y 47):
```typescript
// Sin estado de acumulacion, loadMore usa totalPages, onRefresh no resetea lista:
const [page, setPage] = useState(1);
const limit = 20;
// ...
const loadMore = () => {
  if (data && page < data.totalPages) {
    setPage(prev => prev + 1);
  }
};
// LINEA 47 — BUG:
const entries = (data?.items || []) as BitacoraEntradaResponse[];
// FlatList usa data={entries}
```

**Adaptacion para logbook.tsx** — mismo patron que bestiary, tipo diferente:
```typescript
// Import agregar: useEffect
import { useState, useCallback, useEffect } from "react";

// Estado local acumulado:
const [allEntries, setAllEntries] = useState<BitacoraEntradaResponse[]>([]);
const [hasMore, setHasMore] = useState(true);

// useEffect de acumulacion:
useEffect(() => {
  const newItems = data?.items ?? [];
  if (newItems.length > 0) {
    setAllEntries(prev => {
      const existingIds = new Set(prev.map(e => e.id));
      const filtered = newItems.filter(e => !existingIds.has(e.id));
      return filtered.length > 0 ? [...prev, ...filtered] : prev;
    });
    setHasMore((data?.total ?? 0) > allEntries.length + newItems.length);
  }
}, [data]);

// loadMore — usar hasMore:
const loadMore = () => {
  if (hasMore && !isFetching && allEntries.length < (data?.total ?? 0)) {
    setPage(p => p + 1);
  }
};

// onRefresh — reset completo:
const onRefresh = useCallback(async () => {
  setPage(1);
  setAllEntries([]);
  setHasMore(true);
  await refetch();
}, [refetch]);

// Eliminar linea 47: const entries = (data?.items || []) as BitacoraEntradaResponse[];
// FlatList: cambiar data={entries} → data={allEntries}
// keyExtractor: item.id ya es unico con el nuevo estado acumulado
```

---

### `app/trips.tsx` (screen, CRUD paginado)

**Analog:** `app/(tabs)/resources.tsx` lineas 15-46

**Estado actual — Bug confirmado** (`app/trips.tsx` lineas 29-70 y 95):
```typescript
// Sin estado de acumulacion, loadMore usa totalPages:
const [page, setPage] = useState(1);
const limit = 20;
// ...
const loadMore = () => {
  if (data && page < data.totalPages) {
    setPage(prev => prev + 1);
  }
};
// LINEA 95 — BUG:
const trips = (data?.items || []) as Viaje[];
// FlatList usa data={trips}
```

**Adaptacion para trips.tsx** — mismo patron, tipo Viaje:
```typescript
// Import agregar: useEffect (ya tiene useState, useCallback)
import { useState, useCallback, useEffect } from "react";

// Estado local acumulado:
const [allTrips, setAllTrips] = useState<Viaje[]>([]);
const [hasMore, setHasMore] = useState(true);

// useEffect de acumulacion:
useEffect(() => {
  const newItems = data?.items ?? [];
  if (newItems.length > 0) {
    setAllTrips(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const filtered = newItems.filter(t => !existingIds.has(t.id));
      return filtered.length > 0 ? [...prev, ...filtered] : prev;
    });
    setHasMore((data?.total ?? 0) > allTrips.length + newItems.length);
  }
}, [data]);

// loadMore — usar hasMore:
const loadMore = () => {
  if (hasMore && !isFetching && allTrips.length < (data?.total ?? 0)) {
    setPage(p => p + 1);
  }
};

// onRefresh — reset completo:
const onRefresh = useCallback(async () => {
  setPage(1);
  setAllTrips([]);
  setHasMore(true);
  await refetch();
}, [refetch]);

// Eliminar linea 95: const trips = (data?.items || []) as Viaje[];
// FlatList: cambiar data={trips} → data={allTrips}
// keyExtractor: item.id || `trip-${index}` — funciona correctamente con acumulacion
```

---

## Shared Patterns

### Acceso a store Zustand fuera del render cycle
**Fuente:** `app/(tabs)/map.tsx` lineas 134, 136, 140
**Aplicar a:** `src/hooks/useTrips.ts` (callbacks `onSuccess` de useMutation)
```typescript
// Patron oficial de Zustand para callbacks/efectos fuera del render cycle:
useTripStore.getState().setActiveTrip(updatedTrip);
useTripStore.getState().setActiveTrip(null);
```

### setAuth en onSuccess del hook (NO en la pantalla)
**Fuente:** `src/hooks/useAuth.ts` lineas 9-11
**Aplicar a:** `app/(auth)/login.tsx` — confirma que la pantalla NO debe llamar setAuth
```typescript
onSuccess: (data) => {
  useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user);
},
```

### Acumulacion de paginas con deduplicacion por Set de IDs
**Fuente:** `app/(tabs)/resources.tsx` lineas 23-46
**Aplicar a:** `bestiary.tsx`, `logbook.tsx`, `trips.tsx`
```typescript
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
```

### Reset completo de paginacion en onRefresh
**Fuente:** `app/(tabs)/resources.tsx` lineas 41-46
**Aplicar a:** `bestiary.tsx`, `logbook.tsx`, `trips.tsx`
```typescript
const onRefresh = async () => {
  setPage(1);
  setAllItems([]);    // limpiar acumulacion
  setHasMore(true);  // resetear flag de paginacion
  await refetch();
};
```

---

## No Analog Found

No hay archivos sin analog. Todos los patrones necesarios ya existen en el codebase.

---

## Gotchas Criticos para el Planificador

| Archivo | Gotcha | Accion requerida |
|---------|--------|-----------------|
| `src/hooks/useTrips.ts` | El import de `useTripStore` NO existe aun en este archivo | Agregar `import { useTripStore } from '@/stores/trip.store';` en el bloque de imports (lineas 1-3) |
| `app/(auth)/login.tsx` | Al eliminar la linea 240, la variable `response` queda sin usar | Cambiar `const response = await loginMutation.mutateAsync(...)` por `await loginMutation.mutateAsync(...)` |
| `bestiary.tsx` / `logbook.tsx` / `trips.tsx` | `useEffect` no esta en los imports actuales | Agregar `useEffect` al import de React |
| `bestiary.tsx` / `logbook.tsx` / `trips.tsx` | FlatList `data` prop debe cambiar de `species`/`entries`/`trips` a `allSpecies`/`allEntries`/`allTrips` | Buscar todas las ocurrencias de `data?.items` en cada archivo y reemplazar por el estado acumulado |
| `trips.tsx` | `onRefresh` actual es `useCallback` sincrono — al hacerlo `async` verificar que el linter no requiera cambios adicionales | Los setters de useState son referencias estables, solo `refetch` en deps |

---

## Metadata

**Scope de busqueda de analogs:** `src/hooks/`, `src/stores/`, `app/(tabs)/`, `app/(auth)/`, `app/`
**Archivos leidos:** 8 (resources.tsx, useTrips.ts, useAuth.ts, trip.store.ts, login.tsx, bestiary.tsx, logbook.tsx, trips.tsx, map.tsx)
**Fecha de extraccion de patrones:** 2026-05-04
