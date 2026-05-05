# Phase 21: Error Handling & Offline - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar los requerimientos ERR-01 a ERR-06 del milestone v1.2: ErrorBoundary en todos los route files para recovery graceful de crashes, y OfflineBanner con integración al onlineManager de TanStack Query para comportamiento correcto sin conexión.

Esta fase era "Phase 18" en el ROADMAP original pero se reposiciona como Phase 21 después de insertar las fases de bug fixes y compliance.

**In scope:**
- `ErrorBoundary` como named export en todos los route files de `app/`
- OfflineBanner renderizado condicionalmente en todas las tabs
- TanStack Query `onlineManager` conectado a NetInfo para pausar/reanudar queries según conectividad
- Mensajes de error de red amigables (el interceptor de axios ya los genera, la UI solo necesita mostrarlos)

**Out of scope:**
- NO crear nuevas pantallas ni rutas
- NO modificar la lógica de negocio de ninguna pantalla
- NO implementar offline queue (cola de mutaciones pendientes) — eso es v2 (OFF-01)
- NO validación por campo en formularios — login es el único form y sus errores ya se muestran globalmente (ERR-05 queda pendiente para v2)
</domain>

<decisions>
## Implementation Decisions

### ErrorBoundary (ERR-01, ERR-02)

- **D-01:** Usar el patrón nativo de expo-router: cada route file exporta una función `ErrorBoundary` como named export — expo-router la detecta automáticamente
- **D-02:** El `ErrorBoundary` de expo-router recibe `{ error: Error, retry: () => void }` como props — mostrar el mensaje de error y un botón "REINTENTAR" usando el design system
- **D-03:** Implementar un componente `RouteErrorFallback` en `src/components/common/` que reciba `{ error, retry }` — todos los route files exportan `ErrorBoundary` usando este mismo componente para consistencia visual
- **D-04:** El root layout (`app/_layout.tsx`) también exporta `ErrorBoundary` para capturar errores no manejados fuera de las rutas (ERR-02)
- **D-05:** El `ErrorBoundary` usa el design system HUD: fondo `tc.background`, texto `tc.danger`, botón con `tc.primary` border — sin hardcoded hex

### OfflineBanner (ERR-03)

- **D-06:** El `OfflineBanner` se renderiza en `app/(tabs)/_layout.tsx` encima del navigator de tabs — una sola instancia cubre todas las pantallas de tab sin duplicar código
- **D-07:** Usar `useNetworkStatus` hook existente para detectar `isConnected` — si `false`, mostrar banner; si `true`, no renderizar nada (no animación de entrada/salida en v1)
- **D-08:** El componente `OfflineBanner` ya existe en `src/components/common/OfflineBanner.tsx` — verificar que usa theme system correctamente antes de integrarlo (tiene un uso de `colors.warningMuted` directo que es aceptable)

### TanStack Query onlineManager (ERR-06)

- **D-09:** Conectar NetInfo al `onlineManager` de TanStack Query en `src/utils/queryClient.ts` — usar `onlineManager.setEventListener` para suscribirse a cambios de conectividad
- **D-10:** El patrón oficial de TanStack Query v5 para React Native: `onlineManager.setEventListener(setOnline => NetInfo.addEventListener(state => setOnline(!!state.isConnected)))` en el módulo de queryClient
- **D-11:** Esta integración hace que las queries pendientes se reintentan automáticamente al reconectar — cumple ERR-06 sin lógica adicional en pantallas

### Mensajes de error de red (ERR-04)

- **D-12:** El interceptor de `api.ts` ya transforma errores de red a `{ message: 'Network error. Please check your connection.' }` — las pantallas que muestran `error.message` ya lo reciben correctamente
- **D-13:** No se requiere cambio adicional en pantallas para ERR-04 — ya está cubierto por el interceptor + los error states existentes en cada screen

### The Agent's Discretion
- Styling exacto del componente `RouteErrorFallback` (mantener minimalista, HUD-style)
- Si el OfflineBanner en `(tabs)/_layout.tsx` va dentro o fuera del `<Tabs>` component
- Posición exacta del `onlineManager` setup en `queryClient.ts` (top-level o dentro de función init)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Route files a modificar (agregar export ErrorBoundary)
- `app/_layout.tsx`
- `app/(auth)/_layout.tsx`
- `app/(auth)/login.tsx`
- `app/(tabs)/_layout.tsx` — además agregar OfflineBanner
- `app/(tabs)/dashboard.tsx`
- `app/(tabs)/resources.tsx`
- `app/(tabs)/bestiary.tsx`
- `app/(tabs)/logbook.tsx`
- `app/(tabs)/map.tsx`
- `app/trips.tsx`

### Archivos a crear
- `src/components/common/RouteErrorFallback.tsx` — componente de error HUD reutilizable
- (actualizar `src/components/common/index.ts` para exportarlo)

### Archivos a modificar
- `src/utils/queryClient.ts` — agregar `onlineManager` setup
- `app/(tabs)/_layout.tsx` — agregar `OfflineBanner` condicional

### Componente existente
- `src/components/common/OfflineBanner.tsx` — ya existe, verificar imports antes de usar
- `src/components/common/index.ts` — index de exports de common components

### Hooks existentes
- `src/hooks/useNetworkStatus.ts` — retorna `{ isConnected: boolean, isInternetReachable: boolean }`

### Dependencias TanStack Query
- `src/utils/queryClient.ts` — donde vive el `QueryClient` — agregar onlineManager aquí
- TanStack Query v5 ya instalado — `onlineManager` es parte del paquete base

### Requirements
- `.planning/REQUIREMENTS.md` § Error Handling & Offline (ERR-01 a ERR-06)
- ERR-05 (validación por campo) → explícitamente fuera de scope — registrar como deferred

### Documentación expo-router
- expo-router v6: route-level ErrorBoundary es `export function ErrorBoundary({ error, retry }) { ... }`
- El root ErrorBoundary en `_layout.tsx` captura errores que no fueron capturados por route-level boundaries
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`OfflineBanner`** — `src/components/common/OfflineBanner.tsx` ya implementado con design system, solo necesita ser usado
- **`useNetworkStatus`** — `src/hooks/useNetworkStatus.ts` retorna `isConnected` y `isInternetReachable`; se inicializa optimistamente en `true`
- **`useTheme`** — todas las pantallas ya lo usan; el `RouteErrorFallback` debe seguir el mismo patrón
- **`queryClient`** — `src/utils/queryClient.ts` exporta la instancia singleton — agregar setup de onlineManager aquí para que se configure una sola vez al importar el módulo

### Established Patterns
- Design system HUD para error states: `tc.danger` para texto de error, `tc.textMuted` para descripción, border con `tc.border`
- `SafeAreaView` como contenedor root en pantallas con `flex: 1`
- Botones como `Pressable` o `TouchableOpacity` con `borderWidth: 1, borderColor: tc.primaryBorder`
- Fuente monospace: `fontFamily: 'monospace'` con `letterSpacing` para HUD feel

### Integration Points
- `onlineManager` setup en `queryClient.ts` se ejecuta al importar el módulo — que ocurre en `_layout.tsx` donde vive el `QueryClientProvider`
- `(tabs)/_layout.tsx` renderiza el `<Tabs>` navigator — wrappear con `<View style={{ flex: 1 }}>` que contenga `<OfflineBanner>` + `<Tabs>` es el patrón más limpio
- ErrorBoundary de expo-router: debe ser `export function ErrorBoundary(...)` — named export, no default export

### Gotchas conocidos
- El `onlineManager.setEventListener` debe retornar la función de cleanup (el unsubscribe de NetInfo) — si no se limpia correctamente puede causar memory leaks
- En expo-router v6, si `_layout.tsx` tiene un ErrorBoundary, este captura errores del layout mismo pero no de las rutas hijas (cada ruta necesita su propio ErrorBoundary)
- `OfflineBanner` en `(tabs)/_layout.tsx` aparecerá encima del tabBar — posicionar correctamente para no tapar la navegación
</code_context>

<specifics>
## Specific Ideas

**RouteErrorFallback component sketch:**
```tsx
export function RouteErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  const { colors: tc } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 12, letterSpacing: 3, marginBottom: 8 }}>
        ERROR DEL SISTEMA
      </Text>
      <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, textAlign: 'center', marginBottom: 24 }}>
        {error.message || 'Se produjo un error inesperado'}
      </Text>
      <Pressable onPress={retry} style={{ borderWidth: 1, borderColor: tc.primaryBorder, paddingVertical: 12, paddingHorizontal: 24 }}>
        <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>[ REINTENTAR ]</Text>
      </Pressable>
    </SafeAreaView>
  );
}
```

**onlineManager setup en queryClient.ts:**
```ts
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
```

**OfflineBanner en (tabs)/_layout.tsx:**
Agregar `useNetworkStatus` al componente y renderizar `<OfflineBanner />` condicionalmente antes del `<Tabs>` navigator dentro de un `<View style={{ flex: 1 }}>`.
</specifics>

<deferred>
## Deferred Ideas

- **ERR-05** (validación por campo en formularios) — deferido a v2; login es el único form y la UX actual es aceptable para la defensa
- **OFF-01** (offline mutation queue — encolar mutaciones cuando offline) — deferido a v2 per REQUIREMENTS.md
- Animación de entrada/salida del OfflineBanner (slide down/up) — deferido; funcionalidad primero
</deferred>

---
*Phase: 21-error-handling-offline*
*Context gathered: 2026-05-04*
