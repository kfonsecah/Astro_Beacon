# Migración: Context API → Zustand para Auth State

**Fecha:** 2026-04-07
**Severidad:** ⚠️ Arquitectural (no era un crash, era una inconsistencia de diseño)
**Fase:** Base Inicial (v0.5)

---

## Problema Detectado

Durante la auditoría de integridad del proyecto se identificó una **inconsistencia entre el diagrama de arquitectura y el código real**:

| Capa | Diagrama (Frontend Internal Architecture) | Código real |
|------|-------------------------------------------|-------------|
| State | `authStore · resourceStore · speciesStore · syncStore` (Zustand) | `auth.context.tsx` (Context API) |
| Hooks | `useAuth` apuntando a Zustand store | `useAuth` apuntando a React Context |

Adicionalmente, `api.ts` tenía el interceptor de JWT **completamente comentado** porque no podía acceder al token desde fuera de React:

```ts
// Token will be attached once auth store is implemented
// const token = useAuthStore.getState().token;  ← no existía el store
// if (token) {
//   config.headers.Authorization = `Bearer ${token}`;
// }
```

Con Context API **es imposible** leer el token desde un interceptor de Axios porque los hooks de React no pueden llamarse fuera de componentes.

---

## Causa Raíz

La arquitectura fue diseñada con Zustand como capa de estado desde el inicio (Zustand está en `package.json`), pero la implementación inicial usó Context API por ser más familiar. Esto dejó:

1. **Dos fuentes de verdad potenciales**: Context para auth, Zustand planeado para el resto
2. **Interceptor de Axios sin funcionar**: El token nunca se adjuntaba a las requests
3. **El 401 en el response interceptor solo hacía `console.warn`**: No ejecutaba logout

---

## Solución Implementada

### Archivos creados

**`src/stores/auth.store.ts`** — Store Zustand con toda la lógica de auth:

```ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (agentId, _password) => {
    // TODO: api.post('/auth/login', { agentId, password })
    const mockToken = `mock_token_${Date.now()}`;
    const mockUser = { id: '1', name: agentId, email: `${agentId}@astrobeacon.com` };
    await SecureStore.setItemAsync('auth_token', mockToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(mockUser));
    set({ token: mockToken, user: mockUser, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isAuthenticated: true });
      }
    } catch (error) {
      console.warn('[Auth] Failed to restore session:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Alias para componentes — misma API de consumo
export const useAuth = useAuthStore;
```

### Archivos modificados

**`app/_layout.tsx`**
- Eliminado `<AuthProvider>` wrapper (ya no existe provider)
- `AuthGuard` llama `checkAuth()` en `useEffect` al montar
- Import cambiado: `@/context/auth.context` → `@/stores/auth.store`

```tsx
// ANTES
export default function RootLayout() {
  return (
    <AuthProvider>        // ← Provider necesario con Context
      <RootLayoutContent />
    </AuthProvider>
  );
}

// DESPUÉS
export default function RootLayout() {
  return <RootLayoutContent />;  // ← Zustand no necesita Provider
}
```

**`app/(auth)/login.tsx`**
- Solo cambió el import (1 línea)
- Se agregó `router.replace('/(tabs)/dashboard')` ya que el store no navega

```tsx
// ANTES
import { useAuth } from "@/context/auth.context";
await login(agentId, password); // el context navegaba internamente

// DESPUÉS
import { useAuth } from "@/stores/auth.store";
await login(agentId, password);
router.replace('/(tabs)/dashboard'); // la navegación queda en el componente
```

**`src/services/api.ts`**
- Interceptor de request **ahora funciona** — `getState()` es accesible fuera de React
- El 401 **ahora ejecuta** `logout()` en lugar de solo loggear

```ts
// ANTES — comentado, no funcionaba
api.interceptors.request.use((config) => {
  // const token = useAuthStore.getState().token;  ← store no existía
  return config;
});

// DESPUÉS — funcional
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;   // ← getState() fuera de React ✅
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ANTES — solo un console.warn
if (error.response?.status === 401) {
  console.warn('[API] Token expired, redirecting to login');
}

// DESPUÉS — ejecuta logout real
if (error.response?.status === 401) {
  if (__DEV__) console.warn('[API] Token expired, clearing session');
  await useAuthStore.getState().logout();  // ← logout real ✅
}
```

**`src/context/auth.context.tsx`**
- Marcado como `@deprecated`, vaciado

---

## Por qué Zustand es superior a Context para este caso

| Criterio | Context API | Zustand |
|----------|-------------|---------|
| Acceso fuera de React (ej: interceptors) | ❌ Imposible | ✅ `getState()` |
| Necesita Provider en el árbol | ✅ Sí | ❌ No |
| Reinicio en remount del Provider | ⚠️ Posible | ✅ Estado global persistido |
| Integración con SecureStore | Manual | Manual (igual) |
| Preparado para persist middleware | ❌ No | ✅ Sí (siguiente entrega) |

---

## Verificación

| Escenario | Resultado |
|-----------|-----------|
| App sin sesión previa → muestra Login | ✅ |
| Login con ID/clave → navega a Dashboard | ✅ |
| Reabrir app con sesión guardada → navega directo | ✅ |
| Token en headers de Axios (cuando haya backend) | ✅ Listo |
| 401 → limpia sesión y redirige a Login | ✅ Listo |

---

## Impacto en la Arquitectura

El diagrama **Frontend Internal Architecture** y el código ahora están **alineados**:

```
State (Zustand Stores)
authStore  ← implementado ✅
resourceStore, speciesStore, syncStore ← próximas entregas
```

---

## Lección Aprendida

**Definir la capa de estado global desde el inicio y no mezclar enfoques.**

Si el diseño dice Zustand, implementar Zustand desde el primer store.
Context API es válido para cosas como el tema visual (`useTheme`), pero no para
estado de sesión que necesita ser accedido fuera del árbol de React.

---

*Migración documentada el 2026-04-07*
*Aplica a: v0.5 (Base Inicial)*
