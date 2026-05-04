# Roadmap: Astro_Beacon v1.2 (Integración API-Frontend)

**Milestone Goal**: Conectar el frontend React Native/Expo con el backend Node.js/Express existente, integrando todas las pantallas actuales con sus respectivos endpoints (sin crear nuevos endpoints ni pantallas).

**Phase Numbering**: Continúa desde v1.1 (fases 8-12), inicia en Fase 13.

---

## Phases

- [x] **Phase 13: Auth Integration** - Conectar login con API (registro diferido) (completed 2026-04-30)
- [x] **Phase 14: API Client Setup** - Configurar TanStack Query y detección de red (completed 2026-04-30)
- [x] **Phase 15: Domain Services + Hooks** - Capa de servicios y hooks para todos los dominios (completed 2026-04-30)
- [x] **Phase 16: Screen Integration** - Conectar todas las pantallas a datos reales de la API (6/6 plans done)
- [x] **Phase 17: Maps & Trips Polish** - Fix map crash, implement trip start, complete map view, implement trip execution, fix map panning, add supply request feature (5/5 plans done)
- [ ] **Phase 19: Critical Bug Fixes** - Fix trip activation (TripStore desconectado), paginación sin acumulación, double setAuth en login
- [ ] **Phase 20: Design System Compliance** - Eliminar hex hardcodeados en map.tsx y trips.tsx introducidos en fases 16-17
- [ ] **Phase 21: Error Handling & Offline** - Error boundaries y soporte offline (era Phase 18, reposicionada post-bugfixes)
- [ ] **Phase 22: Code Cleanup** - Eliminar código muerto, artefactos de dev, actualizar documentación

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
- [x] 15-01-PLAN.md — Create domain service layer (DOM-01 to DOM-08)
- [x] 15-02-PLAN.md — Create domain hooks layer (DOM-09)

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
**Plans**: 6 plans

Plans:
- [x] 16-01-PLAN.md — Connect Dashboard to API (UI-03, UI-13, UI-14, UI-15, UI-16)
- [x] 16-02-PLAN.md — Connect Resources to API with pagination (UI-04, UI-05, UI-14, UI-15, UI-16)
- [ ] 16-03-PLAN.md — Connect Logbook to API with pagination (UI-06, UI-07, UI-14, UI-15, UI-16)
- [ ] 16-04-PLAN.md — Connect Bestiary (Species) to API with pagination (UI-08, UI-09, UI-14, UI-15, UI-16)
- [ ] 16-05-PLAN.md — Connect Map/Supplies to API (UI-12, UI-14, UI-15, UI-16)
- [ ] 16-06-PLAN.md — Create Trips screens and connect to API (UI-10, UI-11, UI-14, UI-15, UI-16)
**UI hint**: yes

### Phase 17: Maps & Trips Polish
**Goal**: Fix map crash (formatContents), implement trip start flow with confirmation and oxygen warning, complete map view with react-native-maps showing supply markers, and implement full trip execution with real-time GPS tracking and oxygen countdown.
**Depends on**: Phase 16 (screens integrated)
**Requirements**: TBD
**Success Criteria** (what must be TRUE):
  1. `app/(tabs)/map.tsx` formatContents() no longer throws error
  2. "INICIAR VIAJE" button in trips screen triggers trip start flow with oxygen warning
  3. Map view renders actual map with supply markers (not placeholder)
  4. Active trip shows real-time GPS tracking on map
  5. Oxygen level decreases in real-time during trip
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [x] 17-01-PLAN.md — Fix formatContents, create CategoryLegend, create TripStore (depends on: none)
- [x] 17-02-PLAN.md — Implement MapView with supply markers and user location (depends on: 17-01)
- [x] 17-03-PLAN.md — Implement trip start flow with confirmation dialog (depends on: 17-01)
- [x] 17-04-PLAN.md — Real-time GPS tracking and oxygen countdown (depends on: 17-02, 17-03)

### Phase 19: Critical Bug Fixes
**Goal**: Corregir bugs críticos que dejan features completas como dead code y rompen la paginación infinita.
**Depends on**: Nothing (fixes sobre código existente)
**Requirements**: N/A (deuda técnica descubierta en auditoría post-fase-07)
**Success Criteria** (what must be TRUE):
  1. Iniciar un viaje activa el indicador GPS y countdown de oxígeno en map.tsx (TripStore.activeTrip != null)
  2. Completar/abortar un viaje limpia el TripStore (activeTrip = null)
  3. setAuth se llama exactamente una vez por login exitoso
  4. Scroll al fondo en Bestiary, Logbook y Trips carga página 2 sin perder los items de página 1
**Plans**: 2 plans
**UI hint**: no

Plans:
- [ ] 19-01-PLAN.md — Fix trip activation (useStartTrip → setActiveTrip) + double setAuth en login
- [ ] 19-02-PLAN.md — Fix pagination accumulation en bestiary, logbook, trips

### Phase 20: Design System Compliance
**Goal**: Eliminar hex hardcodeados introducidos en fases 16-17 en map.tsx y trips.tsx, extendiendo colors.ts.
**Depends on**: Phase 19 (código funcional antes de limpiar estilos)
**Requirements**: Invariante de Fase 07 (cero hex fuera de constants/ y theme/)
**Success Criteria** (what must be TRUE):
  1. grep '#[0-9a-fA-F]{3,8}' en map.tsx y trips.tsx retorna 0 resultados
  2. colors.ts tiene secciones trip status y supply category con constantes nombradas
  3. Cero cambios de comportamiento ni UI visible
**Plans**: 1 plan
**UI hint**: no

Plans:
- [ ] 20-01-PLAN.md — Extend colors.ts + replace hardcoded hex en map.tsx y trips.tsx

### Phase 21: Error Handling & Offline
**Goal**: Implementar ErrorBoundary en todos los route files, OfflineBanner en tabs layout, y conectar TanStack Query onlineManager a NetInfo.
**Depends on**: Phase 20 (código limpio antes de agregar capas)
**Requirements**: ERR-01, ERR-02, ERR-03, ERR-04, ERR-06
**Success Criteria** (what must be TRUE):
  1. Todos los route files exportan ErrorBoundary — un crash en una pantalla no derrumba la app
  2. app/_layout.tsx tiene ErrorBoundary catch-all
  3. OfflineBanner aparece en todas las tabs cuando isConnected = false
  4. TanStack Query pausa queries cuando offline y reintenta al reconectar
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 21-01-PLAN.md — ErrorBoundary en todos los route files + RouteErrorFallback component
- [ ] 21-02-PLAN.md — OfflineBanner en tabs layout + onlineManager en queryClient

### Phase 22: Code Cleanup
**Goal**: Eliminar código muerto, artefactos de desarrollo expuestos, y sincronizar documentación con el estado real.
**Depends on**: Phase 21 (todo el trabajo funcional completado)
**Requirements**: N/A (housekeeping)
**Success Criteria** (what must be TRUE):
  1. token-refresh.ts y auth.context.tsx eliminados sin imports rotos
  2. Botón reanimated-test removido del dashboard
  3. REQUIREMENTS.md checkboxes reflejan estado real
  4. STATE.md actualizado con conteos correctos
**Plans**: 1 plan
**UI hint**: no

Plans:
- [ ] 22-01-PLAN.md — Delete dead code + remove dev button + update REQUIREMENTS.md + STATE.md

---

## Progress

| Phase | Plans | Status | Completed |
|-------|-------|--------|-----------|
| 13. Auth Integration | 2/2 | Complete | 2026-04-30 |
| 14. API Client Setup | 1/1 | Complete | 2026-04-30 |
| 15. Domain Services + Hooks | 2/2 | Complete | 2026-04-30 |
| 16. Screen Integration | 6/6 | Complete | 2026-05-01 |
| 17. Maps & Trips Polish | 5/5 | Complete | 2026-05-04 |
| 19. Critical Bug Fixes | 0/2 | Not started | - |
| 20. Design System Compliance | 0/1 | Not started | - |
| 21. Error Handling & Offline | 0/2 | Not started | - |
| 22. Code Cleanup | 0/1 | Not started | - |

---

**Coverage**: 45/45 v1.2 requirements mapped ✓
**Note**: Phase 18 renumbered to Phase 21. Phases 19, 20, 22 agregadas post-auditoría (2026-05-04).
**Last updated**: 2026-05-04
