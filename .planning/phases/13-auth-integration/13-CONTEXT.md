# Phase 13: Auth Integration - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect frontend React Native/Expo app to backend auth endpoints (login, register, token refresh). Replace mock implementation in auth.store.ts with real API calls. Implement secure token storage and automatic token refresh via axios interceptor. Set up protected routes using Expo Router Stack.Protected.

Scope: ONLY integrate existing backend endpoints (Phase 9) with existing frontend screens. NO new endpoints, NO new screens.
</domain>

<decisions>
## Implementation Decisions

### Token Refresh Flow
- **D-01:** Auto-refresh then retry — axios response interceptor catches 401 → calls `/api/v1/auth/refresh` with stored refresh token → retries original request with new access token
- **D-02:** Queue parallel 401s — if multiple requests fail simultaneously, only ONE refresh call is made; others wait and retry with new token
- **D-03:** Logout if refresh fails — if `/refresh` returns 401/403, clear all tokens and redirect to login

### Auth Store Structure
- **D-04:** Use Zustand persist middleware with SecureStore storage
- **D-05:** Store structure: `{ accessToken, refreshToken, user, isAuthenticated, isLoading }`
- **D-06:** login() calls `POST /api/v1/auth/login` → stores tokens + user in state (auto-persisted)
- **D-07:** register() deferred — skip register screen for now; login only
- **D-08:** logout() calls `POST /api/v1/auth/logout` (revoke refresh token) → clears state

### Protected Routes
- **D-09:** Use Expo Router `Stack.Protected` in `app/_layout.tsx`
- **D-10:** Unauthenticated users redirected to `(auth)/login` automatically
- **D-11:** Protected group: `app/(app)/` with Stack.Protected wrapper

### Navigation After Auth
- **D-12:** After login: `router.replace('/(app)/(tabs)/home')` — prevents back navigation to login
- **D-13:** After register deferred — login only
- **D-14:** Use `router.replace()` not `router.navigate()` to prevent back stack issues

### Token Storage Keys
- **D-15:** SecureStore keys: `'access_token'` (JWT access), `'refresh_token'` (refresh token), `'user_data'` (JSON stringified user object)
- **D-16:** Separate keys for access and refresh tokens (not nested) for easier individual updates
- **D-17:** Current `'auth_token'` key in existing code should be migrated to new separate keys

### The Agent's Discretion
- Exact Zustand persist middleware configuration (storage adapter for SecureStore)
- Error handling in login form (field-specific vs global errors)
- Whether to show loading spinner or disable button during auth mutations
- Token refresh interceptor implementation details (queue mechanics)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### From Phase 09 (Auth Backend)
- `.planning/phases/09-autenticaci-n/09-CONTEXT.md` — Token strategy (1hr access, 7 day refresh), endpoints, security decisions
- `.planning/phases/09-autenticaci-n/09-PLAN.md` — Backend implementation details for auth endpoints

### From Phase 08 (API Setup)
- `.planning/phases/08-api-setup-y-estructura/08-CONTEXT.md` — API structure, layered architecture, response envelope format

### Research (v1.2 Milestone)
- `.planning/research/STACK.md` — TanStack Query, Zustand, expo-secure-store recommendations
- `.planning/research/FEATURES.md` — Auth integration patterns, useMutation examples
- `.planning/research/PITFALLS.md` — Insecure token storage, unhandled token expiration

### Existing Frontend Code
- `src/stores/auth.store.ts` — Current mock implementation to be replaced with real API calls
- `src/services/api.ts` — Axios instance with interceptors (needs refresh token logic added)
- `app/_layout.tsx` — Root layout where Stack.Protected should be added
- `app/(auth)/login.tsx` — Login screen to consume useLogin mutation
- `app/(auth)/register.tsx` — Register screen deferred (not in scope now)

### Requirements
- `.planning/REQUIREMENTS.md` § Authentication (AUTH-01 to AUTH-08) — All auth requirements for this phase
- `.planning/REQUIREMENTS.md` § API Client Setup (API-02, API-03, API-05, API-06) — Related API client requirements

### Backend Endpoints (Phase 9)
- `POST /api/v1/auth/register` — Create user + return tokens
- `POST /api/v1/auth/login` — Validate credentials + return tokens
- `POST /api/v1/auth/refresh` — Exchange refresh token for new access token
- `POST /api/v1/auth/logout` — Revoke refresh token

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **auth.store.ts** — Zustand store structure exists, needs real API calls + persist middleware
- **api.ts** — Axios instance with request interceptor (attaches JWT), needs response interceptor for refresh
- **expo-secure-store** — Already installed (~15.0.8), used for mock token storage
- **SecureStore** import in auth.store.ts — already set up, just need to change storage keys

### Established Patterns
- **Zustand for state** — Phase 9 context confirms Zustand (already installed, ^5.0.12)
- **Axios with interceptors** — api.ts already has request interceptor pattern
- **Expo Router for navigation** — app/_layout.tsx uses expo-router, (auth)/ and (app)/ group structure
- **Design system** — All UI must use theme + constants (from PROJECT.md)

### Integration Points
- **auth.store.ts login()** → should call api.post('/auth/login', credentials)
- **auth.store.ts register()** → should call api.post('/auth/register', userData)
- **api.ts response interceptor** → add refresh token logic before current 401 logout
- **app/_layout.tsx** → wrap (app) group with Stack.Protected
- **Login/Register screens** → consume store's login/register functions with loading/error states

</code_context>

<specifics>
## Specific Ideas

- Phase 9 backend returns `{ success, data: { accessToken, refreshToken, user } }` format (response envelope)
- Tokens are JWT (access: 1hr, refresh: 7 days per Phase 9 D-01/D-02)
- Refresh token endpoint expects `{ refreshToken }` in request body
- Backend revokes refresh tokens on logout (Phase 9 D-07)
- After register, backend auto-logs in user (returns tokens immediately)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

### Reviewed Todos (not folded)
None — no todos were matched for this phase.

</deferred>

---
*Phase: 13-auth-integration*
*Context gathered: 2026-04-27*
