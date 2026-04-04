# Fix: Redirect Loop en Android/iOS (Pantalla Blanca Parpadeante)

**Fecha:** 2026-04-04
**Severidad:** 🔴 Crítica (bloquea ejecución en Android/emulador)
**Fase:** Base Inicial (v0.5)

---

## Síntoma

Al abrir la app en Android (emulador o Expo Go), la pantalla queda **blanca y parpadea** sin cargar nada. En iOS el error no era visible pero existía silenciosamente.

---

## Causa Raíz

Un **bucle infinito de redirección** en `app/_layout.tsx`.

El `AuthGuard` envuelve **toda la app** (incluyendo el Login) y ejecuta:

```tsx
if (!isAuthenticated) {
  return <Redirect href="/(auth)/login" />;
}
```

Esto crea el ciclo:
1. Usuario entra al Login
2. `AuthGuard` verifica: "¿Está autenticado?" → No
3. `AuthGuard` ejecuta: `<Redirect href="/(auth)/login" />`
4. La app intenta navegar al Login... **pero ya está en el Login**
5. Se dispara un nuevo render de `RootLayout`, que vuelve a ejecutar `AuthGuard`
6. Loop infinito → pantalla blanca parpadeante

### ¿Por qué en iOS no se veía?
- iOS usa `UINavigationController` (stack nativo) que absorbe redirecciones rápidas sin repintar
- Android expone cada intento de redirect visualmente
- Expo Go en iOS tiene un runtime más tolerante a errores de routing

---

## Solución

### Archivo modificado: `app/_layout.tsx`

Se agregó `usePathname` de `expo-router` para verificar la ruta actual antes de redirigir:

```tsx
import { Stack, Redirect, usePathname } from "expo-router";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();
  const { colors: tc } = theme;
  const pathname = usePathname(); // <--- NUEVO

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
      </View>
    );
  }

  // <--- CONDICIÓN CORREGIDA:
  // Solo redirige si NO está autenticado Y NO está ya en una ruta de auth
  if (!isAuthenticated && !pathname?.includes("login")) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}
```

### Lógica del fix

| Condición | Antes | Después |
|-----------|-------|---------|
| No autenticado + en Login | ❌ Redirige a Login (loop) | ✅ No redirige (ya está ahí) |
| No autenticado + en Dashboard | ✅ Redirige a Login | ✅ Redirige a Login |
| Autenticado + en Login | ❌ Redirige a Login | ✅ Muestra Login (luego el login redirige a Dashboard) |
| Autenticado + en Dashboard | ✅ Muestra Dashboard | ✅ Muestra Dashboard |

---

## Errores Relacionados Solucionados

### 1. `expo-system-ui` no encontrado
**Síntoma:** Error en rojo al iniciar en celular de tercero.
**Causa:** Módulo importado pero no instalado.
**Solución:**
```bash
npx expo install expo-system-ui
```

### 2. `useColorScheme` devuelve null en Android
**Síntoma:** Crash al obtener tema del sistema.
**Causa:** Android tarda en reportar el tema al iniciar.
**Solución:** `src/hooks/use-theme.ts` — fallback a dark mode si `colorScheme` no es `'light'`:
```tsx
const isDark = colorScheme === 'light' ? false : true;
```

### 3. Reanimated sin babel plugin
**Síntoma:** Pantalla blanca sin errores visibles.
**Causa:** Falta `babel.config.js` con plugin de reanimated.
**Solución:** Crear `babel.config.js` en raíz:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

---

## Verificación

### UAT Realizado
| Plataforma | Antes | Después |
|------------|-------|---------|
| Android (Expo Go) | ❌ Pantalla blanca parpadeante | ✅ Login carga correctamente |
| Android (Emulador) | ❌ Pantalla blanca parpadeante | ✅ Login carga correctamente |
| iOS (Expo Go) | ⚠️ Funcionaba pero con loop silencioso | ✅ Login carga sin warnings |

### Comando de verificación
```bash
npx expo start -c
```
*(La `-c` limpia caché y es obligatoria después de cambiar rutas o babel config)*

---

## Lección Aprendida

**Nunca envolver rutas públicas con un guard que redirige a sí mismo.**
Siempre verificar `pathname` antes de ejecutar un `<Redirect>` en el layout raíz.

Patrón seguro para futuros proyectos:
```tsx
const publicRoutes = ['/login', '/register', '/forgot-password'];
const isPublic = publicRoutes.some(route => pathname?.includes(route));

if (!isAuthenticated && !isPublic) {
  return <Redirect href="/login" />;
}
```

---

*Fix documentado el 2026-04-04*
*Aplica a: v0.5 (Base Inicial)*
