# Phase 13: Auth Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-27
**Phase:** 13-Auth Integration
**Areas discussed:** Token refresh flow, Auth store structure, Protected routes, Navigation after auth, Token storage keys

---

## Token Refresh Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-refresh then retry (Recommended) | Intercept 401 → call /refresh with stored refresh token → retry original request with new access token. Handles multiple parallel 401s with a queue. | ✓ |
| Logout immediately | Keep current behavior — any 401 clears session and redirects to login. Simpler but user loses work if token expires mid-session. | |
| Retry once then logout | Try refresh once, if fails then logout. Middle ground but doesn't handle expired refresh token edge cases. | |

**User's choice:** Auto-refresh then retry (Recommended)

**Notes:** Current api.ts just logs out on 401. Need to implement refresh token rotation per Phase 9 decisions (D-04: POST /api/v1/auth/refresh endpoint).

---

## Auth Store Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Zustand persist (Recommended) | Use persist middleware with SecureStore storage. Automatically syncs token/user state. Cleaner code, matches API-06 requirement. | ✓ |
| Manual SecureStore calls | Keep current pattern of explicit SecureStore.setItemAsync/getItemAsync calls in login/logout. More control but more boilerplate. | |

**User's choice:** Zustand persist (Recommended)

**Notes:** Current auth.store.ts has mock implementation. Need to replace with real API calls and add persist middleware.

---

## Protected Routes

| Option | Description | Selected |
|--------|-------------|----------|
| Expo Router Stack.Protected (Recommended) | Use built-in Stack.Protected in app/_layout.tsx. Automatically redirects to (auth)/login if not authenticated. Clean, official pattern. | ✓ |
| Custom auth wrapper | Create AuthGuard component that checks useAuthStore and redirects. More control but more code. | |
| Auth context + redirect | Create AuthContext provider, check auth state in each screen/group layout. More flexible but more boilerplate. | |

**User's choice:** Expo Router Stack.Protected (Recommended)

**Notes:** app/_layout.tsx needs Stack.Protected wrapper for (app)/ group.

---

## Navigation After Auth

| Option | Description | Selected |
|--------|-------------|----------|
| /(app)/(tabs)/home (Recommended) | Main dashboard with astronaut stats and resources. Matches current _layout.tsx group structure. | ✓ |
| /(app)/(tabs)/profile | Profile screen first, so user can review their info. Less common pattern. | |
| Role-based redirect | Check user role/status and redirect accordingly. Overkill for this app (single astronaut). | |

**User's choice:** /(app)/(tabs)/home (Recommended)

**Notes:** Use router.replace() after login to prevent back navigation to login screen.

---

## Token Storage Keys

| Option | Description | Selected |
|--------|-------------|----------|
| Separate: access + refresh + user (Recommended) | 'access_token', 'refresh_token', 'user_data'. Clear separation, matches Phase 9 backend (separate tokens). | ✓ |
| Single token key | Keep 'auth_token' only. Refresh token managed separately or not stored (less secure). | |
| Nested in one key | Store JSON with {accessToken, refreshToken, user} in single 'auth_data' key. Simpler reads but harder to update individual fields. | |

**User's choice:** Separate: access + refresh + user (Recommended)

**Notes:** Current code uses 'auth_token' and 'user_data'. Need to migrate to new separate keys for access/refresh tokens.

---

## The Agent's Discretion

- Exact Zustand persist middleware configuration (storage adapter for SecureStore)
- Error handling in login/register forms (field-specific vs global errors)
- Whether to show loading spinner or disable button during auth mutations
- Token refresh interceptor implementation details (queue mechanics)

## Deferred Ideas

None — discussion stayed within phase scope.
