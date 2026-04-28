# Feature Landscape: API-Frontend Integration

**Domain:** React Native / Expo app integrating with Node.js/Express REST API  
**Researched:** 2026-04-27  
**Confidence:** HIGH — Based on TanStack Query v5 docs, Expo docs (2026), and multiple 2025-2026 community articles

---

## Table Stakes

Features users expect when a mobile app connects to a backend API. Missing = app feels broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **TanStack Query for server state** | Industry standard 2025-2026; eliminates manual loading/error/cache logic | Low (once set up) | Replaces useEffect+fetch boilerplate. Provides `useQuery`, `useMutation`, automatic caching, background refetch, retry logic. |
| **Axios with interceptors** | Global auth token injection, centralized error handling | Low | Interceptors add JWT to all requests. Response interceptor handles 401 → redirect to login. |
| **Loading states in screens** | Users need feedback during API calls | Low | Use `isLoading`, `isFetching` from TanStack Query. Show `ActivityIndicator` or skeleton screens. |
| **Error display in UI** | Users need to know what went wrong | Medium | Per-field errors for forms. Toast/Alert for global errors (401, 500). Network error detection via `!error.response`. |
| **Login/Register form submission** | Core auth flow required for all features | Medium | `useMutation` for POST `/api/v1/auth/register` and `/api/v1/auth/login`. Navigate to `(app)` on success. Store JWT in `expo-secure-store`. |
| **Protected route navigation** | Unauthenticated users shouldn't access app screens | Medium | Use Expo Router `Stack.Protected` or custom auth context with `useAuth()` hook. Redirect to `(auth)/login` if no valid token. |
| **List views with FlatList** | Standard pattern for displaying collections (resources, species, trips, etc.) | Low | Use `useQuery` with query key like `['resources', page]`. FlatList with `renderItem`, `keyExtractor`, `onEndReached` for pagination. |
| **Detail views with data fetching** | Tapping an item shows its details | Low | `useQuery` with ID in query key: `['resource', id]`. Fetch from `/api/v1/resources/:id`. Handle loading/error states. |
| **Pull-to-refresh** | Users expect to swipe down to reload data | Low | Use React Native `RefreshControl` with TanStack Query's `refetch()`. Set `refreshing={isRefetching}`. |
| **Pagination for list endpoints** | Backend returns paginated results (`page`, `limit`, `totalPages`) | Medium | Backend Roadmap confirms pagination support. Use `onEndReached` + page state. TanStack Query `useInfiniteQuery` is an alternative. |
| **Form validation before submit** | Prevent invalid data from reaching API | Low | Use Zod (already in backend) or Formik + Yup. Validate email format, required fields, password strength. |
| **Navigation after mutation** | After creating/updating, navigate to appropriate screen | Low | `router.replace()` for login (prevents back to login). `router.back()` for create forms. `router.push('/detail/:id')` after creating resource. |
| **Token refresh flow** | JWT expires; app should refresh silently | Medium | Axios response interceptor catches 401, calls `/api/v1/auth/refresh`, retries original request with new token. If refresh fails → logout. |
| **Environment-based API URL** | Different URLs for dev/staging/prod | Low | Use `EXPO_PUBLIC_API_URL` in `.env`. For physical devices, use local network IP (e.g., `http://192.168.x.x:3000`). |

---

## Differentiators

Features that set this integration apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Optimistic updates for mutations** | UI updates instantly; feels faster than waiting for server | Medium | TanStack Query `useMutation` with `onMutate` (snapshot), `onError` (rollback), `onSettled` (invalidate). Good for toggling resource status, updating astronaut profile. |
| **Refresh on screen focus** | Data stays fresh when user navigates back to a screen | Low | Use `useFocusEffect` from `@react-navigation/native` + `queryClient.refetchQueries()`. Skip first mount. TanStack Query docs provide hook: `useRefreshOnFocus()`. |
| **Offline-aware error handling** | Detect network status and queue mutations | High | Use `@react-native-community/netinfo` to detect connectivity. Queue failed mutations when offline, flush when reconnected. Phase 11 (Offline Sync) will handle this more comprehensively. |
| **Expo Router data loaders (web)** | Server-side data fetching for web version | Low (web only) | Export `loader` function in route file. Use `useLoaderData()` in component. Only works for web SDK 55+. Native uses TanStack Query. |
| **Cancel in-flight requests** | Prevent race conditions when user navigates quickly | Low | TanStack Query cancels queries automatically on unmount. For manual fetch, use `AbortController`. Axios supports cancel tokens. |
| **Haptic feedback on actions** | Tactile confirmation for creating/updating resources | Low | Use `expo-haptics` on successful mutations. Already in project constraints. |

---

## Anti-Features

Features to explicitly NOT build in this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Redux for server state** | Overkill for API data; TanStack Query handles caching/updates better | Use TanStack Query for server state, Zustand (if needed) for client state |
| **Manual useEffect+fetch in every screen** | Boilerplate hell; no caching; hard to handle errors consistently | Centralize with TanStack Query `useQuery` |
| **Storing JWT in AsyncStorage** | Not encrypted; vulnerable to theft | Use `expo-secure-store` (encrypted) |
| **Showing raw error messages from API** | Bad UX; might expose internals | Map error codes to user-friendly messages. Use interceptor to sanitize. |
| **Polling/long-polling for real-time** | Inefficient; drains battery | Not needed for this app. If real-time needed later, use WebSockets/SSE. |
| **Creating new backend endpoints** | Out of scope for this milestone | Use existing endpoints from Phases 9-10 |
| **Adding new screens** | Out of scope for this milestone | Integrate existing screens only |

---

## Feature Dependencies

```
Auth Context (useAuth hook)
├── Login Screen (useMutation for /auth/login)
├── Register Screen (useMutation for /auth/register)
└── Token Refresh (interceptor for /auth/refresh)
    │
    └── All Domain Screens (require JWT in Authorization header)
        │
        ├── Home/Dashboard (useQuery for astronaut profile + stats)
        ├── Resources List (useQuery with pagination)
        │   └── Resource Detail (useQuery by ID)
        │       └── Create/Edit Resource (useMutation POST/PUT)
        ├── Species List (useQuery with pagination)
        │   └── Species Detail (useQuery by ID)
        │       └── Create Species (useMutation POST)
        ├── Logbook List (useQuery with pagination)
        │   └── Logbook Detail (useQuery by ID)
        │       └── Create Logbook Entry (useMutation POST)
        ├── Trips List (useQuery with pagination)
        │   └── Trip Detail (useQuery by ID)
        │       └── Create/Start/Complete Trip (useMutation POST/PATCH)
        ├── Supplies List (useQuery)
        │   └── Collect Supply (useMutation POST)
        └── Profile Screen (useQuery for astronaut data)
            └── Update Profile (useMutation PATCH)
```

---

## MVP Recommendation

Prioritize integration of these screens/features first:

1. **Auth integration (login + register)** — Foundation for everything else. Without auth, no domain data can be fetched.
2. **Home/Dashboard screen** — Shows astronaut stats. Uses `useQuery` for `/api/v1/astronauts/me`.
3. **Resources list + detail + create** — Core survival feature. Demonstrates list/detail/create pattern for all domain entities.
4. **One additional domain screen (e.g., Species)** — Proves pattern works across entities.

Defer to later phases:
- **Optimistic updates** — Nice-to-have; implement after basic mutations work
- **Offline queue** — Phase 11 (Offline Sync) will handle this comprehensively
- **Complex error boundaries** — Add after identifying common error patterns

---

## Integration Patterns (Answer to Research Question)

### 1. Data Fetching in Screens

**Recommended approach: TanStack Query `useQuery`**

```typescript
// services/astronautService.ts
import api from './api'; // Axios instance with interceptors

export const fetchAstronautProfile = async () => {
  const response = await api.get('/api/v1/astronauts/me');
  return response.data; // Axios interceptor returns response.data automatically
};

// screens/UserProfile.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchAstronautProfile } from '../../services/astronautService';

export default function UserProfileScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['astronaut', 'me'],
    queryFn: fetchAstronautProfile,
  });

  if (isLoading) return <ActivityIndicator size="large" color={colors.primary} />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>{data.name}</Text>
      {/* Render profile details */}
    </View>
  );
}
```

**Why TanStack Query:**
- Caches responses automatically (no duplicate requests)
- Provides `isLoading`, `isError`, `isRefetching` booleans
- Handles background refetch when screen refocuses
- Integrates with TypeScript (generic `useQuery<DataType>()`)

---

### 2. Form Submissions (Login, Register, Create Resource)

**Recommended approach: TanStack Query `useMutation`**

```typescript
// services/authService.ts
import api from './api';

export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/api/v1/auth/login', credentials);
  return response.data; // { accessToken, refreshToken, user }
};

// screens/Login.tsx
import { useMutation } from '@tanstack/react-query';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login: setAuth } = useAuth();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Store tokens in expo-secure-store
      setAuth(data.accessToken, data.refreshToken);
      // Navigate to main app (replace prevents going back to login)
      router.replace('/(app)/(tabs)/home');
    },
    onError: (error: any) => {
      Alert.alert('Login Failed', error.response?.data?.message || 'Please try again');
    },
  });

  const handleLogin = () => {
    mutation.mutate({ email, password });
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button
        title={mutation.isPending ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={mutation.isPending}
      />
      {mutation.isPending && <ActivityIndicator />}
    </View>
  );
}
```

**Key points:**
- `mutation.isPending` replaces manual loading state
- `mutation.error` provides error object
- Navigate after success using `router.replace()` (login) or `router.back()` (create forms)
- Show `ActivityIndicator` during pending state

---

### 3. List/Detail Views

**List with FlatList + Pagination:**

```typescript
// screens/ResourcesList.tsx
import { useQuery } from '@tanstack/react-query';
import { FlatList, RefreshControl } from 'react-native';

export default function ResourcesListScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['resources', page],
    queryFn: () => fetchResources(page, 10),
    keepPreviousData: true, // Smooth pagination
  });

  const loadMore = () => {
    if (data && page < data.totalPages) {
      setPage(page + 1);
    }
  };

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error loading resources</Text>;

  return (
    <FlatList
      data={data?.resources || []}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => router.push(`/resources/${item._id}`)}>
          <Text>{item.name}</Text>
          <Text>Quantity: {item.quantity}</Text>
        </TouchableOpacity>
      )}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        data && page < data.totalPages ? <ActivityIndicator /> : null
      }
    />
  );
}
```

**Detail view:**

```typescript
// screens/ResourceDetail.tsx
export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams();
  
  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => fetchResourceById(id as string),
    enabled: !!id, // Only run if id exists
  });

  // ... loading/error handling
}
```

---

### 4. Optimistic Updates

**Pattern for toggling a resource status or updating a field:**

```typescript
const toggleResourceMutation = useMutation({
  mutationFn: (id: string) => toggleResourceStatus(id),
  
  // 1. Before mutation: snapshot + optimistic update
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['resource', id] });
    const previous = queryClient.getQueryData(['resource', id]);
    
    queryClient.setQueryData(['resource', id], (old: any) => ({
      ...old,
      status: old.status === 'active' ? 'inactive' : 'active',
    }));
    
    return { previous };
  },
  
  // 2. On error: rollback
  onError: (err, id, context) => {
    queryClient.setQueryData(['resource', id], context?.previous);
    Alert.alert('Error', 'Failed to update resource');
  },
  
  // 3. On settle: always refetch to sync with server
  onSettled: (data, error, id) => {
    queryClient.invalidateQueries({ queryKey: ['resource', id] });
  },
});
```

**When to use optimistic updates:**
- Toggling boolean fields (status, favorite)
- Incrementing/decrementing quantities
- Adding items to a list (optimistically add, rollback on error)

**When NOT to use:**
- Financial transactions
- Deleting critical data (unless undo is possible)
- Creating resources that need server-generated IDs (use standard mutation instead)

---

### 5. Error Handling in UI

**Global error handling via Axios interceptor:**

```typescript
// services/api.ts
import axios from 'axios';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Request interceptor: add JWT to all requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response.data, // Unwrap data automatically
  async (error) => {
    if (!error.response) {
      // Network error
      Alert.alert('Network Error', 'Please check your connection');
      return Promise.reject({ message: 'Network Error' });
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Token expired or invalid
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        router.replace('/(auth)/login');
        return Promise.reject({ message: 'Session expired' });
      
      case 403:
        Alert.alert('Forbidden', 'You don\'t have permission');
        break;
      
      case 400:
        // Validation error - return for component to handle
        return Promise.reject({ 
          message: data?.message || 'Invalid request',
          errors: data?.errors, // Field-specific errors
        });
      
      case 500:
        Alert.alert('Server Error', 'Please try again later');
        break;
    }

    return Promise.reject(error.response.data);
  }
);

export default api;
```

**Per-component error display (forms):**

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const mutation = useMutation({
  mutationFn: createResource,
  onError: (error: any) => {
    if (error.errors) {
      // Backend returned field-specific errors
      setErrors(error.errors); // { name: 'Name is required', quantity: 'Must be > 0' }
    }
  },
});

// In JSX:
{errors.name && <Text style={{ color: colors.danger }}>{errors.name}</Text>}
```

---

### 6. Loading States

**Patterns for different loading scenarios:**

```typescript
// Full-screen loading (initial load)
const { data, isLoading } = useQuery({ queryKey: ['resources'], queryFn: fetchResources });
if (isLoading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

// Inline loading (refetch)
const { isRefetching } = useQuery({ ... });
// Show RefreshControl in FlatList

// Mutation loading
const mutation = useMutation({ ... });
// mutation.isPending === true during request

// Skeleton loading (advanced)
// Use react-native-skeleton-placeholder or similar library
```

**Design system integration:**
- Use `colors.primary` for ActivityIndicator
- Wrap loading states in `View` with `flex: 1, justifyContent: 'center', alignItems: 'center'`
- Don't use hardcoded colors (enforce project constraint)

---

### 7. Navigation After API Calls

**Login/Register (replace to prevent back navigation):**

```typescript
const loginMutation = useMutation({
  mutationFn: login,
  onSuccess: (data) => {
    await setAuth(data.accessToken, data.refreshToken);
    router.replace('/(app)/(tabs)/home'); // Can't go back to login
  },
});
```

**Create form (go back to list):**

```typescript
const createMutation = useMutation({
  mutationFn: createResource,
  onSuccess: () => {
    router.back(); // Go back to list
    // OR navigate to detail if ID is returned:
    // router.push(`/resources/${data._id}`);
  },
});
```

**Update form (go back to detail):**

```typescript
const updateMutation = useMutation({
  mutationFn: (data) => updateResource(id, data),
  onSuccess: () => {
    router.back(); // Back to detail view
  },
});
```

**Delete (go back to list):**

```typescript
const deleteMutation = useMutation({
  mutationFn: () => deleteResource(id),
  onSuccess: () => {
    router.dismiss(); // Dismiss modal OR router.back()
  },
});
```

---

## Sources

| Source | Type | Confidence | Notes |
|--------|------|------------|-------|
| [TanStack Query React Native Docs](https://tanstack.com/query/latest/docs/framework/react/react-native) | Official Docs | HIGH | Refresh on focus, disable on blur patterns |
| [TanStack Query Optimistic Updates Guide](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) | Official Docs | HIGH | onMutate, onError, onSettled pattern |
| [Expo Router Authentication Guide](https://docs.expo.dev/router/advanced/authentication/) | Official Docs | HIGH | Stack.Protected, AuthContext pattern |
| [Expo Docs: Authentication](https://docs.expo.dev/develop/authentication/) | Official Docs | HIGH | Navigation auth flow, token storage |
| [OneUptime: React Native TanStack Query](https://oneuptime.com/blog/post/2026-01-15-react-native-tanstack-query/view) | Article (2026) | HIGH | Comprehensive guide with code examples |
| [Mastering React Query in 2025](https://dev.to/jdavissoftware/mastering-react-query-in-2025-a-deep-dive-into-data-fetching-for-modern-apps-22jf) | Article (2025) | HIGH | Pagination, offline support, devtools |
| [React Native FlatList Docs](https://reactnative.dev/docs/flatlist) | Official Docs | HIGH | onEndReached, RefreshControl, pagination |
| [Mastering API Error Handling in React Native](https://codercrafter.in/blogs/react-native/mastering-api-error-handling-in-react-native-a-2025-developers-survival-guide) | Article (2025) | MEDIUM | Axios interceptors, error handling patterns |
| [Optimistic Updates & Offline Thinking](https://medium.com/@didemsahin1789/optimistic-updates-offline-thinking-in-react-native-274b702f0652) | Article (2026) | MEDIUM | Queue pattern for offline mutations |
| [Authentication Flow with Expo Router](https://blog.devgenius.io/complete-authentication-flow-with-expo-router-and-react-native-step-by-step-guide-c9a4d67b5f6c) | Article (2025) | MEDIUM | useAuth hook, protected routes |
| Project ROADMAP.md (Phase 9-10) | Internal Docs | HIGH | Existing API endpoints and pagination support |
| Project PROJECT.md | Internal Docs | HIGH | Expo Router structure, design system constraints |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Data fetching (TanStack Query) | HIGH | Official docs + multiple 2025-2026 articles confirm pattern |
| Form submissions (useMutation) | HIGH | TanStack Query docs + examples |
| List/Detail (FlatList + useQuery) | HIGH | React Native docs + community examples |
| Optimistic updates | HIGH | TanStack Query official guide |
| Error handling (Axios interceptors) | HIGH | Multiple sources + standard pattern |
| Loading states | HIGH | Well-documented in TanStack Query |
| Navigation after mutations | HIGH | Expo Router docs + React Navigation patterns |
| Token refresh flow | MEDIUM | Pattern documented, but needs testing with backend |

---

## Gaps to Address

- **Token refresh implementation details** — Need to verify exact backend response format for `/auth/refresh` endpoint (Phase 9)
- **Pagination query key structure** — Need to decide between `useQuery` with page state vs `useInfiniteQuery` (recommend `useQuery` with `keepPreviousData` for simplicity)
- **Offline queue implementation** — Phase 11 will handle comprehensively; for now, just detect offline and show message
- **Image upload for species/avatar** — May need `FormData` + special handling for React Native (Axios patchForm issue on Android, per GitHub #6968)
