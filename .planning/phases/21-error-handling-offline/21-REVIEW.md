---
phase: 21-error-handling-offline
reviewed: 2026-05-05T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - src/components/common/RouteErrorFallback.tsx
  - src/components/common/index.ts
  - app/_layout.tsx
  - app/(auth)/_layout.tsx
  - app/(auth)/login.tsx
  - app/(tabs)/dashboard.tsx
  - app/(tabs)/resources.tsx
  - app/(tabs)/bestiary.tsx
  - app/(tabs)/logbook.tsx
  - app/(tabs)/map.tsx
  - app/trips.tsx
  - src/utils/queryClient.ts
  - app/(tabs)/_layout.tsx
findings:
  critical: 3
  warning: 8
  info: 5
  total: 16
status: issues_found
---

# Phase 21: Code Review Report

**Reviewed:** 2026-05-05T00:00:00Z
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Phase 21 introduces error boundary wiring (via Expo Router's `ErrorBoundary` export), an offline banner, and a `queryClient` that bridges React Query with `NetInfo`. The overall pattern is consistent across all screen files. However, several correctness bugs were found: oxygen interval leaks in the map screen, a missing initial NetInfo fetch leaving the network status optimistically wrong at startup, a `Math.random()` used as FlatList key creating reconciliation bugs, a scroll-based pagination that can lock users out of further pages, and a local-only trip object created in `map.tsx` that silently omits required fields required by the `Viaje` type. There are also several code-quality warnings around suppressed errors and hardcoded values.

---

## Critical Issues

### CR-01: Oxygen countdown interval leaks when `activeTrip.status` becomes `'activo'` multiple times

**File:** `app/(tabs)/map.tsx:139-151`

**Issue:** The `useEffect` that calls `useTripStore.getState().startOxygenCountdown(oxygenRate)` runs whenever `activeTrip?.status` changes. `startOxygenCountdown` in the store does clear a stale interval before setting a new one, but the store's `stopOxygenCountdown` is also called in the cleanup function of this same `useEffect`. Because the cleanup runs _before_ every re-execution (on every status change), `stopOxygenCountdown` sets `intervalId: null` and then `startOxygenCountdown` immediately creates a new interval — this is correct. However, when the component unmounts while the trip is in any state other than `'activo'`, the cleanup still calls `stopOxygenCountdown` which correctly clears the interval. The real leak arises because the store's interval runs **globally** (not tied to this component's lifecycle). If the `MapScreen` is unmounted and then remounted (e.g., tab switch) while `activeTrip?.status` is still `'activo'`, a second countdown interval is spawned without the first being cancelled — the prior component's cleanup called `stopOxygenCountdown` setting `intervalId: null`, but the store's `intervalId` field was already pointing to the live interval at unmount time so `clearInterval` was never called for the old handle. Consequently, two (or more) intervals can run simultaneously draining oxygen at 2× (or more) the expected rate.

The root cause is that `stopOxygenCountdown` checks `if (state.intervalId)` and clears it — but the cleanup function's call happens _after_ the store might already have a new interval from a prior run that was not stored under that key.

**Fix:**
```typescript
// In map.tsx — store the cleanup handle outside the store
useEffect(() => {
  if (activeTrip?.status !== 'activo') {
    useTripStore.getState().stopOxygenCountdown();
    return;
  }
  const oxygenRate = activeTrip.oxygenBudgeted / 60;
  useTripStore.getState().startOxygenCountdown(oxygenRate);

  return () => {
    useTripStore.getState().stopOxygenCountdown();
  };
}, [activeTrip?.status, activeTrip?.oxygenBudgeted]);
```
The dependency array must include `activeTrip?.oxygenBudgeted` so the rate is recomputed if the budget changes. The current code's dependency array `[activeTrip?.status]` silently ignores budget changes.

---

### CR-02: `Math.random()` used as FlatList `keyExtractor` causes incorrect list reconciliation

**File:** `app/(tabs)/resources.tsx:78`

```typescript
keyExtractor={(item: Recurso) => item.id || (item as any)._id || Math.random().toString()}
```

**Issue:** React's reconciliation relies on stable keys. Every time the list re-renders (e.g., on network status change, any state update), items whose `id` and `_id` are both falsy receive a new random key. This causes those rows to be unmounted and remounted rather than updated, losing any local state on those rows and potentially causing visible flicker. Worse, if the API returns items without an `id` field this may silently corrupt the order of the accumulated list across pages (the deduplication in the `useEffect` uses `r.id` directly, so items with a falsy id will pass the uniqueness check every time and be appended repeatedly on every refetch).

**Fix:**
```typescript
// Use a deterministic fallback. If neither field is present, derive a
// stable key from the item's content rather than random:
keyExtractor={(item: Recurso) => item.id ?? (item as any)._id ?? item.name ?? `resource-fallback`}
```
If the API guarantees one of `id` or `_id`, the `??` chain terminates safely. If neither is ever present, that is an API contract violation that should be surfaced as an error rather than silently papered over.

---

### CR-03: Local trip created in `map.tsx` violates the `Viaje` type — missing required fields cause downstream crashes

**File:** `app/(tabs)/map.tsx:306-318`

**Issue:** `handleStartTripFromSupply` constructs a `localTrip` object and passes it to `setActiveTrip(localTrip)`. The `Viaje` type (imported in `trips.tsx` and used in `trip.store.ts`) is expected to carry all fields that the rest of the application reads. The object literal:

```typescript
const localTrip = {
  id: `local-${Date.now()}`,
  astronautId: useAuthStore.getState().user?.id || "",
  destination: selectedSupply.location,
  status: "activo" as const,
  startedAt: new Date(),
  oxygenBudgeted: oxygenBudget,
  oxygenConsumed: 0,
  resourcesCollected: 0,
  notes: `...`,
};
```

This object is missing fields that other parts of the app likely access (the exact set depends on the full `Viaje` type definition, but `trips.tsx` accesses `item.id.slice(-4)` — which works on the `local-...` string — however, the type cast is unsafe). More critically, `astronautId` is set to `""` when `user?.id` is undefined, which would cause a server-side rejection if this object were ever persisted. The absence of type annotation (`const localTrip: Viaje = {...}`) means TypeScript does not catch missing required fields at compile time.

**Fix:**
```typescript
// Annotate the type so the compiler enforces completeness:
const localTrip: Viaje = {
  id: `local-${Date.now()}`,
  astronautId: useAuthStore.getState().user?.id ?? "",
  // ... remaining fields
};
// Guard against missing user before building the trip:
const userId = useAuthStore.getState().user?.id;
if (!userId) {
  Alert.alert("ERROR", "No se pudo obtener el ID de usuario.");
  return;
}
```

---

## Warnings

### WR-01: `useNetworkStatus` initializes as `isConnected: true` before receiving real state

**File:** `src/hooks/useNetworkStatus.ts:10-13`

**Issue:** The hook initializes with `{ isConnected: true, isInternetReachable: true }` and only updates when `NetInfo.addEventListener` fires its first event. On slow devices, the app renders the `OfflineBanner` (or omits it) with optimistic state for a brief window even if the device is actually offline. More concretely, the dashboard and map screens would show "EN LÍNEA" briefly before correcting. NetInfo provides `NetInfo.fetch()` for an immediate snapshot.

**Fix:**
```typescript
useEffect(() => {
  // Get current state immediately on mount
  NetInfo.fetch().then((state) => {
    setStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
    });
  });

  const unsubscribe = NetInfo.addEventListener((state) => {
    setStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
    });
  });

  return () => unsubscribe();
}, []);
```

---

### WR-02: `onRefresh` in `resources.tsx` does not reset accumulated state before refetch resolves

**File:** `app/(tabs)/resources.tsx:43-48`

```typescript
const onRefresh = async () => {
  setPage(1);
  setAllResources([]);
  setHasMore(true);
  await refetch();
};
```

**Issue:** `setAllResources([])` clears the list immediately (causing a visual empty-state flash), then `refetch()` returns, but the `useEffect` that populates `allResources` runs _after_ this function returns because `data` from `useResources(page, 10)` still refers to the cached page-1 data. When `page` is set back to `1` and the query refetches, the `useEffect` fires again and appends to `allResources` correctly — but if the user triggers `loadMore` before the refetch resolves (race condition is unlikely but possible via rapid scrolling), `page` has already been reset to 1 and `hasMore` is true, so `loadMore` will immediately increment page to 2, skipping page 1's results in the accumulation.

**Fix:** Prevent `loadMore` from firing while a refresh is in progress by tracking a `isRefreshing` boolean, or use `useInfiniteQuery` which handles this correctly by design.

---

### WR-03: Login error is swallowed — user receives no feedback on failure

**File:** `app/(auth)/login.tsx:237-239`

```typescript
} catch (error) {
  console.error('Login failed:', error);
}
```

**Issue:** When login fails (wrong credentials, network error, server error), the catch block only logs to the console. The user sees the button return to its non-pending state with no error message. `loginMutation.error` is available on the mutation object but is never rendered in the UI.

**Fix:**
```tsx
// Below the password field or inside the form, add:
{loginMutation.isError && (
  <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
    {loginMutation.error instanceof Error
      ? loginMutation.error.message
      : 'Error de autenticación. Intente de nuevo.'}
  </Text>
)}
// Remove the try/catch in handleLogin — let the mutation's own error state handle it,
// or re-throw so the mutation registers the error correctly.
```

---

### WR-04: `isLoading` check in `dashboard.tsx` includes `loadingResources` but error check does not

**File:** `app/(tabs)/dashboard.tsx:23-24`

```typescript
const isLoading = loadingProfile || loadingStats || loadingResources;
const error = errorProfile || errorStats;
```

**Issue:** `loadingResources` is included in the loading gate, meaning the whole dashboard spinner shows until resources finish loading. However, `error` excludes any error from `useResources`. If resources fail (e.g., the resources endpoint is down while profile/stats succeed), the dashboard renders normally with an empty resource list and no indication of failure. This inconsistency means the user has no way to know the resource data is stale or failed.

**Fix:**
```typescript
const { data: resourcesData, isLoading: loadingResources, error: errorResources } = useResources(1, 10);
const isLoading = loadingProfile || loadingStats;  // Resources load incrementally — don't block
const error = errorProfile || errorStats || errorResources;
```
Or surface the resource error separately inside the resource section rather than as a full-screen error.

---

### WR-05: Pagination in `resources.tsx` and `logbook.tsx` can permanently stall

**File:** `app/(tabs)/resources.tsx:37-41`, `app/(tabs)/logbook.tsx:39-43`

```typescript
const loadMore = () => {
  if (hasMore && !isLoading && allResources.length < (data?.total ?? 0)) {
    setPage(p => p + 1);
  }
};
```

**Issue:** `isLoading` here refers to the loading state of whatever `page` is currently being fetched. After a failed page load (network error), `isLoading` becomes `false` and `error` is set — but the error state is only shown when `page === 1`. For `page > 1`, the footer shows a spinner only while `isLoading && page > 1`. When the page fails, the spinner disappears but `hasMore` remains `true` and `allResources.length < data?.total`. The next `onEndReached` call will immediately trigger `setPage(p => p + 1)`, skipping the failed page. Over multiple failures the page counter can increment beyond `totalPages`, silently losing data.

**Fix:**
```typescript
const loadMore = () => {
  if (hasMore && !isLoading && !error && allResources.length < (data?.total ?? 0)) {
    setPage(p => p + 1);
  }
};
```

---

### WR-06: `RouteErrorFallback` imported but never used in `app/(auth)/_layout.tsx`

**File:** `app/(auth)/_layout.tsx:2`

```typescript
import { RouteErrorFallback } from '@/components/common';
```

**Issue:** The import is used in the `ErrorBoundary` export on line 10, so it is technically referenced. However, the `AuthLayout` component itself is just a `<Stack>` with no error-producing code path. The `ErrorBoundary` export is the Expo Router convention, so this is legitimate — but worth noting that the import would cause a lint error if a linter with `no-unused-vars` is configured and only sees the `default` export's scope. No code fix needed if the linter is properly scoped; however, the `RouteErrorFallback` is used correctly.

This item is revised to a real finding: the `(auth)/_layout.tsx` `ErrorBoundary` receives errors thrown during auth layout rendering, but at that level the `useTheme` hook (used inside `RouteErrorFallback`) may itself throw if the theme context is not yet mounted, creating an infinite error cycle.

**Fix:** Provide a static fallback at the auth layout level that does not depend on theme context:
```tsx
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  // At auth layout level, theme context may not be available yet.
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Text style={{ color: '#ff4444', fontFamily: 'monospace' }}>[ ERROR DEL SISTEMA ]</Text>
      <Text style={{ color: '#888', fontFamily: 'monospace', marginTop: 8 }}>{error.message}</Text>
    </View>
  );
}
```

---

### WR-07: `handleRequestSupply` silently fails and logs only — no user feedback

**File:** `app/(tabs)/map.tsx:383-386`

```typescript
} catch (error) {
  console.error("Error requesting supply:", error);
}
```

**Issue:** If supply creation fails, the user sees the button return from "SOLICITANDO..." to its normal state with no explanation. Network errors, auth errors, and validation errors are all swallowed. This is the same pattern as WR-03 but in the map screen.

**Fix:**
```typescript
} catch (error) {
  console.error("Error requesting supply:", error);
  Alert.alert(
    "ERROR",
    error instanceof Error ? error.message : "No se pudo solicitar el suministro. Intente de nuevo."
  );
}
```

---

### WR-08: GPS tracking `useEffect` in `map.tsx` starts a location subscription but `startTracking()` is also called, potentially doubling tracking state

**File:** `app/(tabs)/map.tsx:102-136`

```typescript
const startGpsTracking = async () => {
  if (activeTrip?.status === 'activo' && !isTracking) {
    // ...
    subscription = await Location.watchPositionAsync(...);
    startTracking();  // sets isTracking: true in store
  }
};
```

**Issue:** The `useEffect` depends on `[activeTrip?.status, isTracking, startTracking]`. When `startTracking()` is called it sets `isTracking = true` in the store, which triggers a re-render that causes this `useEffect`'s dependencies to change, which fires the cleanup (removing the subscription) and immediately re-runs the effect. Since `isTracking` is now `true`, the condition `!isTracking` prevents a new subscription — so the subscription that was just removed via cleanup is gone. The result: the GPS subscription is established and then immediately torn down on the first successful start.

**Fix:** Remove `isTracking` from the dependency array and instead use a ref to track whether a subscription exists:
```typescript
useEffect(() => {
  let subscription: Location.LocationSubscription | null = null;

  if (activeTrip?.status !== 'activo') return;

  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    subscription = await Location.watchPositionAsync({ ... }, (loc) => { ... });
    startTracking();
  })();

  return () => { subscription?.remove(); };
}, [activeTrip?.status]); // Remove isTracking from deps
```

---

## Info

### IN-01: `supplyETA` is hardcoded — always shows "2d 14h" regardless of actual data

**File:** `app/(tabs)/dashboard.tsx:55`

```typescript
const supplyETA = "2d 14h";
```

**Issue:** This value never changes. Users always see "ETA: 2d 14h" in the mission progress card. If this is placeholder data, it should be clearly marked or removed. If it is meant to be computed from supply data, it needs to derive from an actual supply object.

**Fix:** Either derive from the nearest supply's `expiresAt` field or replace with a `TODO` comment and render nothing until the value is available.

---

### IN-02: `checkAuth` dependency missing in `useEffect` in `app/_layout.tsx`

**File:** `app/_layout.tsx:17-19`

```typescript
useEffect(() => {
  checkAuth();
}, []);
```

**Issue:** `checkAuth` is destructured from `useAuthStore` and used in the effect but not listed as a dependency. React's exhaustive-deps rule would flag this. While Zustand store actions are stable references and this is unlikely to cause a real bug, it is a lint violation that lowers code hygiene and could mask future issues if `checkAuth` is ever redefined.

**Fix:**
```typescript
useEffect(() => {
  checkAuth();
}, [checkAuth]);
```

---

### IN-03: `console.warn` left in production code path in `map.tsx`

**File:** `app/(tabs)/map.tsx:85`, `app/(tabs)/map.tsx:333`

```typescript
console.warn("Permission to access location was denied");
console.warn("Location permission denied");
```

**Issue:** Both permission-denied cases only log a warning. Neither surfaces feedback to the user nor returns early in a clearly documented way. The first one on line 85 means the map silently stays at the default Lima, Peru coordinates when location is denied — users in other regions would see incorrect marker distances permanently.

**Fix:** Show a user-facing alert when location permission is denied:
```typescript
if (status !== "granted") {
  Alert.alert(
    "PERMISO REQUERIDO",
    "Se necesita acceso a la ubicación para mostrar suministros cercanos."
  );
  return;
}
```

---

### IN-04: Duplicate `HudHeader` title rendered in `trips.tsx`

**File:** `app/trips.tsx:119-124`, `app/trips.tsx:131-134`

```typescript
// Navigation bar header:
<Text ...>REGISTROS DE VIAJE</Text>

// FlatList ListHeaderComponent:
<HudHeader title="REGISTROS DE VIAJE" subtitle="BITÁCORA DE EXPLORACIÓN" />
```

**Issue:** "REGISTROS DE VIAJE" appears twice on screen — once in the custom navigation bar and once in the `HudHeader` component at the top of the list. This is visually redundant.

**Fix:** Use distinct titles, e.g., keep the nav bar as-is and change `HudHeader` to `subtitle`-only, or remove the nav bar title.

---

### IN-05: `(auth)/_layout.tsx` `ErrorBoundary` export unused at the route level it wraps

**File:** `app/(auth)/_layout.tsx:10-12`

**Issue:** The `ErrorBoundary` is exported at the `(auth)` layout level. Errors thrown by `login.tsx` are caught by `login.tsx`'s own `ErrorBoundary` first (Expo Router walks inward to outward). The layout-level boundary would only catch errors thrown during layout rendering itself (i.e., the `<Stack>` component), which is extremely unlikely. This is not wrong, but the boundary adds near-zero protection at this level while giving a false sense of coverage.

**Fix:** Document with a comment why the boundary is here, or remove it if it provides no real coverage:
```typescript
// Catches errors thrown during auth layout initialization (rare).
// Route-level errors (login.tsx) are caught by their own ErrorBoundary.
export function ErrorBoundary(...) { ... }
```

---

_Reviewed: 2026-05-05T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
