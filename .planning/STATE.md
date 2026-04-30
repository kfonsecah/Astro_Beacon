---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: milestone
status: executing
last_updated: "2026-04-30T21:40:38.124Z"
last_activity: 2026-04-30
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 11
  completed_plans: 6
---

# State: Astro_Beacon

## Current Position

Phase: 16 (screen-integration) — EXECUTING
Plan: 2 of 6
**Milestone:** v1.2 Integración API-Frontend
**Status:** Executing Phase 16
**Last activity:** 2026-04-30

## Project Reference

**Core Value**: Ayudar al astronauta a sobrevivir en un planeta desconocido mediante información accesible, gestión de recursos y comunicación con la Tierra.
**Current Focus**: Milestone v1.2 Integración API-Frontend — Connecting React Native frontend to Node.js/Express backend

## Current Position
 
**Current Milestone**: v1.2 Integración API-Frontend
**Current Phase**: 15-domain-services-hooks (EXECUTING)
**Phase Status**: 2 of 2 plans complete (15-01 done, 15-02 done)
**Progress**: 1/5 phases completed (20%)
**Milestone Progress**: 21/45 requirements completed (AUTH-01, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, API-01, API-02, API-03, API-04, API-05, API-06, DOM-01 through DOM-08)

## Performance Metrics
 
- Phases Completed: 3
- Plans Executed: 6
- Requirements Met: 22 (AUTH-01, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, API-01, API-02, API-03, API-04, API-05, API-06, DOM-01 through DOM-08)
- Token Usage: TBD

## Accumulated Context

### Key Decisions

- Use TanStack Query v5 for server state management (research confirmed industry standard 2026)
- Use expo-secure-store for JWT storage (never AsyncStorage)
- All API integration uses existing endpoints only (no new endpoints/screens)
- LoginResponse uses accessToken + refreshToken (not single token) per Phase 09 backend
- SecureStore keys: 'access_token', 'refresh_token', 'user_data' (D-15, D-16)
- Migration from legacy 'auth_token' key via zustand persist migrate (D-17)
- Register flow deferred per D-07 — not wired to UI in 13-01
- Implement refresh token queue directly in api.ts (not separate token-refresh.ts)
- Login screen uses useLogin() mutation from TanStack Query
- Navigation after login uses router.replace('/(app)/(tabs)/home') to prevent back navigation

**Current focus:** Phase 16 — screen-integration
 
### Key Decisions (Phase 14)
 
- TanStack Query v5 configured with staleTime: 1min, gcTime: 5min, retry: 1
- Disabled refetchOnWindowFocus (not applicable to React Native)
- useNetworkStatus initializes with optimistic online state
- QueryClientProvider wrapped in root layout (app/_layout.tsx)

### Key Decisions (Phase 15-01)

- All services use the api.ts Axios instance with auth interceptors
- TypeScript types use Spanish names (Recurso, Especie) matching backend DTOs
- Paginated types follow PaginatedResponse<T> pattern with items/page/limit/total/totalPages
- Service interfaces exported (AuthService, ResourceService, etc.) for potential mocking in tests
- All API calls go through api.ts Axios instance (never raw axios)

### Key Decisions (Phase 15-02)
  
- Fixed service layer to not require userId parameter - backend extracts from JWT token (Rule 1 bug fix)
- Query key pattern follows D-05: ['domain', 'operation', id?]
- All mutations use queryClient.invalidateQueries() for cache invalidation
- Auth hooks call useAuthStore.getState() for immediate state updates (not hook inside mutation)

### Key Decisions (Phase 16-01)

- Connected Dashboard to real API data using useAstronautProfile and useAstronautDashboard hooks
- Replaced mockResources and mockAlerts with real astronaut profile and dashboard stats
- Fixed astronaut.service.ts to import DashboardStats from types-dtos (fixed duplicate interface and missing api import)
- Dashboard UI displays: astronaut nombre/estado, recursosCount, activeTrips, speciesDiscovered
- All loading/error states use design system tokens via useTheme

### Todos

- None yet

### Blockers

- None

## Session Continuity
   
- Last action: Completed 16-01-PLAN.md (Dashboard connected to API)
- Stopped At: Completed 16-01-PLAN.md
- Phase 16 context: Dashboard now uses real API data via TanStack Query hooks
- Next step: Execute next plan in phase (`/gsd-execute-phase 16` to run 16-02)
