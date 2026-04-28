# Project Research Summary

**Project:** Astro_Beacon — API-Frontend Integration (Milestone v1.2)
**Domain:** React Native / Expo mobile app integrating with Node.js/Express REST API
**Researched:** 2026-04-27
**Confidence:** HIGH

## Executive Summary

Astro_Beacon is a planetary exploration mobile app built with React Native/Expo that needs to integrate with an existing Node.js/Express backend (Phases 9-10 complete). The industry-standard approach for this integration in 2026 uses **TanStack Query v5** for server state management, **Zustand** for client state (already installed), and **axios** with interceptors for API communication (already configured). This combination eliminates manual loading/error/caching boilerplate while maintaining the existing codebase investments.

The recommended architecture follows a **layered service pattern** with per-domain service files (auth, astronauts, resources, logbook, species, trips, supplies) that expose TypeScript-typed functions, custom hooks wrapping TanStack Query, and screens consuming those hooks. Auth integration comes first since all other endpoints require JWT authentication. TanStack Query setup is a parallel prerequisite that enables all downstream data fetching.

Key risks include **insecure token storage** (must use expo-secure-store, never AsyncStorage), **unhandled token expiration** (implement refresh token rotation in axios interceptors), and **design system inconsistency** during integration (enforce theme/constants usage per PROJECT.md rules). The existing stack is solid — the integration primarily adds TanStack Query and connects existing screens to real API data with proper error handling and loading states.

## Key Findings

### Recommended Stack

The stack is intentionally minimal, building on what's already installed and working. Axios stays because `src/services/api.ts` already has working interceptors. TanStack Query is the key addition for eliminating manual data-fetching boilerplate.

**Core technologies:**
- **@tanstack/react-query v5.100.5**: Server state management — industry standard 2026, handles caching/retries/background refetch automatically
- **axios ^1.14.0**: HTTP client with interceptors — already configured with JWT injection, keep it
- **zustand ^5.0.12**: Client state (auth session, UI state) — already installed, add `persist` middleware for SecureStore
- **expo-secure-store ~15.0.8**: Encrypted token storage — hardware-backed encryption, REQUIRED for JWT
- **@react-native-community/netinfo ^12.0.1**: Network detection — enables offline-aware queries in TanStack Query

### Expected Features

**Must have (table stakes):**
- TanStack Query for all server state — eliminates useEffect+fetch boilerplate
- Login/Register with useMutation — navigate via router.replace() after success
- Protected routes via Expo Router Stack.Protected — redirect unauthenticated users
- List views with FlatList + useQuery — paginated resources, species, trips, etc.
- Detail views with useQuery by ID — tap to view resource/species/logbook details
- Pull-to-refresh with RefreshControl — user expects swipe-down reload
- Token refresh flow in axios interceptor — catch 401, refresh, retry original request
- Loading/error states in all screens — ActivityIndicator and user-friendly error display

**Should have (competitive):**
- Optimistic updates for mutations — UI updates instantly, rolls back on error
- Refresh on screen focus — data stays fresh when navigating back
- Offline detection with @react-native-community/netinfo — show OfflineBanner, pause queries
- Haptic feedback on actions — expo-haptics for tactile confirmation

**Defer (v2+):**
- Redux for server state — TanStack Query handles this better
- Polling/long-polling for real-time — not needed for this app
- Creating new backend endpoints — use existing Phase 9-10 endpoints only
- Adding new screens — integrate existing screens only in this milestone

### Architecture Approach

The architecture uses a **four-layer pattern**: UI screens consume custom hooks → hooks wrap TanStack Query → hooks call service functions → services use axios instance. Each domain (auth, astronauts, resources, logbook, species, trips, supplies) gets its own service file (`src/services/*.service.ts`) and hook file (`src/hooks/use*.ts`), with TypeScript types in `src/types-dtos/`. TanStack Query initializes in `app/_layout.tsx` with QueryClientProvider. Error boundaries use Expo Router's built-in `ErrorBoundary` export in route files. Build order: Auth Integration → TanStack Query Setup → Domain Services + Hooks (parallel) → Screen Integration → Error Boundaries.

**Major components:**
1. **Service Layer** — Pure API call functions per domain, TypeScript types, error normalization
2. **Hooks Layer** — Wrap TanStack Query hooks, domain-specific logic, optimistic updates
3. **API Client (axios)** — Base instance with request/response interceptors, auto-attach JWT from Zustand
4. **UI Layer** — Screens using hooks for data, design system compliance (theme + constants)

### Critical Pitfalls

1. **Insecure Token Storage** — Never use AsyncStorage for JWT (unencrypted). Use expo-secure-store with hardware-backed encryption. Detection: search for `AsyncStorage.getItem('token')`.
2. **Unhandled Token Expiration** — Access tokens expire; implement refresh token rotation in axios response interceptor. Catch 401 → call /auth/refresh → retry original request → logout if refresh fails.
3. **Incorrect Navigation After Login** — Use `router.replace()` not `router.navigate()` after login to prevent back-button to login screen. Reset navigation stack completely.
4. **Design System Inconsistency** — When replacing mocked data, never hardcode colors/spacing. Always use `useTheme()` and `spacing` constants. ESLint rule recommended to ban hardcoded values.
5. **Memory Leaks from Unmounted Components** — Use AbortController or TanStack Query (auto-cancels on unmount). For manual fetches, cleanup in useEffect.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Auth Integration
**Rationale:** Foundation for everything — all other endpoints require JWT in Authorization header. Must complete first.
**Delivers:** Login/register screens connected to API, token storage in SecureStore, useAuth hook with useMutation
**Addresses:** Login/Register (table stakes), Protected routes, Token refresh flow
**Avoids:** Insecure Token Storage, Unhandled Token Expiration, Incorrect Navigation After Login
**Uses:** axios interceptors, expo-secure-store, zustand persist middleware

### Phase 2: TanStack Query Setup
**Rationale:** Parallel to Phase 1 — required before any domain hooks can be created. One-time setup.
**Delivers:** QueryClientProvider in app/_layout.tsx, onlineManager with NetInfo, default query options
**Uses:** @tanstack/react-query, @react-native-community/netinfo
**Implements:** API Client layer initialization

### Phase 3: Domain Services + Hooks (Parallel)
**Rationale:** All domains are independent after auth works. Build in parallel for efficiency.
**Delivers:** 7 service files + 7 hook files with TypeScript types for all domains
- 3a: Astronauts (profile, stats)
- 3b: Resources (list, detail, consume, stats)
- 3c: Logbook (list, detail, create entry)
- 3d: Species (catalog, detail, create)
- 3e: Trips (plan, start, complete, detail)
- 3f: Supplies (inventory, nearby search, collect)
**Depends on:** Phase 1 (JWT required), Phase 2 (TanStack Query)
**Implements:** Service Layer + Hooks Layer for all domains

### Phase 4: Screen Integration
**Rationale:** Connect existing screens to real data via hooks. Highest visibility to user.
**Delivers:** Update all screens in app/(app)/(tabs)/ to use domain hooks
- Home/Dashboard (useAstronauts for profile + stats)
- Resources list + detail + create (useResources)
- Logbook list + detail + create (useLogbook)
- Species list + detail + create (useSpecies)
- Trips list + detail + mutations (useTrips)
- Supplies list + collect (useSupplies)
- Profile screen (useAstronauts)
**Avoids:** Design System Inconsistency (enforce theme tokens)
**Implements:** UI Layer consuming hooks

### Phase 5: Error Boundaries + Offline Support
**Rationale:** Production hardening. Add error boundaries to all routes, offline detection.
**Delivers:** ErrorBoundary export in all screen files, root layout catch-all, OfflineBanner integration, network-aware queries
**Avoids:** Unhandled Offline State, Memory Leaks
**Implements:** Error Boundary pattern, offline detection with NetInfo

### Phase Ordering Rationale

- **Auth first** because JWT is required for all other endpoints (hard dependency)
- **TanStack Query setup parallel** to auth because it's a one-time config with no dependencies
- **Domain services in parallel** because they're independent after auth exists
- **Screen integration after services** because screens consume the hooks
- **Error boundaries last** because they wrap working screens (lowest priority for initial functionality)

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Domain Services):** Each domain has unique API response shapes — use `/gsd-research-phase` to verify endpoint contracts against backend ROADMAP.md
- **Phase 3 (Token Refresh):** Refresh token rotation needs exact backend response format — verify /auth/refresh endpoint in Phase 9 backend

Phases with standard patterns (skip research-phase):
- **Phase 1 (Auth):** Well-documented pattern (TanStack Query useMutation + SecureStore)
- **Phase 2 (TanStack Setup):** Official docs pattern, straightforward provider setup
- **Phase 4 (Screen Integration):** Standard hook consumption pattern, design system compliance is enforced
- **Phase 5 (Error Boundaries):** Expo Router built-in feature, well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official docs for all libraries, versions verified compatible with React Native 0.81.5 + Expo SDK 54 |
| Features | HIGH | TanStack Query v5 docs + multiple 2025-2026 community articles confirm patterns |
| Architecture | HIGH | Multiple current sources (2025-2026) confirm layered service pattern + per-domain organization |
| Pitfalls | HIGH | Based on Expo docs, JWT best practices (Auth0), and React Native official docs |

**Overall confidence:** HIGH — All recommendations verified against official documentation (Expo, TanStack Query, React Native) and cross-checked with 2025-2026 community articles. Existing codebase alignment verified (axios configured, zustand installed, Expo Router structure).

### Gaps to Address

- **Token refresh implementation details** — Need to verify exact backend response format for `/auth/refresh` endpoint (Phase 9 backend). Will research during Phase 1 planning.
- **Pagination query key structure** — Need to decide between `useQuery` with page state vs `useInfiniteQuery`. Recommend `useQuery` with `keepPreviousData` for simplicity based on React Native FlatList pattern.
- **Image upload for species/avatar** — May need `FormData` + special handling for React Native (Axios patchForm issue on Android, per GitHub #6968). Defer to Phase 4 implementation.
- **ResourceContext for camp-wide alerts** — Optional global state for low-resource warnings. Decide during Phase 5 if needed.

## Sources

### Primary (HIGH confidence)
- **TanStack Query React Native Docs** (tanstack.com/query/v5) — useQuery, useMutation, optimistic updates, refresh on focus
- **Expo Documentation** (docs.expo.dev) — expo-secure-store v54, Expo Router authentication, ErrorBoundary pattern
- **React Native Official Docs** (reactnative.dev) — FlatList, RefreshControl, pagination patterns
- **Auth0 JWT Best Practices** (auth0.com/blog) — Refresh token rotation, secure storage guidance
- **Astro_Beacon PROJECT.md** — Design system rules, HUD aesthetic, cross-platform requirements
- **Astro_Beacon ROADMAP.md** — Existing backend endpoints (Phase 9-10), pagination support

### Secondary (MEDIUM confidence)
- **OneUptime: React Native TanStack Query** (2026-01-15) — Comprehensive integration guide with code examples
- **React Native Relay: Zustand + TanStack Query** (2026-02-07) — State management patterns
- **Mastering React Query in 2025** (dev.to) — Pagination, offline support, devtools
- **@tanstack/react-query npm** (v5.100.5) — Version compatibility verified
- **@react-native-community/netinfo npm** (v12.0.1) — React Native 0.76+ required, verified compatible

---
*Research completed: 2026-04-27*
*Ready for roadmap: yes*
