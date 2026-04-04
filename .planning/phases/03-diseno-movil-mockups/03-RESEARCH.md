# Phase 3: Diseño Móvil (Mockups) - Research

**Researched:** 2026-04-03
**Domain:** Mobile mockup tools, expo-router navigation patterns, mobile UX metaphors
**Confidence:** HIGH

## Summary

This phase produces mockups and navigation documentation for the Base Inicial delivery (April 8). The mockups are **documentation artifacts**, not production code — they need to demonstrate screen layouts, navigation flows, and design coherence with the `astro-beacon-reference/` HUD/space aesthetic. The rubric explicitly requires: (1) complete design of main screens, (2) use of common mobile development metaphors, (3) demonstrated interest/creativity, (4) knowledge of all possible routes.

The reference project has 13 web screens that must be reorganized into a mobile-native navigation structure: a root Stack for auth flows, a bottom Tabs navigator for primary sections (Dashboard, Bestiary, Recursos, Bitácora), and nested Stacks for detail screens (Species Detail, Identification, Exploration, Map). This creates a clear `(auth)/` → `(tabs)/` → detail-screen hierarchy that expo-router handles via route groups.

**Primary recommendation:** Use Figma for high-fidelity mockups (industry standard, free tier, easy to share for defense) + draw.io for navigation flow diagrams. Document all routes in `.planning/docs/MOCKUPS.md` with screen descriptions and flow diagrams. Demonstrate mobile metaphors: bottom tabs, pull-to-refresh, FAB, swipe gestures, bottom sheets, and stack navigation with back buttons.

## User Constraints (from CONTEXT.md)

> No CONTEXT.md exists for this phase — no locked decisions to copy. Research proceeds with full discretion.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-03-01 | Mockups de todas las pantallas principales | Standard stack + architecture patterns below |
| REQ-03-02 | Diseño coherente con referencia visual | Color palette, typography, HUD patterns from CONCERNS.md |
| REQ-03-03 | Documentación de rutas y navegación en MOCKUPS.md | Navigation architecture + route mapping below |
| REQ-03-04 | Conocimiento de todas las posibles rutas | Complete route tree documented below |

## Standard Stack

### Mockup & Documentation Tools
| Tool | Purpose | Why Standard |
|------|---------|--------------|
| **Figma** (free tier) | High-fidelity screen mockups | Industry standard, collaborative, easy to export for defense presentations |
| **draw.io / diagrams.net** | Navigation flow diagrams | Free, integrates with GitHub, supports UML/flowchart notation |
| **Excalidraw** (optional) | Quick wireframe sketches | Hand-drawn style, good for early-stage exploration |

### Navigation Stack (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `expo-router` | ~6.0.23 | File-based routing | Expo's official router, React Navigation underneath, typed routes enabled |
| `@react-navigation/bottom-tabs` | ^7.4.0 | Bottom tab navigation | Standard mobile pattern, lazy loading, customizable |
| `@react-navigation/native` | ^7.1.8 | Core navigation primitives | Community standard for RN navigation |
| `@react-navigation/native-stack` | *(not yet installed)* | Native stack screens | Uses native UINavigationController/Fragment for performance |
| `react-native-screens` | ~4.16.0 | Native screen management | Required by expo-router, enables native navigation transitions |
| `react-native-safe-area-context` | ~5.6.0 | Safe area handling | Required for notch/Dynamic Island compatibility |

### Icon & Visual Assets
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@expo/vector-icons` | ^15.0.3 | Icon library | Tab icons, HUD icons, FAB icon — bundled with Expo |
| `expo-haptics` | ~15.0.8 | Haptic feedback | Tab press feedback (already in package.json) |
| `react-native-reanimated` | ~4.1.1 | Animations | HUD glow effects, scan animations, progress bars |
| `react-native-gesture-handler` | ~2.28.0 | Gesture handling | Swipe gestures (requirement: mínimo 2 gestos) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Figma | Penpot (open source) | Less ecosystem, fewer mobile UI kits |
| draw.io | Mermaid.js (markdown diagrams) | Less visual control, harder to export as images |
| @expo/vector-icons | lucide-react-native | Extra dependency, but closer to reference's lucide-react |
| Native stack | JS stack | Worse performance, no native swipe-back gesture |

**Installation for native stack (needed later, not for mockups):**
```bash
npx expo install @react-navigation/native-stack
```

## Architecture Patterns

### Recommended Mobile Navigation Structure

The 13 reference screens map to this mobile-native hierarchy:

```
app/
├── _layout.tsx                    # Root Stack (auth guard)
├── index.tsx                      # Splash → redirect
├── (auth)/
│   ├── _layout.tsx                # Auth Stack (no header)
│   └── login.tsx                  # Login screen
├── (tabs)/
│   ├── _layout.tsx                # Bottom Tabs (4 tabs)
│   ├── dashboard.tsx              # Tab 1: Main HUD (home)
│   ├── bestiary.tsx               # Tab 2: Species catalog
│   ├── resources.tsx              # Tab 3: Resource management
│   └── logbook.tsx                # Tab 4: Discovery journal
├── species/
│   ├── [id].tsx                   # Species detail (pushed from bestiary)
│   └── identify.tsx               # Photo identification (modal/full-screen)
├── exploration/
│   ├── index.tsx                  # Active trip (pushed from map)
│   └── log-resource.tsx           # Log resource form (pushed from exploration)
├── map.tsx                        # Exploration map (modal/full-screen from FAB)
└── +not-found.tsx                 # 404 fallback
```

### Navigation Pattern: Auth → Tabs → Details

**What:** Three-layer navigation hierarchy
**When to use:** Apps with authentication + primary sections + detail views (most mobile apps)
**Why this pattern:** 
- `(auth)/` route group isolates login/register from the rest of the app
- `(tabs)/` provides the 4 primary sections the user accesses most
- Stack routes (`species/`, `exploration/`, `map.tsx`) handle less-frequent but important flows

### Screen-to-Reference Mapping

| Mobile Screen | Reference Page | Tab/Stack | Priority for Mockup |
|---------------|---------------|-----------|---------------------|
| Splash | `Splash.tsx` | Root Stack | HIGH — first impression |
| Login | `Login.tsx` | (auth)/ | HIGH — auth flow |
| Dashboard | `Dashboard.tsx` | (tabs)/dashboard | HIGH — main HUD |
| Bestiary | `Bestiary.tsx` | (tabs)/bestiary | HIGH — species catalog |
| Species Detail | `SpeciesDetail.tsx` | species/[id] | MEDIUM — detail view |
| Species Identification | `SpeciesIdentification.tsx` | species/identify | MEDIUM — camera flow |
| Resources | `Resources.tsx` | (tabs)/resources | HIGH — resource management |
| Exploration Map | `ExplorationMap.tsx` | map.tsx | HIGH — GPS/map |
| Exploration | `Exploration.tsx` | exploration/index | MEDIUM — trip tracking |
| Log Resource | `LogResource.tsx` | exploration/log-resource | MEDIUM — form |
| Logbook | `Logbook.tsx` | (tabs)/logbook | HIGH — journal |
| NotFound | `NotFound.tsx` | +not-found | LOW — error state |

### Mobile Metaphors to Demonstrate

These are the "metáforas comunes del desarrollo móvil" the rubric requires:

| Metaphor | Where Applied | Why It's a Mobile Pattern |
|----------|--------------|---------------------------|
| **Bottom Tab Navigation** | Primary 4 tabs (Dashboard, Bestiary, Recursos, Bitácora) | Standard iOS/Android pattern for top-level sections |
| **Stack Navigation with Back Button** | Species detail, Exploration, Log Resource | Native back gesture + header back button |
| **Floating Action Button (FAB)** | Map shortcut from all tab screens | Material Design pattern for primary action |
| **Pull-to-Refresh** | Bestiary species list, Logbook entries | Standard mobile pattern for data refresh |
| **Swipe Gestures** | Swipe between species in detail view, swipe to dismiss modals | Touch-first interaction (requirement: mínimo 2 gestos) |
| **Bottom Sheet / Modal** | Species identification (camera), Map overlay | Mobile pattern for contextual full-screen overlays |
| **Card-based Layout** | All screens use SpaceCard containers | Mobile-friendly content grouping |
| **Sticky Header** | HUD headers on all screens | Keeps context visible while scrolling |
| **Empty States** | Empty logbook, no species found | Mobile UX pattern for zero-data scenarios |
| **Loading Skeletons** | Species list, resource values | Mobile pattern for async data loading |

### Anti-Patterns to Avoid

- **Web-style top navigation bar** — Mobile users expect bottom tabs, not top nav
- **Hamburger menu for primary navigation** — Hides key features; use bottom tabs instead
- **Replicating web layout exactly** — The reference uses `max-w-lg mx-auto` which is a web constraint; mobile fills the full width
- **Hover-dependent interactions** — No hover on mobile; use tap, long-press, and swipe instead
- **Dense information layouts** — Mobile screens need larger touch targets (min 44x44pt) and more whitespace
- **Custom navigation without native gestures** — Don't build custom swipe-back; use expo-router's native stack

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Navigation system | Custom router with state management | expo-router | File-based routing, deep linking, typed routes, native transitions |
| Tab bar | Custom View with TouchableOpacity | `Tabs` from expo-router | Lazy loading, accessibility, badge support, native behavior |
| Icon system | Custom SVG components | `@expo/vector-icons` | 100+ icon sets, tree-shakeable, consistent sizing |
| Safe area handling | Manual padding calculations | `react-native-safe-area-context` | Handles notches, home indicators, status bars automatically |
| Form validation | Manual string checks | Zod + react-hook-form (later) | Type-safe, accessible error messages, reusable schemas |
| HUD glow effects | Custom canvas rendering | Reanimated + shadow props | GPU-accelerated, worklet-based, no jank |
| Pull-to-refresh | Custom gesture handler | `RefreshControl` from react-native | Native behavior, haptic feedback, accessibility |

**Key insight:** The reference project hand-rolled everything (navigation, state, validation). The RN app should leverage Expo's ecosystem to avoid reinventing solved problems.

## Common Pitfalls

### Pitfall 1: Web Layout Replication
**What goes wrong:** Mockups that look like the web reference (centered content, fixed bottom nav) instead of native mobile layouts
**Why it happens:** The reference uses `max-w-lg mx-auto` and `fixed inset-0` which are web patterns
**How to avoid:** Design for full-width mobile screens. Use bottom tabs, native headers, and mobile touch targets. The HUD aesthetic (colors, typography, glow) translates; the layout structure must change.
**Warning signs:** Mockups show centered content with margins on sides, or navigation that looks like a web navbar

### Pitfall 2: Incomplete Route Documentation
**What goes wrong:** Documenting only the 4 tab screens and forgetting detail screens (species detail, identification, exploration flows)
**Why it happens:** Tabs are visible; stacked screens are hidden until navigated to
**How to avoid:** Document ALL routes including: auth flow, tab screens, detail screens, modal screens, and error states. The rubric says "Conoce todas las posibles rutas."
**Warning signs:** MOCKUPS.md only lists 4-5 screens when there are 11+ routes

### Pitfall 3: Missing Mobile Metaphors
**What goes wrong:** Mockups show static screens without demonstrating mobile interaction patterns
**Why it happens:** Focusing on visual design over interaction design
**How to avoid:** Explicitly annotate mockups with mobile patterns: "Pull-to-refresh here", "Swipe to delete", "Long-press for context menu", "FAB opens map"
**Warning signs:** Mockups look like screenshots of a website, not an app

### Pitfall 4: Ignoring the HUD Aesthetic in Mockups
**What goes wrong:** Generic-looking mockups that don't reflect the space/HUD theme from the reference
**Why it happens:** Using default Figma components without customization
**How to avoid:** Apply the reference's color palette (deep navy, cyan glow, orange alerts), monospace typography (IBM Plex Mono), and card designs (dark cards with colored top borders) to mockups
**Warning signs:** Mockups use standard blue/gray colors and rounded corners (reference has zero border-radius)

### Pitfall 5: expo-router Route Group Misunderstanding
**What goes wrong:** Creating route groups that don't match the navigation intent (e.g., putting detail screens inside tabs)
**Why it happens:** Confusing route groups `(group)` with actual URL segments
**How to avoid:** Route groups `(auth)` and `(tabs)` share a layout but don't add URL segments. Detail screens (`species/[id]`) should be OUTSIDE `(tabs)/` so they push onto the stack, not replace tab content.
**Warning signs:** Navigating to species detail replaces the tab bar instead of pushing on top of it

## Code Examples

### Root Layout with Auth Guard Pattern
```tsx
// app/_layout.tsx
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // or splash screen

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}
```

### Bottom Tabs Layout
```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabLayout() {
  const cyan = useThemeColor({}, 'primary');
  const gray = useThemeColor({}, 'muted');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: cyan,
        tabBarInactiveTintColor: gray,
        tabBarStyle: {
          backgroundColor: '#0a0a2e',
          borderTopColor: 'rgba(0, 255, 200, 0.1)',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Panel',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bestiary"
        options={{
          title: 'Bitácora',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Recursos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logbook"
        options={{
          title: 'Registros',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Stack Navigation for Detail Screens
```tsx
// app/species/_layout.tsx
import { Stack } from 'expo-router';

export default function SpeciesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a2e' },
        headerTintColor: '#00ffc8',
        headerTitleStyle: { fontFamily: 'IBMPlexMono' },
      }}
    >
      <Stack.Screen name="[id]" options={{ title: 'Especie' }} />
      <Stack.Screen name="identify" options={{ title: 'Escanear' }} />
    </Stack>
  );
}
```

### Pull-to-Refresh Pattern
```tsx
import { RefreshControl, ScrollView } from 'react-native';

function BestiaryScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch species data
    setRefreshing(false);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#00ffc8"
          colors={['#00ffc8']}
        />
      }
    >
      {/* Species cards */}
    </ScrollView>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Navigation manual setup | expo-router file-based routing | Expo SDK 48+ (2023) | Routes defined by file structure, not config objects |
| JS-based stack transitions | Native stack (UINavigationController/Fragment) | React Navigation 6+ | 60fps transitions, native swipe-back gesture |
| Manual safe area padding | `react-native-safe-area-context` + `SafeAreaView` | RN 0.60+ | Automatic notch/Dynamic Island handling |
| Custom icon components | `@expo/vector-icons` (Ionicons, MaterialIcons, etc.) | Expo SDK 33+ | 100+ icon sets, zero-config |
| Framer Motion animations | React Native Reanimated 4 | RN ecosystem | GPU-accelerated, worklet-based, no DOM dependency |

**Deprecated/outdated:**
- `react-navigation` v4 and earlier: Replaced by v6/v7 with native stack
- `createStackNavigator` (JS stack): Replaced by `createNativeStackNavigator` for native performance
- Manual `Dimensions.get('window')` for layout: Replaced by flexbox and safe area context
- `AsyncStorage` from `react-native` core: Moved to `@react-native-async-storage/async-storage`

## Open Questions

1. **Mockup fidelity level** — Should mockups be wireframes (low-fi) or high-fidelity (pixel-accurate)?
   - What we know: Rubric says "diseño completo" and "demuestra interés y creatividad"
   - What's unclear: Whether hand-drawn wireframes satisfy "completo"
   - Recommendation: Use Figma for medium-to-high fidelity mockups. Apply the HUD color palette and typography to show design coherence. Low-fi wireframes risk scoring poorly on "interés y creatividad."

2. **Number of screens to mockup** — All 13 reference screens or just the "principales"?
   - What we know: Rubric says "principales pantallas" but also "Conoce todas las posibles rutas"
   - What's unclear: Which screens count as "principales"
   - Recommendation: Mockup all 6 primary screens (Splash, Login, Dashboard, Bestiary, Resources, Logbook) at high fidelity. Document the remaining 5 detail screens (Species Detail, Identification, Map, Exploration, Log Resource) as annotated wireframes or flow diagrams. This satisfies both "diseño completo" and "conoce todas las rutas."

3. **Navigation diagram format** — What format for the route documentation?
   - What we know: Must be in `.planning/docs/MOCKUPS.md`
   - What's unclear: Whether text-based route tree is sufficient or visual diagrams are needed
   - Recommendation: Include both — a text-based route tree (markdown) AND an embedded navigation flow diagram (draw.io export as PNG). This covers both "documentación" and "demuestra interés."

## Environment Availability

> This phase is primarily documentation/artifact creation (mockups + route docs). No external tools are required beyond what's already available.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Figma (web) | Mockup creation | ✓ (web-based) | — | Penpot, Excalidraw |
| draw.io (web) | Navigation diagrams | ✓ (web-based) | — | Mermaid.js, hand-drawn + photo |
| Expo SDK | Project context | ✓ | 54.0.33 | — |
| expo-router | Navigation reference | ✓ | ~6.0.23 | — |

**No missing dependencies.** This phase produces documentation artifacts, not code. The mockup tools (Figma, draw.io) are web-based and freely available.

## Validation Architecture

> Skip — this phase produces documentation artifacts (mockups, route docs), not testable code. Validation is manual review against the rubric criteria.

## Sources

### Primary (HIGH confidence)
- [Expo Router Layout Docs](https://docs.expo.dev/router/basics/layout/) — Layout patterns, tabs, stacks, route groups
- [React Navigation Bottom Tabs Docs](https://reactnavigation.org/docs/bottom-tab-navigator/) — Tab configuration, options, animations
- [React Native Navigation Guide](https://reactnative.dev/docs/navigation) — Official RN navigation recommendation
- `astro-beacon-reference/.planning/codebase/ARCHITECTURE.md` — Reference screen list and data flow
- `astro-beacon-reference/.planning/codebase/CONCERNS.md` — What cannot be directly ported, route mapping table
- `project-requirements.md` §374-400 — Rubric criteria for "Diseño móvil"

### Secondary (MEDIUM confidence)
- Expo SDK 54 package.json — Verified installed versions
- npm registry — Current versions of navigation packages (checked 2026-04-03)

### Tertiary (LOW confidence)
- Rubric interpretation of "metáforas comunes del desarrollo móvil" — Inferred from standard mobile UX patterns
- Professor's expectations for mockup fidelity — Based on typical university project rubrics

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against package.json and official docs
- Architecture: HIGH — based on expo-router official docs and reference project analysis
- Pitfalls: MEDIUM — inferred from common RN migration patterns, not specific to this project
- Mockup tools: HIGH — industry standard, well-established

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (30 days — stable domain, Expo SDK 54 is current)