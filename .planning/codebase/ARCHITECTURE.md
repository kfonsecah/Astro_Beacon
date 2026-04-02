# Architecture

**Analysis Date:** 2026-04-01

## Pattern Overview

**Overall:** File-based routing with expo-router, feature-oriented component organization

**Key Characteristics:**
- expo-router provides file-based routing via the `app/` directory (React Navigation underneath)
- Clear separation between the mobile app (`app/`, `assets/`) and the Lovable-generated web reference (`astro-beacon-reference/`)
- TypeScript-first with strict mode enabled
- Path alias `@/*` maps to project root for absolute imports
- React Native Reanimated for animations (not framer-motion from the web reference)
- React Navigation bottom tabs as the primary navigation pattern

## Layers

**Routing Layer:**
- Purpose: Define app screens and navigation structure
- Location: `app/`
- Contains: Route files (`_layout.tsx`, `index.tsx`, future screen files)
- Depends on: expo-router, react-native-screens
- Used by: The entire app — every screen is a route

**UI/Component Layer:**
- Purpose: Reusable visual elements and domain-specific components
- Location: `components/` (to be created, following reference pattern from `astro-beacon-reference/src/components/`)
- Contains: 
  - `components/space/` — domain-specific space-themed components (ResourceBar, SpaceCard, HudIndicator, BottomNav, etc.)
  - `components/ui/` — generic UI primitives (buttons, inputs, cards)
- Depends on: react-native, react-native-reanimated, @expo/vector-icons
- Used by: All screen/route components

**Business Logic / Hooks Layer:**
- Purpose: Custom hooks, state management, and business rules
- Location: `hooks/` (to be created, following reference pattern from `astro-beacon-reference/src/hooks/`)
- Contains: Custom hooks (e.g., `useResources`, `useAuth`, `useOffline`)
- Depends on: React hooks, expo APIs
- Used by: Screen components and UI components

**Services / API Layer:**
- Purpose: External API communication, offline sync, data persistence
- Location: `services/` or `lib/` (to be created)
- Contains: API clients, offline queue, local storage wrappers
- Depends on: fetch/axios, expo-file-system, expo-sqlite (TBD)
- Used by: Hooks layer and screens

**Utilities Layer:**
- Purpose: Shared helper functions, formatters, constants
- Location: `lib/` or `utils/` (to be created)
- Contains: Utility functions, type definitions, constants
- Depends on: None (pure functions)
- Used by: All layers

## Data Flow

**Screen Rendering:**

1. User navigates to a route via expo-router (e.g., `/dashboard`)
2. `app/_layout.tsx` provides the root `<Stack>` navigator
3. Route component renders, calling custom hooks for data/state
4. Hooks fetch from services layer (API or local cache)
5. UI components receive data as props and render

**State Management:**
- Local component state via React `useState`/`useReducer`
- Shared state via custom hooks (context or Zustand recommended for cross-screen state)
- No global state library currently configured — to be selected during development

**Offline Sync Flow:**

1. User performs action while offline
2. Action is queued in local storage (expo-file-system or expo-sqlite)
3. Network listener detects reconnection
4. Queued actions are flushed to the API
5. Local cache is updated with server response

## Key Abstractions

**Route/Screen Components:**
- Purpose: Each file in `app/` maps to a screen or nested navigator
- Examples: `app/index.tsx`, `app/_layout.tsx`
- Pattern: Default export function component, named after the route

**Space-Themed Components:**
- Purpose: Domain-specific UI elements matching the astronaut survival narrative
- Examples (from reference): `astro-beacon-reference/src/components/space/ResourceBar.tsx`, `astro-beacon-reference/src/components/space/SpaceCard.tsx`, `astro-beacon-reference/src/components/space/HudIndicator.tsx`
- Pattern: Props interface + default export, using React Native equivalents of reference's Tailwind classes

**Generic UI Components:**
- Purpose: Reusable primitives (buttons, inputs, modals)
- Examples (from reference): `astro-beacon-reference/src/components/ui/button.tsx`, `astro-beacon-reference/src/components/ui/card.tsx`
- Pattern: Adapt shadcn/ui patterns to React Native using native primitives

## Entry Points

**App Entry:**
- Location: `package.json` → `"main": "expo-router/entry"`
- Triggers: Expo dev server starts, Metro bundler loads entry
- Responsibilities: Initializes expo-router, loads app directory as route tree

**Root Layout:**
- Location: `app/_layout.tsx`
- Triggers: First render of the app
- Responsibilities: Provides root `<Stack>` navigator, will wrap with providers (theme, auth, query client)

## Error Handling

**Strategy:** Component-level error boundaries + service-level error propagation

**Patterns:**
- Service layer returns typed results or throws typed errors
- Hooks catch and surface errors to components
- Components display error states via UI components (alert dialogs, toast notifications)
- No global error boundary configured yet — recommended to add at `_layout.tsx` level

## Cross-Cutting Concerns

**Logging:** `console.log` currently. No dedicated logging framework. Consider `expo-logging` or a custom logger for production.

**Validation:** Zod recommended (present in reference `astro-beacon-reference/package.json`). To be added to main app for form and API response validation.

**Authentication:** Not yet implemented. Reference shows a basic Login page at `astro-beacon-reference/src/pages/Login.tsx`. Must implement session management with inactivity timeout per requirements.

**Offline Support:** Required by project requirements. Not yet implemented. Will need expo-netinfo for connectivity detection + local storage strategy.

**Animations:** React Native Reanimated (`react-native-reanimated ~4.1.1`) is the animation engine. Reference uses framer-motion — all animations must be adapted to Reanimated's worklet-based API.

**Gestures:** `react-native-gesture-handler ~2.28.0` installed. Project requires at least 2 custom gestures per requirements.

**Expo SDK 54 Features:**
- New Architecture enabled (`newArchEnabled: true` in `app.json`)
- React Compiler enabled (`reactCompiler: true` in experiments)
- Typed routes enabled (`typedRoutes: true` in experiments)
- Static web output configured (`"output": "static"` in `app.json`)
- URL scheme: `astrobeacon` for deep linking

## Expo Template Patterns (app-example/)

The Expo scaffold template provides established patterns to adapt:

**Theming:**
- `app-example/constants/theme.ts` — Defines `Colors` (light/dark) and `Fonts` (platform-specific)
- `app-example/hooks/use-color-scheme.ts` — Detects system color scheme
- `app-example/hooks/use-theme-color.ts` — Resolves color token for current theme
- `app-example/app/_layout.tsx` — Wraps app in `<ThemeProvider>` from `@react-navigation/native`

**Component Patterns:**
- `app-example/components/themed-text.tsx` — Text component that auto-applies theme colors
- `app-example/components/themed-view.tsx` — View component with theme-aware background
- `app-example/components/haptic-tab.tsx` — Tab button with haptic feedback on press
- `app-example/components/parallax-scroll-view.tsx` — Scrollable container with parallax header

**Navigation Pattern:**
- `app-example/app/(tabs)/_layout.tsx` — Bottom tabs with `<Tabs>`, `HapticTab`, icon symbols
- `app-example/app/(tabs)/index.tsx` — Tab screen using `ParallaxScrollView`, `ThemedText`, `ThemedView`
- `app-example/app/modal.tsx` — Modal screen with `presentation: 'modal'` option

**Adaptation for Astro Beacon:**
- Replace `Colors` with space-themed palette (cyan primary, orange destructive, green accent)
- Replace `ThemedText`/`ThemedView` with space-themed equivalents (font-mono, glow effects)
- Replace `HapticTab` with custom space-themed tab bar (reference: `astro-beacon-reference/src/components/space/BottomNav.tsx`)
- Use `ParallaxScrollView` pattern for screens with large headers

## Reference Project Structure (astro-beacon-reference/)

The Lovable-generated web reference defines the target screen and component architecture:

**Screens (13 pages):**
- `Splash.tsx` → Splash screen (entry)
- `Login.tsx` → Authentication
- `Dashboard.tsx` → Main HUD with resources, alerts, mission progress
- `Bestiary.tsx` → Species catalog/bitácora
- `SpeciesDetail.tsx` → Individual species view
- `SpeciesIdentification.tsx` → Photo-based species identification
- `Resources.tsx` → Resource management
- `ExplorationMap.tsx` → GPS map for supply drops
- `Exploration.tsx` → Active exploration/trip tracking
- `LogResource.tsx` → Log resource income/expense
- `Logbook.tsx` → Discovery journal
- `NotFound.tsx` → 404 fallback

**Component Categories:**
- `components/space/` (7 files): BottomNav, FloatingActionButton, HudIndicator, MissionProgress, ResourceBar, ScanAnimation, SpaceCard
- `components/ui/` (49 files): Full shadcn/ui component library (button, card, dialog, form, toast, etc.)

**State Management (reference):**
- `@tanstack/react-query` for server state
- `react-hook-form` + `zod` for form validation
- `sonner` for toast notifications

---

*Architecture analysis: 2026-04-01*
