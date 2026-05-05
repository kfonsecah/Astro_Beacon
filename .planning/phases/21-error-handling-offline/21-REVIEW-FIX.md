---
phase: 21-error-handling-offline
fixed_at: 2026-05-05T18:06:33Z
review_path: .planning/phases/21-error-handling-offline/21-REVIEW.md
iteration: 1
findings_in_scope: 11
fixed: 11
skipped: 0
status: all_fixed
---

# Phase 21: Code Review Fix Report

**Fixed at:** 2026-05-05T18:06:33Z
**Source review:** .planning/phases/21-error-handling-offline/21-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 11
- Fixed: 11
- Skipped: 0

## Fixed Issues

### CR-01: Oxygen countdown interval leak in map.tsx

**Files modified:** `app/(tabs)/map.tsx`
**Commit:** f0477fe
**Applied fix:** Restructured the oxygen countdown `useEffect` to use an early-return guard (`if (activeTrip?.status !== 'activo')`) and added `activeTrip?.oxygenBudgeted` to the dependency array so the rate is recomputed when the budget changes.

---

### CR-02: Math.random() used as FlatList keyExtractor in resources.tsx

**Files modified:** `app/(tabs)/resources.tsx`
**Commit:** 603fab9
**Applied fix:** Replaced `Math.random().toString()` fallback with a deterministic chain: `item.id ?? (item as any)._id ?? item.name ?? 'resource-fallback'`.

---

### CR-03: Local trip object lacks Viaje type annotation and has empty astronautId

**Files modified:** `app/(tabs)/map.tsx`
**Commit:** e8bc549
**Applied fix:** Added `userId` guard that alerts and returns early if `user?.id` is undefined, annotated `localTrip` as `const localTrip: Viaje`, and added `Viaje` to the types-dtos import.

---

### WR-01: useNetworkStatus initializes as isConnected: true before receiving real state

**Files modified:** `src/hooks/useNetworkStatus.ts`
**Commit:** c447bbe
**Applied fix:** Changed initial state to `{ isConnected: false, isInternetReachable: false }` (fail-safe default) and added an immediate `NetInfo.fetch()` call at the top of the `useEffect` before the `addEventListener` subscription.

---

### WR-02: onRefresh race condition in resources.tsx

**Files modified:** `app/(tabs)/resources.tsx`
**Commit:** 4026e98
**Applied fix:** Added `isRefreshing` boolean state, set it true at the start of `onRefresh` and false after `refetch()` resolves, and added `!isRefreshing` to the `loadMore` guard condition. WR-05 for resources was applied in the same commit (see WR-05 below).

---

### WR-03: Login error swallowed — user receives no feedback

**Files modified:** `app/(auth)/login.tsx`
**Commit:** 55c707b
**Applied fix:** Added `throw error` in the `handleLogin` catch block so `loginMutation.isError` is set correctly, and added an error text element in the JSX above the auth button that renders `loginMutation.error.message` when `loginMutation.isError` is true.

---

### WR-04: dashboard.tsx error check excludes resources error

**Files modified:** `app/(tabs)/dashboard.tsx`
**Commit:** d50759d
**Applied fix:** Destructured `error: errorResources` from the `useResources` call, added `errorResources` to the `error` expression, and removed `loadingResources` from the `isLoading` gate so resources load incrementally without blocking the dashboard spinner.

---

### WR-05: Pagination can permanently stall after failed page in resources.tsx and logbook.tsx

**Files modified:** `app/(tabs)/resources.tsx`, `app/(tabs)/logbook.tsx`
**Commits:** 4026e98 (resources.tsx, combined with WR-02), c5f9b2b (logbook.tsx)
**Applied fix:** Added `!error` guard to `loadMore` in `resources.tsx` and `!isError` guard to `loadMore` in `logbook.tsx` (the logbook hook exposes `isError` rather than `error` directly).

---

### WR-06: RouteErrorFallback in (auth)/_layout.tsx may crash if theme context unavailable

**Files modified:** `app/(auth)/_layout.tsx`
**Commit:** 1fb1592
**Applied fix:** Replaced the `RouteErrorFallback` import and usage with a self-contained static `ErrorBoundary` that uses only hardcoded colors (`#000`, `#ff4444`, `#888`) and no theme context dependency. Removed the `RouteErrorFallback` import entirely.

---

### WR-07: handleRequestSupply silently fails in map.tsx

**Files modified:** `app/(tabs)/map.tsx`
**Commit:** 65495e0
**Applied fix:** Added `Alert.alert("ERROR", ...)` in the `handleRequestSupply` catch block, showing the error message if it is an `Error` instance, or a generic fallback string otherwise.

---

### WR-08: GPS tracking useEffect dependency on isTracking tears down subscription immediately

**Files modified:** `app/(tabs)/map.tsx`
**Commit:** 48e90c8
**Applied fix:** Restructured the GPS tracking `useEffect` to use an early-return guard (`if (activeTrip?.status !== 'activo') return`) and an async IIFE pattern, removing `isTracking` and `startTracking` from the dependency array. The effect now only re-runs when `activeTrip?.status` changes, preventing the subscribe-then-immediately-teardown cycle.

---

_Fixed: 2026-05-05T18:06:33Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
