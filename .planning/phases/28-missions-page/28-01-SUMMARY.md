# Plan 28-01 Summary

## Objective
Create the Missions tab screen + detail screen + navigation wiring for Phase 28.

## Files Created
- `app/(tabs)/missions.tsx` — Main missions tab: active mission panel (O₂, duration, COMPLETAR/ABORTAR from useTripStore), past missions FlatList with pagination (client-side filter for completado/abortado), all states (loading/error/empty), INICIAR EXPEDICIÓN CTA, pull-to-refresh, ErrorBoundary export
- `app/missions/[id].tsx` — Read-only past mission detail: status badge, destination coordinates, O₂/resources/duration metrics, notes section, ErrorBoundary export

## Files Modified
- `app/(tabs)/_layout.tsx` — Added `Tabs.Screen name="missions"` with flag icon between Recursos and Mapa
- `app/(tabs)/dashboard.tsx` — Changed EXPEDICIÓN button `router.push("/trips")` → `router.push("/missions")`

## Key Decisions
- Past missions use single `useTrips(page, limit)` call with client-side `completado`/`abortado` filter instead of dual API calls
- Elapsed time re-renders every 10s via `setInterval` in `useEffect`
- Past mission card `marginBottom: 16` (spacing.lg) per updated UI-SPEC
- Detail screen is dedicated `app/missions/[id].tsx` (not reusing `/trips`)
- INICIAR EXPEDICIÓN navigates to `/missions/new` (placeholder for future form)

## Verification
- 12/12 automated checks pass
- TypeScript typecheck: no new type errors beyond pre-existing issues
