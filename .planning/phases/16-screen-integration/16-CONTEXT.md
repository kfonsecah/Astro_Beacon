# Phase 16: Screen Integration - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect all screens to API data using hooks from Phase 15. Each module at a time - test, commit, then next.

Scope: ALL screens consuming real API data. NO new screens, NO new endpoints.

</domain>

<decisions>
## Implementation Decisions

### Module Structure
- **D-01:** 6 modules - one at a time for testing + commits
- **D-02:** Each module completes, test, commit, then next

### Modules

| Module | Screens | Hooks | UI Requirements |
|--------|--------|-------|-------------|
| **1:** Dashboard + Profile | dashboard.tsx, profile | useAstronautProfile, useAstronautDashboard | UI-03, UI-13, UI-14, UI-15, UI-16 |
| **2:** Resources | resources.tsx | useResources, useResourceById, useResourceAlerts | UI-04, UI-05, UI-14, UI-15, UI-16 |
| **3:** Logbook | logbook.tsx | useLogbookEntries, useLogbookEntryById | UI-06, UI-07, UI-14, UI-15, UI-16 |
| **4:** Species | bestiary.tsx | useSpecies, useSpeciesById | UI-08, UI-09, UI-14, UI-15, UI-16 |
| **5:** Trips | (needs trip screen) | useTrips, useTripById, useStartTrip, useCompleteTrip | UI-10, UI-11, UI-14, UI-15, UI-16 |
| **6:** Supplies | map.tsx might use | useSupplies, useNearbySupplies | UI-12, UI-14, UI-15, UI-16 |

### Common Patterns
- **D-03:** Loading: ActivityIndicator with theme colors
- **D-04:** Error: User-friendly messages (no raw API errors)
- **D-05:** Design: useTheme + constants (no hardcoded)
- **D-06:** Pull-to-refresh on lists (FlatList + RefreshControl)
- **D-07:** Pagination on lists (loadMore / infinite scroll)

### Auth (Phase 13 - ÚLTIMA)
- Login + Register use useLogin/useRegister
- But Phase 13 is last, so maybe handle auth later or skip for now

</decisions>

<canonical_refs>
## Canonical References

### Hooks (Phase 15)
- `src/hooks/useAstronaut.ts`
- `src/hooks/useResources.ts`
- `src/hooks/useLogbook.ts`
- `src/hooks/useSpecies.ts`
- `src/hooks/useTrips.ts`
- `src/hooks/useSupplies.ts`

### Screens
- `app/(tabs)/dashboard.tsx`
- `app/(tabs)/resources.tsx`
- `app/(tabs)/logbook.tsx`
- `app/(tabs)/bestiary.tsx`
- `app/(tabs)/map.tsx`

### Design System
- `.planning/PROJECT.md` § Design System
- `src/hooks/use-theme.ts`

</canonical_refs>

<specifics>
## Module Execution

Each module:
1. Modify screen to use hooks
2. Test locally
3. Commit: "feat(module{N}): connect {screen} to API"
4. Next module

</specifics>

<deferred>
## Deferred Ideas

- Auth (Phase 13) - login/register integration

</deferred>

---
*Phase: 16-screen-integration*
*Context gathered: 2026-04-28*