---
phase: 19-critical-bug-fixes
fixed_at: 2026-05-05T00:00:00Z
review_path: .planning/phases/19-critical-bug-fixes/19-REVIEW.md
iteration: 1
findings_in_scope: 10
fixed: 10
skipped: 0
status: all_fixed
---

# Phase 19: Code Review Fix Report

**Fixed at:** 2026-05-05T00:00:00Z
**Source review:** .planning/phases/19-critical-bug-fixes/19-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 10 (CR-01, CR-02, CR-03, CR-04, WR-01, WR-02, WR-03, WR-04, WR-05, WR-06)
- Fixed: 10
- Skipped: 0

---

## Fixed Issues

### CR-01: Stale closure in `hasMore` / `allTrips.length` computation — trips.tsx

**Files modified:** `app/trips.tsx`
**Commit:** a0dc304
**Applied fix:** Moved `setHasMore` inside the `setAllTrips` functional updater. The computation now uses `next.length` (the post-update array length) instead of the stale outer `allTrips.length` that was captured before `setAllTrips` had flushed. This eliminates the spurious extra fetch at the bottom of the list.

---

### CR-02: Same stale-closure `hasMore` bug — logbook.tsx

**Files modified:** `app/(tabs)/logbook.tsx`
**Commit:** 0bc8f04
**Applied fix:** Identical pattern to CR-01. Moved `setHasMore` inside the `setAllEntries` functional updater, replacing the stale `allEntries.length + newItems.length` expression (which double-counted unfiltered items) with `next.length` (the actual post-update length).

---

### CR-03: `isAuthenticating` permanently stuck on success path — login.tsx

**Files modified:** `app/(auth)/login.tsx`
**Commit:** 086426f
**Applied fix:** Removed the `isAuthenticating` local state entirely. `handleLogin` now guards on `loginMutation.isPending` (which TanStack Mutation resets automatically on both success and error). The `setIsAuthenticating(true/false)` calls and the state declaration were deleted. All button `disabled` conditions and label conditionals now reference `loginMutation.isPending`. The `router` dependency was also added to the `useCallback` array.

---

### CR-04: `keyExtractor` uses `Math.random()` as fallback key — logbook.tsx

**Files modified:** `app/(tabs)/logbook.tsx`
**Commit:** 0bc8f04
**Applied fix:** Replaced `item.id || Math.random().toString()` with `item.id ?? \`entry-fallback-\${index}\``. The index-based fallback is stable across renders, preventing React from unmounting and remounting list items on every re-render due to a changing key.

---

### WR-01: Race between refresh clear and stale cached data — bestiary.tsx

**Files modified:** `app/(tabs)/bestiary.tsx`
**Commit:** 98a4ccc
**Applied fix:** Added `data.page === page` guard to the accumulation effect so that stale cached data from a previous page number cannot be appended after a refresh has cleared `allSpecies`. The `PaginatedResponse<T>` type includes a `page` field so the comparison is well-typed. Also replaced the O(n²) `Set+find` dedup strategy with an O(n) `Map`-based approach.

---

### WR-02: `startTripMutation.isPending` disables ALL trip rows — trips.tsx

**Files modified:** `app/trips.tsx`
**Commit:** a0dc304
**Applied fix:** Added `startingTripId` state (`useState<string | null>(null)`). `handleStartTrip` now calls `setStartingTripId(trip.id)` before the mutation and clears it in both `onSuccess` and `onError` callbacks. The button `disabled` condition and label text now check `startingTripId === item.id` instead of `startTripMutation.isPending`, so only the specific trip row being started is affected.

---

### WR-03: `onRefresh` does not reset `hasMore` — bestiary.tsx

**Files modified:** `app/(tabs)/bestiary.tsx`
**Commit:** 98a4ccc
**Applied fix:** Added `setHasMore(true)` to the `onRefresh` callback. Without this, a user who had scrolled to the end of the list (setting `hasMore=false`) would find that infinite scroll remained permanently broken after a pull-to-refresh.

---

### WR-04: Login does not validate password before submitting — login.tsx

**Files modified:** `app/(auth)/login.tsx`
**Commit:** 086426f
**Applied fix:** Bundled into the CR-03 fix. The `handleLogin` guard was updated to `if (!email.trim() || !password || loginMutation.isPending) return;`, adding the missing `!password` check that prevents a blank-password API call.

---

### WR-05: No guard for already-active trip in `useStartTrip.onSuccess` — useTrips.ts

**Files modified:** `src/hooks/useTrips.ts`
**Commit:** 83246ee
**Applied fix:** Added a store-state check before calling `setActiveTrip`. If `currentActive` is non-null and its `id` differs from the trip being started, a `console.error` is emitted to surface the inconsistent state. The `setActiveTrip` call proceeds regardless (non-blocking guard), consistent with the reviewer's intent of making the violation observable without halting the mutation.

---

### WR-06: Sync indicator always shows "Sincronizado" — logbook.tsx

**Files modified:** `app/(tabs)/logbook.tsx`
**Commit:** 0bc8f04
**Applied fix:** Removed the misleading sync badge (the `View` with the emoji and "Sincronizado"/"Pendiente" text). Since `updatedAt` is a required field on `BitacoraEntradaResponse`, the "Pendiente" branch was unreachable and the badge provided no real information. Replaced with a plain text node showing the formatted `updatedAt` date, which is useful and accurate.

---

## Skipped Issues

None — all 10 in-scope findings were successfully fixed.

---

_Fixed: 2026-05-05T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
