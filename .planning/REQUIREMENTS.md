# Requirements: Astro_Beacon

**Defined:** 2026-04-27
**Core Value:** Ayudar al astronauta a sobrevivir en un planeta desconocido mediante información accesible, gestión de recursos y comunicación con la Tierra.

## v1.2 Requirements (Integración API-Frontend)

Requirements for API-Frontend integration milestone. Scope estricto: integrar pantallas existentes con endpoints existentes. NO crear endpoints nuevos, NO crear pantallas nuevas.

### Authentication (AUTH)

- [x] **AUTH-01**: User can login with email and password (integrate with POST /api/v1/auth/login)
- [ ] **AUTH-02**: User can register with email and password (integrate with POST /api/v1/auth/register)
- [x] **AUTH-03**: JWT access token stored securely in expo-secure-store (not AsyncStorage)
- [x] **AUTH-04**: Refresh token stored securely for session persistence
- [x] **AUTH-05**: JWT token automatically attached to API requests via axios request interceptor
- [x] **AUTH-06**: Protected routes redirect unauthenticated users to login screen
- [x] **AUTH-07**: Token refresh flow handles 401 responses automatically via axios response interceptor
- [x] **AUTH-08**: After login, navigation stack replaced (router.replace) to prevent back to login

### API Client Setup (API)

- [x] **API-01**: TanStack Query provider (QueryClientProvider) setup in root layout (app/_layout.tsx)
- [x] **API-02**: Axios instance with request interceptor for JWT injection from Zustand store
- [x] **API-03**: Axios response interceptor for global error handling (401, 403, 400, 500)
- [x] **API-04**: Network detection with @react-native-community/netinfo for offline awareness
- [x] **API-05**: Environment-based API URL via EXPO_PUBLIC_API_URL
- [x] **API-06**: Zustand persist middleware to sync auth state with expo-secure-store

### Domain Services & Hooks (DOM)

- [x] **DOM-01**: Auth service + hook (useLogin, useRegister, useRefreshToken)
- [x] **DOM-02**: Astronauts service + hook (useAstronautProfile, useAstronautStats)
- [x] **DOM-03**: Resources service + hook (useResources with pagination, useResourceById, useCreateResource, useConsumeResource, useResourceStats)
- [x] **DOM-04**: Logbook service + hook (useLogbookEntries with pagination, useLogbookEntryById, useCreateLogbookEntry)
- [x] **DOM-05**: Species service + hook (useSpecies with pagination, useSpeciesById, useCreateSpecies)
- [x] **DOM-06**: Trips service + hook (useTrips with pagination, useTripById, usePlanTrip, useStartTrip, useCompleteTrip)
- [x] **DOM-07**: Supplies service + hook (useSupplies, useNearbySupplies, useCollectSupply)
- [x] **DOM-08**: All services return TypeScript-typed data matching backend DTOs
- [x] **DOM-09**: All hooks use TanStack Query useQuery/useMutation with proper query keys

### Screen Integration (UI)

- [ ] **UI-01**: Login screen consumes useLogin mutation with loading/error states
- [ ] **UI-02**: Register screen consumes useRegister mutation with loading/error states
- [x] **UI-03**: Home/Dashboard screen consumes useAstronautProfile + useResourceStats via useQuery
- [x] **UI-04**: Resources list screen consumes useResources with FlatList + pagination + pull-to-refresh
- [ ] **UI-05**: Resource detail screen consumes useResourceById via useQuery
- [x] **UI-06**: Logbook list screen consumes useLogbookEntries with FlatList + pagination
- [ ] **UI-07**: Logbook detail screen consumes useLogbookEntryById via useQuery
- [x] **UI-08**: Species list screen consumes useSpecies with FlatList + pagination
- [ ] **UI-09**: Species detail screen consumes useSpeciesById via useQuery
- [x] **UI-10**: Trips list screen consumes useTrips with FlatList + pagination
- [ ] **UI-11**: Trip detail screen consumes useTripById via useQuery
- [x] **UI-12**: Supplies list screen consumes useSupplies via useQuery
- [x] **UI-13**: Profile screen consumes useAstronautProfile via useQuery
- [x] **UI-14**: All screens handle loading states with ActivityIndicator using theme colors
- [x] **UI-15**: All screens handle error states with user-friendly messages (no raw API errors)
- [x] **UI-16**: All screens use design system (useTheme, constants, no hardcoded values)

### Error Handling & Offline (ERR)

- [x] **ERR-01**: ErrorBoundary export in all route files for graceful error recovery
- [x] **ERR-02**: Root layout (app/_layout.tsx) has catch-all ErrorBoundary
- [x] **ERR-03**: Offline detection shows OfflineBanner component when network unavailable
- [x] **ERR-04**: Network errors (no response) display user-friendly "Check connection" message
- [ ] **ERR-05**: Form validation errors display per-field with clear messaging
- [x] **ERR-06**: TanStack Query onlineManager pauses queries when offline, retries when online

## AI Camera Detection Requirements (Phases 23-25)

Requirements for AI species identification with camera. Added 2026-05-05.

### Backend AI (AI-BE)

- [ ] **AI-01**: `POST /api/v1/species/identify` acepta `{ imageBase64: string }` y retorna `{ classification, dangerLevel, name, description, confidence }`
- [ ] **AI-02**: Google Cloud Vision API analiza la imagen y mapea labels a enums `SpeciesClassification` y `DangerLevel`
- [ ] **AI-03**: Fallback determinístico retorna `{ classification: "desconocido", dangerLevel: "cauteloso", confidence: 0 }` si Vision API falla

### Frontend Camera (AI-CAM)

- [ ] **AI-04**: expo-image-picker instalado con permisos declarados en app.json (cámara + galería, iOS + Android)
- [ ] **AI-05**: Imagen capturada comprimida con quality: 0.4, maxWidth: 800 antes de convertir a base64
- [ ] **AI-06**: Pantalla `app/(app)/species/new.tsx` con formulario completo (nombre, clasificación, peligro, notas, imagen preview); FAB en bestiary.tsx navega a ella

### AI Identification UX (AI-UX)

- [ ] **AI-07**: Botón "IDENTIFICAR CON IA" en formulario de nueva especie → llama al endpoint → pre-llena campos automáticamente (campos editables)
- [ ] **AI-08**: Animación de "escaneando..." (Reanimated 4) visible durante el análisis; chip de confianza con color según nivel
- [ ] **AI-09**: expo-speech instalado; botón de audio en species detail lee nombre, clasificación y descripción en voz alta

### Missing Screens (SCREEN)

- [ ] **SCREEN-01**: `app/species/[id].tsx` — Pantalla de detalle de especie: foto, nombre, clasificación, nivel de peligro, descripción, notas, confianza IA, botón de audio (documentada en MOCKUPS.md §3.7, UI-09 pending)
- [ ] **SCREEN-02**: `app/species/identify.tsx` — Modal de identificación IA: vista de cámara, overlay de escaneo, resultado de clasificación, opción confirmar/corregir (documentada en MOCKUPS.md §3.8)
- [ ] **SCREEN-03**: `app/log-resource/index.tsx` — Formulario de movimiento de recurso: selector de recurso, tipo ingreso/egreso, cantidad, razón, vinculación a viaje (documentada en MOCKUPS.md §3.10)

### Gestures (GEST)

- [ ] **GEST-01**: Gesto 1 — Swipe en lista (bestiary o resources) para acción contextual usando react-native-gesture-handler Swipeable (requerimiento del curso: mínimo 2 gestos)
- [ ] **GEST-02**: Gesto 2 — Long-press en species card para preview rápido, O pinch-to-zoom en foto de especie en detalle (requerimiento del curso: mínimo 2 gestos)

### Log Resource (LOGR)

- [ ] **LOGR-01**: `log-resource/index.tsx` conectada a `useConsumeResource`/`useCreateResource`; botón en resources.tsx navega a esta pantalla; retorna con datos actualizados tras guardar

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
| AUTH-01 | Phase 13 | Complete |
| AUTH-02 | Phase 13 | Pending |
| AUTH-03 | Phase 13 | Complete |
| AUTH-04 | Phase 13 | Complete |
| AUTH-05 | Phase 13 | Complete |
| AUTH-06 | Phase 13 | Complete |
| AUTH-07 | Phase 13 | Complete |
| AUTH-08 | Phase 13 | Complete |
| API-01 | Phase 14 | Complete |
| API-02 | Phase 13 | Complete |
| API-03 | Phase 13 | Complete |
| API-04 | Phase 14 | Complete |
| API-05 | Phase 13 | Complete |
| API-06 | Phase 13 | Complete |
| DOM-01 | Phase 15 | Complete |
| DOM-02 | Phase 15 | Complete |
| DOM-03 | Phase 15 | Complete |
| DOM-04 | Phase 15 | Complete |
| DOM-05 | Phase 15 | Complete |
| DOM-06 | Phase 15 | Complete |
| DOM-07 | Phase 15 | Complete |
| DOM-08 | Phase 15 | Complete |
| DOM-09 | Phase 15 | Complete |
| UI-01 | Phase 16 | Pending |
| UI-02 | Phase 16 | Pending |
| UI-03 | Phase 16 | Complete |
| UI-04 | Phase 16 | Complete |
| UI-05 | Phase 16 | Pending |
| UI-06 | Phase 16 | Complete |
| UI-07 | Phase 16 | Pending |
| UI-08 | Phase 16 | Complete |
| UI-09 | Phase 16 | Pending |
| UI-10 | Phase 16 | Complete |
| UI-11 | Phase 16 | Pending |
| UI-12 | Phase 16 | Complete |
| UI-13 | Phase 16 | Complete |
| UI-14 | Phase 16 | Complete |
| UI-15 | Phase 16 | Complete |
| UI-16 | Phase 16 | Complete |
| ERR-0 | Phase 21 | Complete |
| ERR-0 | Phase 21 | Complete |
| ERR-0 | Phase 21 | Complete |
| ERR-0 | Phase 21 | Complete |
| ERR-0 | Phase 21 | Pending |
| ERR-0 | Phase 21 | Complete |

**Coverage:**
- v1.2 requirements: 45 total
- Mapped to phases: 45
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-27*
*Last updated: 2026-05-05 after Phase 22 code cleanup*
