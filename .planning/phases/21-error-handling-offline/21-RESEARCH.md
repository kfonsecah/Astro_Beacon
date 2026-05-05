<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Usar el patrón nativo de expo-router: cada route file exporta una función `ErrorBoundary` como named export — expo-router la detecta automáticamente
- **D-02:** El `ErrorBoundary` de expo-router recibe `{ error: Error, retry: () => void }` como props — mostrar el mensaje de error y un botón "REINTENTAR" usando el design system
- **D-03:** Implementar un componente `RouteErrorFallback` en `src/components/common/` que reciba `{ error, retry }` — todos los route files exportan `ErrorBoundary` usando este mismo componente para consistencia visual
- **D-04:** El root layout (`app/_layout.tsx`) también exporta `ErrorBoundary` para capturar errores no manejados fuera de las rutas (ERR-02)
- **D-05:** El `ErrorBoundary` usa el design system HUD: fondo `tc.background`, texto `tc.danger`, botón con `tc.primary` border — sin hardcoded hex
- **D-06:** El `OfflineBanner` se renderiza en `app/(tabs)/_layout.tsx` encima del navigator de tabs — una sola instancia cubre todas las pantallas de tab sin duplicar código
- **D-07:** Usar `useNetworkStatus` hook existente para detectar `isConnected` — si `false`, mostrar banner; si `true`, no renderizar nada (no animación de entrada/salida en v1)
- **D-08:** El componente `OfflineBanner` ya existe en `src/components/common/OfflineBanner.tsx` — verificar que usa theme system correctamente antes de integrarlo (tiene un uso de `colors.warningMuted` directo que es aceptable)
- **D-09:** Conectar NetInfo al `onlineManager` de TanStack Query en `src/utils/queryClient.ts` — usar `onlineManager.setEventListener` para suscribirse a cambios de conectividad
- **D-10:** El patrón oficial de TanStack Query v5 para React Native: `onlineManager.setEventListener(setOnline => NetInfo.addEventListener(state => setOnline(!!state.isConnected)))` en el módulo de queryClient
- **D-11:** Esta integración hace que las queries pendientes se reintentan automáticamente al reconectar — cumple ERR-06 sin lógica adicional en pantallas
- **D-12:** El interceptor de `api.ts` ya transforma errores de red a `{ message: 'Network error. Please check your connection.' }` — las pantallas que muestran `error.message` ya lo reciben correctamente
- **D-13:** No se requiere cambio adicional en pantallas para ERR-04 — ya está cubierto por el interceptor + los error states existentes en cada screen

### the agent's Discretion
- Styling exacto del componente `RouteErrorFallback` (mantener minimalista, HUD-style)
- Si el OfflineBanner en `(tabs)/_layout.tsx` va dentro o fuera del `<Tabs>` component
- Posición exacta del `onlineManager` setup en `queryClient.ts` (top-level o dentro de función init)

### Deferred Ideas (OUT OF SCOPE)
- **ERR-05** (validación por campo en formularios) — deferido a v2; login es el único form y la UX actual es aceptable para la defensa
- **OFF-01** (offline mutation queue — encolar mutaciones cuando offline) — deferido a v2 per REQUIREMENTS.md
- Animación de entrada/salida del OfflineBanner (slide down/up) — deferido; funcionalidad primero
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ERR-01 | ErrorBoundary export in all route files for graceful error recovery | `RouteErrorFallback` in `src/components/common/`; `export function ErrorBoundary` in routes |
| ERR-02 | Root layout (app/_layout.tsx) has catch-all ErrorBoundary | Added `ErrorBoundary` export on root layout via `RouteErrorFallback` |
| ERR-03 | Offline detection shows OfflineBanner component when network unavailable | `useNetworkStatus` combined with `OfflineBanner` in `app/(tabs)/_layout.tsx` |
| ERR-04 | Network errors display user-friendly "Check connection" message | Axios interceptors already process network errors; TanStack Query handles states |
| ERR-06 | TanStack Query onlineManager pauses queries when offline, retries | Connect `NetInfo` to `@tanstack/react-query` `onlineManager` via `setEventListener` |
</phase_requirements>

# Phase 21: Error Handling & Offline - Research

**Researched:** 2026-05-05
**Domain:** Frontend App Architecture / Error Recovery / Offline Support
**Confidence:** HIGH

## Summary

This phase integrates error handling using Expo Router's standard `ErrorBoundary` mechanism to gracefully recover from crashes without bringing down the JS thread. It also implements an offline state banner globally across tabs, powered by `@react-native-community/netinfo`, and connects it to TanStack Query's `onlineManager` to automatically pause outgoing queries while disconnected and resume them when the network returns.

**Primary recommendation:** Export a uniform `<RouteErrorFallback />` UI from `export function ErrorBoundary` on every screen/layout, and set up `onlineManager.setEventListener` globally in `src/utils/queryClient.ts`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Catching JS render crashes | Browser / Client | — | Expo Router catches these locally via `<ErrorBoundary />` |
| Network disconnect monitoring | Browser / Client | — | Managed strictly via native device capabilities (`NetInfo`) |
| Query pause/resume logic | Browser / Client | — | TanStack Query (`onlineManager`) handles API caching and retry mechanics |
| Display offline warnings | Browser / Client | — | Driven by React context/hooks acting on `NetInfo` state |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `expo-router` | ~6.0.23 | Routing & Error Boundaries | Built-in routing layout capabilities |
| `@tanstack/react-query` | ^5.100.6 | Data Fetching & Sync | Standard solution for async query management & offline queue tracking |
| `@react-native-community/netinfo` | ^11.4.1 | Network status detection | React Native ecosystem standard |

**Installation:**
No new installations needed.

## Architecture Patterns

### Pattern 1: Expo Router ErrorBoundary
**What:** Catch-all exported function catching errors on route boundaries.
**When to use:** In Expo Router applications, any file routing representation (`_layout.tsx` or `[screen].tsx`) should export an `ErrorBoundary` for graceful crash mitigation.
**Example:**
```typescript
import { RouteErrorFallback } from '@/components/common';

export function ErrorBoundary(props: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={props.error} retry={props.retry} />;
}
```

### Anti-Patterns to Avoid
- **Anti-pattern:** Placing `NetInfo` hooks inside individual screen components to re-run queries. *Instead:* Let TanStack Query's `onlineManager` manage it completely in the background.

## Common Pitfalls

### Pitfall 1: Memory Leaks with NetInfo Listeners
**What goes wrong:** Adding `NetInfo.addEventListener` directly inside components or singletons without cleaning up subscriptions.
**Why it happens:** Every mount lifecycle pushes a new closure.
**How to avoid:** TanStack's `setEventListener` handles it by consuming a cleanup function explicitly returned by the hook.
```typescript
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + React Native Testing Library |
| Config file | `jest.config.js` |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ERR-01 | Route files export ErrorBoundary | unit | `jest src/components/common/RouteErrorFallback.test.tsx` | ❌ Wave 0 |
| ERR-03 | Tabs show OfflineBanner | unit | `jest app/(tabs)/_layout.test.tsx` | ❌ Wave 0 |
| ERR-06 | queryClient triggers NetInfo | unit | `jest src/utils/queryClient.test.ts` | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] `src/components/common/RouteErrorFallback.test.tsx`
- [ ] `app/(tabs)/_layout.test.tsx`
- [ ] `src/utils/queryClient.test.ts`

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V7 Error Handling | yes | `RouteErrorFallback` securely catches UI exceptions without exposing stack traces |

## Sources
### Primary (HIGH confidence)
- `.planning/phases/21-error-handling-offline/21-CONTEXT.md`
- `.planning/REQUIREMENTS.md`

## Metadata
**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH
- Pitfalls: HIGH
**Research date:** 2026-05-05
**Valid until:** 2026-06-05
