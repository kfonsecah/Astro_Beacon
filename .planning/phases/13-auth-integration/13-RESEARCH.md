# Phase 13: Auth Integration - Research

**Phase:** 13 - Auth Integration  
**Researched:** 2026-04-28  
**Context:** Integrating React Native/Expo frontend with existing Node.js/Express backend auth endpoints

---

## Research Question

What do I need to know to PLAN Phase 13 (Auth Integration) well?

---

## 1. Backend Auth Endpoints (from Phase 09)

| Endpoint | Method | Request Body | Response |
|----------|--------|---------------|----------|
| `/api/v1/auth/register` | POST | `{ email, password }` | `{ success, data: { accessToken, refreshToken, user } }` |
| `/api/v1/auth/login` | POST | `{ email, password }` | `{ success, data: { accessToken, refreshToken, user } }` |
| `/api/v1/auth/refresh` | POST | `{ refreshToken }` | `{ success, data: { accessToken, refreshToken } }` |
| `/api/v1/auth/logout` | POST | `{}` (requires auth) | `{ success, message }` |

**Token Strategy (Phase 09 decisions):**
- Access token: JWT, 1 hour expiry
- Refresh token: JWT, 7 days expiry, stored in MongoDB (revocable)
- Refresh tokens array in User schema: `refreshTokens: string[]`

---

## 2. Frontend Auth Store (Current State)

**File:** `src/stores/auth.store.ts`

**Current state:**
- Uses Zustand for state management
- Uses expo-secure-store for token storage (but only one key: 'auth_token')
- Has mock implementation for login() - needs real API calls
- Missing: register(), refresh token logic, persist middleware

**Needed changes (from CONTEXT.md D-01 to D-17):**
- Add Zustand persist middleware with SecureStore storage adapter
- Update storage keys to: `access_token`, `refresh_token`, `user_data` (D-15, D-16)
- Implement real login() calling `api.post('/auth/login', credentials)` (D-06)
- Implement register() calling `api.post('/auth/register', userData)` (D-07)
- Implement logout() calling `api.post('/auth/logout')` (D-08)
- Add refresh token handling in the store or in api.ts interceptor (D-01 to D-03)

---

## 3. API Client (Current State)

**File:** `src/services/api.ts`

**Current state:**
- Axios instance with baseURL from environment
- Request interceptor: Attaches JWT from `useAuthStore.getState().token`
- Response interceptor: Only logs out on 401, no refresh logic

**Needed changes (from CONTEXT.md D-01 to D-03):**
- Add response interceptor logic for 401 handling:
  1. Catch 401 response
  2. Try to refresh token using `refreshToken` from SecureStore
  3. Retry original request with new access token
  4. If multiple requests fail simultaneously, only make ONE refresh call (queue others)
  5. If refresh fails (401/403), clear tokens and redirect to login

---

## 4. Protected Routes (Current State)

**File:** `app/_layout.tsx`

**Current state:**
- Uses custom `AuthGuard` component with `Redirect` for unauthenticated users
- Structure: (auth) group + (tabs) group (not (app)/(tabs) as per CONTEXT.md)

**Needed changes (from CONTEXT.md D-09 to D-11):**
- Create `app/(app)/_layout.tsx` with `Stack.Protected` wrapper
- Move (tabs) group inside (app) group
- Update root `_layout.tsx` to reference `(app)` instead of `(tabs)` directly

---

## 5. Navigation After Auth (Current State)

**File:** `app/(auth)/login.tsx`

**Current state:**
- Uses `router.replace('/(tabs)/dashboard')` after login
- CONTEXT.md says should be `router.replace('/(app)/(tabs)/home')`

**Needed changes (from CONTEXT.md D-12 to D-14):**
- Update login success navigation to use `(app)/(tabs)/home` path
- Ensure register screen also uses `router.replace()` after successful registration
- Use `router.replace()` not `router.navigate()` to prevent back stack issues

---

## 6. Register Screen

**Status:** Does NOT exist currently

**Needed:**
- Create `app/(auth)/register.tsx` with:
  - Email and password inputs
  - Loading state during registration
  - Error display
  - Call `useAuthStore.getState().register()` on submit
  - Navigate to `(app)/(tabs)/home` after success

---

## 7. Secure Token Storage

**Decisions (CONTEXT.md D-15 to D-17):**
- Keys: `access_token` (JWT access), `refresh_token` (refresh token), `user_data` (JSON stringified user)
- Separate keys for access and refresh tokens (not nested) for easier individual updates
- Current `'auth_token'` key should be migrated to new separate keys

**Implementation:**
- Use `expo-secure-store` (already installed ~15.0.8)
- Create storage adapter for Zustand persist middleware
- Handle migration from old `auth_token` key if exists

---

## 8. Token Refresh Flow

**Decisions (CONTEXT.md D-01 to D-03):**

### D-01: Auto-refresh then retry
```typescript
// In api.ts response interceptor
if (error.response.status === 401) {
  const refreshToken = await SecureStore.getItemAsync('refresh_token');
  const { data } = await api.post('/auth/refresh', { refreshToken });
  // Store new tokens
  await SecureStore.setItemAsync('access_token', data.accessToken);
  // Retry original request
  originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
  return api(originalRequest);
}
```

### D-02: Queue parallel 401s
```typescript
let refreshPromise = null;

if (error.response.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  
  if (!refreshPromise) {
    refreshPromise = refreshToken().finally(() => { refreshPromise = null; });
  }
  
  const tokens = await refreshPromise;
  originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
  return api(originalRequest);
}
```

### D-03: Logout if refresh fails
```typescript
try {
  const tokens = await refreshToken();
} catch (error) {
  // Refresh failed - clear everything and redirect
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
  await SecureStore.deleteItemAsync('user_data');
  router.replace('/(auth)/login');
}
```

---

## 9. Environment Configuration

**File:** `src/services/api.ts`

**Current:**
```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://api.astrobeacon.com/api/v1';
```

**Needed (API-05):**
- Use `EXPO_PUBLIC_API_URL` environment variable
- Fall back to localhost for __DEV__

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  (__DEV__ ? 'http://localhost:3000/api/v1' : 'https://api.astrobeacon.com/api/v1');
```

---

## 10. Validation Architecture (for Nyquist)

**Success Criteria (from ROADMAP.md):**
1. User can log in with email/password and is redirected to home screen with no back button to login
2. User can register a new account with email/password and receive confirmation
3. JWT and refresh tokens are stored securely in expo-secure-store
4. Unauthenticated users are redirected to login screen when accessing protected routes
5. Expired JWTs are automatically refreshed via axios interceptor without user intervention

**Observable Truths:**
- User sees login screen when not authenticated
- After login, user is on home screen and cannot go back to login
- After register, user is automatically logged in and on home screen
- Accessing protected route when not authenticated redirects to login
- Expired JWT triggers silent refresh (user doesn't notice)
- Tokens are in SecureStore (not AsyncStorage)

**Required Artifacts:**
- `src/stores/auth.store.ts` - Auth state management with persist
- `src/services/api.ts` - API client with refresh interceptor
- `app/(app)/_layout.tsx` - Protected route wrapper
- `app/_layout.tsx` - Root layout with auth guard
- `app/(auth)/register.tsx` - Register screen

---

## Validation Architecture

**Purpose:** Define how Phase 13 plans will be verified during execution (Nyquist validation).

### Observable Truths (What must be TRUE)

1. **User can log in with email/password** → User enters credentials, taps login, sees home screen
2. **User can register new account** → User enters email/password, taps register, sees home screen
3. **JWT stored securely** → `expo-secure-store` has `access_token` and `refresh_token` keys (not AsyncStorage)
4. **Unauthenticated users redirected** → Accessing protected route when not logged in shows login screen
5. **Expired JWTs auto-refresh** → 401 response triggers silent token refresh, original request retries
6. **No back button to login** → After login, pressing back doesn't return to login screen
7. **Tokens persisted across app restarts** → Killing and reopening app restores auth state

### Required Artifacts (What must EXIST)

| File | Provides | Verification |
|------|----------|-------------|
| `src/stores/auth.store.ts` | Auth state + persist middleware | File exists, has `persist()` wrapper, uses SecureStore keys `access_token`, `refresh_token`, `user_data` |
| `src/services/api.ts` | Axios instance + refresh interceptor | File exists, has response interceptor catching 401, calls `/auth/refresh`, retries original request |
| `app/(app)/_layout.tsx` | Protected route wrapper | File exists, uses `Stack.Protected` from expo-router |
| `app/_layout.tsx` | Root layout with auth guard | File exists, references `(app)` group |
| `app/(auth)/register.tsx` | Register screen | File exists, has email/password inputs, calls register function |

### Key Links (Critical connections)

| From | To | Via | Pattern to Verify |
|------|-----|----|-------------------|
| `api.ts` response interceptor | `/auth/refresh` endpoint | `axios.post('/auth/refresh', { refreshToken })` | Search for `refresh` in api.ts |
| `auth.store.ts` login() | `api.ts` request | `api.post('/auth/login', credentials)` | Search for `/auth/login` in auth.store.ts |
| `auth.store.ts` | SecureStore | `SecureStore.setItemAsync('access_token', ...)` | Search for `access_token` in auth.store.ts |
| `app/_layout.tsx` | `Stack.Protected` | `<Stack.Protected>` component | Search for `Protected` in layout files |
| Login success | Navigation | `router.replace('/(app)/(tabs)/home')` | Search for `router.replace` in login.tsx |

### Sampling Strategy

- **After every task commit:** Check file exists + grep for expected patterns
- **After each plan wave:** Full verification of all truths for that plan's scope
- **Manual verification:** Login flow, register flow, token refresh (use expired token), protected route redirect

---

## 11. Key Technical References

### Zustand Persist with SecureStore
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

const secureStorage = {
  getItem: async (name: string) => {
    const value = await SecureStore.getItemAsync(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: async (email: string, password: string) => {
        // implementation
      },
      
      register: async (email: string, password: string) => {
        // implementation
      },
      
      logout: async () => {
        // implementation
      },
      
      checkAuth: async () => {
        // implementation
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
```

### Axios Response Interceptor with Token Refresh
```typescript
// src/services/api.ts
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        await SecureStore.setItemAsync('access_token', data.accessToken);
        await SecureStore.setItemAsync('refresh_token', data.refreshToken);
        
        processQueue(null, data.accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        await SecureStore.deleteItemAsync('user_data');
        router.replace('/(auth)/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## 12. Sources & Confidence

| Source | Confidence | Notes |
|--------|------------|-------|
| Phase 09 CONTEXT.md | HIGH | Backend endpoint definitions, token strategy |
| Phase 13 CONTEXT.md | HIGH | All user decisions for implementation |
| Existing code (auth.store.ts, api.ts, _layout.tsx) | HIGH | Current state verified by reading files |
| STACK.md (v1.2 research) | HIGH | Zustand + TanStack Query + expo-secure-store recommendations |
| FEATURES.md (v1.2 research) | HIGH | Integration patterns for auth, forms, interceptors |
| PITFALLS.md (v1.2 research) | HIGH | Token storage, expiration, navigation pitfalls |
| Expo SecureStore Docs | HIGH | Official docs for expo-secure-store |
| Zustand Docs | HIGH | Persist middleware documentation |
| Axios Docs | HIGH | Interceptor documentation |

---

## 13. Decisions Driven by Research

1. **Keep axios** - Already configured with request interceptor, no need to switch to fetch
2. **Use Zustand persist** - Cleanest way to sync auth state with SecureStore
3. **Token refresh in api.ts** - Centralized location, avoids store complexity
4. **Queue parallel 401s** - Prevents multiple refresh calls when tokens expire
5. **Separate SecureStore keys** - Easier to update individual tokens
6. **Stack.Protected** - Expo Router's built-in auth protection (cleaner than custom AuthGuard)

---

**Research Complete:** All information needed to plan Phase 13 is documented above.
