# Architecture

**Analysis Date:** 2026-04-01

## Pattern Overview

**Overall:** SPA (Single Page Application) with route-based page components, serving as a visual reference for a mobile survival game UI.

**Key Characteristics:**
- Flat page-per-route architecture — each page is a self-contained component with inline data and styling
- Heavy use of `framer-motion` for animations (transitions, pulse effects, scan lines, progress bars)
- Tailwind CSS with CSS variables for a custom "space/HUD" theme (dark backgrounds, cyan glow, monospace fonts)
- shadcn/ui component library (Radix primitives) available but largely unused in favor of custom `space/` components
- No state management library — pages use local `useState` and inline mock data
- No API layer — all data is hardcoded within page components
- Mobile-first layout with `max-w-lg mx-auto` constraint on all pages
- Zero border radius (`--radius: 0rem`) — sharp, angular HUD aesthetic

## Layers

**Entry Layer:**
- Purpose: Bootstrap React app, mount to DOM
- Location: `src/main.tsx`
- Contains: `createRoot` call, global CSS import
- Depends on: `src/App.tsx`, `src/index.css`
- Used by: `index.html`

**App/Router Layer:**
- Purpose: Wrap app with providers, define all routes
- Location: `src/App.tsx`
- Contains: `QueryClientProvider`, `TooltipProvider`, `BrowserRouter`, `Routes` with 12 route definitions
- Depends on: `react-router-dom`, `@tanstack/react-query`, all page components
- Used by: `src/main.tsx`

**Page Layer:**
- Purpose: Full-screen views for each app screen
- Location: `src/pages/`
- Contains: 13 page components (Splash, Login, Dashboard, Bestiary, SpeciesDetail, SpeciesIdentification, Resources, ExplorationMap, Exploration, LogResource, Logbook, NotFound, Index)
- Depends on: `src/components/space/`, `lucide-react`, `framer-motion`
- Used by: `src/App.tsx` router

**Custom Component Layer (Space-themed):**
- Purpose: Reusable UI elements matching the space/HUD aesthetic
- Location: `src/components/space/`
- Contains: `SpaceCard`, `BottomNav`, `FloatingActionButton`, `HudIndicator`, `ResourceBar`, `MissionProgress`, `ScanAnimation`
- Depends on: `framer-motion`, `lucide-react`, Tailwind utility classes
- Used by: Page components

**UI Component Layer (shadcn/ui):**
- Purpose: Generic UI primitives (49 components)
- Location: `src/components/ui/`
- Contains: shadcn/ui generated components (button, card, dialog, toast, etc.)
- Depends on: Radix UI primitives, `class-variance-authority`, `clsx`, `tailwind-merge`
- Used by: Available but minimally used by pages (pages prefer custom `space/` components)

**Utility Layer:**
- Purpose: Shared helpers
- Location: `src/lib/utils.ts`
- Contains: `cn()` function (clsx + tailwind-merge)
- Depends on: `clsx`, `tailwind-merge`
- Used by: All component layers

**Hook Layer:**
- Purpose: Custom React hooks
- Location: `src/hooks/`
- Contains: `useIsMobile` (breakpoint detection), `useToast` (toast state management with reducer pattern)
- Depends on: React
- Used by: Components and pages as needed

## Data Flow

**Screen Navigation Flow:**

1. `Splash` → auto-advances through 4 phases (500ms, 1500ms, 2500ms, 4000ms) → navigates to `/login`
2. `/login` → enter agent ID → simulated 1.5s auth → navigates to `/dashboard`
3. `/dashboard` → main hub with HUD, resources, alerts, mission progress
4. Bottom nav provides 4 persistent tabs: `/dashboard`, `/bestiary`, `/resources`, `/logbook`
5. FAB (floating action button) on most screens navigates to `/map`
6. `/bestiary` → tap species → `/species/:id` (detail view)
7. `/bestiary` → camera button → `/identify` (scan flow)
8. `/map` → tap supply drop → `/exploration` (travel simulation)
9. `/exploration` (on complete) → `/log-resource` (form to record items)
10. `/log-resource` (on submit) → `/resources`

**State Management:**
- All state is local to page components (`useState`, `useEffect`)
- No global state — no context providers beyond React Query (unused) and TooltipProvider
- No data fetching — React Query is wired but never used; all data is inline arrays/objects
- `useToast` hook provides a reducer-based toast system but is not actively used in pages
- Pages use `useNavigate` and `useParams` from react-router-dom for navigation and route params

**Animation Flow:**
- `framer-motion` is the primary animation engine
- Pages use `motion.div`, `motion.button`, `motion.span` for entrance animations
- Custom animations defined in `src/index.css` (scanline, flicker, pulse-glow, scan-line, data-stream)
- `SpaceCard` and `HudIndicator` components use `motion` for critical state pulsing
- Common entrance pattern: `initial={{ opacity: 0, y: 10 }}` → `animate={{ opacity: 1, y: 0 }}` with staggered delays
- Interactive pattern: `whileTap={{ scale: 0.9 }}` on buttons

## Key Abstractions

**SpaceCard:**
- Purpose: Themed card container with variant-based border colors (default/alert/discovery)
- Examples: `src/components/space/SpaceCard.tsx`
- Pattern: Props-driven variant selection with CSS class mapping
- Used in: Dashboard, Bestiary, Resources, Exploration, Logbook, SpeciesDetail

**BottomNav:**
- Purpose: Fixed bottom tab navigation (4 tabs: Panel, Bitácora, Recursos, Registros)
- Examples: `src/components/space/BottomNav.tsx`
- Pattern: Uses `useLocation` + `useNavigate` for active state and routing
- Used in: Dashboard, Bestiary, Resources, Logbook

**FloatingActionButton:**
- Purpose: Fixed map shortcut button (bottom-right, pulsing glow)
- Examples: `src/components/space/FloatingActionButton.tsx`
- Pattern: Always navigates to `/map`
- Used in: Dashboard, Bestiary, Resources, Logbook

**HudIndicator:**
- Purpose: Single-value HUD display with sparkline and critical state
- Examples: `src/components/space/HudIndicator.tsx`
- Pattern: Auto-detects critical state when value < 15, triggers pulsing animation
- Used in: Dashboard

**ResourceBar:**
- Purpose: Segmented progress bar with critical state animation
- Examples: `src/components/space/ResourceBar.tsx`
- Pattern: Configurable segments, auto-detects critical when < 15%
- Used in: Dashboard, Resources, Exploration

**ScanAnimation:**
- Purpose: Radar-style scanning rings with particle effects
- Examples: `src/components/space/ScanAnimation.tsx`
- Pattern: Shows/hides based on `isScanning` prop, animates progress
- Used in: SpeciesIdentification

**MissionProgress:**
- Purpose: XP-based level progress bar
- Examples: `src/components/space/MissionProgress.tsx`
- Pattern: Animated width based on xp/maxXp ratio
- Used in: Dashboard

## Entry Points

**`src/main.tsx`:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html` → script tag executes
- Responsibilities: Create React root, render `<App />`, import global CSS

**`src/App.tsx`:**
- Location: `src/App.tsx`
- Triggers: Imported by `main.tsx`
- Responsibilities: Set up providers (React Query, tooltips), define all 12 routes

**`index.html`:**
- Location: `astro-beacon-reference/index.html`
- Triggers: Vite dev server or build output
- Responsibilities: Mount point (`#root`), meta tags, font loading, script entry

## Error Handling

**Strategy:** Minimal — this is a visual reference with no real error boundaries or API error handling.

**Patterns:**
- `NotFound` page catches unmatched routes (`*` route in `src/App.tsx`)
- Console logging in `NotFound` for debug (`console.error` on 404)
- No error boundaries defined
- No try/catch patterns (no async operations)

## Cross-Cutting Concerns

**Logging:** None — no logging framework, only a single `console.error` in `NotFound`

**Validation:** None — no form validation libraries used (Zod is installed but unused); Login page only checks `agentId.trim()`

**Authentication:** Mock only — `Login` page simulates auth with `setTimeout` redirect, no real auth flow

**Styling:** Tailwind CSS with custom CSS variables in `src/index.css` defining the entire space/HUD theme (dark backgrounds, cyan glow, monospace fonts, scanline effects, grid patterns)

**Typography:** Two font families — `IBM Plex Mono` (mono) for HUD elements, `Space Grotesk` (body) for descriptive text

**Visual Consistency Pattern:**
- Every page applies `<div className="fixed inset-0 scanline pointer-events-none z-40" />` as overlay
- All content constrained to `max-w-lg mx-auto` (mobile viewport simulation)
- Sticky headers with `z-30` and `backdrop-blur-sm`
- Fixed bottom nav at `z-50`

---

*Architecture analysis: 2026-04-01*
