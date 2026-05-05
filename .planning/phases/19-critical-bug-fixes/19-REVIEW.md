---
phase: 19-critical-bug-fixes
reviewed: 2026-05-05T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/hooks/useTrips.ts
  - app/(auth)/login.tsx
  - app/(tabs)/bestiary.tsx
  - app/(tabs)/logbook.tsx
  - app/trips.tsx
findings:
  critical: 4
  warning: 6
  info: 3
  total: 13
status: issues_found
---

# Phase 19: Code Review Report

**Reviewed:** 2026-05-05T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files were reviewed: the `useTrips` hook suite, the login screen, and three list screens (bestiary, logbook, trips). All three list screens share the same pagination accumulation pattern, and all three carry variants of the same stale-closure bug. The trips screen additionally has a UI-blocking mutation state defect. The login screen has an `isAuthenticating` state that can be left permanently stuck on error. Security surface is low (mobile client), but `Math.random()` is used as a React key in the logbook screen — a correctness/stability defect. The `useStartTrip` hook calls a Zustand store getter inside a TanStack mutation `onSuccess` callback, which is safe here but uses a non-reactive pattern worth flagging. Overall the codebase is structurally coherent, but the pagination bugs are widespread and will produce duplicate or missing items under normal scroll usage.

---

## Critical Issues

### CR-01: Stale closure in `hasMore` / `allTrips.length` computation — trips.tsx

**File:** `app/trips.tsx:46`
**Issue:** `setHasMore` is called inside `setAllTrips`'s functional updater in the `useEffect`, but `allTrips.length` on line 46 is captured from the outer scope at the time the effect runs — **before** the `setAllTrips` call on line 41 has flushed. React state updates from `setAllTrips` are not synchronously reflected in `allTrips`, so `allTrips.length` still holds the *previous* length when `setHasMore` evaluates. This means `hasMore` is always one page behind, causing the last page to be incorrectly treated as having more data, which triggers one spurious extra fetch at the bottom of the list.

```tsx
// CURRENT (buggy) — allTrips.length is stale at this point
useEffect(() => {
  const newItems = data?.items ?? [];
  if (newItems.length > 0) {
    setAllTrips(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const filtered = newItems.filter(t => !existingIds.has(t.id));
      return filtered.length > 0 ? [...prev, ...filtered] : prev;
    });
    // allTrips.length here is the PRE-update length — stale
    setHasMore((data?.total ?? 0) > allTrips.length + newItems.length);
  }
}, [data]);

// FIX — compute hasMore inside the updater where the current length is known
useEffect(() => {
  const newItems = data?.items ?? [];
  if (newItems.length > 0) {
    setAllTrips(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const filtered = newItems.filter(t => !existingIds.has(t.id));
      const next = filtered.length > 0 ? [...prev, ...filtered] : prev;
      setHasMore((data?.total ?? 0) > next.length);
      return next;
    });
  }
}, [data]);
```

### CR-02: Same stale-closure `hasMore` bug — logbook.tsx

**File:** `app/(tabs)/logbook.tsx:26`
**Issue:** Identical defect as CR-01. `allEntries.length` in `setHasMore` on line 26 is the pre-update length. Additionally the condition `(data?.total ?? 0) > allEntries.length + newItems.length` double-counts: `newItems` includes both new and potentially already-filtered items, but the comparison adds the unfiltered `newItems.length` to the stale `allEntries.length`, which can produce incorrect `hasMore=false` early — cutting off pagination before all entries are loaded.

```tsx
// FIX — move hasMore computation inside updater
useEffect(() => {
  const newItems = data?.items ?? [];
  if (newItems.length > 0) {
    setAllEntries(prev => {
      const existingIds = new Set(prev.map(e => e.id));
      const filtered = newItems.filter(e => !existingIds.has(e.id));
      const next = filtered.length > 0 ? [...prev, ...filtered] : prev;
      setHasMore((data?.total ?? 0) > next.length);
      return next;
    });
  }
}, [data]);
```

### CR-03: `isAuthenticating` permanently stuck on network error — login.tsx

**File:** `app/(auth)/login.tsx:239-242`
**Issue:** `setIsAuthenticating(false)` is only called in the `catch` block. When `loginMutation.mutateAsync` resolves successfully, `router.replace` is called immediately. If navigation succeeds the component unmounts and the stuck state is irrelevant — but if `router.replace` itself throws (which can happen with navigation errors in Expo Router, e.g., invalid route or navigation state mismatch), the `catch` block **does** reset the state. However, there is a subtler and more serious problem: `setIsAuthenticating(true)` is set, but is **never reset to `false` on the success path**. If the component stays mounted after a successful login (e.g., the navigation is slow or the component is kept in the stack), the button remains permanently disabled. Additionally, because `isAuthenticating` is local state independent of `loginMutation.isPending`, a rapid double-press can call `handleLogin` twice before the first `setIsAuthenticating(true)` renders — the `if (!email.trim() || isAuthenticating) return` guard relies on a state value that hasn't flushed yet.

```tsx
// FIX — use finally to always reset, and rely on loginMutation.isPending for the guard
const handleLogin = useCallback(async () => {
  if (!email.trim() || loginMutation.isPending) return;
  try {
    await loginMutation.mutateAsync({ email, password });
    router.replace('/(tabs)/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    // loginMutation resets isPending automatically; no manual state needed
  }
}, [email, password, loginMutation, router]);
```
Then remove the `isAuthenticating` state entirely and replace all references with `loginMutation.isPending`.

### CR-04: `keyExtractor` uses `Math.random()` as fallback key — logbook.tsx

**File:** `app/(tabs)/logbook.tsx:67`
**Issue:** `keyExtractor={(item) => item.id || Math.random().toString()}` generates a new random key on every render for items that have a falsy `id`. React uses keys to match list items between renders — a random key means React will unmount and remount the component on every re-render (including scroll, focus, or any parent state change), causing visible flicker, lost component state, and potential focus loss. Since `BitacoraEntradaResponse extends BitacoraEntrada` where `id: string` is required (non-optional), a falsy `id` indicates a data contract violation from the API; using a random key silently hides this instead of surfacing it.

```tsx
// FIX — use a stable fallback that exposes the problem while staying safe
keyExtractor={(item, index) => item.id ?? `entry-fallback-${index}`}
```

---

## Warnings

### WR-01: `useEffect` missing dependency — bestiary.tsx

**File:** `app/(tabs)/bestiary.tsx:44`
**Issue:** The `useEffect` dependency array is `[data, page]`. Inside the effect, `page` is read via the dependency but `setHasMore(page < data.totalPages)` — `page` is already included so this is consistent. However, `setAllSpecies` with its functional updater does not need `page` in deps. The real problem is that `data` changes whenever the page changes (new query key), meaning when a refresh resets `page` to 1 but `data` is still the previous page's data from cache, the effect will fire with stale `data`. This is a race condition that can prepend old page-2 data before page-1 data arrives. The `onRefresh` callback calls `setAllSpecies([])` and `setPage(1)` and then `refetch()` — but because `setPage(1)` triggers a new query key, the old cached page-1 data may be returned instantly from React Query cache and run through the effect before the cleared `allSpecies` state has committed, re-adding old items.

```tsx
// FIX — guard the effect against stale page data by checking page number matches
useEffect(() => {
  if (data?.items && data.page === page) {
    setAllSpecies(prev => {
      const uniqueMap = new Map(prev.map(a => [a.id, a]));
      data.items.forEach(a => uniqueMap.set(a.id, a));
      return Array.from(uniqueMap.values());
    });
    setHasMore(page < data.totalPages);
  }
}, [data, page]);
```

### WR-02: `startTripMutation.isPending` disables ALL trip rows, not just the active one — trips.tsx

**File:** `app/trips.tsx:165`
**Issue:** `disabled={startTripMutation.isPending}` applies the mutation's pending state to every "INICIAR VIAJE" button in the list. If there are multiple `planificado` trips, clicking "INICIAR" on one will disable all start buttons simultaneously, and the button text changes to "INICIANDO..." on all rows. This is misleading UX and prevents the user from knowing which trip is being started. Worse, if the mutation fails, all buttons stay disabled until the component re-renders.

```tsx
// FIX — track which trip id is being started
const [startingTripId, setStartingTripId] = useState<string | null>(null);

const handleStartTrip = (trip: Viaje) => {
  Alert.alert('INICIAR VIAJE', `...`, [
    { text: 'CANCELAR', style: 'cancel' },
    {
      text: 'INICIAR',
      onPress: () => {
        setStartingTripId(trip.id);
        startTripMutation.mutate(
          { id: trip.id },
          {
            onSuccess: () => setStartingTripId(null),
            onError: () => {
              setStartingTripId(null);
              Alert.alert('ERROR', 'No se pudo iniciar el viaje');
            },
          }
        );
      },
    },
  ]);
};

// In renderItem:
disabled={startingTripId === item.id}
```

### WR-03: `onRefresh` does not reset `hasMore` in bestiary.tsx — bestiary.tsx

**File:** `app/(tabs)/bestiary.tsx:46-50`
**Issue:** `onRefresh` sets `allSpecies([])` and `setPage(1)` but does **not** reset `hasMore` to `true`. If the user reached the end of the list (setting `hasMore=false`) and then pulls to refresh, `hasMore` remains `false`, so `loadMore` will never trigger even if the refreshed list has more pages. This silently breaks infinite scroll after a pull-to-refresh when the list was previously exhausted.

```tsx
const onRefresh = useCallback(() => {
  setAllSpecies([]);
  setPage(1);
  setHasMore(true); // ADD THIS
  refetch();
}, [refetch]);
```

### WR-04: Login does not validate password before submitting — login.tsx

**File:** `app/(auth)/login.tsx:234`
**Issue:** `handleLogin` guards on `!email.trim()` but has no guard for an empty password. A user can submit with a blank password — the API call will be made unnecessarily, wasting the network round-trip and potentially returning a confusing server error message instead of immediate UI feedback.

```tsx
if (!email.trim() || !password || loginMutation.isPending) return;
```

### WR-05: `useStartTrip.onSuccess` — first argument `updatedTrip` from service returns `Viaje` but `setActiveTrip` is called without error handling — useTrips.ts

**File:** `src/hooks/useTrips.ts:55-56`
**Issue:** `tripService.start()` returns `Promise<Viaje>`. The `onSuccess` callback receives `updatedTrip` which is typed as `Viaje`. This is correct. However, `useTripStore.getState().setActiveTrip(updatedTrip)` is called synchronously inside the React Query `onSuccess` — if `updatedTrip` is null-ish due to an unexpected API response shape, `setActiveTrip` will set `oxygenRemaining` to `undefined || 0` (safe due to the `|| 0` fallback in the store). The deeper issue: if the trip was **already active** in the store (from a previous uncleared state), calling `setActiveTrip` overwrites it silently. There is no guard ensuring only one trip is active at a time at the hook level. This is a data consistency risk if `useCompleteTrip` or `useAbortTrip` fails to clear the store (their `onSuccess` does call `setActiveTrip(null)`, but if they error, the store is not cleared).

**Fix:** Add a store-level guard or at minimum document this precondition. At the hook level, consider clearing any existing active trip before setting a new one, or asserting the store is clear:
```ts
onSuccess: (updatedTrip, { id }) => {
  const currentActive = useTripStore.getState().activeTrip;
  if (currentActive && currentActive.id !== id) {
    // A different trip is already active — this is an inconsistent state
    console.error('Starting trip while another trip is active:', currentActive.id);
  }
  useTripStore.getState().setActiveTrip(updatedTrip);
  // ...
},
```

### WR-06: Logbook `updatedAt` sync indicator is always "Sincronizado" — logbook.tsx

**File:** `app/(tabs)/logbook.tsx:87-89`
**Issue:** The sync badge shows "Sincronizado" when `item.updatedAt` is truthy and "Pendiente" otherwise. Per `BitacoraEntradaResponse`, `updatedAt` is declared on the base `BitacoraEntrada` as a required `Date` field — it will **always** be present for any valid server response. The "Pendiente" branch is therefore unreachable in practice, and the indicator will always show "Sincronizado" regardless of actual sync state. This is misleading UI that provides no real information.

**Fix:** Remove the sync indicator if real offline sync state is not tracked, or wire it to an actual offline queue / sync state from a store.

---

## Info

### IN-01: Commented Spanish inline comment in production animation code — login.tsx

**File:** `app/(auth)/login.tsx:40`
**Issue:** `//animaciones estrellas` is an untranslated inline comment left in the module-level constant definition block. Minor but inconsistent with the rest of the codebase.

**Fix:** Remove or translate the comment.

### IN-02: `SCREEN_HEIGHT` and `SCREEN_WIDTH` captured at module load time — login.tsx

**File:** `app/(auth)/login.tsx:28-29`
**Issue:** `Dimensions.get("window")` is called once at module evaluation time. On devices where the screen dimensions can change (rotation, foldable displays, multi-window on tablets), the shooting star animation coordinates will be stale. This is not a crash but will produce visually incorrect trajectories after orientation changes.

**Fix:** Use `useWindowDimensions()` hook inside the component, or subscribe to `Dimensions.addEventListener` in a module-level listener.

### IN-03: Dead `isAuthenticating` state alongside `loginMutation.isPending` — login.tsx

**File:** `app/(auth)/login.tsx:226`
**Issue:** `isAuthenticating` local state duplicates `loginMutation.isPending` (from TanStack Mutation). Both are used for disabling the button (line 318: `!email.trim() || isAuthenticating`) and showing the loading label (line 323: `isAuthenticating`). The two can diverge — for example, after a successful login `isAuthenticating` remains `true` while `loginMutation.isPending` resets to `false`. Maintaining parallel state increases bug surface for no benefit.

**Fix:** Remove `isAuthenticating` and use `loginMutation.isPending` exclusively (already addressed as part of CR-03 fix).

---

_Reviewed: 2026-05-05T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
