# Technology Stack

**Project:** Astro_Beacon — API-Frontend Integration (Milestone v1.2)
**Researched:** 2026-04-27
**Context:** Integrating existing React Native/Expo frontend with Node.js/Express backend

---

## Recommended Stack

### Core HTTP Client
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **axios** | ^1.14.0 | HTTP requests to backend API | Already configured in `src/services/api.ts` with JWT interceptors. Expo's native-data-fetching skill prefers `expo/fetch`, but switching now would waste working code. Axios provides interceptors needed for auth token injection and 401 handling. |

### State Management (Server State)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@tanstack/react-query** | ^5.100.5 | Cache, fetch, deduplicate API data | PURPOSE-BUILT for server state. Handles caching, background refetch, loading/error states, retries, and deduplication automatically. Zustand (already installed) handles client state; TanStack Query handles server state. This is the current community standard (2026) for React Native data fetching. |

### State Management (Client State)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **zustand** | ^5.0.12 | Auth session, UI state, global client state | Already installed and used for `useAuthStore`. Tiny (~1KB), no providers needed, works outside React components via `getState()`. Perfect for auth token storage and UI state. Persist middleware can integrate with SecureStore. |

### Secure Storage
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **expo-secure-store** | ~15.0.8 | Encrypt JWT tokens, refresh tokens | Already installed. Uses iOS Keychain and Android Keystore for hardware-backed encryption. REQUIRED for JWT storage — never use AsyncStorage for tokens (unencrypted). Current `useAuthStore` keeps token in memory only; need to persist to SecureStore. |

### Network Detection
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@react-native-community/netinfo** | ^12.0.1 | Detect online/offline status | Required for TanStack Query `onlineManager` integration. Pauses queries when offline, auto-retries when online. 1.6M weekly downloads, maintained by react-native-community. |

### React & React Native
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **react** | 19.1.0 | UI library | Already installed, works with TanStack Query v5 (supports React 18/19) |
| **react-native** | 0.81.5 | Mobile framework | Already installed, compatible with all recommended libraries |
| **expo** | ~54.0.33 | Expo SDK | Already installed, provides SecureStore and other native modules |

---

## Integration Architecture

### Data Flow Pattern
```
Component
  ↓ useQuery/useMutation (TanStack Query)
  ↓
api.ts (axios instance with interceptors)
  ↓ injects JWT from useAuthStore.getState().token
  ↓
Backend API (Express + JWT auth)
```

### Auth Token Flow
```
Login → 
  Zustand store (useAuthStore.login(user, token)) →
  Persist token to expo-secure-store →
  Axios interceptor reads token from store on each request
```

### Store Structure (Zustand)
```typescript
// Already exists: useAuthStore
{
  user: User | null,
  token: string | null,           // access token (memory)
  refreshToken: string | null,     // refresh token (SecureStore only)
  isAuthenticated: boolean,
  
  login: (user, token, refreshToken) => void,
  logout: () => void,
  // TODO: add rehydrate() to read from SecureStore on app start
}
```

---

## What NOT to Add

| Library | Why Not | Alternative |
|---------|---------|-------------|
| **expo/fetch or fetch API** | axios already configured with interceptors, switching is wasted effort | Keep axios |
| **SWR** | TanStack Query is more feature-complete for React Native (devtools, mutations, infinite queries) | Use TanStack Query |
| **Redux / Redux Toolkit** | Zustand already installed, 10x less code, sufficient for this app's needs | Keep Zustand |
| **React Hook Form** | Not needed for API integration milestone (no new forms) | Add later if needed |
| **AsyncStorage** | Unencrypted! Never store tokens here. SecureStore is already installed. | Use expo-secure-store |
| **MMKV** | Great for large datasets, but tokens are tiny — SecureStore is sufficient | Use SecureStore for tokens |

---

## Installation

```bash
# Add TanStack Query for server state management
npx expo install @tanstack/react-query

# Add NetInfo for offline detection
npx expo install @react-native-community/netinfo

# Already installed (verify versions match):
# axios ^1.14.0
# expo-secure-store ~15.0.8
# zustand ^5.0.12
```

---

## Key Integration Points

### 1. Axios Interceptors (Already Configured)
File: `src/services/api.ts`
- ✅ Request interceptor attaches JWT from `useAuthStore.getState().token`
- ⚠️ Response interceptor only logs out on 401 — needs refresh token logic

### 2. TanStack Query Setup (New)
Create `src/providers/QueryProvider.tsx`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// Connect NetInfo to TanStack Query
onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    setOnline(state.isConnected ?? false);
  });
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 3. SecureStore Persistence for Auth (Enhancement)
The current `useAuthStore` only keeps token in memory. Add persistence:
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

const secureStorage = {
  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(key);
    return value || null;
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      // ... actions
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
```

### 4. Refresh Token Rotation (Enhancement)
Update `src/services/api.ts` response interceptor:
```typescript
// When 401 received:
// 1. Try to refresh token using refreshToken from SecureStore
// 2. If refresh succeeds, retry original request with new token
// 3. If refresh fails, logout
```

---

## Version Compatibility (Verified 2026-04-27)

| Library | Version | React Native | Expo SDK | Status |
|---------|---------|--------------|----------|--------|
| axios | 1.14.0 | 0.81.5 | 54 | ✅ Compatible |
| @tanstack/react-query | 5.100.5 | 0.81.5 | 54 | ✅ Compatible (React 18/19) |
| zustand | 5.0.12 | 0.81.5 | 54 | ✅ Compatible |
| expo-secure-store | 15.0.8 | 0.81.5 | 54 | ✅ Compatible |
| @react-native-community/netinfo | 12.0.1 | 0.81.5 | 54 | ✅ Compatible (RN ≥ 0.76) |

---

## Sources & Confidence Levels

| Source | Confidence | Notes |
|--------|------------|-------|
| Expo Documentation (docs.expo.dev) | HIGH | Official docs for expo-secure-store v54 |
| TanStack Query Docs (tanstack.com/query) | HIGH | Official docs for React Native integration |
| @tanstack/react-query npm (v5.100.5) | HIGH | Verified latest version via npmjs.com |
| @react-native-community/netinfo npm (v12.0.1) | HIGH | Verified latest version, React Native 0.76+ required |
| Expo native-data-fetching skill (skills.sh) | HIGH | Official Expo skill recommending patterns |
| React Native Relay article (2026-02-07) | MEDIUM | Community guide for Zustand + TanStack Query |
| DEV Community articles (2026) | MEDIUM | Community patterns, verified with official docs |
| WebSearch general results | LOW → MEDIUM | Cross-verified with official sources |

---

## Decisions Driven by Existing Codebase

1. **Keep axios** — `src/services/api.ts` already has working interceptors. Expo recommends `expo/fetch`, but replacing working code is wasteful.

2. **Add TanStack Query** — The app will make many API calls (astronauts, resources, logbook, species, trips, supplies). Managing loading/error/caching states manually is error-prone. TanStack Query handles this.

3. **Keep Zustand for auth** — `useAuthStore` already exists. Don't migrate to Redux or Context. Add `persist` middleware to sync with SecureStore.

4. **Use SecureStore (not AsyncStorage)** — Tokens are sensitive. AsyncStorage is unencrypted. SecureStore uses hardware encryption. Already installed.

5. **Add NetInfo** — Required for proper offline support with TanStack Query. Without it, queries will attempt while offline and fail.

---

**Researcher Note:** This stack is intentionally minimal — only adding what's needed for API integration. The existing stack (axios + zustand + expo-secure-store) is solid. The key addition is @tanstack/react-query for server state, which eliminates manual loading/error/caching boilerplate.
