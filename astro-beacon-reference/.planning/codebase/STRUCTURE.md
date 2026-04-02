# Codebase Structure

**Analysis Date:** 2026-04-01

## Directory Layout

```
astro-beacon-reference/
├── index.html              # HTML entry point, mounts React to #root
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite config with React SWC plugin, path alias @ → src
├── tailwind.config.ts      # Tailwind config with space/HUD theme tokens
├── postcss.config.js       # PostCSS config for Tailwind
├── tsconfig.json           # Root TypeScript config
├── tsconfig.app.json       # App-specific TS config
├── tsconfig.node.json      # Node/TS config for Vite
├── eslint.config.js        # ESLint config (flat config format)
├── components.json         # shadcn/ui configuration
├── vitest.config.ts        # Vitest test runner config
├── playwright.config.ts    # Playwright E2E config
├── playwright-fixture.ts   # Playwright test fixtures
├── public/                 # Static assets (favicon, placeholder, robots.txt)
├── src/
│   ├── main.tsx            # Entry point — creates root, renders <App />
│   ├── App.tsx             # App shell — providers + router
│   ├── App.css             # Unused Vite starter styles
│   ├── index.css           # Global styles — CSS variables, Tailwind, animations, scrollbar
│   ├── vite-env.d.ts       # Vite type declarations
│   ├── pages/              # Full-screen page components (route targets)
│   ├── components/         # Reusable UI components
│   │   ├── space/          # Domain-specific components (HUD, cards, nav)
│   │   └── ui/             # shadcn/ui generated primitives (49 files)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── test/               # Test files and setup
```

## Directory Purposes

**`src/pages/`:**
- Purpose: Full-screen route components — each file maps to one app screen
- Contains: 13 `.tsx` files, one per route
- Key files: `Dashboard.tsx` (main hub), `Bestiary.tsx` (species list), `SpeciesDetail.tsx` (detail view), `Splash.tsx` (intro animation), `Login.tsx` (auth screen)
- Pattern: Each page is self-contained with inline mock data, local state, and framer-motion animations

**`src/components/space/`:**
- Purpose: Domain-specific reusable components for the Astro Beacon visual theme
- Contains: 7 `.tsx` files
- Key files: `SpaceCard.tsx` (themed card), `BottomNav.tsx` (tab bar), `FloatingActionButton.tsx` (FAB), `HudIndicator.tsx` (HUD metric), `ResourceBar.tsx` (segmented progress), `ScanAnimation.tsx` (radar effect), `MissionProgress.tsx` (XP bar)
- Pattern: Props-driven, uses framer-motion for animations, no external state

**`src/components/ui/`:**
- Purpose: shadcn/ui component library (auto-generated, mostly scaffolding)
- Contains: 49 `.tsx` files — button, card, dialog, tabs, input, form, etc.
- Key files: `sonner.tsx` (toast integration), `tooltip.tsx` (used in App.tsx)
- Pattern: Standard shadcn/ui — Radix UI primitives with Tailwind styling

**`src/components/NavLink.tsx`:**
- Purpose: NavLink wrapper with activeClassName support
- Pattern: ForwardRef wrapper around react-router-dom NavLink with cn() class merging

**`src/hooks/`:**
- Purpose: Custom React hooks
- Contains: `use-mobile.tsx` (responsive breakpoint at 768px), `use-toast.ts` (reducer-based toast system)
- Pattern: Standard React hooks with TypeScript

**`src/lib/`:**
- Purpose: Shared utility functions
- Contains: `utils.ts` — single `cn()` function (clsx + tailwind-merge)
- Pattern: Barrel-free, direct export

**`src/test/`:**
- Purpose: Test configuration and example tests
- Contains: `example.test.ts` (placeholder), `setup.ts` (test setup)
- Framework: Vitest

**`public/`:**
- Purpose: Static assets served as-is by Vite
- Contains: `favicon.ico`, `placeholder.svg`, `robots.txt`

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell with `<div id="root">`
- `src/main.tsx`: React DOM bootstrap
- `src/App.tsx`: Provider shell + route definitions

**Configuration:**
- `vite.config.ts`: Vite setup — React SWC, path alias `@` → `./src`, lovable-tagger plugin
- `tailwind.config.ts`: Theme config — space/HUD colors, fonts, animations
- `components.json`: shadcn/ui config — aliases for `@/components`, `@/ui`, `@/lib`, `@/hooks`
- `tsconfig.app.json`: TypeScript app config with path alias `@/*` → `./src/*`
- `eslint.config.js`: ESLint flat config with TypeScript and React plugins

**Core Logic:**
- `src/pages/Dashboard.tsx`: Main hub screen (204 lines) — most complex page
- `src/pages/SpeciesIdentification.tsx`: Scan/camera flow (137 lines)
- `src/pages/ExplorationMap.tsx`: Map with interactive points (136 lines)
- `src/pages/LogResource.tsx`: Resource logging form (135 lines)
- `src/pages/Exploration.tsx`: Travel simulation (126 lines)

**Styling:**
- `src/index.css`: Global styles — CSS variables (170 lines), Tailwind directives, custom animations, scrollbar styling

**Testing:**
- `vitest.config.ts`: Vitest configuration
- `src/test/example.test.ts`: Placeholder test

## Naming Conventions

**Files:**
- Pages: PascalCase `.tsx` — `Dashboard.tsx`, `SpeciesDetail.tsx`
- Components: PascalCase `.tsx` — `SpaceCard.tsx`, `BottomNav.tsx`
- Hooks: camelCase with `use-` prefix — `use-mobile.tsx`, `use-toast.ts`
- Utilities: camelCase `.ts` — `utils.ts`

**Directories:**
- All lowercase — `pages/`, `components/`, `hooks/`, `lib/`, `test/`
- Subdirectories: lowercase — `space/`, `ui/`

**Components:**
- Exported as default: `export default ComponentName`
- Named exports for hooks: `export { useToast, toast }`
- No barrel files (no `index.ts` re-exports)

**CSS Classes:**
- Tailwind utility classes exclusively
- Custom utility classes in `src/index.css`: `.text-glow-cyan`, `.text-glow-orange`, `.text-glow-green`, `.border-glow`, `.border-glow-orange`, `.scanline`, `.grid-pattern`, `.flicker`, `.animate-pulse-glow`, `.animate-scan-line`

## Path Aliases

Configured in `vite.config.ts` and `tsconfig.app.json`:
- `@/` → `./src/`
- `@/components` → `./src/components/`
- `@/components/ui` → `./src/components/ui/`
- `@/lib` → `./src/lib/`
- `@/hooks` → `./src/hooks/`

## Where to Add New Code

**New Page/Screen:**
- Implementation: `src/pages/PageName.tsx`
- Route registration: Add `<Route path="/path" element={<PageName />} />` in `src/App.tsx`
- If part of bottom nav: Update tabs array in `src/components/space/BottomNav.tsx`

**New Domain Component:**
- Implementation: `src/components/space/ComponentName.tsx`
- Pattern: Props interface, default export, framer-motion for animations

**New UI Primitive:**
- Implementation: `src/components/ui/component-name.tsx`
- Use shadcn CLI: `npx shadcn@latest add component-name`

**New Hook:**
- Implementation: `src/hooks/use-feature.tsx`
- Pattern: camelCase with `use-` prefix

**New Utility:**
- Implementation: `src/lib/utils.ts` (add function) or `src/lib/new-file.ts`

**New CSS Animation/Utility:**
- Implementation: `src/index.css` under `@layer utilities`

**Tests:**
- Location: `src/test/` or co-located `*.test.ts` next to source
- Framework: Vitest

## Special Directories

**`.planning/`:**
- Purpose: Project planning and analysis documents
- Generated: Yes (by GSD tooling)
- Committed: Depends on project workflow

**`public/`:**
- Purpose: Static assets served directly by Vite dev server and included in build
- Generated: No
- Committed: Yes

**`src/components/ui/`:**
- Purpose: shadcn/ui generated component library
- Generated: Partially (via shadcn CLI)
- Committed: Yes
- Note: 49 files present but most are unused — pages prefer custom `space/` components

**`src/components/NavLink.tsx`:**
- Purpose: Compatibility wrapper for react-router-dom NavLink with activeClassName support
- Note: Only file directly in `components/` (not in a subdirectory)

---

*Structure analysis: 2026-04-01*
