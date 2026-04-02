# Codebase Concerns

**Analysis Date:** 2026-04-01

## Tech Debt

### No Backend/API Implementation

- **Issue:** The project requirements mandate a "clear separation between frontend and backend" with a "versioned and documented API." There is no backend project, no API server, and no API client code.
- **Files:** `src/services/` (does not exist), `src/services/api.ts` (does not exist)
- **Impact:** 10% of the grade (Base Inicial) requires API connection. Without a backend, the app cannot fulfill core requirements like species classification, data sync, or authentication.
- **Fix approach:** Create a backend API (Node.js/Express, FastAPI, or similar) with documented endpoints. Add API client layer in `src/services/api.ts` with typed DTOs.

### No State Management Solution

- **Issue:** No state management library is installed. The app will need global state for resources, authentication, offline queue, and navigation.
- **Files:** `package.json` — no zustand, redux, jotai, or equivalent
- **Impact:** Without structured state management, resource tracking, offline sync, and auth state will become tangled and unmaintainable.
- **Fix approach:** Add Zustand or Redux Toolkit for global state. Define stores per domain: `authStore`, `resourceStore`, `logbookStore`, `offlineQueueStore`.

### Reference Project Uses Incompatible Web Stack

- **Issue:** The reference project (`astro-beacon-reference/`) is a React web app using Vite, Tailwind CSS, shadcn/ui, Radix UI, react-router-dom, and framer-motion. None of these are directly usable in React Native.
- **Files:** `astro-beacon-reference/src/pages/*.tsx`, `astro-beacon-reference/src/components/ui/*.tsx`
- **Impact:** Every component, animation, and style from the reference must be re-implemented with React Native primitives. This is a massive amount of work — 14 pages, 50+ UI components, custom animations.
- **Fix approach:** Use reference only for visual design inspiration. Re-implement all components using React Native equivalents (e.g., `react-native-reanimated` for animations, `@shopify/flash-list` for lists).

### No Test Infrastructure

- **Issue:** No test runner, no test files, no testing configuration in the Expo project. The reference has a single placeholder test with vitest.
- **Files:** `package.json` — no jest, vitest, or testing-library
- **Impact:** Course requirements include "pruebas de integración y procesos" (20% defense). No test infrastructure means no way to validate correctness or demonstrate testing.
- **Fix approach:** Add Jest + React Native Testing Library for unit tests. Consider Detox or Maestro for E2E. Create test directory structure matching the project layout.

## Known Bugs

### Default Expo Scaffold Code

- **Symptoms:** The app currently renders the default "Edit app/index.tsx to edit this screen" placeholder. The root layout has no navigation structure.
- **Files:** `app/index.tsx`, `app/_layout.tsx`
- **Trigger:** Running the app as-is
- **Workaround:** None — this is expected boilerplate that needs to be replaced.

### ESLint Config Uses CommonJS Syntax

- **Symptoms:** `eslint.config.js` uses `require()` and `module.exports` syntax. This works with Expo's flat config but is inconsistent with the project's ESM-aligned setup.
- **Files:** `eslint.config.js`
- **Trigger:** Running `npm run lint`
- **Workaround:** Convert to ESM syntax or rename to `eslint.config.mjs`.

### Reference Exploration Timer Has No Background Handling

- **Symptoms:** The reference exploration screen (`astro-beacon-reference/src/pages/Exploration.tsx`) uses a `setInterval` to simulate O2 consumption and travel progress. If the app goes to background, the timer continues but the UI doesn't update — and when foregrounded, the interval may fire rapidly to catch up.
- **Files:** `astro-beacon-reference/src/pages/Exploration.tsx` (lines 13-27)
- **Trigger:** App backgrounding during exploration
- **Workaround:** N/A — prototype only. The React Native implementation must use `AppState` to pause/resume timers and persist elapsed time.

### Reference Exploration Timer Has No Background Handling

- **Symptoms:** The reference exploration screen (`astro-beacon-reference/src/pages/Exploration.tsx`) uses a `setInterval` to simulate O2 consumption and travel progress. If the app goes to background, the timer continues but the UI doesn't update — and when foregrounded, the interval may fire rapidly to catch up.
- **Files:** `astro-beacon-reference/src/pages/Exploration.tsx` (lines 13-27)
- **Trigger:** App backgrounding during exploration
- **Workaround:** N/A — prototype only. The React Native implementation must use `AppState` to pause/resume timers and persist elapsed time.

## Security Considerations

### No Authentication Implementation

- **Risk:** The reference login page (`astro-beacon-reference/src/pages/Login.tsx`) has no real authentication — it accepts any non-empty agent ID and navigates to dashboard with a `setTimeout`. No password, no token, no session management.
- **Files:** `astro-beacon-reference/src/pages/Login.tsx` (lines 10-14)
- **Current mitigation:** None
- **Recommendations:** Implement real auth flow with JWT tokens, secure storage (`expo-secure-store`), session timeout on inactivity (course requirement), and protected route guards in expo-router.

### No Secure Storage

- **Risk:** No `expo-secure-store` or equivalent is installed. Any tokens, credentials, or sensitive data would be stored in plain AsyncStorage.
- **Files:** `package.json` — no expo-secure-store
- **Recommendations:** Add `expo-secure-store` for tokens and sensitive data. Never store auth credentials in AsyncStorage.

### No Input Validation

- **Risk:** No Zod, Yup, or validation library is installed. The reference project uses native HTML inputs with no sanitization.
- **Files:** `astro-beacon-reference/src/pages/Login.tsx`, all form pages
- **Recommendations:** Add Zod for schema validation on all user inputs, API payloads, and form data. Validate species names, resource quantities, coordinates, etc.

## Performance Bottlenecks

### No Image Optimization Strategy

- **Problem:** The bitácora requirement involves taking photos, storing them, and sending them for AI classification. No image compression, caching, or lazy loading strategy exists.
- **Files:** Not yet implemented
- **Cause:** No `expo-image` optimization config, no image cache layer, no upload queue for offline
- **Improvement path:** Use `expo-image` with caching. Compress images before upload with `expo-image-manipulator`. Implement upload queue with retry logic for offline mode.

### No Pagination or Virtualized Lists

- **Problem:** The bestiary/logbook will accumulate many entries. Without virtualization, rendering hundreds of species entries will cause jank.
- **Files:** Not yet implemented
- **Improvement path:** Use `@shopify/flash-list` or `FlatList` with proper `keyExtractor`, `getItemLayout`, and pagination.

### No Offline Queue Implementation

- **Problem:** Course requires offline support with sync-on-reconnect. No queue mechanism exists for pending operations (photos taken offline, resource updates, etc.).
- **Files:** Not yet implemented
- **Improvement path:** Implement an offline queue using `@react-native-async-storage/async-storage` or `WatermelonDB` with a sync manager that processes queued operations when connectivity is restored.

## Fragile Areas

### Flat File-Based Routing Without Route Guards

- **Files:** `app/_layout.tsx`, `app/index.tsx`
- **Why fragile:** Expo-router uses file-based routing. Without route groups and middleware, there's no way to protect authenticated routes or handle auth redirects cleanly.
- **Safe modification:** Use route groups `(auth)/` and `(app)/` as defined in `.planning/PROJECT.md`. Add a root layout that checks auth state before rendering children.
- **Test coverage:** None

### No Error Boundary or Global Error Handler

- **Files:** `app/_layout.tsx`
- **Why fragile:** Any unhandled error in a component will crash the entire app. No error boundary, no global error handler, no error reporting.
- **Safe modification:** Wrap the app in an error boundary. Add a global error handler that logs to console in dev and reports in production.
- **Test coverage:** None

### Hardcoded Values in Reference Project

- **Files:** `astro-beacon-reference/src/pages/Dashboard.tsx` — hardcoded resource values (O₂: 87, H₂O: 62, etc.)
- **Why fragile:** All data is static. The RN version must connect to real data sources.
- **Safe modification:** Define TypeScript interfaces for all entities. Use typed stores/services instead of hardcoded values.

## Scaling Limits

### No Database Strategy

- **Current capacity:** No database — everything is in-memory or not implemented
- **Limit:** The app needs to store species entries, resource logs, user data, and offline queue items
- **Scaling path:** Use SQLite via `expo-sqlite` for local offline storage. Sync with backend API when online. Consider WatermelonDB for reactive offline-first architecture.

### No API Rate Limiting or Caching

- **Current capacity:** No API exists
- **Limit:** AI classification endpoints, map tile servers, and sync operations will need rate limiting and caching
- **Scaling path:** Implement request caching with `react-query` or SWR. Add exponential backoff for retries. Cache map tiles locally.

## Dependencies at Risk

### React Compiler Experimental

- **Risk:** `app.json` has `"reactCompiler": true` in experiments. This is an experimental feature that may cause unexpected behavior or build failures.
- **Impact:** Could break builds or cause runtime issues with certain React Native patterns
- **Migration plan:** Monitor Expo docs for React Compiler stability. Disable if issues arise.

### No Prettier or CSpell Installed

- **Risk:** Course requirements explicitly require "ESLint, Prettier y CSpell" as part of the workflow. Only ESLint is configured.
- **Files:** `package.json` — no prettier, no cspell
- **Impact:** Code quality rubric requires linting and formatting validation. Missing tools = lost points.
- **Migration plan:** Add `prettier`, `eslint-config-prettier`, `cspell` with appropriate configs.

## Missing Critical Features

### No Offline Support

- **Problem:** Course requires offline mode for most app sections with sync-on-reconnect. Nothing is implemented.
- **Blocks:** Bitácora offline photo capture, resource management without connection, species browsing offline
- **Priority:** High — core requirement

### No AI Integration

- **Problem:** Course requires AI-assisted development documentation AND AI-powered species classification. Neither exists.
- **Blocks:** Species auto-classification, AI-assisted development evidence
- **Priority:** High — explicit requirement

### No Maps/GPS

- **Problem:** Course requires GPS-based supply drop locations on a map. No map library is installed.
- **Files:** `package.json` — no expo-location, no react-native-maps
- **Blocks:** Exploration map, supply drop tracking, GPS coordinates
- **Priority:** High — core requirement

### No Audio/Narration

- **Problem:** Course requires audio narration of species entries. No text-to-speech or audio library is installed.
- **Files:** `package.json` — no expo-speech, no expo-av
- **Blocks:** Species narration feature
- **Priority:** Medium

### No Camera Integration

- **Problem:** Course requires photo capture for the bitácora. No camera library is installed.
- **Files:** `package.json` — no expo-camera or expo-image-picker
- **Blocks:** Bitácora photo capture
- **Priority:** High — core requirement

### No Camera Permission Configuration

- **Problem:** Even when camera libraries are added, `app.json` has no camera or microphone permission declarations for iOS or Android.
- **Files:** `app.json` — missing `ios.infoPlist.NSCameraUsageDescription`, `android.permissions.CAMERA`
- **Blocks:** Camera will be denied at runtime without permission strings
- **Fix approach:** Add permission descriptions to `app.json` under `ios.infoPlist` and `android.permissions`.

### No Camera Permission Configuration

- **Problem:** Even when camera libraries are added, `app.json` has no camera or microphone permission declarations for iOS or Android.
- **Files:** `app.json` — missing `ios.infoPlist.NSCameraUsageDescription`, `android.permissions.CAMERA`
- **Blocks:** Camera will be denied at runtime without permission strings
- **Fix approach:** Add permission descriptions to `app.json` under `ios.infoPlist` and `android.permissions`.

### No Gamification System

- **Problem:** Course requires gamification elements (progress, levels, achievements). Nothing is implemented.
- **Blocks:** Mission progress, XP system, achievement badges
- **Priority:** Medium

### No Gesture Implementation

- **Problem:** Course requires at least 2 gestures for key processes. No gesture library beyond the base `react-native-gesture-handler` is configured with specific gestures.
- **Blocks:** Gesture-based interactions
- **Priority:** Medium

### Reference Project Has No Backend Either

- **Problem:** The reference project (`astro-beacon-reference/`) is a frontend-only web app with hardcoded data. It has no API server, no database, and no auth backend. The course requires a full-stack solution.
- **Files:** `astro-beacon-reference/` — no server code, no API routes, no database migrations
- **Blocks:** All data-dependent features. The reference cannot serve as a backend blueprint.
- **Fix approach:** Design and build a separate backend API project from scratch. Define data models, REST endpoints, authentication flow, and database schema before implementing the mobile data layer.

### TypeScript Path Alias May Conflict

- **Problem:** `tsconfig.json` defines `"@/*": ["./*"]` which maps `@/` to the project root. This is a very broad alias that can cause import resolution ambiguity, especially when creating `src/` or `components/` directories.
- **Files:** `tsconfig.json` (lines 5-8)
- **Impact:** Import resolution may fail or resolve to unexpected files as the project grows.
- **Fix approach:** Narrow the alias to `"@/*": ["./src/*"]` or `"@/*": ["./app/*"]` once the directory structure is finalized.

### Reference Project Has No Backend Either

- **Problem:** The reference project (`astro-beacon-reference/`) is a frontend-only web app with hardcoded data. It has no API server, no database, and no auth backend. The course requires a full-stack solution.
- **Files:** `astro-beacon-reference/` — no server code, no API routes, no database migrations
- **Blocks:** All data-dependent features. The reference cannot serve as a backend blueprint.
- **Fix approach:** Design and build a separate backend API project from scratch. Define data models, REST endpoints, authentication flow, and database schema before implementing the mobile data layer.

### TypeScript Path Alias May Conflict

- **Problem:** `tsconfig.json` defines `"@/*": ["./*"]` which maps `@/` to the project root. This is a very broad alias that can cause import resolution ambiguity, especially when creating `src/` or `components/` directories.
- **Files:** `tsconfig.json` (lines 5-8)
- **Impact:** Import resolution may fail or resolve to unexpected files as the project grows.
- **Fix approach:** Narrow the alias to `"@/*": ["./src/*"]` or `"@/*": ["./app/*"]` once the directory structure is finalized.

## Test Coverage Gaps

### Entire Codebase Untested

- **What's not tested:** All functionality — zero test files exist in the Expo project
- **Files:** `app/`, `src/` (when created)
- **Risk:** Any regression, broken feature, or logic error will go undetected. Course defense includes "pruebas de estrés" and "pruebas de integración."
- **Priority:** High — must add tests before defense

### Reference Project Has Minimal Tests

- **What's not tested:** All pages, components, hooks, and business logic in the reference
- **Files:** `astro-beacon-reference/src/test/example.test.ts` — single passing test with no assertions about app logic
- **Risk:** Reference cannot serve as a quality baseline; all testing must be built from scratch
- **Priority:** High

### No CI/CD Pipeline

- **What's not tested:** Build process, lint checks, test execution on push
- **Files:** No `.github/workflows/`, no `ci.yml`, no build scripts beyond `npm run lint`
- **Risk:** No automated quality gate. Broken code can be pushed without detection. Course requires GitHub repo access for evaluation.
- **Priority:** Medium — set up GitHub Actions for lint + test on PR before second delivery.

### No CI/CD Pipeline

- **What's not tested:** Build process, lint checks, test execution on push
- **Files:** No `.github/workflows/`, no `ci.yml`, no build scripts beyond `npm run lint`
- **Risk:** No automated quality gate. Broken code can be pushed without detection. Course requires GitHub repo access for evaluation.
- **Priority:** Medium — set up GitHub Actions for lint + test on PR before second delivery.

---

*Concerns audit: 2026-04-01*
