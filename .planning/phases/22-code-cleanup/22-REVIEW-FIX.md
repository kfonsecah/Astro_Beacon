---
phase: 22
fixed_at: 2026-05-05T00:00:00Z
review_path: .planning/phases/22-code-cleanup/22-REVIEW.md
iteration: 1
findings_in_scope: 12
fixed: 12
skipped: 0
status: all_fixed
---

# Phase 22: Code Review Fix Report

**Fixed at:** 2026-05-05T00:00:00Z
**Source review:** .planning/phases/22-code-cleanup/22-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 12 (CR-001..CR-004, WR-001..WR-008)
- Fixed: 12
- Skipped: 0

## Fixed Issues

### CR-001: Active-trip guard restored in map.tsx

**Files modified:** `app/(tabs)/map.tsx`
**Commit:** c2f1201
**Applied fix:** Removed debug comment `// DEBUG: Sin requisito viaje activo temporalmente para probar` and restored the `isTripActive` condition to the collectible check: `if (isInRange && isPendiente && isTripActive)`. The outer `isTripActive` variable declared at the top of the effect is now used (removed redundant inner declaration that was introduced during CR-001 application).

---

### CR-002: Production URL guard in api.ts

**Files modified:** `src/config/api.ts`
**Commit:** c2f1201
**Applied fix:** Replaced the hardcoded `"https://your-api-domain.com/api/v1"` placeholder with a guard that throws `Error('[API Config] EXPO_PUBLIC_API_URL must be set in production...')` when the env var is absent in a production build. Combined with WR-002 — all `console.log` calls in the function are now gated on `__DEV__`.

---

### CR-003: Defensive GeoPoint normalization in trip.service.ts

**Files modified:** `src/services/trip.service.ts`
**Commit:** c2f1201
**Applied fix:** `mapTrip` now normalizes `destination` before returning: if `t.destination` is an object with a `lat` key it is used as-is; otherwise `{ lat: 0, lng: 0 }` is substituted. This prevents `NaN` coordinates when the backend returns a string label.

---

### CR-004: Remove dead code in species.service.ts

**Files modified:** `api/src/services/species.service.ts`
**Commit:** c2f1201
**Applied fix:** Applied option (b) — species are globally shared. Removed the unreachable `if (!existing)` checks after `findOne()` (which already throws) in both `update` and `delete`. The `userId` parameter is kept in the method signature to avoid breaking the controller call surface. JSDoc updated to document the globally-shared design intent explicitly.

---

### WR-001: Remove console.log calls from supply.service collect method

**Files modified:** `api/src/services/supply.service.ts`
**Commit:** c2f1201
**Applied fix:** Removed all 7 `console.log` calls within the `collect` method (supply found, processing count, content mapping, existing/new resource logs). The `console.error` in the catch block is preserved. Also removed the now-unused local `updated` and `created` variables that existed solely to be logged.

---

### WR-002: Gate console.log calls on __DEV__ in api.ts

**Files modified:** `src/config/api.ts`
**Commit:** c2f1201
**Applied fix:** All `console.log` calls in `getApiBaseUrl` and `setApiBaseUrl` are now wrapped in `if (__DEV__)`. This was folded into the CR-002 fix since both touch the same function body.

---

### WR-003: Clear stale interval in startOxygenCountdown

**Files modified:** `src/stores/trip.store.ts`
**Commit:** c2f1201
**Applied fix:** Changed guard from `if (state.intervalId) return state` (which skips creating a new interval if one exists) to `if (state.intervalId !== null) { clearInterval(state.intervalId); }` (which always clears any existing interval then starts fresh). Uses `intervalId as unknown as number` cast consistent with the type declaration. Also uses `s` instead of `state` in the inner `set` callback to avoid shadowing.

---

### WR-004: Move calculateDistanceKm before its first use

**Files modified:** `app/(tabs)/map.tsx`
**Commit:** c2f1201
**Applied fix:** Moved the `calculateDistanceKm` arrow function definition to line 173, immediately before the proximity `useEffect` that calls it (previously defined at ~262, after early-return JSX blocks). The duplicate definition at the original location was removed.

---

### WR-005: Fix stale closure in resources.tsx hasMore

**Files modified:** `app/(tabs)/resources.tsx`
**Commit:** c2f1201
**Applied fix:** `setHasMore` is now called inside the `setAllResources` updater using the `next` array (post-dedup state) rather than the stale outer `allResources` captured by the effect closure. This ensures `hasMore` always reflects the actual committed array length.

---

### WR-006: Fix typo "entregido" -> "entregado" in getEta

**Files modified:** `app/(tabs)/map.tsx`
**Commit:** c2f1201
**Applied fix:** Changed `if (status === "entregido")` to `if (status === "entregado")` so the delivered branch correctly returns `"Recogido"`.

---

### WR-007: Update misleading rate-limit comment in auth.routes.ts

**Files modified:** `api/src/routes/auth.routes.ts`
**Commit:** c2f1201
**Applied fix:** Updated comment from `"5 attempts per 15 minutes"` to `"100 attempts per 15 minutes (adjust for production)"` to match the actual `max: 100` value. Also cleaned up the inline comment on `max` to remove the redundant `(dev mode)` note.

---

### WR-008: Remove passwordHash from Astronauta frontend DTO

**Files modified:** `src/types-dtos/astronauta.dto.ts`
**Commit:** c2f1201
**Applied fix:** Removed `passwordHash: string` from the `Astronauta` interface. The remaining fields match the review's suggested clean interface.

---

## Skipped Issues

None — all 12 in-scope findings were successfully fixed.

---

_Fixed: 2026-05-05T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
