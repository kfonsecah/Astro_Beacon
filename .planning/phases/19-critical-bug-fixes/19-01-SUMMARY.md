---
phase: 19-critical-bug-fixes
plan: 01
status: complete
completed: 2026-05-04
commit: c049f7d
---

# Plan 19-01 Summary: Trip Activation & Double setAuth Fixes

## What Was Built

Two surgical fixes that eliminated dead code and a duplicate auth store write.

## Changes Made

### src/hooks/useTrips.ts — 4 changes

1. **Added import** `import { useTripStore } from '@/stores/trip.store';` (line 4)
2. **useStartTrip.onSuccess**: Changed first arg from `_` to `updatedTrip`; added `useTripStore.getState().setActiveTrip(updatedTrip)` before invalidateQueries — this activates the GPS banner and O2 countdown in `map.tsx`
3. **useCompleteTrip.onSuccess**: Added `useTripStore.getState().setActiveTrip(null)` — cleans up active trip state when a trip is completed
4. **useAbortTrip.onSuccess**: Added `useTripStore.getState().setActiveTrip(null)` — cleans up active trip state when a trip is aborted

### app/(auth)/login.tsx — 2 changes

1. **Removed import**: `import { useAuthStore } from "@/stores/auth.store"` (was only used for the duplicate call)
2. **Removed duplicate setAuth call**: Changed `const response = await loginMutation.mutateAsync(...)` + `useAuthStore.getState().setAuth(...)` to just `await loginMutation.mutateAsync(...)` — the `useLogin` hook's `onSuccess` already calls `setAuth` exactly once

## Verification Gates

```bash
# useTripStore: 4+ matches (import + 3 calls)
grep -n "useTripStore" src/hooks/useTrips.ts  # ✓ 4 lines

# setActiveTrip: exactly 3 calls (start, complete, abort)
grep -n "setActiveTrip" src/hooks/useTrips.ts  # ✓ 3 lines

# setAuth: 0 results in login.tsx (duplicate removed)
grep -n "setAuth" app/(auth)/login.tsx  # ✓ 0 results

# useAuthStore: 0 results in login.tsx (import removed)
grep -n "useAuthStore" app/(auth)/login.tsx  # ✓ 0 results
```

## Impact

- **Phase 17 Plans 03-04 are no longer dead code**: `activeTrip` in TripStore now correctly becomes non-null after `useStartTrip` succeeds → triggers `map.tsx`'s `useEffect` at lines 130-142 → activates GPS banner and O2 countdown
- **Auth store writes reduced to 1 per login**: eliminates the race condition where the store was written twice

## Self-Check: PASSED

All grep gates pass. Both hooks connect correctly to their respective stores.

## key-files

### created
- (none — fixes to existing files only)

### modified
- src/hooks/useTrips.ts
- app/(auth)/login.tsx
