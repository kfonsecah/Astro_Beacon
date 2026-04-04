# Phase 04: Design System y Estructura Visual - Research

**Researched:** 2026-04-03
**Domain:** React Native Design System Architecture
**Confidence:** HIGH

## Summary

Esta fase requiere extraer los estilos hardcodeados de 6 screens implementadas (login, dashboard, bestiary, resources, map, logbook) en un design system estructurado según la cátedra: `src/constants/` para tokens puros (colores, spacing, typography) y `src/theme/` para sistemas de tema dark/light. La estética es HUD/espacial con paleta navy/cyan, tipografía monospace, y zero border-radius.

El enfoque recomendado es: (1) crear archivos de constantes tipados con TypeScript, (2) implementar un tema provider usando `@react-navigation/native` ThemeProvider (ya instalado como dependencia transitiva de expo-router), (3) crear componentes UI reutilizables en `src/components/ui/` siguiendo el patrón component + styles.ts del profesor.

**Primary recommendation:** Constants-first approach con React Navigation ThemeProvider, componentes UI con variantes via props, y carga de fuentes IBM Plex Mono + Space Grotesk via expo-font.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `StyleSheet` (RN built-in) | RN 0.81.5 | Estilos de componentes | Patrón oficial de React Native, optimizado por Fabric |
| `@react-navigation/native` ThemeProvider | 7.1.8 | Theme context para dark/light | Ya instalado transitivamente, estándar de la industria |
| `expo-font` | ~14.0.11 | Carga de fuentes custom | Oficial de Expo, soporta async loading con SplashScreen |
| `@expo/vector-icons` | ^15.0.3 | Iconos en componentes UI | Pre-instalado, soporta Ionicons/MaterialIcons/Feather |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-native-safe-area-context` | ~5.6.0 | Safe area insets | Ya instalado, necesario para headers y FABs |
| `react-native-reanimated` | ~4.1.1 | Animaciones (glow, pulse) | Ya instalado, para efectos HUD en fase posterior |
| `expo-haptics` | ~15.0.8 | Feedback táctil | Ya instalado, para interacciones en botones |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Navigation ThemeProvider | Custom React Context + useTheme hook | Más control pero duplica infraestructura ya disponible |
| StyleSheet.create | NativeWind (Tailwind para RN) | Más cercano al reference pero complejidad de setup y limitaciones con custom CSS vars |
| expo-font | react-native-config + font linking | Más manual, expo-font es el camino oficial |

**Installation:**
```bash
# Todas las dependencias ya están instaladas — no se requieren paquetes nuevos
# Solo se necesitan las fuentes .ttf/.otf en assets/fonts/
```

**Version verification:**
- `expo-font`: 14.0.11 (installed, latest compatible with Expo SDK 54)
- `@react-navigation/native`: 7.1.8 (installed, transitively via expo-router)
- `@expo/vector-icons`: 15.0.3 (installed, matches SDK 54)
- `react-native-safe-area-context`: 5.6.0 (installed, latest is 5.7.0 — compatible)

## Architecture Patterns

### Recommended Project Structure

```
src/
├── constants/
│   ├── colors.ts          # Paleta de colores raw (hex/HSL values)
│   ├── spacing.ts         # Escala de spacing (4px base)
│   ├── typography.ts      # Font families, sizes, weights, letter-spacing
│   └── shadows.ts         # Sombras y efectos de glow (opcional)
│
├── theme/
│   ├── dark.ts            # Tema dark (tokens semánticos → colores)
│   ├── light.ts           # Tema light (tokens semánticos → colores)
│   ├── fonts.ts           # Configuración de fuentes por plataforma
│   └── index.ts           # Export unificado + Theme type
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   ├── Card.tsx
│   │   ├── Card.styles.ts
│   │   ├── Input.tsx
│   │   ├── Input.styles.ts
│   │   ├── Badge.tsx
│   │   ├── Badge.styles.ts
│   │   ├── ProgressBar.tsx
│   │   ├── ProgressBar.styles.ts
│   │   ├── EmptyState.tsx
│   │   ├── EmptyState.styles.ts
│   │   └── index.ts       # Barrel export
│   └── common/
│       ├── HudHeader.tsx
│       ├── HudHeader.styles.ts
│       ├── ScanlineOverlay.tsx
│       └── Fab.tsx
│
└── hooks/
    ├── use-theme-color.ts # Hook para resolver color por tema actual
    └── use-color-scheme.ts # Hook para detectar sistema dark/light
```

### Pattern 1: Constants → Theme → Component Flow

**What:** Separación en 3 capas: constantes raw → mapeo semántico por tema → consumo en componentes.

**Why:** Permite cambiar tema sin tocar componentes. Las constantes son inmutables, el tema mapea tokens semánticos, los componentes consumen via hook.

```typescript
// src/constants/colors.ts — Raw palette (immutable)
export const COLORS = {
  navy900: '#0B1120',
  navy800: '#111827',
  navy700: '#1F2937',
  navy600: '#374151',
  gray500: '#4B5563',
  gray400: '#6B7280',
  gray300: '#9CA3AF',
  gray100: '#E5E7EB',
  cyan400: '#6EE7B7',
  orange400: '#FB923C',
  green500: '#22C55E',
  red500: '#EF4444',
  purple500: '#A855F7',
  blue500: '#3B82F6',
  amber500: '#F59E0B',
} as const;
```

```typescript
// src/theme/dark.ts — Semantic tokens
import { COLORS } from '@/src/constants/colors';

export const darkTheme = {
  dark: true,
  colors: {
    primary: COLORS.cyan400,
    background: COLORS.navy900,
    card: COLORS.navy800,
    border: COLORS.navy700,
    text: COLORS.gray100,
    textSecondary: COLORS.gray400,
    textMuted: COLORS.gray500,
    success: COLORS.green500,
    warning: COLORS.orange400,
    danger: COLORS.red500,
    accent: COLORS.purple500,
  },
  spacing: { /* ... */ },
  typography: { /* ... */ },
} as const;
```

```typescript
// src/hooks/use-theme-color.ts
import { useTheme } from '@react-navigation/native';

export function useThemeColor(colorName: keyof typeof darkTheme.colors) {
  const theme = useTheme();
  return theme.colors[colorName];
}
```

### Pattern 2: Component + Styles File Separation

**What:** Cada componente UI tiene su archivo `.tsx` y su archivo `.styles.ts` separado.

**Why:** Sigue la estructura del profesor (ver PROJECT.md). Facilita mantenimiento y reutilización de estilos.

```typescript
// src/components/ui/Button.styles.ts
import { StyleSheet } from 'react-native';
import { COLORS } from '@/src/constants/colors';

export const buttonStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 0, // Zero border-radius — principio HUD
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primary: {
    borderColor: COLORS.cyan400,
    backgroundColor: 'transparent',
  },
  text: {
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 3,
  },
  primaryText: {
    color: COLORS.cyan400,
  },
});
```

### Pattern 3: React Navigation ThemeProvider Integration

**What:** Usar el `ThemeProvider` de `@react-navigation/native` (ya disponible transitivamente) para proveer el tema a toda la app.

```typescript
// app/_layout.tsx
import { ThemeProvider } from '@react-navigation/native';
import { darkTheme } from '@/src/theme/dark';

export default function RootLayout() {
  return (
    <ThemeProvider value={darkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* routes */}
      </Stack>
    </ThemeProvider>
  );
}
```

### Pattern 4: Font Loading with expo-font

**What:** Cargar fuentes custom en el root layout antes de renderizar la app.

```typescript
// app/_layout.tsx
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'IBMPlexMono-Regular': require('@/assets/fonts/IBMPlexMono-Regular.ttf'),
    'IBMPlexMono-Bold': require('@/assets/fonts/IBMPlexMono-Bold.ttf'),
    'SpaceGrotesk-Regular': require('@/assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Bold': require('@/assets/fonts/SpaceGrotesk-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;
  // ...
}
```

### Anti-Patterns to Avoid

- **Hardcoded colors en componentes:** Cada `#6EE7B7` inline debe migrar a `useThemeColor('primary')`
- **`borderRadius` en cualquier componente:** El principio HUD exige zero border-radius siempre
- **Math.random() en render:** El reference project lo usa para sparklines — causa re-renders visuales en RN
- **Tailwind classes en RN:** No funcionan nativamente. No usar NativeWind para esta fase (complejidad innecesaria)
- **CSS text-shadow:** No existe en RN. Glow effects requieren alternativas (ver sección Common Pitfalls)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme context | Custom React.Context + Provider | `@react-navigation/native` ThemeProvider | Ya instalado, integrado con expo-router, soporta system theme detection |
| Font loading | Custom native module | `expo-font` + `useFonts` hook | Oficial de Expo, maneja async loading, platform differences |
| Safe area insets | Manual `Platform.OS` checks | `react-native-safe-area-context` | Ya instalado, maneja notches, home indicators, rotation |
| Icon library | Custom SVG icons | `@expo/vector-icons` | Pre-instalado, 3000+ icons, tree-shakeable |
| Color opacity | Manual hex manipulation (`#6EE7B7` + `33`) | `Color` from `@react-navigation/native` or inline `rgba()` | Evita errores de conversión hex→alpha |
| Spacing scale | Valores arbitrarios (13px, 17px) | Escala 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48 | Consistencia visual, fácil de mantener |

**Key insight:** El 90% del design system son constantes + StyleSheet + ThemeProvider. No se necesita ninguna librería adicional de design system (como react-native-paper o nativewind) para esta fase.

## Common Pitfalls

### Pitfall 1: Font Family Resolution en Android vs iOS
**What goes wrong:** `fontFamily: 'monospace'` funciona en iOS pero en Android resuelve a una fuente diferente o no carga la fuente custom.
**Why it happens:** Android usa el nombre completo de la fuente (`IBMPlexMono-Regular`), iOS usa el nombre PostScript (`IBM Plex Mono`).
**How to avoid:** Usar `Platform.OS` para mapear nombres:
```typescript
const MONO_FONT = Platform.OS === 'ios' ? 'IBM Plex Mono' : 'IBMPlexMono-Regular';
```
**Warning signs:** Texto se ve diferente en Android vs iOS, o fuente no carga en Android.

### Pitfall 2: ThemeProvider No Disponible en expo-router
**What goes wrong:** `useTheme()` de `@react-navigation/native` no funciona si el ThemeProvider no envuelve el Stack navigator.
**Why it happens:** expo-router crea su propio navigator internamente. El ThemeProvider debe estar en `app/_layout.tsx` envolviendo el `<Stack>`.
**How to avoid:** Envolver el Stack con ThemeProvider en el root layout.
**Warning signs:** `useTheme()` retorna undefined o tema default.

### Pitfall 3: Border Radius Heredado
**What goes wrong:** Algunos componentes de RN (como TextInput en Android) tienen border-radius por defecto.
**Why it happens:** Estilos nativos de plataforma.
**How to avoid:** Explicitamente setear `borderRadius: 0` en todos los componentes que requieran estética HUD.
**Warning signs:** Inputs o botones con esquinas redondeadas en Android.

### Pitfall 4: Opacidad de Colores con Hex Strings
**What goes wrong:** Concatenar hex + alpha (`COLORS.cyan400 + '33'`) funciona pero es frágil y no type-safe.
**Why it happens:** JavaScript no valida hex strings en runtime.
**How to avoid:** Definir variantes con opacidad directamente en las constants:
```typescript
cyan400_10: 'rgba(110, 231, 183, 0.1)',
cyan400_20: 'rgba(110, 231, 183, 0.2)',
cyan400_30: 'rgba(110, 231, 183, 0.3)',
```
**Warning signs:** Colores que no renderizan o se ven incorrectos.

### Pitfall 5: Gap Property en React Native
**What goes wrong:** `gap` funciona en RN 0.71+ pero puede tener comportamiento inconsistente con `flexWrap`.
**Why it happens:** Soporte relativamente nuevo en RN.
**How to avoid:** Usar `gap` con confianza (RN 0.81 lo soporta bien), pero verificar en Android. Para compatibilidad máxima, usar `marginRight`/`marginBottom` en children.
**Warning signs:** Espaciado inconsistente entre filas de elementos.

### Pitfall 6: Scanline/Glow Effects en RN
**What goes wrong:** Los efectos CSS del reference (text-shadow, box-shadow, scanlines) no tienen equivalente directo en RN.
**Why it happens:** RN no renderiza con CSS.
**How to avoid:** 
- **Glow:** Usar `elevation` (Android) + `shadowColor/shadowOpacity` (iOS) en View wrappers
- **Scanlines:** Crear un componente con un patrón repetitivo usando SVG o imagen de fondo
- **Text glow:** No implementar en esta fase — requiere `react-native-svg` o enfoque custom
**Warning signs:** Intentar replicar CSS directamente en StyleSheet.

### Pitfall 7: Light Theme Incompatibility con Estética HUD
**What goes wrong:** La referencia es dark-only. Un light theme con la misma paleta se ve mal.
**Why it happens:** Los colores navy/cyan están diseñados para fondo oscuro.
**How to avoid:** Para light theme, invertir la paleta: fondo claro (gray-50), texto oscuro, acentos cyan más oscuros para contraste. O mantener dark-only y documentar la decisión.
**Warning signs:** Texto cyan sobre fondo blanco es ilegible.

## Code Examples

### Color Constants con Variantes de Opacidad
```typescript
// src/constants/colors.ts
export const COLORS = {
  // Backgrounds
  navy900: '#0B1120',
  navy800: '#111827',
  navy700: '#1F2937',
  navy600: '#374151',

  // Text
  gray100: '#E5E7EB',
  gray300: '#9CA3AF',
  gray400: '#6B7280',
  gray500: '#4B5563',

  // Accent
  cyan400: '#6EE7B7',
  cyan400_10: 'rgba(110, 231, 183, 0.1)',
  cyan400_20: 'rgba(110, 231, 183, 0.2)',
  cyan400_30: 'rgba(110, 231, 183, 0.3)',

  orange400: '#FB923C',
  orange400_10: 'rgba(251, 146, 60, 0.1)',
  orange400_30: 'rgba(251, 146, 60, 0.3)',

  green500: '#22C55E',
  green500_10: 'rgba(34, 197, 94, 0.1)',

  red500: '#EF4444',
  red500_10: 'rgba(239, 68, 68, 0.1)',

  purple500: '#A855F7',
  blue500: '#3B82F6',
  amber500: '#F59E0B',
} as const;
```

### Spacing Scale
```typescript
// src/constants/spacing.ts
export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxx: 48,
} as const;
```

### Typography Scale
```typescript
// src/constants/typography.ts
import { Platform } from 'react-native';

export const FONT_FAMILY = {
  mono: Platform.OS === 'ios' ? 'IBM Plex Mono' : 'IBMPlexMono-Regular',
  monoBold: Platform.OS === 'ios' ? 'IBM Plex Mono' : 'IBMPlexMono-Bold',
  body: Platform.OS === 'ios' ? 'Space Grotesk' : 'SpaceGrotesk-Regular',
  bodyBold: Platform.OS === 'ios' ? 'Space Grotesk' : 'SpaceGrotesk-Bold',
} as const;

export const TYPOGRAPHY = {
  h1: { fontSize: 28, letterSpacing: 6, lineHeight: 36 },
  h2: { fontSize: 18, letterSpacing: 4, lineHeight: 24 },
  h3: { fontSize: 16, letterSpacing: 3, lineHeight: 22 },
  h4: { fontSize: 14, letterSpacing: 3, lineHeight: 20 },
  label: { fontSize: 11, letterSpacing: 2, lineHeight: 16 },
  data: { fontSize: 12, letterSpacing: 1, lineHeight: 18 },
  body: { fontSize: 14, letterSpacing: 0, lineHeight: 20 },
  caption: { fontSize: 9, letterSpacing: 2, lineHeight: 14 },
  footer: { fontSize: 8, letterSpacing: 1, lineHeight: 12 },
} as const;
```

### Theme Hook
```typescript
// src/hooks/use-color-scheme.ts
import { useColorScheme } from 'react-native';

export function useColorScheme() {
  const colorScheme = useColorScheme();
  return colorScheme ?? 'dark'; // Default a dark theme
}
```

### Card Component con Variantes
```typescript
// src/components/ui/Card.tsx
import { View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { cardStyles } from './Card.styles';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'alert' | 'discovery';
}

export function Card({ children, title, variant = 'default' }: CardProps) {
  const theme = useTheme();
  return (
    <View style={[cardStyles.container, cardStyles[variant]]}>
      {title && <Text style={cardStyles.title}>{title}</Text>}
      {children}
    </View>
  );
}
```

### Badge Component
```typescript
// src/components/ui/Badge.tsx
import { View, Text } from 'react-native';
import { badgeStyles } from './Badge.styles';

interface BadgeProps {
  label: string;
  color: string;
  variant?: 'solid' | 'outline' | 'ghost';
}

export function Badge({ label, color, variant = 'ghost' }: BadgeProps) {
  return (
    <View style={[badgeStyles.container, badgeStyles[variant], { borderColor: color }]}>
      <Text style={[badgeStyles.text, { color }]}>{label}</Text>
    </View>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline styles en cada componente | Design tokens + ThemeProvider | ~2020 | Consistencia, theming fácil |
| `StyleSheet.create` con colores hardcodeados | Tokens semánticos (`primary`, `danger`) | ~2021 | Refactoring de colores sin tocar componentes |
| Custom theme context | React Navigation ThemeProvider | ~2022 | Menos boilerplate, integración nativa |
| `Platform.select` para fuentes | `expo-font` + `useFonts` | Expo SDK 40+ | Carga async, manejo de errores |
| `nativewind` para todo | StyleSheet + constants | Siempre | Más control, menos dependencia de tooling |

**Deprecated/outdated:**
- **`StyleSheet.hairlineWidth`**: Usar valores explícitos (1) para bordes HUD
- **`Dimensions.get('window')`**: Usar hooks de safe area o `useWindowDimensions`
- **CSS-in-JS libraries (styled-components)**: No recomendadas para RN con New Architecture

## Open Questions

1. **¿Light theme es obligatorio o decorativo?**
   - What we know: El ROADMAP dice "tema dark/light". El reference es dark-only.
   - What's unclear: Si el profesor evalúa el light theme o es suficiente con la infraestructura.
   - Recommendation: Implementar light.ts con paleta invertida pero priorizar dark como tema principal.

2. **¿Efectos de glow/scanline en esta fase o en fase de animaciones?**
   - What we know: Los efectos CSS del reference no tienen equivalente directo en RN.
   - What's unclear: Si se esperan en esta fase o en la fase de animaciones.
   - Recommendation: Implementar solo la infraestructura (colores, spacing, tipografía, componentes base). Dejar glow/scanlines para fase de animaciones con react-native-reanimated.

3. **¿Qué fuentes exactas descargar?**
   - What we know: IBM Plex Mono + Space Grotesk del reference.
   - What's unclear: Qué pesos (weights) son necesarios.
   - Recommendation: Descargar Regular (400) y Bold (700) de ambas fuentes. Medium (500) si se necesita.

4. **¿Barrel exports en `src/components/ui/index.ts`?**
   - What we know: El reference no usa barrel files. El profesor no especifica.
   - What's unclear: Si es buena práctica para este proyecto.
   - Recommendation: Usar barrel exports para simplificar imports: `import { Button, Card, Badge } from '@/src/components/ui'`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| expo-font | Font loading | ✓ | ~14.0.11 | — |
| @expo/vector-icons | Icon components | ✓ | ^15.0.3 | — |
| @react-navigation/native ThemeProvider | Theme context | ✓ | ^7.1.8 | Custom context (más trabajo) |
| react-native-safe-area-context | Safe area handling | ✓ | ~5.6.0 | — |
| IBM Plex Mono .ttf/.otf | Typography | ✗ | — | Descargar de Google Fonts |
| Space Grotesk .ttf/.otf | Typography | ✗ | — | Descargar de Google Fonts |

**Missing dependencies with fallback:**
- **Fuentes IBM Plex Mono y Space Grotesk**: No están en `assets/fonts/`. Se deben descargar de Google Fonts. Fallback: usar fuentes del sistema (`Platform.select({ ios: 'Courier', android: 'monospace' })`) mientras se descargan.

## Validation Architecture

> Nota: `.planning/config.json` no fue verificado para `workflow.nyquist_validation`. Se asume habilitado por defecto.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No detectado — Wave 0 |
| Config file | none — see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DS-01 | Colores extraídos a constants | Manual visual | — | ❌ Wave 0 |
| DS-02 | Spacing scale consistente | Manual visual | — | ❌ Wave 0 |
| DS-03 | Tipografía con fuentes custom | Manual visual | — | ❌ Wave 0 |
| DS-04 | Tema dark aplicado globalmente | Manual visual | — | ❌ Wave 0 |
| DS-05 | Componentes UI reutilizables | Manual visual | — | ❌ Wave 0 |
| DS-06 | Zero border-radius en toda la UI | Manual visual | — | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Verificación visual en emulator/dispositivo
- **Per wave merge:** Revisión de que todos los colores hardcodeados fueron migrados
- **Phase gate:** Todos los screens usan el design system, ningún color inline restante

### Wave 0 Gaps
- [ ] Framework de testing no configurado
- [ ] Tests visuales (snapshot) para componentes UI — considerar `react-native-testing-library`
- [ ] Framework install: `npm install --save-dev jest @testing-library/react-native` — Wave 0

## Sources

### Primary (HIGH confidence)
- `astro-beacon-reference/src/index.css` — Paleta de colores HSL exacta del reference
- `app/(tabs)/dashboard.tsx`, `bestiary.tsx`, `resources.tsx`, `map.tsx`, `logbook.tsx`, `app/(auth)/login.tsx` — Colores hardcodeados actuales extraídos
- `package.json` — Dependencias instaladas y versiones
- Expo SDK 54 documentation — `expo-font`, `useFonts` pattern
- React Navigation 7.x documentation — ThemeProvider API

### Secondary (MEDIUM confidence)
- React Native 0.81 StyleSheet documentation — `gap` support, platform differences
- Google Fonts — IBM Plex Mono y Space Grotesk weights disponibles

### Tertiary (LOW confidence)
- Efectos de glow en RN — múltiples approaches posibles, ninguno estándar

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — todas las librerías están instaladas y verificadas
- Architecture: HIGH — patrón constants→theme→component es estándar en RN
- Pitfalls: HIGH — verificados con código actual del proyecto y documentación oficial
- Font loading: HIGH — patrón oficial de expo-font
- Glow/scanline effects: MEDIUM — requieren investigación adicional para implementación óptima

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (30 días — tecnologías estables)
