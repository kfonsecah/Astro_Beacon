# Phase 5: Base de la App y Conexión API - Research

**Researched:** 2026-04-03
**Domain:** Expo Router v6, Axios API service, React Native auth patterns, Expo SecureStore
**Confidence:** HIGH

## Summary

This phase bridges the completed design system (Phase 4) and mockup routes (Phase 3) into a functional app base with API connectivity. The core challenge is integrating existing route files — which currently use inline styles — with the Phase 4 design system, while establishing the API service layer and auth guard pattern. The login screen is the ideal candidate for the "at least one screen connected to API" requirement since it has a clear DTO (`LoginDTO`, `LoginResponse`) already defined in Phase 2.

**Primary recommendation:** Use `Stack.Protected` from expo-router v6 for auth guards, axios with interceptors for the API service, `expo-secure-store` for JWT persistence, and migrate the login screen to use Phase 4 UI components as the demo of API connection.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- No CONTEXT.md exists for this phase — no locked decisions to enforce.

### the agent's Discretion
- No CONTEXT.md exists — all architectural choices are at the agent's discretion within project constraints.

### Deferred Ideas (OUT OF SCOPE)
- No CONTEXT.md exists — no deferred ideas.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `axios` | `1.14.0` | HTTP client for API calls | Industry standard, interceptors, typed responses, works with Expo |
| `expo-secure-store` | `~15.0.15` (SDK 54 bundled) | Secure JWT token storage | Native encryption (Keychain/Keystore), Expo-managed, no native build needed |
| `expo-splash-screen` | `~31.0.13` | Splash screen during auth check | Already installed, prevents flash of login screen |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@react-native-async-storage/async-storage` | `3.0.2` | Non-sensitive app state caching | Resource cache, preferences, non-secret data |
| `expo-netinfo` | SDK 54 bundled | Network connectivity detection | Offline detection, API availability check |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `axios` | `fetch` (built-in) | fetch lacks interceptors, requires manual retry logic; axios is standard for RN |
| `expo-secure-store` | `AsyncStorage` for tokens | AsyncStorage is plaintext — insecure for JWTs; secure-store uses native encryption |
| `Stack.Protected` | Manual `Redirect` in `index.tsx` | Manual redirect is fragile (back-button bypass); `Stack.Protected` handles history clearing |

**Installation:**
```bash
npx expo install axios expo-secure-store @react-native-async-storage/async-storage
```

**Version verification:**
```bash
npm view axios version          # → 1.14.0 (verified 2026-04-03)
npm view expo-secure-store version  # → SDK 54 bundled version
npm view @react-native-async-storage/async-storage version  # → 3.0.2 (verified 2026-04-03)
```

## Architecture Patterns

### Recommended Project Structure

The phase must complete the folder structure required by the cátedra. Currently missing directories:

```
src/
├── services/              # NEW — API layer
│   ├── api.ts             # Axios instance with interceptors
│   └── auth.service.ts    # Auth-specific API calls (login, refresh)
├── context/               # NEW — Global state providers
│   └── AuthContext.tsx    # Auth state + token management
├── utils/                 # NEW — Helper functions
│   └── storage.ts         # SecureStore + AsyncStorage wrappers
├── screens/               # NEW — Screen components (optional, per cátedra structure)
│   └── LoginScreen/
│       ├── LoginScreen.tsx
│       └── LoginScreen.styles.ts
├── components/            # EXISTING (Phase 4)
│   ├── ui/                # Button, Card, Input, Badge, etc.
│   └── common/            # OfflineBanner, etc.
├── hooks/                 # EXISTING (Phase 4)
│   └── use-theme.ts
├── constants/             # EXISTING (Phase 4)
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
├── theme/                 # EXISTING (Phase 4)
│   ├── dark.ts
│   ├── light.ts
│   └── index.ts
└── types-dtos/            # EXISTING (Phase 2)
    ├── sesion.dto.ts
    ├── shared.types.ts
    └── ...
```

### Pattern 1: Expo Router v6 Auth with `Stack.Protected`

**What:** Use `Stack.Protected` to guard route groups based on authentication state.

**When to use:** Always — this is the expo-router v6 standard for auth guards.

**Example:**
```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}
```

**Source:** [Expo Docs — Protected Routes](https://docs.expo.dev/router/advanced/protected/)

### Pattern 2: AuthContext with Token Management

**What:** React Context provider that manages auth state, token storage, and login/logout.

**When to use:** Always — single source of truth for auth state across the app.

**Example:**
```tsx
// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { LoginDTO, LoginResponse } from "@/types-dtos";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: LoginResponse["astronauta"] | null;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<LoginResponse["astronauta"] | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(credentials: LoginDTO) {
    const response = await authService.login(credentials);
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
    setUser(response.astronauta);
    setIsAuthenticated(true);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

### Pattern 3: Axios Service with Interceptors

**What:** Centralized axios instance with request/response interceptors for token injection and error handling.

**When to use:** Always — every API call should go through the configured instance.

**Example:**
```tsx
// src/services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { ApiResponse } from "@/types-dtos";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.100:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("auth_token");
      await SecureStore.deleteItemAsync("auth_refresh_token");
    }
    return Promise.reject(error);
  }
);

export { api };
```

### Pattern 4: Mock API for Base Inicial Demo

**What:** Since the backend doesn't exist yet, create a mock service that simulates API responses with realistic delays.

**When to use:** For Base Inicial delivery — demonstrates the connection pattern without a real backend.

**Example:**
```tsx
// src/services/mock.api.ts
import { LoginDTO, LoginResponse } from "@/types-dtos";

const MOCK_DELAY = 1500;

export async function mockLogin(credentials: LoginDTO): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  if (!credentials.email || !credentials.password) {
    throw new Error("Credenciales inválidas");
  }

  return {
    token: "mock-jwt-token-" + Date.now(),
    refreshToken: "mock-refresh-token-" + Date.now(),
    expiraEn: new Date(Date.now() + 3600000),
    astronauta: {
      id: "astronaut-001",
      nombre: credentials.email.split("@")[0],
      email: credentials.email,
      rol: "astronaut",
    },
  };
}
```

### Anti-Patterns to Avoid

- **Inline Redirect without auth state:** Don't use `<Redirect href="/(tabs)/dashboard" />` in `index.tsx` without checking auth state first — this creates a flash and allows back-button bypass.
- **Storing tokens in AsyncStorage:** Never store JWTs in plaintext. Use `expo-secure-store`.
- **Hardcoding API URLs:** Use environment variables (`EXPO_PUBLIC_API_URL`) with a fallback.
- **Mixing UI and API logic in screens:** Keep API calls in services, state in context, UI in screens.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP client | Custom `fetch` wrapper | `axios` | Interceptors, automatic JSON, retry logic, timeout handling |
| Token storage | AsyncStorage or state | `expo-secure-store` | Native encryption, platform-specific keychain/keystore |
| Auth guards | Manual `useEffect` + `router.replace` | `Stack.Protected` | Handles history clearing, nested guards, tab protection |
| Splash screen | Custom loading screen | `expo-splash-screen` | Native-level splash, prevents white flash, already installed |
| Form validation | Manual string checks | Zod (already in reference) | Schema validation, type inference, error messages |

**Key insight:** Auth flows have subtle edge cases (token refresh race conditions, back-button bypass, splash screen timing) that are easy to get wrong. Using expo-router's built-in `Stack.Protected` and `expo-splash-screen` eliminates entire categories of bugs.

## Runtime State Inventory

> This is not a rename/refactor/migration phase. Omitted.

## Common Pitfalls

### Pitfall 1: Splash Screen + Auth Check Race Condition
**What goes wrong:** The splash screen hides before auth state is checked, showing a flash of the login screen or briefly showing the dashboard before redirecting.
**Why it happens:** `SplashScreen.hideAsync()` is called before `SecureStore.getItemAsync()` resolves.
**How to avoid:** Call `SplashScreen.preventAutoHideAsync()` in the root layout, then only call `hideAsync()` after `isLoading` becomes `false` in the auth context.
**Warning signs:** White flash on app launch, login screen visible for < 1 second.

### Pitfall 2: Stack.Protected with Route Groups
**What goes wrong:** Declaring the same screen in both `(auth)/` and `(tabs)/` groups causes expo-router errors.
**Why it happens:** Expo Router v6 requires each screen to exist in only one active route group at a time.
**How to avoid:** Use `Stack.Protected` to conditionally include entire route groups, not individual screens. The `(auth)/` group contains login, the `(tabs)/` group contains dashboard — they're mutually exclusive.
**Warning signs:** "Screen already exists" errors, navigation crashes.

### Pitfall 3: Axios in React Native — FormData Issues
**What goes wrong:** File uploads (photos for species identification) fail silently or send empty data.
**Why it happens:** React Native's `FormData` is different from the browser's. Axios needs the `uri` field to be a local file path, not a blob URL.
**How to avoid:** When uploading files, use `{ uri: localUri, type: "image/jpeg", name: "photo.jpg" }` format. This is a known React Native + axios quirk.
**Warning signs:** Empty uploads, 400 errors from backend.

### Pitfall 4: SecureStore iOS Keychain Persistence
**What goes wrong:** After reinstalling the app on iOS, old tokens are still present, causing auth state confusion.
**Why it happens:** iOS Keychain persists data across app uninstallations for the same bundle ID.
**How to avoid:** On first launch after install, check if the token is still valid by calling a `/me` endpoint. If invalid, clear SecureStore.
**Warning signs:** "Logged in" state after fresh install, but API calls fail with 401.

### Pitfall 5: Inline Styles Not Migrated from Phase 3
**What goes wrong:** Screens still use hardcoded colors (`#0B1120`, `#6EE7B7`) instead of theme tokens.
**Why it happens:** Phase 3 screens were built before the design system existed.
**How to avoid:** Replace all hardcoded color values with `theme.colors.*` from `useTheme()`. Start with the login screen as the migration example.
**Warning signs:** Screens don't respond to theme changes, colors don't match design system.

## Code Examples

### AuthContext Provider in Root Layout
```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
```

### Login Screen with Design System Components
```tsx
// app/(auth)/login.tsx
import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { Button, Input, Card } from "@/components/ui";
import { HudHeader } from "@/components/ui/HudHeader";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/(tabs)/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <HudHeader title="ASTRO_BEACON" subtitle="Houston, we need you" />

          <Card style={styles.formCard}>
            <Input
              label="AGENT_ID"
              value={email}
              onChangeText={setEmail}
              placeholder="Ingrese ID de agente"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="ACCESS_KEY"
              value={password}
              onChangeText={setPassword}
              placeholder="Ingrese clave de acceso"
              secureTextEntry
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
              </View>
            )}

            <Button
              title="INICIAR SESIÓN"
              onPress={handleLogin}
              variant="primary"
              disabled={loading}
            />
          </Card>

          <Text style={[styles.footer, { color: theme.colors.textDisabled }]}>
            Sistema de Asistencia Astronauta v1.0
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 32 },
  formCard: { padding: 24 },
  errorContainer: { marginBottom: 16 },
  errorText: { fontFamily: "monospace", fontSize: 10, textAlign: "center" },
  footer: { fontFamily: "monospace", fontSize: 9, textAlign: "center", marginTop: 32, letterSpacing: 1 },
});
```

### Auth Service (Real API)
```tsx
// src/services/auth.service.ts
import { api } from "./api";
import { LoginDTO, LoginResponse, ApiResponse } from "@/types-dtos";

export const authService = {
  async login(credentials: LoginDTO): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", credentials);
    return response.data.data;
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/refresh", { refreshToken });
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `useEffect` + `router.replace` for auth | `Stack.Protected` in expo-router v6 | Expo Router v5+ | Cleaner, handles history clearing automatically |
| `AsyncStorage` for JWT tokens | `expo-secure-store` | Always recommended | Native encryption, platform keychain |
| `fetch` with manual headers | `axios` with interceptors | Industry standard | Automatic token injection, error handling |
| Custom splash screen component | `expo-splash-screen` API | Expo SDK 49+ | Native-level, no flash |
| Inline styles everywhere | Theme tokens via `useTheme()` | Phase 4 completed | Consistent design, theme switching |

**Deprecated/outdated:**
- `expo-router` v4 `unstable_settings` — replaced by stable route group configuration in v5+
- `SplashScreen.hideAsync()` without `preventAutoHideAsync()` — causes flash on modern Expo
- Manual auth redirect in `index.tsx` — replaced by `Stack.Protected` pattern

## Open Questions

1. **What API endpoint should the demo connect to?**
   - What we know: The rubric requires "Se desarrolla la API del sistema, y se consume desde la aplicación." The backend will be built later.
   - What's unclear: Whether the demo should use a mock service, a public test API, or a simple local Express server.
   - Recommendation: Use a mock service (`src/services/mock.api.ts`) that simulates realistic delays and responses. This demonstrates the connection pattern without requiring a real backend. The mock can be swapped for real API calls by changing the import in `auth.service.ts`.

2. **Should `src/screens/` directory be created?**
   - What we know: The cátedra structure shows `src/screens/UserProfile/` as an example.
   - What's unclear: Whether screens should live in `app/` (expo-router convention) or `src/screens/` (cátedra convention).
   - Recommendation: Keep route files in `app/` (expo-router requirement) but extract screen components into `src/screens/` for reusability. For this phase, the login screen component can be extracted to `src/screens/LoginScreen/`.

3. **Environment variable for API URL?**
   - What we know: No `.env` files currently exist.
   - What's unclear: Whether to create `.env` and `.env.example` files.
   - Recommendation: Create `.env.example` with `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api` and add `.env` to `.gitignore`. Use a fallback URL in the code.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Development | ✓ | Check with `node --version` | — |
| Expo CLI | Development | ✓ | SDK 54.0.33 | — |
| Android Studio / Xcode | Testing | Unknown | — | Use Expo Go on physical device |
| Backend API | API connection | ✗ | — | Mock service (recommended for Base Inicial) |
| `axios` | HTTP client | ✗ | 1.14.0 available | Install via `npx expo install` |
| `expo-secure-store` | Token storage | ✗ | SDK 54 bundled | Install via `npx expo install` |
| `@react-native-async-storage/async-storage` | Non-sensitive cache | ✗ | 3.0.2 available | Install via `npx expo install` |

**Missing dependencies with no fallback:**
- None — mock service covers the missing backend requirement.

**Missing dependencies with fallback:**
- `axios` — installable, no fallback needed
- `expo-secure-store` — installable, no fallback needed
- `@react-native-async-storage/async-storage` — installable, no fallback needed

## Validation Architecture

> Skipping — no test infrastructure detected in the project. The planner should determine if manual verification steps are sufficient.

### Manual Verification Steps
| Requirement | Verification |
|-------------|-------------|
| Routes configured with expo-router | Run `npx expo start` and navigate to login → dashboard |
| Layouts implemented | Verify `(auth)/_layout.tsx` and `(tabs)/_layout.tsx` render correctly |
| API service configured | Check `src/services/api.ts` exists with axios instance and interceptors |
| At least one screen connected to API | Login screen calls auth service, shows loading/error states |
| Folder structure complete | Verify all cátedra directories exist: `services/`, `context/`, `utils/` |

## Sources

### Primary (HIGH confidence)
- [Expo Docs — Protected Routes](https://docs.expo.dev/router/advanced/protected/) — `Stack.Protected` API verified (modified April 2026)
- [Expo Docs — SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) — API methods, iOS Keychain persistence behavior
- [Axios GitHub](https://github.com/axios/axios) — v1.x API, interceptors, config options
- [package.json](./package.json) — Current dependencies, Expo SDK 54.0.33, expo-router ~6.0.23
- `.planning/docs/DATA-DESIGN.md` — DTOs and entity relationships
- `.planning/docs/MOCKUPS.md` — Route tree and screen descriptions

### Secondary (MEDIUM confidence)
- Expo Router v6 route group patterns — inferred from official docs + current codebase structure
- axios + React Native FormData handling — known community pattern, verified via axios README

### Tertiary (LOW confidence)
- Exact version of `expo-secure-store` bundled with SDK 54 — should verify with `npx expo install expo-secure-store`
- `@react-native-async-storage/async-storage` Expo compatibility — should verify with `npx expo install`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified versions via npm registry, official docs for all libraries
- Architecture: HIGH — `Stack.Protected` verified from official Expo docs, patterns from codebase analysis
- Pitfalls: MEDIUM — based on known React Native + Expo patterns, verified via official docs where possible
- Code examples: MEDIUM — patterns are standard but not tested against this specific codebase

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (30 days — Expo SDK 54 is stable)
