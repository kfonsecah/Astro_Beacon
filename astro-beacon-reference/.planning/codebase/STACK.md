# Technology Stack

**Analysis Date:** 2026-04-01

## Languages

**Primary:**
- TypeScript 5.8.3 - All application source code (`src/**/*.ts`, `src/**/*.tsx`)

## Runtime

**Environment:**
- Node.js (version not pinned — no `.nvmrc` or `engines` field)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)
- Bun also detected (`bun.lock`, `bun.lockb` present — project was likely generated via Lovable which defaults to Bun)

## Frameworks

**Core:**
- React 18.3.1 - UI library for all components
- Vite 5.4.19 - Build tool and dev server (`vite.config.ts`)
- React Router DOM 6.30.1 - Client-side routing (`src/App.tsx`)

**UI Component System:**
- shadcn/ui - Component library (configured via `components.json`, style: "default", TSX: true)
- Radix UI (20+ headless primitives) — accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, popover, select, tabs, toast, tooltip, etc.
- Tailwind CSS 3.4.17 — Utility-first styling (`tailwind.config.ts`)
- class-variance-authority 0.7.1 — Variant-based component styling
- tailwind-merge 2.6.0 + clsx 2.1.1 — Class name merging utility (`src/lib/utils.ts`)

**Animation:**
- Framer Motion 11.0.0 — Page transitions, micro-interactions, animated SVGs (used across all pages and space-themed components)

**Forms & Validation:**
- React Hook Form 7.61.1 — Form state management
- Zod 3.25.76 — Schema validation (via `@hookform/resolvers`)

**Data Fetching:**
- TanStack React Query 5.83.0 — Server state management (`src/App.tsx` wraps app in `QueryClientProvider`)

**Charts:**
- Recharts 2.15.4 — Data visualization (wrapped in `src/components/ui/chart.tsx`)

**Utilities:**
- date-fns 3.6.0 — Date manipulation
- lucide-react 0.462.0 — Icon library (used extensively across all pages and UI components)
- sonner 1.7.4 — Toast notifications
- next-themes 0.3.0 — Theme switching (dark mode via `darkMode: ["class"]`)
- vaul 0.9.9 — Drawer component
- embla-carousel-react 8.6.0 — Carousel/slider
- cmdk 1.1.1 — Command palette
- input-otp 1.4.2 — OTP input
- react-day-picker 8.10.1 — Calendar component
- react-resizable-panels 2.1.9 — Resizable layout panels

**Testing:**
- Vitest 3.2.4 — Unit test runner (`vitest.config.ts`)
- Testing Library React 16.0.0 — Component testing
- Testing Library Jest-DOM 6.6.0 — DOM assertions
- jsdom 20.0.3 — Browser environment simulation
- Playwright 1.57.0 — E2E testing (`playwright.config.ts`)

**Build/Dev:**
- @vitejs/plugin-react-swc 3.11.0 — Fast React compilation via SWC
- ESLint 9.32.0 — Linting (`eslint.config.js`)
- TypeScript ESLint 8.38.0 — TS-specific lint rules
- PostCSS 8.5.6 — CSS processing
- Autoprefixer 10.4.21 — Vendor prefixing
- tailwindcss-animate 1.0.7 — Tailwind animation plugin
- lovable-tagger 1.1.13 — Lovable dev tooling (development only)

## Key Dependencies

**Critical:**
- `react` 18.3.1 — Core UI framework
- `react-router-dom` 6.30.1 — All routing defined in `src/App.tsx`
- `@tanstack/react-query` 5.83.0 — Data caching layer (currently unused beyond provider setup)
- `framer-motion` 11.0.0 — Animation layer used in every page component

**Infrastructure:**
- `zod` 3.25.76 — Validation schemas (available but not actively used in pages)
- `react-hook-form` 7.61.1 — Form handling (available but not actively used in pages)

## Configuration

**Environment:**
- No `.env` files detected — project is purely visual/static, no environment configuration needed
- Vite dev server runs on port 8080, HMR overlay disabled (`vite.config.ts`)

**Build:**
- `vite.config.ts` — Main Vite config with React SWC plugin, path alias `@` → `./src`, Lovable tagger in dev mode
- `tsconfig.json` — Root config with project references to `tsconfig.app.json` and `tsconfig.node.json`
- `tsconfig.app.json` — App-level TS config
- `tsconfig.node.json` — Node-level TS config (for Vite config files)
- `tailwind.config.ts` — Custom space-themed design tokens (cyan glow, alien green, warning orange, etc.), custom fonts (IBM Plex Mono, Space Grotesk), custom animations
- `postcss.config.js` — Tailwind + Autoprefixer pipeline
- `eslint.config.js` — Flat config with TypeScript ESLint, React Hooks, React Refresh plugins
- `components.json` — shadcn/ui configuration (aliases: `@/components`, `@/lib`, `@/hooks`)
- `vitest.config.ts` — Vitest config with jsdom environment, globals enabled, setup file at `src/test/setup.ts`
- `playwright.config.ts` — Playwright E2E config via Lovable wrapper

## Platform Requirements

**Development:**
- Node.js (any recent version)
- npm or Bun for package management
- No native dependencies

**Production:**
- Static hosting (Vite SPA output)
- Deployable to any static file server or CDN
- Lovable platform hosting (default deployment target per README)

---

*Stack analysis: 2026-04-01*
