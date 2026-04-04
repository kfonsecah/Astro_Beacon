# Phase 3: Diseño Móvil (Mockups) - Research

**Researched:** 2026-04-03
**Domain:** Mobile mockup creation, Expo Router navigation patterns, mobile UX metaphors
**Confidence:** HIGH

## Summary

This phase creates mockups of the main app screens for documentation and defense purposes (Base Inicial delivery). The mockups must demonstrate understanding of mobile design patterns ("metáforas comunes del desarrollo móvil"), not simply replicate the web reference layouts. The deliverable is visual mockups + navigation documentation in `.planning/docs/MOCKUPS.md`.

The reference project has 13 screens in a web layout (max-w-lg, fixed bottom nav, FAB). These must be mapped to a coherent React Native navigation structure using expo-router v6 with route groups `(auth)/` and `(tabs)/`. The HUD/space aesthetic (deep navy, cyan glow, monospace typography, zero border-radius) must be preserved in the mockup designs.

**Primary recommendation:** Use Figma for visual mockups (industry standard, free tier sufficient) + draw.io/Excalidraw for navigation flow diagrams. Document everything in `.planning/docs/MOCKUPS.md` with screen descriptions, route mappings, and user flow diagrams.

## User Constraints (from CONTEXT.md)

### Locked Decisions
No CONTEXT.md exists for this phase — no locked decisions to honor.

### the agent's Discretion
Full discretion on mockup tool selection, screen detail level, and documentation format.

### Deferred Ideas (OUT OF SCOPE)
No deferred ideas specified.

## Standard Stack

### Mockup & Documentation Tools
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Figma | Web (2026) | Visual screen mockups | Industry standard for mobile UI design, free tier, collaborative, exports to PNG/PDF for documentation |
| draw.io / Excalidraw | Web | Navigation flow diagrams | Free, exports to SVG/PNG, integrates with documentation |
| Markdown | — | MOCKUPS.md documentation | Already used in project, renders in GitHub, version-controlled |

### Expo Router Navigation Stack (for mockup route mapping)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-router | ~6.0.23 | File-based routing | Official Expo router, built on React Navigation, project already uses it |
| @react-navigation/bottom-tabs | ^7.4.0 | Bottom tab navigator | Project dependency, renders native tab bar |
| @react-navigation/native | ^7.1.8 | Navigation core | Project dependency, expo-router is built on top |
| @expo/vector-icons | ^15.0.3 | Icon library | Project dependency, Lucide/Ionicons for tab icons |
| react-native-reanimated | ~4.1.1 | Animations | Project dependency, replaces framer-motion from reference |
| react-native-gesture-handler | ~2.28.0 | Gesture support | Project dependency, required for swipe/pull gestures |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-blur | TBD | Blur effects for tab bar/headers | When replicating `backdrop-blur-sm` from reference |
| react-native-safe-area-context | ~5.6.0 | Safe area handling | Always — handles notches, status bars on mobile |

**Installation:** No new packages needed for mockup creation. Navigation stack is already installed.

**Version verification:** All versions confirmed from project `package.json` (2026-04-03). expo-router v6 uses `Stack.Protected` for auth guards (verified via official docs, April 2026).

## Architecture Patterns

### Recommended Screen-to-Route Mapping

The 13 reference screens map to this expo-router structure:

```
app/
├── _layout.tsx                    # Root Stack + auth guard
├── index.tsx                      # Splash → redirect logic
├── (auth)/
│   ├── _layout.tsx                # Auth stack (no header)
│   └── login.tsx                  # Login screen
├── (tabs)/
│   ├── _layout.tsx                # Bottom tabs navigator (5 tabs)
│   ├── dashboard.tsx              # Tab 1: Main HUD (home)
│   ├── bestiary.tsx               # Tab 2: Species catalog
│   ├── resources.tsx              # Tab 3: Resource management
│   ├── map.tsx                    # Tab 4: Exploration map
│   └── logbook.tsx                # Tab 5: Discovery journal
├── species/
│   ├── [id].tsx                   # Species detail (stack push)
│   └── identify.tsx               # Photo identification (modal/full-screen)
├── exploration/
│   ├── index.tsx                  # Active trip tracking (stack push)
│   └── log-resource.tsx           # Log resource form (stack push)
├── profile.tsx                    # Profile/settings (modal or stack)
└── +not-found.tsx                 # 404 fallback
```

### Navigation Pattern: Auth + Tabs + Stack

**What:** Three-layer navigation architecture using expo-router route groups
**When to use:** Standard for apps with authentication + tab-based main navigation + detail screens
**Structure:**

```
Root Stack
├── (auth)/          → Login (no tabs, no header)
└── (tabs)/          → Main app with bottom tabs
    ├── dashboard    → Tab screen
    ├── bestiary     → Tab screen → pushes to /species/[id]
    ├── resources    → Tab screen
    ├── map          → Tab screen → pushes to /exploration/
    └── logbook      → Tab screen
```

**Key pattern from official docs (Expo Router authentication, April 2026):**
```tsx
// app/_layout.tsx — Root layout with auth protection
import { Stack } from 'expo-router';
import { SessionProvider, useSession } from '@/ctx';

export default function Root() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session } = useSession();
  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
```

### Tab Configuration Pattern

**What:** 5-tab bottom navigation matching the reference's 4 tabs + map
**When to use:** Primary navigation for the authenticated app section

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#6EE7B7', // cyan-glow equivalent
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        backgroundColor: '#0A0A1A', // deep navy
        borderTopColor: 'rgba(110, 231, 183, 0.4)',
      },
    }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Panel',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="bestiary" options={{ title: 'Bitácora', tabBarIcon: /* ... */ }} />
      <Tabs.Screen name="resources" options={{ title: 'Recursos', tabBarIcon: /* ... */ }} />
      <Tabs.Screen name="map" options={{ title: 'Mapa', tabBarIcon: /* ... */ }} />
      <Tabs.Screen name="logbook" options={{ title: 'Registros', tabBarIcon: /* ... */ }} />
    </Tabs>
  );
}
```

### Mobile Metaphor Patterns for This Project

| Metaphor | Where Applied | Why |
|----------|--------------|-----|
| **Bottom tabs** | Main navigation (5 tabs) | Primary mobile navigation pattern, thumb-reachable |
| **Stack navigation** | Species detail, exploration flow, login | Drill-down pattern, back button support |
| **FAB (Floating Action Button)** | Map shortcut from any tab | Quick access to primary action, reference pattern |
| **Pull-to-refresh** | Bestiary species list, logbook entries | Standard mobile refresh gesture |
| **Swipe gestures** | Species identification (swipe to confirm), resource adjustment | Project requirement (min 2 gestures) |
| **Modal presentation** | Login (if using modal pattern), species identification | Overlay without full navigation |
| **Skeleton loading** | All screens with async data | Standard mobile loading state |
| **Toast/snackbar notifications** | Resource changes, sync status | Non-intrusive feedback |
| **Safe area insets** | All screens | Handles notches, home indicators |
| **Haptic feedback** | Tab presses, button interactions | Tactile confirmation (expo-haptics installed) |

### Anti-Patterns to Avoid

- **Replicating web layouts directly:** The reference uses `max-w-lg mx-auto` and `fixed inset-0` overlays. On mobile, the full screen IS the content area — no max-width constraint needed.
- **Too many tabs:** iOS HIG recommends 3-5 tabs. The reference has 4 tabs + FAB for map. Adding more than 5 tabs causes overflow and poor UX.
- **Nested tab bars:** Don't put tabs inside tabs. Use stack navigation for sub-navigation within a tab.
- **Custom navigation without back support:** Every drill-down screen must support the native back gesture/button.
- **Ignoring safe areas:** The reference has no concept of notches or home indicators. Mobile mockups must show proper safe area handling.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Navigation structure | Custom navigator | expo-router file-based routing | Already installed, handles deep linking, typed routes, auth guards |
| Tab bar | Custom bottom bar component | @react-navigation/bottom-tabs via expo-router `<Tabs>` | Native animations, accessibility, haptic feedback, platform-specific rendering |
| Icon set | Custom SVG icons | @expo/vector-icons (Ionicons, MaterialCommunityIcons) | Already installed, 10,000+ icons, consistent sizing, color theming |
| Splash screen | Custom splash component | expo-splash-screen API | Native-level display, proper lifecycle management |
| Auth flow | Manual redirect logic | `Stack.Protected` guard (expo-router v6) | Official pattern, handles deep links, loading states |
| Gesture handling | Touch event listeners | react-native-gesture-handler + react-native-reanimated | Native gesture recognition, worklet-based animations, project already has both |
| Safe area handling | Manual padding calculations | react-native-safe-area-context | Already installed, handles all device variations |

**Key insight:** The project scaffold already includes all the navigation infrastructure needed. The mockup phase should DESIGN how these pieces fit together, not build them yet.

## Runtime State Inventory

> Not applicable — this is a design/mockup phase with no runtime state to migrate or rename.

## Common Pitfalls

### Pitfall 1: Web-to-Mobile Layout Translation
**What goes wrong:** Mockups directly copy the reference's `max-w-lg mx-auto` constraint and CSS-only effects (scanlines, glow), resulting in designs that don't feel native.
**Why it happens:** The reference project was generated for web with Tailwind CSS. It's tempting to replicate it pixel-for-pixel.
**How to avoid:** Design mockups using mobile-first patterns: full-bleed content, native tab bars, proper safe areas, scrollable content areas. Translate the HUD *aesthetic* (colors, typography, card shapes) but use mobile *patterns* (tabs, stacks, gestures).
**Warning signs:** Mockups show a centered content column with margins on both sides, or CSS effects that can't be replicated in RN.

### Pitfall 2: Incomplete Route Documentation
**What goes wrong:** The rubric requires "Conoce todas las posibles rutas" but mockups only show tab screens without documenting stack pushes, modals, or navigation flows.
**Why it happens:** Focus on visual screens while forgetting that navigation structure is equally important for the grade.
**How to avoid:** Create a navigation flow diagram showing ALL routes: tab screens, stack pushes, modals, auth redirects. Include the route path, screen name, and how to reach it.
**Warning signs:** MOCKUPS.md only has screenshots without route paths or flow descriptions.

### Pitfall 3: Missing Mobile Metaphors
**What goes wrong:** The rubric specifically requires "utiliza metáforas comunes del desarrollo móvil" but mockups show static screens with no gestures, pull-to-refresh, or native patterns.
**Why it happens:** Static mockups don't naturally show interactive patterns.
**How to avoid:** Annotate mockups with callouts showing where each mobile metaphor applies. Include a "Metáforas Móviles" section in MOCKUPS.md documenting each metaphor, where it's used, and why.
**Warning signs:** MOCKUPS.md has no mention of gestures, pull-to-refresh, haptic feedback, or native navigation patterns.

### Pitfall 4: Over-Scoping Mockup Detail
**What goes wrong:** Spending excessive time on pixel-perfect mockups when the rubric values completeness and coherence over precision.
**Why it happens:** The reference project looks polished, creating pressure to match it visually.
**How to avoid:** Focus on showing ALL main screens with correct layouts and navigation flows. Use wireframe-level fidelity with HUD color palette. The mockups are for documentation/defense, not production.
**Warning signs:** More than 2 hours spent on a single screen's visual details.

### Pitfall 5: Ignoring the HUD Aesthetic in Mockups
**What goes wrong:** Mockups look like generic mobile apps with no connection to the space/HUD theme from the reference.
**Why it happens:** Focus on mobile patterns overshadows the visual identity requirement.
**How to avoid:** Apply the reference's color palette (deep navy `#0B1120`, cyan `#6EE7B7`, orange `#FB923C`, green `#A3E635`), monospace typography for data, sharp corners (zero border-radius), and card-based layouts in all mockups.
**Warning signs:** Mockups use standard iOS/Android colors and rounded corners.

## Code Examples

### Route Group Structure (from Expo Router docs, verified April 2026)

```tsx
// app/_layout.tsx — Root layout
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="species/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="species/identify" options={{ presentation: 'modal' }} />
      <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
```

### Tab Layout with Custom Styling

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const tabConfig = [
  { name: 'dashboard', title: 'Panel', icon: 'planet-outline' },
  { name: 'bestiary', title: 'Bitácora', icon: 'bug-outline' },
  { name: 'resources', title: 'Recursos', icon: 'cube-outline' },
  { name: 'map', title: 'Mapa', icon: 'map-outline' },
  { name: 'logbook', title: 'Registros', icon: 'journal-outline' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6EE7B7',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#0B1120',
          borderTopColor: 'rgba(110, 231, 183, 0.3)',
          borderTopWidth: 1,
        },
        headerStyle: { backgroundColor: '#0B1120' },
        headerTintColor: '#6EE7B7',
        headerTitleStyle: { fontFamily: 'monospace', letterSpacing: 2 },
      }}
    >
      {tabConfig.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={icon as any} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
```

### Dynamic Route with Params

```tsx
// app/species/[id].tsx
import { useLocalSearchParams, router } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function SpeciesDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SPECIES #{id}</Text>
      {/* Detail content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120', padding: 16 },
  title: { color: '#6EE7B7', fontFamily: 'monospace', letterSpacing: 3, fontSize: 18 },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Navigation manual setup | expo-router file-based routing | 2023 (Expo Router v1) | Routes = files, automatic deep linking, typed routes |
| `useAuth` redirect pattern | `Stack.Protected` guard | 2024 (Expo Router v5) | Declarative auth, handles deep links correctly |
| react-native-vector-icons | @expo/vector-icons with tree-shaking | 2023 | Smaller bundle, auto-linked |
| Manual safe area padding | SafeAreaProvider + useSafeAreaInsets | 2022 | Automatic notch/home indicator handling |
| Animated API | react-native-reanimated 4 (worklets) | 2024 | 60fps animations, runs on UI thread |

**Deprecated/outdated:**
- **framer-motion:** DOM-only, cannot be used in React Native. Replaced by react-native-reanimated for all animations.
- **react-router-dom:** Web-only navigation. Replaced by expo-router for RN apps.
- **Tailwind CSS in RN:** Requires NativeWind layer. For this project, StyleSheet is recommended (simpler, no build step issues).
- **CSS text-shadow/box-shadow glow effects:** Must be recreated with RN shadow props, SVG overlays, or custom components.

## Open Questions

1. **Mockup fidelity level:** Should mockups be wireframe-level (boxes, labels, colors) or high-fidelity (exact typography, icons, spacing)?
   - What we know: Rubric values "completo" and "creatividad" over pixel precision
   - What's unclear: How much visual polish is expected for Base Inicial
   - Recommendation: Mid-fidelity — show correct layouts, HUD color palette, and typography style, but don't obsess over exact pixel matching. Annotate with notes about intended animations and interactions.

2. **Number of screens to mock up:** The reference has 13 screens. Should all be mocked up?
   - What we know: Rubric says "principales pantallas" and "faltan algunos detalles, rutas o páginas importantes" for lower grades
   - What's unclear: Which screens are "principales" vs. secondary
   - Recommendation: Mock up all 6-8 core screens (splash, login, dashboard, bestiary, resources, map, logbook, species detail) and document the remaining 4-5 as flow diagrams with descriptions.

3. **Figma vs. code-based mockups:** Should mockups be created in Figma or as actual RN components?
   - What we know: Phase 4 (Design System) will implement actual components
   - What's unclear: Whether this phase expects visual mockups or code prototypes
   - Recommendation: Figma for visual mockups (faster, better for documentation) + markdown diagrams for navigation flows. This aligns with "mockup" terminology and avoids duplicating Phase 4 work.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Figma (web) | Visual mockups | ✓ (web-based) | — | Penpot (open-source alternative) |
| draw.io / Excalidraw | Navigation diagrams | ✓ (web-based) | — | Mermaid.js in markdown |
| Node.js | Project development | ✓ | — | — |
| Expo CLI | Project development | ✓ | SDK 54 | — |

**No missing dependencies.** All tools for this phase are web-based or already installed.

## Validation Architecture

> This phase produces documentation artifacts (mockup images, MOCKUPS.md), not code. Validation is manual review against the rubric criteria.

### Phase Requirements → Validation Map
| Req ID | Behavior | Validation Type | Command | File Exists? |
|--------|----------|-----------------|---------|-------------|
| MOCKUP-01 | Mockups of all main screens (login, dashboard, bitácora, recursos, mapa, perfil) | Manual review | — | ❌ Wave 0 |
| MOCKUP-02 | Design coherent with astro-beacon-reference/ | Manual review | — | ❌ Wave 0 |
| MOCKUP-03 | MOCKUPS.md with routes and navigation | File existence | `test -f .planning/docs/MOCKUPS.md` | ❌ Wave 0 |
| MOCKUP-04 | Knowledge of all possible routes documented | Manual review | — | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] `.planning/docs/MOCKUPS.md` — main documentation file
- [ ] Mockup images exported and referenced in MOCKUPS.md
- [ ] Navigation flow diagram (PNG/SVG)
- [ ] Mobile metaphors section in MOCKUPS.md

## Sources

### Primary (HIGH confidence)
- [Expo Router Introduction](https://docs.expo.dev/router/introduction/) — Core concepts, file-based routing rules (verified March 2026)
- [Expo Router Notation](https://docs.expo.dev/router/basics/notation/) — Route groups, dynamic routes, layouts (verified February 2026)
- [Expo Router JavaScript Tabs](https://docs.expo.dev/router/advanced/tabs/) — Tab configuration API (verified February 2026)
- [Expo Router Authentication](https://docs.expo.dev/router/advanced/authentication/) — `Stack.Protected` pattern (verified April 2026)
- Project `package.json` — Confirmed installed versions (expo ~54.0.33, expo-router ~6.0.23)
- `astro-beacon-reference/.planning/codebase/ARCHITECTURE.md` — 13 screen definitions and navigation flows
- `astro-beacon-reference/.planning/codebase/CONCERNS.md` — What cannot be ported directly, CSS-to-RN mapping

### Secondary (MEDIUM confidence)
- React Navigation Bottom Tabs documentation — Tab bar options referenced by Expo Router docs
- Material Design / iOS HIG guidelines — Mobile metaphor patterns (general knowledge, verified against current docs)

### Tertiary (LOW confidence)
- Figma as mockup tool — Industry standard claim based on general knowledge, not verified with current market data
- Rubric interpretation — "metáforas comunes del desarrollo móvil" interpretation based on common academic expectations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from project package.json and official Expo docs (April 2026)
- Architecture: HIGH — verified from official Expo Router documentation (April 2026)
- Navigation mapping: HIGH — derived from reference project architecture + expo-router patterns
- Pitfalls: MEDIUM — based on common web-to-mobile porting issues, validated against CONCERNS.md
- Mockup tool recommendation: MEDIUM — Figma is industry standard but not verified with current 2026 market data
- Mobile metaphors: MEDIUM — standard patterns from iOS HIG/Material Design, not verified with specific academic rubric

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable — Expo Router v6 API is mature)
