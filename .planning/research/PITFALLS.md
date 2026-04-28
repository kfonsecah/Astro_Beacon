# Domain Pitfalls

**Domain:** API-Frontend Integration (React Native/Expo + Node.js/Express JWT)
**Researched:** 2026-04-27

## Critical Pitfalls

Mistakes that cause security breaches, major rewrites, or complete feature failure.

### Pitfall 1: Insecure Token Storage (AsyncStorage for JWT)
**What goes wrong:** JWT access/refresh tokens are stored in AsyncStorage, which is unencrypted, stored in plain text, and accessible to any JavaScript code running in the app. This makes tokens vulnerable to theft via XSS attacks, reverse engineering, or malicious packages.
**Why it happens:** Developers default to AsyncStorage (familiar from web development) instead of Expo's secure storage solution, underestimate JWT sensitivity, or are unaware of `expo-secure-store`.
**Consequences:** Token theft leading to unauthorized API access, account takeover, data breaches. Violates security requirements for the course deliverable.
**Prevention:** Use `expo-secure-store` (encrypted, hardware-backed when available) for all auth tokens. Never use AsyncStorage for sensitive data. Example:
```typescript
import * as SecureStore from 'expo-secure-store';

// Save token
await SecureStore.setItemAsync('accessToken', token);
// Get token
const token = await SecureStore.getItemAsync('accessToken');
```
**Detection:** Search codebase for `AsyncStorage.getItem('token')` or `AsyncStorage.setItem('token')` in auth-related files (e.g., `src/services/api.ts`, `src/context/auth.tsx`).

### Pitfall 2: Unhandled Token Expiration
**What goes wrong:** Access tokens expire after their TTL, API requests return 401 Unauthorized, and the app does not automatically refresh the token or redirect to login. Users are unexpectedly logged out, or screens break with unhandled 401 errors.
**Why it happens:** No refresh token rotation logic, no interceptor on the API client to catch 401 responses, or refresh token expiration is not handled.
**Consequences:** Poor UX, repeated login prompts, broken screens when API calls fail, failed UAT for auth flows.
**Prevention:** Implement an API client interceptor (using axios or fetch with wrapper) that:
1. Catches 401 responses
2. Uses the refresh token to request a new access token
3. Retries the original request with the new token
4. If refresh token is expired, clears auth state and redirects to login
Example using axios:
```typescript
// src/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const api = axios.create({ baseURL: process.env.API_URL });

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const { data } = await axios.post('/auth/refresh', { refreshToken });
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);
```
**Detection:** API calls failing with 401 after 15-60 minutes (typical JWT TTL), user session ending unexpectedly, no refresh token logic in API service.

## Moderate Pitfalls

Mistakes that cause UX issues, failed requirements, or performance degradation.

### Pitfall 1: Memory Leaks from Unmounted Components
**What goes wrong:** A component triggers an API fetch, but the user navigates away before the request completes. The component tries to update state after unmounting, causing React warnings and memory leaks.
**Prevention:** Use `AbortController` with fetch requests, or a cleanup function in `useEffect` to track mounted state. For expo-router projects, use the `useFocusEffect` hook with cleanup, or:
```typescript
// Example with AbortController
useEffect(() => {
  const controller = new AbortController();
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', { signal: controller.signal });
      const data = await response.json();
      setData(data);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err);
    }
  };
  fetchData();
  return () => controller.abort();
}, []);
```

### Pitfall 2: Incorrect Navigation After Login
**What goes wrong:** After successful login, the app uses `router.navigate` instead of `router.replace` or `router.reset`, leaving the login screen in the navigation stack. Users can press the back button to return to the login screen even when authenticated.
**Prevention:** After login, use `router.replace('/(app)/(tabs)')` to reset the navigation stack and clear auth routes. For expo-router, use:
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
// After successful login
router.replace('/(app)/(tabs)');
```

### Pitfall 3: Platform-Specific Issues (iOS vs Android)
**What goes wrong:** Integrated screens do not account for platform differences, leading to keyboard covering inputs on iOS, clipped content under notches on iOS, or touch targets too small on Android. Violates the project's cross-platform requirement.
**Prevention:** Follow the platform-specific patterns defined in `PROJECT.md`:
- Use `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`
- Apply `SafeAreaView` to all screens
- Ensure touch targets meet minimum sizes (44x44pt iOS, 48x48dp Android)
- Test on both iOS Simulator (iPhone 15) and Android Emulator (Pixel 7)

### Pitfall 4: Design System Inconsistency During Integration
**What goes wrong:** When replacing mocked data with real API data, developers hardcode colors, spacing, or typography instead of using the project's design system tokens. Violates the "Cero valores hardcodeados" rule in `PROJECT.md`.
**Prevention:** 
- Always use `useTheme()` to access design tokens
- Never use hardcoded hex values (e.g., `#0B1120`) or numeric spacing (e.g., `16`) without checking for a token
- Add an ESLint rule to ban hardcoded color values in `src/screens/` and `src/components/`
- Checklist item for every integrated screen: "All UI values use design system tokens"

### Pitfall 5: Unhandled Offline State
**What goes wrong:** The app attempts API calls when offline, with no feedback to the user, no caching of data, and no sync logic when the connection is restored. Violates the active requirement for "Offline con sincronización".
**Prevention:**
- Use `@react-native-community/netinfo` to detect network state
- Display the existing `OfflineBanner` component when offline
- Cache non-sensitive API responses in AsyncStorage (not for tokens)
- Implement sync queue for mutations when back online

## Minor Pitfalls

### Pitfall 1: Untyped API Responses
**What goes wrong:** API responses are not typed with TypeScript interfaces, leading to runtime errors, no autocomplete, and harder maintenance.
**Prevention:** Define DTOs in `src/types-dtos/` for all API requests/responses, and type the API client responses.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Auth Integration | Insecure Token Storage, Unhandled Token Expiration, Incorrect Navigation After Login | Use `expo-secure-store` for tokens, implement refresh token interceptor, use `router.replace` after login |
| Domain Integration | Memory Leaks, Platform-Specific Issues, Design System Inconsistency | Use `AbortController` for fetches, follow `PROJECT.md` cross-platform patterns, enforce design system tokens |
| Error Handling / Offline | Unhandled Offline State | Integrate `@react-native-community/netinfo`, use `OfflineBanner`, cache non-sensitive data |

## Sources

- Expo SecureStore Documentation: https://docs.expo.dev/versions/latest/sdk/securestore/ (HIGH confidence)
- Expo Router Authentication Guide: https://docs.expo.dev/router/advanced/authentication/ (HIGH confidence)
- React Native Networking Best Practices: https://reactnative.dev/docs/network (HIGH confidence)
- @react-native-community/netinfo Docs: https://github.com/react-native-netinfo/react-native-netinfo (HIGH confidence)
- Project PROJECT.md (Cross-Platform, Design System rules): /home/brian/4_anno/Moviles/Astro_Beacon/.planning/PROJECT.md (HIGH confidence)
- JWT Best Practices: https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/ (HIGH confidence)
