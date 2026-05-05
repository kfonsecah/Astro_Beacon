---
phase: 21
slug: error-handling-offline
date: 2026-05-04
---

# Phase 21: Error Handling & Offline - Validation Architecture

**Goal:** Implementar ErrorBoundary en todos los route files, OfflineBanner en tabs layout, y conectar TanStack Query onlineManager a NetInfo.
**Requirements:** ERR-01, ERR-02, ERR-03, ERR-04, ERR-06

## Trust Boundaries

| Component | Boundary Type | Validation Strategy |
|-----------|---------------|---------------------|
| `ErrorBoundary` Components | UI Resilience | Simulate unhandled exceptions and confirm graceful fallback UI is rendered instead of app crash. |
| `NetInfo` -> `onlineManager` | State Synchronization | Toggle network state and verify that TanStack Query correctly pauses and resumes refetches. |

## Nyquist Validation Strategy

| Capability | Signal | Method | Artifact |
|------------|--------|--------|----------|
| **Expo Router Error Boundaries** | `ErrorBoundary` is exported from `_layout.tsx` and all route files, catching errors without app-level crash. | `grep` for `export { ErrorBoundary }` or similar in all route files. Visual test by intentionally throwing an error. | `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, individual screen routes. |
| **Global Network Monitoring** | `onlineManager` is correctly hooked into `@react-native-community/netinfo`. | Check `src/config/queryClient.ts` (or wherever query client is initialized) for `onlineManager.setEventListener(setOnline)`. | `queryClient` config file. |
| **Offline Banner Display** | `OfflineBanner` component is visible when disconnected. | Visual verification + `grep` in `app/(tabs)/_layout.tsx` for `<OfflineBanner />`. | `app/(tabs)/_layout.tsx` |

## Critical Failure Modes

| Mode | Detection | Prevention |
|------|-----------|------------|
| **Memory Leaks** | Unmounted components still listen to network changes. | Ensure `NetInfo.addEventListener` is properly cleaned up (returns unsubscribe function) when used inside `useEffect`. |
| **Query Infinite Retries** | Queries constantly fail in loop when offline. | Proper setup of `onlineManager` ensures queries are automatically paused by TanStack Query when offline, avoiding spamming the network layer. |
| **Uncaught Render Errors** | White screen of death (WSOD). | Exhaustively adding `ErrorBoundary` to root and tab layouts ensures *at least* the top-level boundary catches it. |

## Reference Dataset

*   `app/_layout.tsx`
*   `app/(tabs)/_layout.tsx`
*   `src/components/common/OfflineBanner.tsx` (Pre-existing/to be integrated)
*   `src/components/ui/RouteErrorFallback.tsx` (To be created)
*   `package.json` (Verify dependencies)
