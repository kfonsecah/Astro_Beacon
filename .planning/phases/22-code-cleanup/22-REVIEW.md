---
phase: 22
plan: 01
status: findings
depth: standard
files_reviewed: 37
files_reviewed_list:
  - api/src/controllers/species.controller.ts
  - api/src/models/astronaut.model.ts
  - api/src/models/species.model.ts
  - api/src/routes/auth.routes.ts
  - api/src/routes/species.routes.ts
  - api/src/services/species.service.ts
  - api/src/services/supply.service.ts
  - app/(auth)/_layout.tsx
  - app/(auth)/login.tsx
  - app/(tabs)/_layout.tsx
  - app/(tabs)/bestiary.tsx
  - app/(tabs)/dashboard.tsx
  - app/(tabs)/logbook.tsx
  - app/(tabs)/map.tsx
  - app/(tabs)/resources.tsx
  - app/_layout.tsx
  - app/trips.tsx
  - src/components/common/RouteErrorFallback.tsx
  - src/components/common/index.ts
  - src/components/map/CategoryLegend.tsx
  - src/config/api.ts
  - src/constants/colors.ts
  - src/hooks/useSupplies.ts
  - src/hooks/useTrips.ts
  - src/services/astronaut.service.ts
  - src/services/logbook.service.ts
  - src/services/resource.service.ts
  - src/services/species.service.ts
  - src/services/supply.service.ts
  - src/services/trip.service.ts
  - src/stores/trip.store.ts
  - src/types-dtos/astronauta.dto.ts
  - src/types-dtos/bitacora.dto.ts
  - src/types-dtos/especie.dto.ts
  - src/types-dtos/recurso.dto.ts
  - src/types-dtos/suministro.dto.ts
  - src/types-dtos/viaje.dto.ts
  - src/utils/queryClient.ts
findings:
  critical: 4
  warning: 8
  info: 5
  total: 17
reviewed_at: 2026-05-05T00:00:00Z
---

# Phase 22 Code Review

## Summary

37 files reviewed after the code-cleanup phase (dead-code removal, UAT artifact removal, TS fixes). The cleanup itself is structurally sound — deleted files are gone, no dangling imports were detected, and the ErrorBoundary pattern is consistently applied across all routes. However, the review surfaces four critical issues: a dead debug comment in production map logic that permanently disables a security gate, `console.log` calls left in production-path code (API config and supply service), a hardcoded production URL placeholder that will silently break in production, and a type-safety hole in `trip.service.ts` where `destination` is silently coerced from a `string` (API response) to `GeoPoint` (TS type). Warnings cover interval/timer leaks, a hoisted function usage before its declaration, a stale `hasMore` calculation that reads pre-update state, a misleading `getEta` typo, an authorization gap in the species API, and several instances of `any`-typed data paths that escape type checking at runtime.

---

## Findings

### CR-001 | Critical | app/(tabs)/map.tsx:194

**Issue:** A debug comment explicitly states that an active-trip requirement was removed "temporarily" before testing, and the check was never restored. The gate `if (isInRange && isPendiente)` marks supplies as collectible regardless of whether a trip is active. This means any authenticated user can collect any supply drop within 1 km without ever starting a trip, bypassing the intended game mechanic and supply-ownership model.

**Impact:** Any supply within range is collectible at any time. The comment `// DEBUG: Sin requisito viaje activo temporalmente para probar` confirms this was intentional for testing and was never reverted. This is a behavioral correctness defect — the feature works opposite to its design specification.

**Fix:**
```tsx
// Restore the active-trip guard:
const isInRange = distMeters < 1000;
const isPendiente = supply.status === 'pendiente';
const isTripActive = activeTrip?.status === 'activo';

if (isInRange && isPendiente && isTripActive) {
  collectible.add(String(supply.id));
}
```

---

### CR-002 | Critical | src/config/api.ts:22-23

**Issue:** The production API URL is the placeholder string `"https://your-api-domain.com/api/v1"`. When `__DEV__` is false (any production/release build) and `EXPO_PUBLIC_API_URL` is not set, every API call silently points to a non-existent domain. The app will appear to load (no crash) but all network requests fail with a DNS error. There is no validation or early-exit guard.

**Impact:** A production build without the env variable set results in a completely broken app — no login, no data — with no user-facing feedback about the misconfiguration.

**Fix:**
```ts
const prodUrl = process.env.EXPO_PUBLIC_API_URL;
if (!prodUrl) {
  throw new Error(
    '[API Config] EXPO_PUBLIC_API_URL must be set in production. ' +
    'Add it to your .env file or CI environment.'
  );
}
return prodUrl;
```
Remove the `__DEV__` branch's fallback IP from the `getApiBaseUrl` function since the env-variable check already handles both environments.

---

### CR-003 | Critical | src/services/trip.service.ts:31-44

**Issue:** The `mapTrip` function maps the raw API `destination` field — which the backend stores as a plain `string` (the trip name/location label) — directly into the `Viaje.destination` typed as `GeoPoint` (`{ lat: number; lng: number }`). Line 36: `destination: t.destination ?? ''` assigns a string to a `GeoPoint`. At runtime, `map.tsx` reads `activeTrip.destination` as a GeoPoint for coordinates (e.g., `supply.location.lat/lng` comparisons), but when the trip comes from the API, `destination` is a string, causing `NaN` coordinates and silent map/distance calculation breakage.

**Impact:** Starting a trip from the API (not the local `setActiveTrip` path in map.tsx) results in broken distance calculations and GPS centering — the trip store receives an object where `destination.lat` is `undefined`. This is a type contract violation that escapes TypeScript because `mapTrip` accepts `any`.

**Fix:**
```ts
function mapTrip(t: any): Viaje {
  // Backend stores destination as { lat, lng } GeoJSON point or a label string.
  // Normalise defensively:
  const destination: GeoPoint =
    t.destination && typeof t.destination === 'object' && 'lat' in t.destination
      ? t.destination
      : { lat: 0, lng: 0 };

  return {
    id: t._id?.toString() ?? t.id ?? '',
    astronautId: t.userId?.toString() ?? '',
    destination,
    status: t.status,
    startedAt: t.startDate,
    completedAt: t.endDate,
    oxygenBudgeted: t.plannedDuration != null && t.O2Config?.baseRate != null
      ? t.O2Config.baseRate * t.plannedDuration
      : (t.O2Config?.baseRate ?? 0),
    oxygenConsumed: t.O2Consumed ?? 0,
    resourcesCollected: t.resourcesCollected ?? 0,
    notes: t.name ?? '',
  };
}
```

---

### CR-004 | Critical | api/src/services/species.service.ts:86-88

**Issue:** In the `update` method, `findOne(speciesId)` is called at line 86 and the result is stored in `existing`. Then line 87 checks `if (!existing)` and throws — but `findOne` itself already throws `AppError('Species not found', 404)` before returning `null` (line 71-73). The `if (!existing)` check at line 87 is dead code that can never execute. More critically: the `userId` parameter (line 80) is accepted and passed through the service signature as if it enforces ownership, but neither `findOne` nor `findByIdAndUpdate` filter by `userId` — any authenticated user can update any species entry.

**Impact:** The authorization model is broken for `update` and `delete` — both accept a `userId` argument but never use it for filtering. Combined with the global `authenticate` middleware, any authenticated user can mutate any species regardless of who created it.

**Fix:**
```ts
// If species are intentionally global (shared), remove the userId parameter
// from update/delete signatures and document that explicitly.
// If ownership enforcement is intended, add userId to the filter:
const species = await Species.findOneAndUpdate(
  { _id: new mongoose.Types.ObjectId(speciesId), userId: new mongoose.Types.ObjectId(userId) },
  { ...input, lastModified: new Date() },
  { new: true, runValidators: true }
);
if (!species) {
  throw new AppError('Species not found or unauthorized', 404);
}
```

---

### WR-001 | Warning | api/src/services/supply.service.ts:110-212

**Issue:** Twelve `console.log` calls remain in the `collect` method — at lines 110, 145, 153, 164, 186, 192, 212 (and the `console.error` at 215 is appropriate). These are production-path logs that emit detailed internal state including supply IDs, user IDs, resource amounts, and object dumps to server stdout. They were clearly dev/debug artifacts.

**Impact:** Performance overhead per collect operation; leaks internal resource state to server logs which may be accessible to non-admin personnel. This is a cleanup phase — these logs should have been removed.

**Fix:** Remove all `console.log` calls within `collect`. Keep only the `console.error` in the catch block (line 215), which is appropriate for error visibility.

---

### WR-002 | Warning | src/config/api.ts:5,12,16-17,23

**Issue:** `getApiBaseUrl()` contains five `console.log` calls that execute on every cold start of the app (the module is evaluated at import time). These log the full API URL (including any credentials embedded in the URL) to the React Native debug console and Metro bundler output.

**Impact:** URLs are emitted in production builds via Expo's logging. Any URL with embedded API keys or tokens would be exposed. Even without secrets in the URL, the logs are noise in a production app.

**Fix:** Replace all `console.log` calls in `getApiBaseUrl` with conditional logs gated on `__DEV__`:
```ts
if (__DEV__) console.log('[API Config] Using URL:', url);
```
Or remove them entirely — the value is already exported as `API_BASE_URL` for debugging.

---

### WR-003 | Warning | src/stores/trip.store.ts:42-51

**Issue:** `startOxygenCountdown` stores the `setInterval` return value as `intervalId: number`. When the component that triggered the countdown unmounts without calling `stopOxygenCountdown`, the interval keeps running indefinitely against Zustand state. In `map.tsx` (line 139-151), `stopOxygenCountdown` is called in the `useEffect` cleanup, but `startOxygenCountdown` is called via `useTripStore.getState()` (line 143) outside React's lifecycle — if the effect fires before the previous cleanup completes, a second interval is spawned. The guard at line 43 (`if (state.intervalId) return state`) prevents duplicate intervals only if the store state is checked synchronously, but the Zustand `set` call is asynchronous, creating a race window.

**Impact:** Memory/timer leak — multiple intervals can accumulate if the map screen remounts while a trip is active, causing oxygen to drain faster than intended and the store's `intervalId` to hold a stale reference that `clearInterval` won't clean up.

**Fix:**
```ts
startOxygenCountdown: (ratePerMinute: number) => set((state) => {
  if (state.intervalId !== null) {
    clearInterval(state.intervalId); // Clean up any stale interval first
  }
  const intervalId = setInterval(() => {
    set((s) => ({
      oxygenRemaining: Math.max(0, s.oxygenRemaining - ratePerMinute / 60),
    }));
  }, 1000);
  return { intervalId: intervalId as unknown as number, isTracking: true };
}),
```

---

### WR-004 | Warning | app/(tabs)/map.tsx:262-272

**Issue:** `calculateDistanceKm` is defined as an inner function at line 262, but it is called at line 181 (inside the `useEffect` starting at line 174) — before its declaration in the component body. JavaScript hoists `function` declarations but not `const`/`function expression` assignments. Since this is a `const` arrow function, it is in the temporal dead zone when the effect first runs. This may not crash in all bundler configurations (Metro's transform may reorder), but it is a structural bug that is order-dependent and fragile.

**Impact:** If Metro or a future bundler does not hoist the arrow function, the first render will throw a ReferenceError. At minimum, the code is structurally incorrect and will confuse maintainers.

**Fix:** Move the `calculateDistanceKm` definition (lines 262-272) to before the first `useEffect` that calls it (before line 174), or extract it as a module-level utility function outside the component.

---

### WR-005 | Warning | app/(tabs)/resources.tsx:32

**Issue:** The `hasMore` calculation reads `allResources.length` from the outer closure (pre-update state) inside the `setAllResources` updater function:
```ts
setHasMore((data?.total ?? 0) > allResources.length + newItems.length);
```
`allResources` here is the value captured by the `useEffect` closure at render time, not the value that `setAllResources` is about to commit. If items have already accumulated across pages, `allResources.length` is stale and `hasMore` may be set to `true` even when all items have been loaded, causing an infinite load-more loop.

**Impact:** Stale pagination state causes repeated `loadMore` calls even when all resources have been fetched — results in redundant network requests.

**Fix:**
```ts
setAllResources(prev => {
  const existingIds = new Set(prev.map(r => r.id));
  const filtered = newItems.filter(r => !existingIds.has(r.id));
  const next = filtered.length > 0 ? [...prev, ...filtered] : prev;
  setHasMore((data?.total ?? 0) > next.length); // Use next, not outer allResources
  return next;
});
```

---

### WR-006 | Warning | app/(tabs)/map.tsx:241

**Issue:** `getEta` contains a typo: `if (status === "entregido")` — the correct enum value is `"entregado"` (consistent with `statusColorMap`, `statusLabelMap`, `Suministro.status`, and the backend `SupplyDropStatus`). As a result, the `"entregado"` branch never matches, and the function always returns `""` for delivered supplies.

**Impact:** Delivered supplies always show an empty ETA string instead of `"Recogido"`. Minor display bug, but indicates the function was never actually exercised.

**Fix:**
```ts
if (status === "entregado") return "Recogido";
```

---

### WR-007 | Warning | api/src/routes/auth.routes.ts:10-11

**Issue:** The rate limiter comment says "5 attempts per 15 minutes" but `max` is set to `100`. The comment from a prior configuration was not updated when the limit was raised. This is a misleading discrepancy in security-critical code — a reviewer trusting the comment would believe the rate limit is much stricter than it is.

**Impact:** Documentation mismatch on a security control. In a security audit, this creates ambiguity about the intended limit.

**Fix:** Update the comment to match the actual value:
```ts
// Rate limiter for auth endpoints: 100 attempts per 15 minutes (adjust for production)
max: 100,
```
Or lower the value to match the original intent of `5` if this was raised only for development.

---

### WR-008 | Warning | src/types-dtos/astronauta.dto.ts:8

**Issue:** The `Astronauta` interface exposes `passwordHash: string` as a top-level field. This DTO is used on the frontend (`src/services/astronaut.service.ts` returns `Astronauta`) and is also the type for `useAstronautProfile` hook data. If the API ever accidentally returns the hash (e.g., a serialization misconfiguration), the frontend type accepts and stores it, and it would be exposed to any logging, error reporting, or rendering code that touches the profile object.

**Impact:** Defense-in-depth failure — the frontend type model should never declare `passwordHash`. Even if the current API strips the field server-side, the type contract invites misuse and makes future serialization mistakes silent.

**Fix:** Remove `passwordHash` from the `Astronauta` frontend interface:
```ts
export interface Astronauta {
  id: string;
  name: string;
  email: string;
  rol: UserRole;
  status: AstronautStatus;
  baseCampLocation: GeoPoint;
  creadoEn: Date;
  ultimaActividad: Date;
}
```

---

### IR-001 | Info | app/(tabs)/dashboard.tsx:55

**Issue:** `const supplyETA = "2d 14h"` is a hardcoded magic string displayed as "PRÓXIMO SUMINISTRO / ETA: 2d 14h" in the dashboard. This was presumably a UAT artifact. The UAT dev data was removed from other parts of the dashboard, but this static string remains.

**Fix:** Either fetch the actual next supply ETA from the API/supply list, or remove the field from the dashboard until the feature is implemented. At minimum, replace with `"N/A"` so it does not mislead users.

---

### IR-002 | Info | app/(tabs)/map.tsx:85

**Issue:** `console.warn("Permission to access location was denied")` is left in the location permission handler. In production, warnings should be handled with user-facing feedback rather than console output.

**Fix:** Replace with a user-facing `Alert.alert` or update the UI state to indicate that location access was denied, consistent with how errors are surfaced elsewhere in the component.

---

### IR-003 | Info | src/services/logbook.service.ts:7-13

**Issue:** `PaginatedLogbookEntries` is defined in both `src/services/logbook.service.ts` (line 7) and `src/types-dtos/bitacora.dto.ts` (line 28) with slightly different `items` types: the service defines `items: BitacoraEntrada[]` while the DTO defines `items: BitacoraEntradaResponse[]`. The hook `useLogbookEntries` uses the DTO version (`PaginatedLogbookEntries` from `bitacora.dto.ts`), but the service returns the service version. This mismatch means enriched fields (`speciesName`, `speciesClassification`) added in `logbook.service.getAll` are not represented in the service-level type contract.

**Fix:** Remove the duplicate `PaginatedLogbookEntries` from `logbook.service.ts` and import from `@/types-dtos`. Align the service's `getAll` return type to use `BitacoraEntradaResponse[]` consistent with the DTO.

---

### IR-004 | Info | app/(tabs)/resources.tsx:77

**Issue:** `keyExtractor` falls back to `Math.random().toString()` when both `item.id` and `item._id` are falsy. React's FlatList uses keys to identify items across renders; a random key on every render causes the item to be treated as a new element, breaking list virtualization and causing unnecessary remounts.

**Fix:**
```tsx
keyExtractor={(item: Recurso, index: number) => item.id || (item as any)._id || `resource-fallback-${index}`}
```
Use the stable `index` fallback instead of `Math.random()`.

---

### IR-005 | Info | app/(tabs)/logbook.tsx:86-94

**Issue:** The logbook `renderItem` displays `item.title` in two places: once as the header (line 86: `item.title.toUpperCase()`) and again as body text below `item.description` (line 93-95). When `item.title` exists, it is shown twice in the same card — as the card title and then again as a subtitle below the description. This is likely unintended duplicate rendering.

**Fix:** Remove the redundant second occurrence at lines 93-95, or replace it with a different field (e.g., `item.speciesName` or a formatted location).

---

_Reviewed: 2026-05-05T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
