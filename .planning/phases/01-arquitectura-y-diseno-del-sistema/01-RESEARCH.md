# Phase 1: Arquitectura y Diseño del Sistema - Research

**Researched:** 2026-04-02
**Domain:** React Native/Expo architecture, API design, state management, diagramming
**Confidence:** HIGH

## Summary

This phase is a documentation and design phase — the deliverable is a well-justified architecture document with a draw.io diagram, not code implementation. The research confirms that the course requires: (1) a clear client-server separation, (2) React Native + TypeScript frontend with layered or feature-based organization, (3) a versioned and documented API, and (4) justified design patterns.

The project already has Expo SDK 54 with expo-router, React 19, and React Native 0.81.5 scaffolded. The reference project (astro-beacon-reference/) is a web-only visual prototype that defines the HUD/space aesthetic but cannot be reused directly — all components must be re-implemented with React Native equivalents.

**Primary recommendation:** Use a simplified layer-first organization (mandated by the professor's structure) with feature-based sub-grouping within layers. Frontend uses Zustand for global state, expo-router for navigation, and a service-layer abstraction for all external communication. Backend is a separate Node.js/Express REST API with MongoDB, documented via Swagger/OpenAPI.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Arquitectura cliente-servidor con separación clara entre frontend (React Native/Expo) y backend (API REST)
- **D-02:** Frontend organizado por funcionalidades dentro de la estructura de carpetas del profesor
- **D-03:** API versionada (v1) con documentación (Swagger/OpenAPI)
- **D-04:** Presentación-contenedor (smart/dumb components) — componentes de pantalla manejan lógica, componentes UI son puros
- **D-05:** Custom hooks como capa de abstracción entre pantallas y servicios
- **D-06:** Servicios como única capa de comunicación externa (API, storage, device APIs)
- **D-07:** API REST con controladores, servicios y repositorios (3 capas)
- **D-08:** Base de datos NoSQL (MongoDB/Firebase) para flexibilidad con datos de bitácora y especies
- **D-09:** expo-router con route groups: `(auth)/` para login/register, `(app)/` para pantallas protegidas con tabs
- **D-10:** Bottom tabs para secciones principales: Dashboard, Bitácora, Mapa, Recursos, Perfil
- **D-11:** Estética HUD/espacial del proyecto `astro-beacon-reference/` como guía visual
- **D-12:** Adaptar componentes web (shadcn/ui, framer-motion) a equivalentes React Native

### the agent's Discretion
- Herramienta específica para diagramas (draw.io recomendado pero abierto)
- Formato exacto de documentación de arquitectura
- Nivel de detalle del diagrama de base de datos

### Deferred Ideas (OUT OF SCOPE)
- Implementación real de la API — Fase 5+ (solo se necesita conexión base en Base Inicial)
- Diseño de datos detallado — Phase 2
- Mockups de pantallas — Phase 3
- Design system implementation — Phase 4
</user_constraints>

---

## Standard Stack

### Frontend (React Native / Expo)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-router | ~6.0.23 | File-based routing | Official Expo routing, built on React Navigation, typed routes, deep linking |
| zustand | 5.0.12 | Global state management | Minimal boilerplate, no context providers, TypeScript-first, persist middleware for offline |
| @tanstack/react-query | ^5.x | Server state & caching | Industry standard for API data fetching, automatic caching, offline support |
| zod | 4.3.6 | Schema validation | Runtime type validation for API responses, forms, and user input (v4 confirmed 2026-04-02) |
| @react-native-async-storage/async-storage | 3.0.2 | Local key-value storage | Expo-compatible, used with zustand persist for offline state (v3 confirmed 2026-04-02) |
| @react-native-community/netinfo | latest | Network connectivity detection | Required for offline/online sync detection |
| react-native-reanimated | ~4.1.1 | Animations | Already installed, required for HUD effects and gesture animations |
| react-native-gesture-handler | ~2.28.0 | Touch/gesture handling | Already installed, required for course gesture requirement |
| expo-secure-store | latest | Secure token storage | Required for JWT auth tokens, course security requirement |

### Backend (API REST)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js + Express | ^4.x (Express) | API server framework | Industry standard, simple 3-layer pattern (controllers/services/repositories) |
| MongoDB + Mongoose | ^8.x | NoSQL database | Flexible schema for bitácora species data, already decided (D-08) |
| swagger-jsdoc + swagger-ui-express | latest | OpenAPI documentation | Required by D-03, auto-generates interactive API docs |
| jsonwebtoken | ^9.x | JWT authentication | Standard token-based auth for mobile API |
| bcryptjs | ^2.x | Password hashing | Secure credential storage |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-image-manipulator | latest | Image compression before upload | Bitácora photo optimization |
| expo-sqlite | latest | Local relational storage | Offline cache for species, resources |
| expo-maps | alpha | Maps/GPS (Apple Maps iOS, Google Maps Android) | Official Expo maps package — replaces react-native-maps. **ALPHA STATUS**: requires dev builds, not Expo Go, frequent breaking changes |
| expo-location | latest | GPS coordinates | Map/supply drop features, permission handling |
| expo-camera / expo-image-picker | latest | Photo capture | Bitácora photo entries |
| expo-speech | latest | Text-to-speech | Species narration (course requirement) |
| axios | ^1.x | HTTP client | API communication (alternative to fetch) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Redux Toolkit | More boilerplate, better devtools — overkill for this project size |
| Zustand | React Context + useReducer | No boilerplate but causes unnecessary re-renders, harder to persist |
| Express | FastAPI (Python) | Faster but requires Python ecosystem — team likely knows Node.js |
| MongoDB | PostgreSQL | More rigid schema, better for relational data — but D-08 decided NoSQL |
| React Query | SWR | Simpler but less feature-rich (no mutations, less offline support) |
| Swagger | Redocly | More modern but Swagger is more widely known and taught |

**Installation (frontend additions):**
```bash
npx expo install zustand @react-native-async-storage/async-storage @react-native-community/netinfo expo-secure-store
npm install @tanstack/react-query zod axios
```

**Installation (backend):**
```bash
mkdir api && cd api
npm init -y
npm install express mongoose swagger-jsdoc swagger-ui-express jsonwebtoken bcryptjs cors dotenv
npm install --save-dev nodemon
```

## Architecture Patterns

### Recommended Project Structure

The professor's structure is mandatory. Within it, we organize by feature sub-groups:

```
project/
├── app/                              # expo-router file-based routes
│   ├── (auth)/                       # Route group: public screens
│   │   ├── _layout.tsx               # Stack navigator for auth flow
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (app)/                        # Route group: protected screens
│   │   ├── _layout.tsx               # Tabs navigator (5 tabs)
│   │   ├── (tabs)/                   # Bottom tabs
│   │   │   ├── index.tsx             # Dashboard (tab 1)
│   │   │   ├── bestiary.tsx          # Bitácora (tab 2)
│   │   │   ├── map.tsx               # Mapa (tab 3)
│   │   │   ├── resources.tsx         # Recursos (tab 4)
│   │   │   └── profile.tsx           # Perfil (tab 5)
│   │   ├── species/
│   │   │   └── [id].tsx              # Species detail (modal/stack)
│   │   ├── exploration/
│   │   │   └── index.tsx             # Active trip tracking
│   │   └── log-resource/
│   │       └── index.tsx             # Resource income/expense form
│   ├── _layout.tsx                   # Root layout: providers, auth guard
│   └── +not-found.tsx                # 404 fallback
│
├── src/                              # Application logic (professor's structure)
│   ├── components/
│   │   ├── ui/                       # Generic primitives: Button, Card, Input
│   │   ├── common/                   # Shared: AppHeader, EmptyState, Loading
│   │   └── space/                    # Domain-specific: ResourceBar, SpaceCard, HudIndicator
│   ├── hooks/                        # Custom hooks (D-05)
│   │   ├── use-auth.ts               # Auth state + session timeout
│   │   ├── use-resources.ts          # Resource management
│   │   ├── use-species.ts            # Species CRUD + AI classification
│   │   ├── use-offline.ts            # Connectivity + sync status
│   │   ├── use-location.ts           # GPS tracking
│   │   └── use-theme.ts              # Dark/light HUD theme
│   ├── services/                     # External communication (D-06)
│   │   ├── api.ts                    # Axios instance, interceptors, base URL
│   │   ├── auth.service.ts           # Login, register, token refresh
│   │   ├── species.service.ts        # Species CRUD, photo upload
│   │   ├── resources.service.ts      # Resource tracking
│   │   ├── storage.service.ts        # AsyncStorage/SQLite wrapper
│   │   ├── sync.service.ts           # Offline queue + sync manager
│   │   └── device.service.ts         # Camera, location, speech
│   ├── context/                      # React Context providers
│   │   ├── auth.context.tsx          # Auth provider for route guards
│   │   └── theme.context.tsx         # Theme provider
│   ├── stores/                       # Zustand stores
│   │   ├── auth.store.ts             # Session, token, user
│   │   ├── resource.store.ts         # O2, water, food levels
│   │   ├── species.store.ts          # Cached species data
│   │   └── sync.store.ts             # Offline queue state
│   ├── constants/                    # App constants
│   │   ├── colors.ts                 # HUD color palette
│   │   ├── spacing.ts                # Spacing scale
│   │   ├── typography.ts             # Font configuration
│   │   └── api.ts                    # API endpoints, timeouts
│   ├── theme/                        # Theme system
│   │   ├── dark.ts                   # Dark HUD theme
│   │   ├── light.ts                  # Light HUD theme
│   │   └── index.ts                  # Theme provider hook
│   ├── types-dtos/                   # TypeScript types
│   │   ├── species.dto.ts            # API request/response types
│   │   ├── resource.dto.ts
│   │   ├── auth.dto.ts
│   │   └── api.types.ts              # Generic API response wrapper
│   ├── utils/                        # Pure helper functions
│   │   ├── formatters.ts             # Date, number formatting
│   │   ├── validators.ts             # Zod schemas
│   │   └── offline-queue.ts          # Queue operations
│   └── screens/                      # Screen components (if not in app/)
│       └── UserProfile/
│           ├── UserProfile.tsx
│           └── UserProfile.styles.ts
│
├── api/                              # Backend API (separate project)
│   ├── src/
│   │   ├── controllers/              # Request handlers (D-07)
│   │   ├── services/                 # Business logic
│   │   ├── repositories/             # Database access
│   │   ├── middleware/               # Auth, validation, error handling
│   │   ├── models/                   # Mongoose schemas
│   │   ├── routes/                   # Express routers (v1/)
│   │   ├── config/                   # DB, swagger, env config
│   │   └── app.ts                    # Express app setup
│   ├── swagger/                      # OpenAPI spec
│   └── package.json
│
├── assets/
│   ├── images/                       # Splash, icons, backgrounds
│   ├── fonts/                        # IBM Plex Mono, Space Grotesk
│   └── sounds/                       # Audio effects
│
├── docs/                             # Architecture documentation
│   ├── ARCHITECTURE-DESIGN.md        # This phase deliverable
│   └── diagrams/                     # draw.io XML files
│
├── app.json
├── tsconfig.json
└── package.json
```

### Pattern 1: Presentation-Container (Smart/Dumb Components)

**What:** Components are split into "smart" containers (screens/hooks) that handle logic and "dumb" presentational components that only render UI.

**When to use:** Always — this is the locked decision (D-04) and the course requirement.

**Example:**
```tsx
// DUMB: src/components/space/ResourceBar.tsx — pure UI component
interface ResourceBarProps {
  label: string;
  value: number;
  max: number;
  segments?: number;
  criticalThreshold?: number;
}

export function ResourceBar({ label, value, max, segments = 10, criticalThreshold = 15 }: ResourceBarProps) {
  const percentage = (value / max) * 100;
  const isCritical = percentage < criticalThreshold;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isCritical && styles.critical]}>{label}</Text>
      <View style={styles.bar}>
        {/* Render segments based on percentage */}
      </View>
      <Text style={styles.value}>{Math.round(percentage)}%</Text>
    </View>
  );
}

// SMART: app/(app)/(tabs)/resources.tsx — screen container
export default function ResourcesScreen() {
  const { resources, isLoading, error } = useResources();
  const { updateResource } = useResourceActions();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  return (
    <ScrollView>
      {resources.map((r) => (
        <ResourceBar
          key={r.id}
          label={r.name}
          value={r.current}
          max={r.max}
          criticalThreshold={15}
        />
      ))}
    </ScrollView>
  );
}
```

### Pattern 2: Custom Hooks as Abstraction Layer

**What:** Custom hooks sit between screens and services, encapsulating business logic and state access.

**When to use:** For every domain concern — auth, resources, species, offline sync.

**Example:**
```tsx
// src/hooks/use-species.ts
export function useSpecies() {
  const { isConnected } = useOffline();
  const speciesStore = useSpeciesStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['species'],
    queryFn: () => speciesService.getAll(),
    staleTime: isConnected ? 5 * 60 * 1000 : Infinity, // Cache forever when offline
  });

  const identifySpecies = async (photoUri: string) => {
    if (isConnected) {
      return speciesService.identify(photoUri);
    }
    // Queue for later sync
    syncService.enqueue({ type: 'identify', data: { photoUri } });
    return null;
  };

  return { species: data, isLoading, error, identifySpecies };
}
```

### Pattern 3: Service Layer as Single External Communication Point

**What:** All external communication (API calls, device APIs, storage) goes through service modules. Screens and hooks never call `fetch`, `AsyncStorage`, or device APIs directly.

**When to use:** Always — locked decision D-06.

**Example:**
```tsx
// src/services/api.ts — Base API configuration
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export { api };
```

### Pattern 4: Backend 3-Layer Architecture (Controller/Service/Repository)

**What:** Each API endpoint flows through: Controller (HTTP) → Service (business logic) → Repository (data access).

**When to use:** For all API resources — locked decision D-07.

**Example:**
```
// api/src/routes/v1/species.routes.ts
router.get('/', SpeciesController.getAll);
router.post('/', SpeciesController.create);
router.post('/identify', SpeciesController.identify);

// api/src/controllers/species.controller.ts
class SpeciesController {
  static async getAll(req, res) {
    const species = await SpeciesService.getAll(req.user.id);
    res.json({ success: true, data: species });
  }

  static async identify(req, res) {
    const { imageUrl } = req.body;
    const classification = await SpeciesService.classifyWithAI(imageUrl);
    res.json({ success: true, data: classification });
  }
}

// api/src/services/species.service.ts
class SpeciesService {
  static async getAll(userId: string) {
    return SpeciesRepository.findByUser(userId);
  }

  static async classifyWithAI(imageUrl: string) {
    // Call external AI API (OpenAI Vision, custom model, etc.)
    const response = await aiClient.classify(imageUrl);
    return {
      species: response.classification,
      dangerLevel: response.danger_level,
      confidence: response.confidence,
    };
  }
}

// api/src/repositories/species.repository.ts
class SpeciesRepository {
  static async findByUser(userId: string) {
    return SpeciesModel.find({ userId }).sort({ createdAt: -1 });
  }
}
```

### Pattern 5: Route Groups for Auth Protection

**What:** expo-router route groups `(auth)/` and `(app)/` separate public and protected routes. The root layout checks auth state and redirects.

**When to use:** Always — locked decision D-09.

**Example:**
```tsx
// app/_layout.tsx — Root layout with auth guard
export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <SplashScreen />;

  return (
    <Stack>
      {!isAuthenticated ? (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
```

### Anti-Patterns to Avoid

- **Putting business logic in screen components:** Screens should only compose hooks and UI components. Logic belongs in hooks/services.
- **Direct API calls from components:** Never call `fetch` or `axios` directly in a screen. Always go through services → hooks.
- **Mixing route files with component files in `app/`:** expo-router treats every file in `app/` as a route. Non-route components must live in `src/`.
- **Storing JWT in AsyncStorage:** Use `expo-secure-store` for tokens. AsyncStorage is not encrypted.
- **Using framer-motion in React Native:** The reference uses framer-motion, but it's web-only. Use `react-native-reanimated` for all animations.
- **Tailwind CSS in React Native:** The reference uses Tailwind, but React Native doesn't support it natively. Use `StyleSheet.create()` or `nativewind` if absolutely necessary (not recommended for this project).

### Draw.io Diagram Structure Guide

For the rubric's "esfuerzo alto" requirement, the architecture diagram should have **3 levels of detail** across separate pages or layers in draw.io:

**Page 1: System-Level Architecture (High-Level)**
- Mobile App (React Native/Expo) block
- API REST Server block (Node.js/Express)
- MongoDB Database block
- External Services blocks: AI Classification API, Google Maps/Apple Maps, Push Notifications
- Arrows showing data flow: App ↔ API ↔ DB, App → AI API, App → Maps SDK
- Protocol labels: HTTPS/REST, WebSocket (if applicable), TCP/IP

**Page 2: Frontend Internal Architecture**
- Route Layer: `(auth)/`, `(app)/` route groups with expo-router
- Screen Layer: Dashboard, Bitácora, Mapa, Recursos, Perfil
- Hook Layer: useAuth, useResources, useSpecies, useOffline
- Service Layer: api.ts, storage.ts, camera.ts, location.ts, sync.service.ts
- State Layer: Zustand stores (auth, resource, species, sync)
- UI Component Layer: space/ (domain), ui/ (generic), common/ (shared)
- Arrows showing dependency direction: Screens → Hooks → Services → State

**Page 3: Backend 3-Layer Architecture**
- Routes → Controllers → Services → Repositories → MongoDB
- Middleware stack: Auth, Validation, Error Handling
- Swagger/OpenAPI documentation layer
- AI Classification integration point

**Diagram conventions:**
- Use consistent colors: blue for frontend, green for backend, orange for external services, purple for database
- Arrow labels should indicate protocol/data type (REST/JSON, MQTT, etc.)
- Include a legend explaining symbols and colors
- Number components for easy reference in the written documentation

### Draw.io Diagram Structure Guide

For the rubric's "esfuerzo alto" requirement, the architecture diagram should have **3 levels of detail** across separate pages or layers in draw.io:

**Page 1: System-Level Architecture (High-Level)**
- Mobile App (React Native/Expo) block
- API REST Server block (Node.js/Express)
- MongoDB Database block
- External Services blocks: AI Classification API, Google Maps/Apple Maps, Push Notifications
- Arrows showing data flow: App ↔ API ↔ DB, App → AI API, App → Maps SDK
- Protocol labels: HTTPS/REST, WebSocket (if applicable), TCP/IP

**Page 2: Frontend Internal Architecture**
- Route Layer: `(auth)/`, `(app)/` route groups with expo-router
- Screen Layer: Dashboard, Bitácora, Mapa, Recursos, Perfil
- Hook Layer: useAuth, useResources, useSpecies, useOffline
- Service Layer: api.ts, storage.ts, camera.ts, location.ts, sync.service.ts
- State Layer: Zustand stores (auth, resource, species, sync)
- UI Component Layer: space/ (domain), ui/ (generic), common/ (shared)
- Arrows showing dependency direction: Screens → Hooks → Services → State

**Page 3: Backend 3-Layer Architecture**
- Routes → Controllers → Services → Repositories → MongoDB
- Middleware stack: Auth, Validation, Error Handling
- Swagger/OpenAPI documentation layer
- AI Classification integration point

**Diagram conventions:**
- Use consistent colors: blue for frontend, green for backend, orange for external services, purple for database
- Arrow labels should indicate protocol/data type (REST/JSON, MQTT, etc.)
- Include a legend explaining symbols and colors
- Number components for easy reference in the written documentation

### Draw.io Diagram Structure Guide

For the rubric's "esfuerzo alto" requirement, the architecture diagram should have **3 levels of detail** across separate pages or layers in draw.io:

**Page 1: System-Level Architecture (High-Level)**
- Mobile App (React Native/Expo) block
- API REST Server block (Node.js/Express)
- MongoDB Database block
- External Services blocks: AI Classification API, Google Maps/Apple Maps, Push Notifications
- Arrows showing data flow: App ↔ API ↔ DB, App → AI API, App → Maps SDK
- Protocol labels: HTTPS/REST, WebSocket (if applicable), TCP/IP

**Page 2: Frontend Internal Architecture**
- Route Layer: `(auth)/`, `(app)/` route groups with expo-router
- Screen Layer: Dashboard, Bitácora, Mapa, Recursos, Perfil
- Hook Layer: useAuth, useResources, useSpecies, useOffline
- Service Layer: api.ts, storage.ts, camera.ts, location.ts, sync.service.ts
- State Layer: Zustand stores (auth, resource, species, sync)
- UI Component Layer: space/ (domain), ui/ (generic), common/ (shared)
- Arrows showing dependency direction: Screens → Hooks → Services → State

**Page 3: Backend 3-Layer Architecture**
- Routes → Controllers → Services → Repositories → MongoDB
- Middleware stack: Auth, Validation, Error Handling
- Swagger/OpenAPI documentation layer
- AI Classification integration point

**Diagram conventions:**
- Use consistent colors: blue for frontend, green for backend, orange for external services, purple for database
- Arrow labels should indicate protocol/data type (REST/JSON, MQTT, etc.)
- Include a legend explaining symbols and colors
- Number components for easy reference in the written documentation

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Global state management | Custom Context + useReducer | Zustand | Handles zombie child problem, no context re-render issues, persist middleware |
| API data fetching/caching | Manual fetch + useState | @tanstack/react-query | Automatic caching, stale-while-revalidate, offline support, retry logic |
| Offline queue | Custom array + setInterval | Zustand persist + NetInfo listener | Simpler, battle-tested pattern for queueing and flushing |
| Form validation | Manual if/else checks | Zod schemas | Type-safe, composable, works with React Hook Form |
| JWT token storage | AsyncStorage | expo-secure-store | Encrypted keychain storage, required for auth security |
| Network detection | Custom ping endpoint | @react-native-community/netinfo | Native-level detection, works offline, battery efficient |
| API documentation | Manual markdown | Swagger/OpenAPI | Interactive, auto-generated, industry standard |
| Image compression | Canvas manipulation | expo-image-manipulator | Native performance, handles EXIF, cross-platform |

**Key insight:** The offline sync problem is the most complex in this domain. Rolling a custom sync engine with conflict resolution, retry logic, and queue management is a multi-week effort. For this project, a simpler approach (queue operations while offline, flush on reconnect, last-write-wins) is sufficient and achievable.

## Common Pitfalls

### Pitfall 1: expo-router `app/` Directory Pollution
**What goes wrong:** Developers put non-route components (buttons, cards, helpers) inside `app/`. expo-router tries to render them as routes, causing errors.
**Why it happens:** The file-based routing convention is new; developers are used to putting everything together.
**How to avoid:** Strict separation: `app/` = ONLY routes. `src/` = everything else. Use ESLint rule to enforce.
**Warning signs:** "No default export" errors, unexpected routes appearing in navigation.

### Pitfall 2: Reanimated 4 Worklet Context Errors
**What goes wrong:** Animation code throws "cannot access X from worklet" errors because it references non-worklet code.
**Why it happens:** Reanimated 4 runs animations on the UI thread (worklets). Any code in an animation must be marked with `'worklet'` directive or be a worklet-compatible function.
**How to avoid:** Keep animation logic simple. Use `useSharedValue` and `useAnimatedStyle` correctly. Test animations early.
**Warning signs:** Red screen errors mentioning "worklet" or "JS thread" during animations.

### Pitfall 3: Zustand Store Re-render Loops
**What goes wrong:** Components re-render infinitely because they select the entire store instead of specific slices.
**Why it happens:** `useStore()` without a selector subscribes to ALL state changes.
**How to avoid:** ALWAYS use selectors: `useStore((s) => s.specificField)`. Use `useShallow` for multiple fields.
**Warning signs:** App freezes, console spam, performance warnings.

### Pitfall 4: Offline Sync Race Conditions
**What goes wrong:** When connection returns, queued operations fire simultaneously, causing duplicate entries or server errors.
**Why it happens:** NetInfo fires multiple events on reconnection. Without debouncing, the sync function runs multiple times.
**How to avoid:** Use a mutex/lock pattern. Only one sync operation at a time. Mark items as "syncing" before sending.
**Warning signs:** Duplicate species entries, resource counts doubling, server 409 conflicts.

### Pitfall 5: TypeScript Path Alias Conflicts
**What goes wrong:** The current `@/*` alias maps to project root (`"./*"`), causing import resolution ambiguity as the project grows.
**Why it happens:** The scaffold template uses a broad alias.
**How to avoid:** Narrow to `"@/*": ["./src/*"]` once `src/` structure is finalized.
**Warning signs:** Import resolution errors, IDE can't find modules, builds fail.

### Pitfall 6: expo-maps Alpha Instability
**What goes wrong:** `expo-maps` is in alpha and requires development builds (not Expo Go). Frequent breaking changes between versions.
**Why it happens:** It's Expo's new official maps package, replacing `react-native-maps`, but is not yet stable.
**How to avoid:** Use `npx expo prebuild` for development builds. Pin the exact version in package.json. Document in the architecture that `react-native-maps` is the stable fallback if expo-maps proves too unstable for the project timeline.
**Warning signs:** Build failures after `npx expo install expo-maps`, "native module not found" errors in Expo Go.

### Pitfall 7: React Compiler Incompatibility
**What goes wrong:** The experimental React Compiler (`"reactCompiler": true`) breaks certain React Native patterns, especially with Reanimated or third-party libraries.
**Why it happens:** React Compiler auto-memoizes components, which can conflict with libraries that rely on reference identity.
**How to avoid:** Monitor for build/runtime errors. Disable if issues arise. Keep it enabled for now but be ready to remove.
**Warning signs:** Build failures, components not updating, Reanimated animations not triggering.

## Code Examples

### Zustand Store with Persist (Offline Support)
```tsx
// src/stores/resource.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Resource {
  id: string;
  name: string;
  current: number;
  max: number;
  unit: string;
  isCritical: boolean;
}

interface ResourceStore {
  resources: Resource[];
  setResources: (resources: Resource[]) => void;
  updateResource: (id: string, delta: number) => void;
  resetResources: () => void;
}

export const useResourceStore = create<ResourceStore>()(
  persist(
    (set) => ({
      resources: [
        { id: 'o2', name: 'Oxígeno', current: 87, max: 100, unit: '%', isCritical: false },
        { id: 'h2o', name: 'Agua', current: 62, max: 100, unit: '%', isCritical: false },
        { id: 'food', name: 'Comida', current: 45, max: 100, unit: '%', isCritical: false },
      ],
      setResources: (resources) => set({ resources }),
      updateResource: (id, delta) =>
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id
              ? { ...r, current: Math.max(0, Math.min(r.max, r.current + delta)), isCritical: r.current + delta < 15 }
              : r
          ),
        })),
      resetResources: () => set((state) => ({
        resources: state.resources.map((r) => ({ ...r, current: r.max, isCritical: false })),
      })),
    }),
    {
      name: 'astro-beacon-resources',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Offline Sync Service Pattern
```tsx
// src/services/sync.service.ts
import NetInfo from '@react-native-community/netinfo';
import { useSyncStore } from '@/stores/sync.store';

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

class SyncService {
  private isSyncing = false;
  private unsubscribe: (() => void) | null = null;

  // Start listening for connectivity changes
  init() {
    this.unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && !this.isSyncing) {
        this.flushQueue();
      }
    });
  }

  // Add operation to queue
  enqueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'status'>) {
    const op: SyncOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      status: 'pending',
    };
    useSyncStore.getState().addOperation(op);
  }

  // Flush pending operations to API
  async flushQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const pending = useSyncStore.getState().getPendingOperations();

    for (const op of pending) {
      useSyncStore.getState().markSyncing(op.id);
      try {
        await this.executeOperation(op);
        useSyncStore.getState().markCompleted(op.id);
      } catch (error) {
        useSyncStore.getState().markFailed(op.id);
      }
    }

    this.isSyncing = false;
  }

  private async executeOperation(op: SyncOperation) {
    const { api } = await import('./api');
    switch (op.type) {
      case 'create': return api.post(`/${op.entity}`, op.data);
      case 'update': return api.put(`/${op.entity}/${op.data.id}`, op.data);
      case 'delete': return api.delete(`/${op.entity}/${op.data.id}`);
    }
  }

  // Stop listening
  destroy() {
    this.unsubscribe?.();
  }
}

export const syncService = new SyncService();
```

### API Service with Typed DTOs
```tsx
// src/types-dtos/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// src/types-dtos/species.dto.ts
export interface SpeciesDTO {
  id: string;
  name: string;
  classification: 'recurso' | 'animal' | 'planta' | 'microorganismo' | 'otro';
  dangerLevel: 'amigable' | 'neutral' | 'peligroso' | 'mortal';
  description: string;
  imageUrl: string;
  discoveredAt: string;
  coordinates?: { lat: number; lng: number };
}

export interface CreateSpeciesDTO {
  imageUri: string; // local URI before upload
  description: string;
  coordinates?: { lat: number; lng: number };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Navigation manual route config | expo-router file-based routing | 2023 (Expo Router v2+) | Routes auto-generated from file system, typed routes, universal deep linking |
| Redux boilerplate (actions, reducers, store) | Zustand (single create call) | 2022+ | 80% less boilerplate, no providers needed |
| Manual fetch + useState for API data | TanStack Query (react-query) | 2021+ | Automatic caching, background refetch, optimistic updates |
| AsyncStorage for everything | expo-secure-store for tokens + AsyncStorage for cache | Ongoing | Security best practices for mobile auth |
| Custom animation libraries | react-native-reanimated 4 (worklet-based) | 2024 | 60fps animations on UI thread, React 19 compatible |
| Class components + HOCs | Function components + hooks | 2019+ | Simpler, more composable, better TypeScript support |

**Deprecated/outdated:**
- **React Navigation standalone for new projects:** Expo Router is now the recommended approach for Expo apps. React Navigation is still used under the hood.
- **Redux for small/medium apps:** Zustand, Jotai, and Recoil have replaced Redux for most React Native projects. Redux is still valid for very large apps.
- **PropTypes:** TypeScript has fully replaced PropTypes in the React Native ecosystem.
- **expo-camera (deprecated in SDK 53+):** Use `expo-image-picker` for photo selection and the new camera APIs. Verify current Expo SDK 54 camera approach.

## Open Questions

1. **MongoDB vs Firebase for backend?**
   - What we know: D-08 decided "MongoDB/Firebase" — both are NoSQL options
   - What's unclear: Which one the team has more experience with, hosting preferences
   - Recommendation: MongoDB + Express is more teachable and defensible in the project defense. Firebase is faster to build but harder to demonstrate "3-layer architecture" (D-07). Use MongoDB for the API to satisfy the architecture rubric.

2. **AI Classification API — which service?**
   - What we know: Course requires AI species classification
   - What's unclear: Budget for AI API calls, whether to use OpenAI Vision, Google Vision, or a custom model
   - Recommendation: Start with OpenAI GPT-4o Vision API for the prototype. It's the simplest to integrate and produces good results for image classification. Document the choice and be ready to discuss alternatives in the defense.

3. **How detailed should the draw.io diagram be?**
   - What we know: Rubric says "esfuerzo alto por agregar y entender las relaciones de los componentes"
   - What's unclear: Whether to include internal component relationships or just high-level architecture
   - Recommendation: Create TWO diagrams: (1) High-level system architecture (App → API → DB + external services), (2) Frontend layer diagram showing the component/hook/service/service relationships. This demonstrates both system-level and code-level understanding.

4. **Should the API project live in the same repo or separate?**
   - What we know: Course requires "separación clara entre frontend y backend"
   - What's unclear: Whether monorepo or separate repos
   - Recommendation: Same repo, separate directory (`api/`). This simplifies sharing for the course (single GitHub repo link) while maintaining clear separation. Use a monorepo structure with separate `package.json` files.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js/npm | Frontend + Backend build | ✓ | Verified via package-lock | — |
| Expo CLI | Frontend dev server | ✓ | SDK 54.0.33 | — |
| Android Studio / Xcode | Native builds | Unknown | — | Use Expo Go for development |
| MongoDB | Backend database | Unknown | — | Use MongoDB Atlas (free tier) |
| draw.io | Architecture diagrams | ✓ | Web version | diagrams.net (same tool) |
| Swagger UI | API documentation | ✗ | — | Install in Phase 5 (backend phase) |

**Missing dependencies with no fallback:**
- None identified — all required tools for this phase (documentation + diagramming) are available

**Missing dependencies with fallback:**
- Android Studio/Xcode: Use Expo Go for development and testing during early phases
- MongoDB: Use MongoDB Atlas free tier (cloud-hosted, no local install needed)

## Validation Architecture

> This phase is documentation-only (architecture design, diagrams, justification). No code implementation or runtime behavior to test. Validation Architecture is not applicable.

**Phase requirements map to deliverables, not tests:**
- REQ: Architecture diagram → Manual verification (draw.io file exists, shows all components)
- REQ: Frontend/backend separation → Manual verification (documented in ARCHITECTURE-DESIGN.md)
- REQ: Design pattern justification → Manual verification (documented with reasoning)

## Sources

### Primary (HIGH confidence)
- [Expo Router docs](https://docs.expo.dev/router/introduction/) — Core concepts, notation, file-based routing (verified March 2026)
- [Expo Router notation](https://docs.expo.dev/router/basics/notation/) — Route groups, dynamic routes, layouts
- [Zustand GitHub](https://github.com/pmndrs/zustand) — State management patterns, persist middleware, TypeScript usage (v5.0.12, March 2026)
- [NetInfo docs](https://docs.expo.dev/versions/latest/sdk/netinfo/) — Network connectivity API
- [project-requirements.md](./project-requirements.md) — Course rubric and requirements (§147-173, §342-450)

### Secondary (MEDIUM confidence)
- `.planning/codebase/ARCHITECTURE.md` — Current project architecture analysis
- `.planning/codebase/STACK.md` — Technology stack inventory
- `.planning/codebase/CONCERNS.md` — Known issues and tech debt
- `astro-beacon-reference/.planning/codebase/ARCHITECTURE.md` — Reference project structure

### Tertiary (LOW confidence)
- Zustand v5 migration patterns — training data may not reflect latest API
- React Compiler compatibility with Reanimated 4 — experimental feature, behavior may change

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries verified against official docs and current versions
- Architecture: HIGH — Based on Expo official docs, locked decisions from CONTEXT.md, and course requirements
- Pitfalls: MEDIUM — Based on known React Native/Expo issues, some verified with official docs
- API design: HIGH — Standard REST patterns, well-established 3-layer architecture
- Offline sync: MEDIUM — Pattern is sound but specific implementation details need validation during development

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (30 days — architecture decisions are stable, but Expo SDK updates may affect recommendations)
