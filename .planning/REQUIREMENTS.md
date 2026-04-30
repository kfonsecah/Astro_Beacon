# Requirements: Astro_Beacon

**Defined:** 2026-04-27
**Core Value:** Ayudar al astronauta a sobrevivir en un planeta desconocido mediante información accesible, gestión de recursos y comunicación con la Tierra.

## v1.2 Requirements (Integración API-Frontend)

Requirements for API-Frontend integration milestone. Scope estricto: integrar pantallas existentes con endpoints existentes. NO crear endpoints nuevos, NO crear pantallas nuevas.

### Authentication (AUTH)

- [ ] **AUTH-01**: User can login with email and password (integrate with POST /api/v1/auth/login)
- [ ] **AUTH-02**: User can register with email and password (integrate with POST /api/v1/auth/register)
- [x] **AUTH-03**: JWT access token stored securely in expo-secure-store (not AsyncStorage)
- [x] **AUTH-04**: Refresh token stored securely for session persistence
- [ ] **AUTH-05**: JWT token automatically attached to API requests via axios request interceptor
- [ ] **AUTH-06**: Protected routes redirect unauthenticated users to login screen
- [ ] **AUTH-07**: Token refresh flow handles 401 responses automatically via axios response interceptor
- [ ] **AUTH-08**: After login, navigation stack replaced (router.replace) to prevent back to login

### API Client Setup (API)

- [ ] **API-01**: TanStack Query provider (QueryClientProvider) setup in root layout (app/_layout.tsx)
- [ ] **API-02**: Axios instance with request interceptor for JWT injection from Zustand store
- [ ] **API-03**: Axios response interceptor for global error handling (401, 403, 400, 500)
- [ ] **API-04**: Network detection with @react-native-community/netinfo for offline awareness
- [ ] **API-05**: Environment-based API URL via EXPO_PUBLIC_API_URL
- [x] **API-06**: Zustand persist middleware to sync auth state with expo-secure-store

### Domain Services & Hooks (DOM)

- [ ] **DOM-01**: Auth service + hook (useLogin, useRegister, useRefreshToken)
- [ ] **DOM-02**: Astronauts service + hook (useAstronautProfile, useAstronautStats)
- [ ] **DOM-03**: Resources service + hook (useResources with pagination, useResourceById, useCreateResource, useConsumeResource, useResourceStats)
- [ ] **DOM-04**: Logbook service + hook (useLogbookEntries with pagination, useLogbookEntryById, useCreateLogbookEntry)
- [ ] **DOM-05**: Species service + hook (useSpecies with pagination, useSpeciesById, useCreateSpecies)
- [ ] **DOM-06**: Trips service + hook (useTrips with pagination, useTripById, usePlanTrip, useStartTrip, useCompleteTrip)
- [ ] **DOM-07**: Supplies service + hook (useSupplies, useNearbySupplies, useCollectSupply)
- [ ] **DOM-08**: All services return TypeScript-typed data matching backend DTOs
- [ ] **DOM-09**: All hooks use TanStack Query useQuery/useMutation with proper query keys

### Screen Integration (UI)

- [ ] **UI-01**: Login screen consumes useLogin mutation with loading/error states
- [ ] **UI-02**: Register screen consumes useRegister mutation with loading/error states
- [ ] **UI-03**: Home/Dashboard screen consumes useAstronautProfile + useResourceStats via useQuery
- [ ] **UI-04**: Resources list screen consumes useResources with FlatList + pagination + pull-to-refresh
- [ ] **UI-05**: Resource detail screen consumes useResourceById via useQuery
- [ ] **UI-06**: Logbook list screen consumes useLogbookEntries with FlatList + pagination
- [ ] **UI-07**: Logbook detail screen consumes useLogbookEntryById via useQuery
- [ ] **UI-08**: Species list screen consumes useSpecies with FlatList + pagination
- [ ] **UI-09**: Species detail screen consumes useSpeciesById via useQuery
- [ ] **UI-10**: Trips list screen consumes useTrips with FlatList + pagination
- [ ] **UI-11**: Trip detail screen consumes useTripById via useQuery
- [ ] **UI-12**: Supplies list screen consumes useSupplies via useQuery
- [ ] **UI-13**: Profile screen consumes useAstronautProfile via useQuery
- [ ] **UI-14**: All screens handle loading states with ActivityIndicator using theme colors
- [ ] **UI-15**: All screens handle error states with user-friendly messages (no raw API errors)
- [ ] **UI-16**: All screens use design system (useTheme, constants, no hardcoded values)

### Error Handling & Offline (ERR)

- [ ] **ERR-01**: ErrorBoundary export in all route files for graceful error recovery
- [ ] **ERR-02**: Root layout (app/_layout.tsx) has catch-all ErrorBoundary
- [ ] **ERR-03**: Offline detection shows OfflineBanner component when network unavailable
- [ ] **ERR-04**: Network errors (no response) display user-friendly "Check connection" message
- [ ] **ERR-05**: Form validation errors display per-field with clear messaging
- [ ] **ERR-06**: TanStack Query onlineManager pauses queries when offline, retries when online

## v2 Requirements (Deferred)

Features acknowledged but deferred to future milestones.

### Advanced Integration

- **INT-01**: Optimistic updates for mutations (toggle status, increment/decrement)
- **INT-02**: Refresh on screen focus (data stays fresh when navigating back)
- **INT-03**: Haptic feedback on successful mutations (expo-haptics)
- **INT-04**: Cancel in-flight requests on component unmount

### Offline Support

- **OFF-01**: Queue failed mutations when offline, flush when reconnected
- **OFF-02**: Cache API responses for offline viewing (TanStack Query cache)

### Enhancements

- **ENH-01**: Image upload for species/avatar with FormData
- **ENH-02**: Expo Router data loaders for web version (SDK 55+)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Creating new backend endpoints | Use existing Phase 9-10 endpoints only (scope estricto) |
| Creating new screens | Integrate existing screens only (scope estricto) |
| Redux for server state | TanStack Query handles caching/updates better |
| Polling/long-polling for real-time | Not needed for this app; WebSocket/SSE if needed later |
| Manual useEffect+fetch in screens | Use TanStack Query useQuery instead |
| Storing JWT in AsyncStorage | Security risk; use expo-secure-store (encrypted) |
| Showing raw API error messages | Bad UX; map to user-friendly messages |
| Adding new features | Milestone focus is integration only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 13 | Pending |
| AUTH-02 | Phase 13 | Pending |
| AUTH-03 | Phase 13 | Complete |
| AUTH-04 | Phase 13 | Complete |
| AUTH-05 | Phase 13 | Pending |
| AUTH-06 | Phase 13 | Pending |
| AUTH-07 | Phase 13 | Pending |
| AUTH-08 | Phase 13 | Pending |
| API-01 | Phase 14 | Pending |
| API-02 | Phase 13 | Pending |
| API-03 | Phase 13 | Pending |
| API-04 | Phase 14 | Pending |
| API-05 | Phase 13 | Pending |
| API-06 | Phase 13 | Complete |
| DOM-01 | Phase 15 | Pending |
| DOM-02 | Phase 15 | Pending |
| DOM-03 | Phase 15 | Pending |
| DOM-04 | Phase 15 | Pending |
| DOM-05 | Phase 15 | Pending |
| DOM-06 | Phase 15 | Pending |
| DOM-07 | Phase 15 | Pending |
| DOM-08 | Phase 15 | Pending |
| DOM-09 | Phase 15 | Pending |
| UI-01 | Phase 16 | Pending |
| UI-02 | Phase 16 | Pending |
| UI-03 | Phase 16 | Pending |
| UI-04 | Phase 16 | Pending |
| UI-05 | Phase 16 | Pending |
| UI-06 | Phase 16 | Pending |
| UI-07 | Phase 16 | Pending |
| UI-08 | Phase 16 | Pending |
| UI-09 | Phase 16 | Pending |
| UI-10 | Phase 16 | Pending |
| UI-11 | Phase 16 | Pending |
| UI-12 | Phase 16 | Pending |
| UI-13 | Phase 16 | Pending |
| UI-14 | Phase 16 | Pending |
| UI-15 | Phase 16 | Pending |
| UI-16 | Phase 16 | Pending |
| ERR-01 | Phase 17 | Pending |
| ERR-02 | Phase 17 | Pending |
| ERR-03 | Phase 17 | Pending |
| ERR-04 | Phase 17 | Pending |
| ERR-05 | Phase 17 | Pending |
| ERR-06 | Phase 17 | Pending |

**Coverage:**
- v1.2 requirements: 45 total
- Mapped to phases: 45
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-27*
*Last updated: 2026-04-27 after initial definition*
