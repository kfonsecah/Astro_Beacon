# Architecture: React Native/Expo API Integration

**Domain:** Mobile Frontend (React Native + Expo)  
**Project:** Astro_Beacon - Planetary Exploration Mobile App  
**Focus:** API-Frontend Integration Architecture  
**Researched:** 2026-04-27  
**Confidence:** HIGH (multiple current sources 2025-2026, Expo docs, TanStack Query docs)

---

## Executive Summary

For Astro_Beacon's API integration with the existing Express backend, the recommended architecture uses a **layered service pattern** with **TanStack Query (React Query)** for server state management. The existing project structure (`src/services/`, `src/hooks/`, `src/context/`) aligns with current best practices. Key architectural decisions:

1. **Service Layer Per Domain**: Each API domain (auth, astronauts, resources, logbook, species, trips, supplies) gets its own service file co-located with custom hooks
2. **TanStack Query for Data Fetching**: Replaces manual useState/useEffect patterns; handles caching, background refetching, loading/error states automatically
3. **Context Providers for Global State**: Auth context already exists; consider additional contexts for resources or camp-wide state
4. **Error Boundaries via Expo Router**: Export `ErrorBoundary` function from route files; root layout catches uncaught errors
5. **Design System Integration**: All new components must use `src/theme/` and `src/constants/` — never hardcode values

The build order prioritizes **auth first** (all other endpoints require JWT), then domain services in parallel, with screens consuming hooks that wrap TanStack Query.

---

## 1. Recommended Architecture Overview

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      UI LAYER                              │
│  Screens (app/(app)/...) + Components (src/components/)    │
│  - Consume hooks for data                                 │
│  - Handle loading/error states from TanStack Query         │
│  - Use design system (theme + constants)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   HOOKS LAYER                              │
│  src/hooks/useAuth.ts, useResources.ts, useTrips.ts, etc. │
│  - Wrap TanStack Query hooks (useQuery, useMutation)        │
│  - Add domain-specific logic                               │
│  - Handle optimistic updates                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                             │
│  src/services/auth.service.ts, resources.service.ts, etc.  │
│  - Pure API call functions                                 │
│  - TypeScript types/interfaces                             │
│  - Error normalization                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              API CLIENT (src/services/api.ts)               │
│  - Axios instance with interceptors                         │
│  - Auto-attach JWT from Zustand store                      │
│  - Handle 401 responses (trigger logout)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS BACKEND API                       │
│  /api/v1/auth, /api/v1/astronauts, /api/v1/resources...  │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | What It Contains | What It Does NOT Contain |
|-------|-----------------|------------------|------------------------|
| **UI** | Display data, handle user input | Screens, components, navigation | API calls, business logic |
| **Hooks** | Connect UI to data, manage query state | useQuery, useMutation wrappers | Direct axios calls, UI rendering |
| **Services** | API interaction, data transformation | fetch functions, TypeScript types | React hooks, state management |
| **API Client** | HTTP configuration, auth injection | Axios instance, interceptors | Business logic, React code |

---

## 2. Service Layer Organization (Per Domain)

### Domain-Based File Structure

Based on existing backend routes and frontend requirements:

```
src/
├── services/
│   ├── api.ts                    # Base Axios instance (ALREADY EXISTS)
│   ├── auth.service.ts           # Login, register, refresh token
│   ├── astronauts.service.ts      # CRUD for astronauts
│   ├── resources.service.ts      # Resource management (oxygen, food, water)
│   ├── logbook.service.ts        # Logbook entries (discoveries)
│   ├── species.service.ts        # Species catalog
│   ├── trips.service.ts          # Trip planning and execution
│   └── supplies.service.ts       # Supply inventory and nearby search
│
├── hooks/
│   ├── useAuth.ts                # Auth state + login/logout mutations
│   ├── useAstronauts.ts          # Query + mutations for astronauts
│   ├── useResources.ts           # Resource queries, consumption mutations
│   ├── useLogbook.ts             # Logbook queries and entries
│   ├── useSpecies.ts             # Species catalog queries
│   ├── useTrips.ts               # Trip planning and execution
│   └── useSupplies.ts            # Supply queries and nearby search
│
├── types-dtos/                   # (Already exists in project structure)
│   ├── auth.types.ts
│   ├── astronaut.types.ts
│   ├── resource.types.ts
│   └── ... (one per domain)
```

### Service Implementation Pattern

**Example: `src/services/auth.service.ts`**

```typescript
import { api } from './api';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types-dtos/auth.types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Optional: call backend logout endpoint if it exists
    // await api.post('/auth/logout');
    return Promise.resolve();
  },
};
```

**Why per-domain files?**
- Clear ownership (astronauts team owns astronauts.service.ts)
- Easy to find and modify
- TypeScript types co-located with service functions
- Enables tree-shaking (unused domains don't get bundled)

---

## 3. Custom Hooks for Data Fetching (TanStack Query)

### Why TanStack Query?

**Current state (without TanStack Query):**
```typescript
// ❌ MANUAL PATTERN (avoid)
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  api.get('/resources')
    .then(res => { setData(res.data); setLoading(false); })
    .catch(err => { setError(err); setLoading(false); });
}, []);
```

**Recommended state (with TanStack Query):**
```typescript
// ✅ TANSTACK QUERY PATTERN (use this)
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['resources'],
  queryFn: () => resourcesService.getAll(),
});
```

**Benefits:**
- Automatic caching (no duplicate requests)
- Background refetching when app returns from background
- Built-in loading/error states
- Optimistic updates for mutations
- Pagination and infinite scroll support
- DevTools for debugging (in development)

### Hook Implementation Pattern

**Example: `src/hooks/useAuth.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store'; // Existing Zustand store
import type { LoginRequest, RegisterRequest } from '@/types-dtos/auth.types';

export function useLogin() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      // Update Zustand store with token + user
      setAuth(data.accessToken, data.user);
      // Invalidate any cached queries that depend on auth
      queryClient.invalidateQueries();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logoutStore();
      queryClient.clear(); // Clear all cached data on logout
    },
  });
}
```

**Example: `src/hooks/useResources.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourcesService } from '@/services/resources.service';
import type { Resource, ConsumeResourceRequest } from '@/types-dtos/resource.types';

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: () => resourcesService.getAll(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}

export function useResourceStats() {
  return useQuery({
    queryKey: ['resources', 'stats'],
    queryFn: () => resourcesService.getStats(),
    staleTime: 2 * 60 * 1000, // Stats change more frequently
  });
}

export function useConsumeResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, amount }: ConsumeResourceRequest) =>
      resourcesService.consume(resourceId, amount),
    onSuccess: () => {
      // Invalidate resource queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
```

### Where to Initialize TanStack Query

**In `app/_layout.tsx` (root layout):**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';

// Create QueryClient at module level (outside component)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,    // 10 minutes (was cacheTime in v4)
      retry: 2,
      refetchOnWindowFocus: false, // Not applicable in RN, but safe to set
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
```

**Note:** Since Expo Router uses file-based routing, the root layout wraps ALL routes. This makes TanStack Query available everywhere.

---

## 4. Context Providers for Global State

### Auth Context (Already Exists - Verify Integration)

The project already has `src/stores/auth.store.ts` using Zustand. This is **better than React Context** for auth state because:
- No provider wrapper needed
- Can be accessed outside React components (in `api.ts` interceptors)
- Smaller bundle size

**Verify `api.ts` already uses the store correctly:**

```typescript
// src/services/api.ts (ALREADY EXISTS - verified)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // ✅ Direct store access
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Additional Contexts to Consider

**Resource Context (Optional - for camp-wide resource alerts):**

```typescript
// src/context/ResourceContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useResourceStats } from '@/hooks/useResources';

interface ResourceContextType {
  isLowOnOxygen: boolean;
  isLowOnFood: boolean;
  isLowOnWater: boolean;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export function ResourceProvider({ children }: { children: ReactNode }) {
  const { data: stats } = useResourceStats();

  const value: ResourceContextType = {
    isLowOnOxygen: stats?.oxygen < 20, // Example threshold
    isLowOnFood: stats?.food < 30,
    isLowOnWater: stats?.water < 25,
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResourceAlerts() {
  const context = useContext(ResourceContext);
  if (!context) throw new Error('useResourceAlerts must be used within ResourceProvider');
  return context;
}
```

**Where to add providers:**

```typescript
// app/(app)/_layout.tsx - Protected routes layout
export default function AppLayout() {
  return (
    <ResourceProvider>
      <Stack>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ResourceProvider>
  );
}
```

---

## 5. Error Boundary Placement

### Expo Router Built-In Error Boundaries

**Expo Router v3+ (SDK 53+)** provides streamlined error handling. Export an `ErrorBoundary` function from any route file:

**Root-level catch-all (in `app/_layout.tsx`):**

```typescript
import { View, Text, TouchableOpacity } from 'react-native';
import { type ErrorBoundaryProps } from 'expo-router';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B1120', padding: 20, justifyContent: 'center' }}>
      <Text style={{ color: '#EF4444', fontSize: 18, marginBottom: 12 }}>
        Something went wrong
      </Text>
      <Text style={{ color: '#E5E7EB', marginBottom: 20 }}>
        {error.message}
      </Text>
      <TouchableOpacity 
        onPress={retry}
        style={{ backgroundColor: '#6EE7B7', padding: 12, borderRadius: 8, alignSelf: 'flex-start' }}
      >
        <Text style={{ color: '#0B1120', fontWeight: 'bold' }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  return <Slot />;
}
```

**Route-specific boundary (in `app/(app)/(tabs)/profile.tsx`):**

```typescript
import { View, Text } from 'react-native';
import { type ErrorBoundaryProps } from 'expo-router';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: '#EF4444' }}>Failed to load profile: {error.message}</Text>
      <Text onPress={retry}>Retry</Text>
    </View>
  );
}

export default function ProfileScreen() {
  // ... screen content
}
```

### Error Propagation Rules

1. Error thrown in a route → looks for `ErrorBoundary` in same file
2. If not found → bubbles up to nearest parent layout
3. Root layout is the final catch-all
4. `retry` function re-renders the component (not a full page reload)

### What Error Boundaries Catch

✅ **Catches:**
- Errors during rendering
- Errors in lifecycle methods
- Errors in constructors

❌ **Does NOT catch:**
- Event handlers (use try/catch)
- Async code (setTimeout, promises) — handle in service layer
- Server-side rendering errors
- Errors in the ErrorBoundary itself

---

## 6. Component Patterns for API-Driven Screens

### Screen Structure Pattern

**Example: `app/(app)/(tabs)/resources.tsx`**

```typescript
import { View, ScrollView } from 'react-native';
import { useResources } from '@/hooks/useResources';
import { useConsumeResource } from '@/hooks/useResources';
import { ResourceCard } from '@/components/domain/ResourceCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { theme } from '@/theme'; // Use design system

export default function ResourcesScreen() {
  const { data: resources, isLoading, error, refetch } = useResources();
  const consumeMutation = useConsumeResource();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      {resources?.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onConsume={(amount) => consumeMutation.mutate({ resourceId: resource.id, amount })}
          isConsuming={consumeMutation.isPending}
        />
      ))}
    </ScrollView>
  );
}

// Export ErrorBoundary in same file (Expo Router pattern)
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>
      <Text style={{ color: theme.colors.danger }}>Resources Error: {error.message}</Text>
      <Text onPress={retry} style={{ color: theme.colors.primary }}>Retry</Text>
    </View>
  );
}
```

### Design System Integration Rules

**✅ ALWAYS do this:**

```typescript
import { useTheme } from '@/theme'; // or however theme is exported
import { spacing } from '@/constants/spacing';

export function MyComponent() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={{ backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

**❌ NEVER do this:**

```typescript
// ❌ HARDCODED VALUES
<View style={{ backgroundColor: '#0B1120', padding: 16 }}>
```

### Component Responsibilities

| Component Type | Location | Responsibility | Example |
|----------------|----------|-----------------|---------|
| **Screen** | `app/(app)/...` | Compose layout, handle navigation | `resources.tsx` |
| **Domain Component** | `src/components/domain/` | Display domain data, handle mutations | `ResourceCard.tsx` |
| **UI Component** | `src/components/ui/` | Pure presentation, no domain logic | `Button.tsx`, `Card.tsx` |
| **Common Component** | `src/components/common/` | Cross-cutting UI | `OfflineBanner.tsx` |

---

## 7. Build Order for Integration

### Phase Dependencies

```
Phase 1: Auth Integration (Blocked by: nothing)
    ↓
Phase 2: TanStack Query Setup (Blocked by: nothing)
    ↓
Phase 3: Domain Services + Hooks (Blocked by: Phase 1 - needs JWT)
    ├── 3a: Astronauts
    ├── 3b: Resources (parallel)
    ├── 3c: Logbook (parallel)
    ├── 3d: Species (parallel)
    ├── 3e: Trips (parallel)
    └── 3f: Supplies (parallel)
    ↓
Phase 4: Screen Integration (Blocked by: Phase 3)
    ├── 4a: Connect existing screens to hooks
    └── 4b: Add ErrorBoundary to each screen
    ↓
Phase 5: Global State (Blocked by: Phase 3)
    └── 5a: Add ResourceContext if needed
```

### Detailed Build Sequence

| Phase | What to Build | Rationale | Files to Create/Modify |
|-------|---------------|-----------|------------------------|
| **1. Auth Integration** | Connect login/register screens to API | All other endpoints require JWT | Modify: `app/(auth)/login.tsx`, `app/(auth)/register.tsx` |
| **2. TanStack Query Setup** | Add provider to root layout | Required before domain hooks | Modify: `app/_layout.tsx` |
| **3. Domain Services** | Create service + hook pairs per domain | Each domain is independent after auth | NEW: `src/services/*.service.ts`, `src/hooks/use*.ts` |
| **4. Screen Integration** | Update screens to use hooks | Connects UI to real data | Modify: `app/(app)/(tabs)/*.tsx` |
| **5. Error Boundaries** | Add to all route files | Production error handling | Modify: All screen files + root layout |

---

## 8. Integration with Existing Design System

### Theme Usage Verification

The project has a **HUD-style design system** (dark theme, monospace, sharp corners). All new components must follow these rules:

**Colors (from `src/theme/dark.ts`):**
```typescript
// ✅ CORRECT
const theme = useTheme();
<View style={{ backgroundColor: theme.colors.background }}>  // #0B1120
<Text style={{ color: theme.colors.primary }}>                         // #6EE7B7
<ProgressBar color={theme.colors.warning}>                              // #FB923C

// ❌ WRONG
<View style={{ backgroundColor: '#0B1120' }}>
```

**Spacing (from `src/constants/spacing.ts`):**
```typescript
// ✅ CORRECT
import { spacing } from '@/constants/spacing';
<View style={{ padding: spacing.lg }}>  // 16px

// ❌ WRONG  
<View style={{ padding: 16 }}>
```

**Typography (monospace with letter-spacing):**
```typescript
// ✅ CORRECT
const theme = useTheme();
<Text style={{ 
  fontFamily: theme.fonts.mono, 
  letterSpacing: theme.letterSpacing.wide 
}}>
```

### HUD Aesthetic Rules

From PROJECT.md:
- **Zero border-radius** (esquinas rectas)
- **Typography monospace** with wide letter-spacing
- **Progress bars segmented** (not smooth gradients)
- **Subtle borders** (`#1F2937`)
- **Scanline overlays** (decorative)

**All API-driven components must respect these rules.**

---

## 9. Summary & Key Decisions

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Server State** | TanStack Query v5 | Industry standard 2026, handles caching/refetching automatically |
| **Service Layer** | Per-domain files | Clear ownership, matches backend structure |
| **Hooks Layer** | Wrap TanStack Query | Domain-specific logic, optimistic updates |
| **Auth State** | Zustand (existing) | Already implemented, works outside React components |
| **Error Handling** | Expo Router ErrorBoundary | Built-in, no extra libraries needed |
| **Design System** | Use existing theme/constants | Mandatory per PROJECT.md rules |

### Integration Points (Services → Hooks → Screens)

| Domain | Service File | Hook File | Screen Files |
|--------|--------------|-----------|--------------|
| **Auth** | `auth.service.ts` | `useAuth.ts` | `app/(auth)/login.tsx`, `register.tsx` |
| **Astronauts** | `astronauts.service.ts` | `useAstronauts.ts` | `app/(app)/(tabs)/profile.tsx` |
| **Resources** | `resources.service.ts` | `useResources.ts` | `app/(app)/(tabs)/resources.tsx` |
| **Logbook** | `logbook.service.ts` | `useLogbook.ts` | `app/(app)/(tabs)/logbook.tsx` |
| **Species** | `species.service.ts` | `useSpecies.ts` | `app/(app)/(tabs)/species.tsx` |
| **Trips** | `trips.service.ts` | `useTrips.ts` | `app/(app)/(tabs)/trips.tsx` |
| **Supplies** | `supplies.service.ts` | `useSupplies.ts` | `app/(app)/(tabs)/supplies.tsx` |

### Files to Create (New)

```
src/
├── services/
│   ├── auth.service.ts          (NEW)
│   ├── astronauts.service.ts    (NEW)
│   ├── resources.service.ts     (NEW)
│   ├── logbook.service.ts       (NEW)
│   ├── species.service.ts       (NEW)
│   ├── trips.service.ts         (NEW)
│   └── supplies.service.ts      (NEW)
│
├── hooks/
│   ├── useAuth.ts               (NEW)
│   ├── useAstronauts.ts         (NEW)
│   ├── useResources.ts          (NEW)
│   ├── useLogbook.ts            (NEW)
│   ├── useSpecies.ts            (NEW)
│   ├── useTrips.ts              (NEW)
│   └── useSupplies.ts           (NEW)
│
└── types-dtos/
    ├── auth.types.ts            (NEW)
    ├── astronaut.types.ts        (NEW)
    ├── resource.types.ts         (NEW)
    ├── logbook.types.ts          (NEW)
    ├── species.types.ts          (NEW)
    ├── trip.types.ts             (NEW)
    └── supply.types.ts           (NEW)
```

### Files to Modify (Existing)

```
app/
├── _layout.tsx                  (ADD: QueryClientProvider)
├── (auth)/
│   ├── login.tsx                (MODIFY: use useLogin hook)
│   └── register.tsx             (MODIFY: use useRegister hook)
└── (app)/
    └── (tabs)/
        ├── profile.tsx          (MODIFY: use useAstronauts hook)
        ├── resources.tsx        (MODIFY: use useResources hook)
        ├── logbook.tsx          (MODIFY: use useLogbook hook)
        ├── species.tsx          (MODIFY: use useSpecies hook)
        ├── trips.tsx            (MODIFY: use useTrips hook)
        └── supplies.tsx         (MODIFY: use useSupplies hook)
```

---

## 10. Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Service layer per domain** | HIGH | Multiple 2025-2026 sources confirm this pattern |
| **TanStack Query for data fetching** | HIGH | Official docs, widely adopted in React Native 2026 |
| **Error Boundary pattern** | HIGH | Expo Router official docs (2026-02-26) |
| **Auth flow (JWT + Zustand)** | HIGH | Existing implementation verified in `api.ts` |
| **Design system compliance** | HIGH | Rules documented in PROJECT.md, easy to verify |
| **Build order (auth first)** | HIGH | JWT required for all other endpoints |

---

## Sources

- **Expo Router Error Handling** — https://docs.expo.dev/router/error-handling/ (2026-02-26)
- **TanStack Query React Native** — https://tanstack.com/query/v5/docs/framework/react/react-native (Official docs)
- **How to Structure Large-Scale React Native Apps** — https://oneuptime.com/blog/post/2026-01-15-structure-react-native-applications/view (2026-01-15)
- **React Native App Architecture Patterns for 2026** — https://shahmeerrizwan.com/blog/react-native-app-architecture-patterns-2026 (2025-11-01)
- **Expo Router Authentication** — https://docs.expo.dev/router/advanced/authentication/ (2026-04-01)
- **Zustand & TanStack Query Guide** — https://reactnativerelay.com/article/modern-state-management-react-native-zustand-tanstack-query (2026-02-07)
- **Astro_Beacon PROJECT.md** — /home/brian/4_anno/Moviles/Astro_Beacon/.planning/PROJECT.md (2026-04-27)
- **Existing API Client** — /home/brian/4_anno/Moviles/Astro_Beacon/src/services/api.ts (Verified)

---

**Next Steps:** This architecture research feeds into `/gsd-plan-phase` for each integration phase. The recommended build order is: Auth → TanStack Setup → Domain Services → Screen Integration → Error Boundaries.
