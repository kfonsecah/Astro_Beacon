# Testing Patterns

**Analysis Date:** 2026-04-01

## Test Framework

**Runner:**
- **Vitest** 3.2.4
- Config: `vitest.config.ts`
- Environment: `jsdom` (simulates browser DOM)
- Globals: `true` (no need to import `describe`, `it`, `expect`)
- Setup file: `src/test/setup.ts`
- Test pattern: `src/**/*.{test,spec}.{ts,tsx}`

**Assertion Library:**
- Vitest built-in assertions (`expect`)
- `@testing-library/jest-dom` 6.6.0 for DOM-specific matchers

**E2E Testing:**
- **Playwright** 1.57.0
- Config: `playwright.config.ts` (uses Lovable's `createLovableConfig`)
- Fixture: `playwright-fixture.ts`

**Run Commands:**
```bash
npm test              # Run all tests (vitest run)
npm run test:watch    # Watch mode (vitest)
```

## Test File Organization

**Location:**
- Tests live in `src/test/` directory
- Single example test: `src/test/example.test.ts`
- Test setup: `src/test/setup.ts`

**Naming:**
- `{name}.test.ts` pattern
- No `.spec.ts` files detected (though pattern supports it)

**Structure:**
```
src/
├── test/
│   ├── setup.ts          # Global test setup
│   └── example.test.ts   # Placeholder test
```

**Note:** This is a **visual reference project** with hardcoded data. There are no actual tests beyond the placeholder. The project has no component tests, page tests, or integration tests.

## Test Structure

**Suite Organization (from `src/test/example.test.ts`):**
```typescript
import { describe, it, expect } from "vitest";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
```

**Setup (from `src/test/setup.ts`):**
```typescript
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
```

The setup file:
- Imports `@testing-library/jest-dom` for extended DOM matchers (e.g., `toBeInTheDocument()`, `toHaveClass()`)
- Polyfills `window.matchMedia` for components that check media queries (needed by `use-mobile.tsx` hook)

## Mocking

**Framework:** Vitest built-in mocking

**Patterns:** No mocking patterns detected — no tests exist beyond the placeholder.

**What Would Need Mocking (if tests were added):**
- `react-router-dom` hooks (`useNavigate`, `useLocation`, `useParams`) — used in every page
- `framer-motion` animations — used extensively in all components
- `lucide-react` icons — used throughout
- Timer-based effects (`setInterval`, `setTimeout`) — used in `Exploration.tsx`, `Splash.tsx`
- `@tanstack/react-query` — configured but unused

## Fixtures and Factories

**Test Data:**
- No fixtures or factories exist
- All data is hardcoded directly in page components:
  - `src/pages/Bestiary.tsx` — `species` array inline
  - `src/pages/Resources.tsx` — `resources` and `history` arrays inline
  - `src/pages/SpeciesDetail.tsx` — `speciesData` record inline

**Location:** N/A — no test data directory

## Coverage

**Requirements:** None enforced — no coverage configuration in `vitest.config.ts`

**View Coverage:** Not configured

## Test Types

**Unit Tests:**
- None written
- Components are pure display components with hardcoded data — ideal candidates for snapshot or rendering tests

**Integration Tests:**
- None written
- Pages could be tested as integration units (render page → verify content → interact → verify navigation)

**E2E Tests:**
- Playwright is configured but no test files exist
- `playwright-fixture.ts` re-exports `test` and `expect` from `lovable-agent-playwright-config/fixture`
- `playwright.config.ts` uses `createLovableConfig()` with no custom overrides
- Lovable's AI agent likely uses this config for automated visual testing

## Recommended Test Patterns (for future tests)

**Component Rendering Test:**
```typescript
import { render, screen } from "@testing-library/react";
import SpaceCard from "@/components/space/SpaceCard";

describe("SpaceCard", () => {
  it("renders with default variant", () => {
    render(<SpaceCard title="TEST">Content</SpaceCard>);
    expect(screen.getByText("TEST")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies alert variant classes", () => {
    render(<SpaceCard variant="alert">Alert content</SpaceCard>);
    expect(screen.getByText("Alert content")).toHaveClass("border-t-destructive");
  });
});
```

**Page Test with Router Mock:**
```typescript
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Bestiary from "@/pages/Bestiary";

describe("Bestiary", () => {
  it("renders species list", () => {
    render(
      <MemoryRouter>
        <Bestiary />
      </MemoryRouter>
    );
    expect(screen.getByText("BITÁCORA")).toBeInTheDocument();
    expect(screen.getByText("Flora Luminosa X-7")).toBeInTheDocument();
  });
});
```

**Animation Test (skip framer-motion in tests):**
```typescript
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Mock framer-motion to avoid animation complexity in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
  },
}));
```

## Testing Gaps

**Critical gaps for a visual reference project:**
1. **No visual regression tests** — This is a UI reference app; screenshots/percy would be the most valuable test type
2. **No component tests** — All `src/components/space/*` and `src/components/ui/*` components are untested
3. **No page tests** — All 13 pages in `src/pages/` are untested
4. **No interaction tests** — Navigation, search filtering, and form interactions are untested
5. **No snapshot tests** — No baseline snapshots for UI components

---

*Testing analysis: 2026-04-01*
