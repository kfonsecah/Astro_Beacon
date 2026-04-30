# Roadmap: Astro_Beacon v1.2 (Integración API-Frontend)

**Milestone Goal**: Conectar el frontend React Native/Expo con el backend Node.js/Express existente, integrando todas las pantallas actuales con sus respectivos endpoints (sin crear nuevos endpoints ni pantallas).

**Phase Numbering**: Continúa desde v1.1 (fases 8-12), inicia en Fase 13.

---

## Phases

- [x] **Phase 14: API Client Setup** - Configurar TanStack Query y detección de red (completed 2026-04-30)
- [ ] **Phase 15: Domain Services + Hooks** - Capa de servicios y hooks para todos los dominios
- [ ] **Phase 16: Screen Integration** - Conectar todas las pantallas a datos reales de la API
- [ ] **Phase 17: Error Handling & Offline** - Error boundaries y soporte offline
- [x] **Phase 13: Auth Integration** - Conectar login con API (registro diferido) (completed 2026-04-30)

---

## Phase Details

### Phase 13: Auth Integration
**Goal**: Users can authenticate with the backend, maintain secure sessions, and access protected screens.
**Depends on**: Phase 16 (screens integrated with API data), Phase 17 (offline handling ready)
**Requirements**: AUTH-01, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, API-02, API-03, API-05, API-06
**Success Criteria** (what must be TRUE):
  1. User can log in with email/password and is redirected to home screen with no back button to login
  2. JWT and refresh tokens are stored securely in expo-secure-store (not accessible via unencrypted storage)
  3. Unauthenticated users are redirected to login screen when accessing protected routes
  4. Expired JWTs are automatically refreshed via axios interceptor without user intervention
  5. Register flow is deferred (no register screen or register integration in this phase)
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 13-01-PLAN.md — Update auth DTOs + store persistence (AUTH-03, AUTH-04, API-06)
- [ ] 13-02-PLAN.md — Login screen + refresh interceptor + protected routes (AUTH-01, AUTH-05, AUTH-06, AUTH-07, AUTH-08, API-02, API-03, API-05)

### Phase 14: API Client Setup
**Goal**: Configure TanStack Query for server state management and network detection for offline awareness.
**Depends on**: Nothing (first phase of this milestone)
**Requirements**: API-01, API-04
**Success Criteria** (what must be TRUE):
  1. App initializes with TanStack Query provider in root layout, enabling useQuery/useMutation in all screens
  2. Network connectivity status is detectable via NetInfo for offline-aware logic
**Plans**: TBD

### Phase 15: Domain Services + Hooks
**Goal**: Create service layer and custom hooks for all domain entities to fetch and mutate data.
**Depends on**: Phase 14 (TanStack Query + network detection)
**Requirements**: DOM-01, DOM-02, DOM-03, DOM-04, DOM-05, DOM-06, DOM-07, DOM-08, DOM-09
**Success Criteria** (what must be TRUE):
  1. All domain services (auth, astronauts, resources, logbook, species, trips, supplies) have typed API functions matching backend DTOs
  2. All domain hooks wrap TanStack Query with proper query keys and mutation support
  3. TypeScript types are correctly defined for all API request/response shapes
**Plans**: 2 plans

Plans:
- [ ] 15-01-PLAN.md — Create domain service layer (DOM-01 to DOM-08)
- [ ] 15-02-PLAN.md — Create domain hooks layer (DOM-09)

### Phase 16: Screen Integration
**Goal**: Connect all existing screens to real API data via domain hooks, with proper loading/error states and design system compliance.
**Depends on**: Phase 15 (domain hooks available)
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08, UI-09, UI-10, UI-11, UI-12, UI-13, UI-14, UI-15, UI-16
**Success Criteria** (what must be TRUE):
  1. Login/register screens consume useLogin/useRegister mutations with loading/error states
  2. All list screens (resources, logbook, species, trips, supplies) display real paginated data with pull-to-refresh
  3. All detail screens fetch and display real data via useQuery
  4. All screens use design system tokens (useTheme, constants) with zero hardcoded values
  5. All screens handle loading states with ActivityIndicator and user-friendly error messages
**Plans**: TBD
**UI hint**: yes

### Phase 17: Error Handling & Offline
**Goal**: Add error boundaries for graceful failure and offline detection with user feedback.
**Depends on**: Phase 16 (screens integrated, errors can occur)
**Requirements**: ERR-01, ERR-02, ERR-03, ERR-04, ERR-05, ERR-06
**Success Criteria** (what must be TRUE):
  1. All route files export ErrorBoundary for graceful error recovery
  2. Root layout (app/_layout.tsx) has a catch-all ErrorBoundary for unhandled errors
  3. OfflineBanner component appears when network is unavailable
  4. Network errors display user-friendly "Check connection" messages
  5. TanStack Query onlineManager pauses queries when offline and retries when reconnected
**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Plans | Status | Completed |
|-------|-------|--------|-----------|
| 13. Auth Integration | 1/2 | Complete    | 2026-04-30 |
| 14. API Client Setup | 1/1 | Complete   | 2026-04-30 |
| 15. Domain Services + Hooks | 2/2 | Planned | - |
| 16. Screen Integration | 0/X | Not started | - |
| 17. Error Handling & Offline | 0/X | Not started | - |

---

**Coverage**: 45/45 v1.2 requirements mapped ✓
**Last updated**: 2026-04-27
