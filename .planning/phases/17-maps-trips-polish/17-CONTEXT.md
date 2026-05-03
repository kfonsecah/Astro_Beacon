# Phase 17: Maps & Trips Polish - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers: Fix map crash (formatContents), implement trip start flow with confirmation and oxygen warning, complete map view with react-native-maps showing supply markers + category legend, and implement full trip execution with real-time GPS tracking, oxygen countdown, and resource recording upon return.

**In scope:**
- Fix `formatContents()` crash in map.tsx
- Map view with react-native-maps: supply markers with real GPS, route calculation from user position
- Category symbols legend off-map
- Trip start: "INICIAR VIAJE" → confirmation dialog with oxygen warning → API call
- Real-time trip execution: GPS tracking, oxygen level decreases in real-time
- Trip completion: record resources collected upon arrival and return

**Out of scope:**
- Creating new backend endpoints (use existing: POST /api/v1/trips/:id/start, etc.)
- Creating new screens (use existing map.tsx, trips.tsx)
</domain>

<decisions>
## Implementation Decisions

### Map Display & Navigation
- **D-01:** Full navigation mode with react-native-maps — interactive map with real GPS
- **D-02:** Route calculation from user's real GPS position to supply locations (client-side or third-party service)
- **D-03:** Supply markers on map showing location, status color (pendiente=warning, entregado=success, recogido=info)

### Supply Contents Format
- **D-04:** `formatContents()` displays category symbols + quantity for each resource item
- **D-05:** Off-map legend explaining each category symbol and its meaning

### Trip Start Behavior
- **D-06:** "INICIAR VIAJE" triggers confirmation dialog with oxygen cost warning
- **D-07:** On confirm: call `useStartTrip()` mutation, refresh trip list
- **D-08:** Trip status changes to "activo" after successful start

### Trip Execution (Real-time)
- **D-09:** Active trip shows real-time GPS tracking on map
- **D-10:** Oxygen level decreases in real-time during trip (countdown timer)
- **D-11:** On arrival/return: app records resources collected during trip

### the agent's Discretion
- Exact implementation of client-side route calculation (library choice: react-native-maps Polyline vs third-party routing service)
- Real-time oxygen countdown mechanism (setInterval vs requestAnimationFrame vs native timer)
- How resource collection is recorded (modal, inline form, or post-trip summary screen)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Trips & Supplies
- `src/types-dtos/viaje.dto.ts` — Viaje, CreateViajeDTO, UpdateViajeDTO types
- `src/types-dtos/suministro.dto.ts` — Suministro, SuministroConDistancia types
- `src/types-dtos/recurso.dto.ts` — ResourceItem type (used in supply contents)
- `src/hooks/useTrips.ts` — useStartTrip, useCompleteTrip, useAbortTrip mutations
- `src/hooks/useSupplies.ts` — useSupplies hook with pagination
- `src/services/trip.service.ts` — API calls for trip operations
- `src/services/supply.service.ts` — API calls for supply operations

### Screens
- `app/(tabs)/map.tsx` — Map screen (fix formatContents, add react-native-maps)
- `app/trips.tsx` — Trips screen (implement trip start flow)

### Design System
- `src/theme/dark.ts` — Dark theme tokens (background, surface, primary, etc.)
- `src/theme/light.ts` — Light theme tokens
- `src/constants/colors.ts` — Color constants
- `src/hooks/use-theme.ts` — useTheme hook

### Backend Endpoints (existing, Phase 10)
- POST `/api/v1/trips/:id/start` — Start trip
- POST `/api/v1/trips/:id/complete` — Complete trip
- POST `/api/v1/trips/:id/abort` — Abort trip
- GET `/api/v1/suministros` — List supplies with location data

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **react-native-maps**: Not currently installed — needs `expo install react-native-maps` (check Expo compatibility)
- **useStartTrip()** in `src/hooks/useTrips.ts` — already exists, calls `tripService.start(id, data)`
- **useSupplies()** in `src/hooks/useSupplies.ts` — already has pagination, returns `Suministro[]` with `location.lat/lng`
- **statusColorMap** pattern in both map.tsx and trips.tsx — reuse for map markers
- **HudHeader** component — use in map header for consistent HUD aesthetic

### Established Patterns
- TanStack Query mutations with `useMutation` + `queryClient.invalidateQueries`
- Loading states: `ActivityIndicator` with `tc.primary` color
- Error states: red text with user-friendly messages (no raw API errors)
- Confirmation dialogs: not yet established — agent's discretion (can use `Alert.alert` from react-native)
- Real-time updates: no existing pattern — agent decides (setInterval, useEffect cleanup)

### Integration Points
- **Map tab** (`app/(tabs)/map.tsx`): replace placeholder View with `MapView` from react-native-maps
- **Trips screen** (`app/trips.tsx`): wire `onPress` to confirmation dialog → `useStartTrip()` mutation
- **Oxygen display**: Dashboard already shows oxygen stats — trip screen could show real-time countdown reusing similar styling
- **GPS**: use `@react-native-community/netinfo` pattern already exists in `useNetworkStatus.ts` — GPS needs `expo-location`

</code_context>

<specifics>
## Specific Ideas

- Map shows category symbols (e.g., 💧 for water, 🍎 for food, 💊 for medical) + quantity in callout/Marker
- Off-map legend: View at bottom of map or collapsible panel explaining symbols
- Oxygen warning dialog: "Este viaje consumirá X unidades de oxígeno. ¿Continuar?"
- Real-time oxygen: countdown timer displayed prominently during active trip (HUD-style monospace, large font)
- Resource recording: on trip completion, show collected resources from supply drops visited

</specifics>

<deferred>
## Deferred Ideas

None — all discussed features included in Phase 17 scope.

</deferred>

---
*Phase: 17-maps-trips-polish*
*Context gathered: 2026-05-03*
