# Testing Patterns

**Analysis Date:** 2026-04-01

## Test Framework

**Current State: No testing framework is configured for the Expo project.**

The root project (`package.json`) has no test dependencies and no test scripts. The only test-related script is `npm run lint` which runs `expo lint`.

**Reference Project Testing Setup** (in `astro-beacon-reference/`):

The reference project (web-based Vite + React) has a testing setup that can serve as a model:

**Runner:**
- Vitest v3.2.4
- Config: `astro-beacon-reference/vitest.config.ts`

**Assertion Library:**
- Vitest built-in assertions (`expect`)
- `@testing-library/jest-dom` for DOM matchers
- `@testing-library/react` v16.0.0 for component testing

**Reference Run Commands:**
```bash
npm run test              # Run all tests (vitest run)
npm run test:watch        # Watch mode (vitest)
```

**Recommended Setup for Expo Project:**

For React Native / Expo, the standard testing stack is:

```bash
npm install -D jest @testing-library/react-native @testing-library/jest-native
npm install -D jest-expo @types/jest
```

The `jest-expo` preset auto-mocks all Expo SDK modules, which is critical for testing components that use `expo-router`, `expo-haptics`, `expo-image`, etc.

**Recommended run commands (add to `package.json` scripts):**
```bash
npx jest                  # Run all tests
npx jest --watch          # Watch mode
npx jest --coverage       # Coverage report
```

**Recommended `jest.config.js`:**
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

**Recommended Setup for Expo Project:**

For React Native / Expo, the standard testing stack is:

```bash
npm install -D jest @testing-library/react-native @testing-library/jest-native
npm install -D jest-expo @types/jest
```

The `jest-expo` preset auto-mocks all Expo SDK modules, which is critical for testing components that use `expo-router`, `expo-haptics`, `expo-image`, etc.

**Recommended run commands (add to `package.json` scripts):**
```bash
npx jest                  # Run all tests
npx jest --watch          # Watch mode
npx jest --coverage       # Coverage report
```

**Recommended `jest.config.js`:**
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

## Test File Organization

**Current State:**
- No test files exist in the Expo project root
- No `__tests__` directories
- No `*.test.*` or `*.spec.*` files

**Reference Project Pattern** (`astro-beacon-reference/`):
- Tests co-located in `src/test/` directory
- Setup file: `src/test/setup.ts`
- Example test: `src/test/example.test.ts`
- Include pattern: `src/**/*.{test,spec}.{ts,tsx}`

**Recommended Pattern for Expo:**
- Co-located tests next to source files: `components/__tests__/themed-text.test.tsx`
- Or centralized: `__tests__/` at project root
- Naming: `{component-name}.test.tsx` for component tests (kebab-case to match file conventions), `{module-name}.test.ts` for utilities
- For Expo Router screens: `app/(tabs)/__tests__/index.test.tsx`

## Test Structure

**Reference Project Pattern** (`astro-beacon-reference/src/test/example.test.ts`):
```typescript
import { describe, it, expect } from "vitest";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
```

**Recommended Pattern for Expo + React Native Testing Library:**
```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import SpaceCard from "../SpaceCard";

describe("SpaceCard", () => {
  it("renders with default variant", () => {
    render(<SpaceCard title="Test Card">Content</SpaceCard>);
    expect(screen.getByText("Test Card")).toBeTruthy();
    expect(screen.getByText("Content")).toBeTruthy();
  });

  it("applies alert variant styling", () => {
    render(<SpaceCard variant="alert">Alert content</SpaceCard>);
    // Assert variant-specific behavior
  });
});
```

## Mocking

**Reference Project:**
- No mocking patterns observed in the single example test
- `jsdom` environment used for DOM APIs

**Recommended for Expo:**
- Use `jest-expo` preset which auto-mocks Expo modules
- Mock native modules that aren't available in Jest environment:

```typescript
// jest.setup.ts
jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

jest.mock("expo-router", () => ({
  Stack: () => null,
  Tabs: () => null,
  Link: ({ children }: { children: React.ReactNode }) => children,
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/",
}));

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});
```

**What to Mock:**
- Native modules (camera, haptics, location, sensors)
- External API calls
- Navigation (expo-router hooks)
- Async storage
- `react-native-reanimated` (use built-in mock)
- `expo-image` and `expo-font`

**What NOT to Mock:**
- Component rendering logic
- Utility functions (`cn`, formatters)
- Business logic in hooks
- `StyleSheet.create()` outputs
- `StyleSheet.create()` outputs

## Fixtures and Factories

**Current State:**
- No test fixtures or factories detected in either project

**Recommended Pattern:**
Create test data factories for consistent test data:

```typescript
// __tests__/fixtures.ts
export const mockSpecies = {
  id: "1",
  name: "Flora Luminosa X-7",
  classification: "PLANTA",
  hostile: false,
  description: "Bioluminiscent species",
};

export const mockResources = {
  oxygen: 87,
  water: 62,
  food: 45,
  energy: 12,
};
```

**Location:**
- `__tests__/fixtures.ts` or `__tests__/factories.ts` at project root
- Or co-located: `src/__tests__/fixtures.ts`

## Coverage

**Requirements:**
- No coverage target enforced currently

**Recommended:**
- Set coverage thresholds in `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 80,
    lines: 80,
    statements: 80,
  }
}
```

**View Coverage:**
```bash
npx jest --coverage
# Opens coverage/lcov-report/index.html in browser
```

## Test Types

**Unit Tests:**
- Test individual components in isolation
- Test utility functions (`cn`, formatters, validators)
- Test custom hooks (`useToast`, `useMobile`)
- Scope: single module, mocked dependencies

**Integration Tests:**
- Test component interactions (e.g., form submission flow)
- Test navigation between screens
- Test state management across components
- Scope: multiple modules, minimal mocking

**E2E Tests:**
- Reference project has Playwright configured (`playwright.config.ts`, `playwright-fixture.ts`)
- Not applicable to React Native — consider Detox or Maestro for mobile E2E
- Not currently set up

## Common Patterns

**Async Testing:**
```typescript
// For async operations (API calls, storage)
it("loads species data on mount", async () => {
  render(<SpeciesDetail />);
  const speciesName = await screen.findByText("Flora Luminosa X-7");
  expect(speciesName).toBeTruthy();
});
```

**Error Testing:**
```typescript
// For error scenarios
it("shows error state when API fails", async () => {
  jest.spyOn(api, "fetchSpecies").mockRejectedValue(new Error("Network error"));
  render(<SpeciesDetail />);
  const errorMessage = await screen.findByText("Failed to load species");
  expect(errorMessage).toBeTruthy();
});
```

**Hook Testing:**
```typescript
import { renderHook, act } from "@testing-library/react-native";
import { useToast } from "../hooks/use-toast";

it("adds toast to state", () => {
  const { result } = renderHook(() => useToast());
  act(() => {
    result.current.toast({ title: "Test" });
  });
  expect(result.current.toasts).toHaveLength(1);
});
```

**Testing Themed Components:**
```typescript
import { render, screen } from "@testing-library/react-native";
import { ThemedText } from "../themed-text";

describe("ThemedText", () => {
  it("renders default text", () => {
    render(<ThemedText>Hello World</ThemedText>);
    expect(screen.getByText("Hello World")).toBeTruthy();
  });

  it("applies title styling", () => {
    render(<ThemedText type="title">Heading</ThemedText>);
    const text = screen.getByText("Heading");
    expect(text.props.style).toContainEqual(expect.objectContaining({ fontSize: 32 }));
  });
});
```

**Testing Expo Router Screens:**
```typescript
import { render, screen } from "@testing-library/react-native";
import HomeScreen from "../app/(tabs)/index";

// Mock expo-router Link component
jest.mock("expo-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

describe("HomeScreen", () => {
  it("renders welcome text", () => {
    render(<HomeScreen />);
    expect(screen.getByText("Welcome!")).toBeTruthy();
  });
});
```

**Testing Haptic Components:**
```typescript
import { render, fireEvent } from "@testing-library/react-native";
import { HapticTab } from "../haptic-tab";
import * as Haptics from "expo-haptics";

describe("HapticTab", () => {
  it("triggers haptic feedback on press", () => {
    const onPressIn = jest.fn();
    render(<HapticTab onPressIn={onPressIn} />);
    fireEvent(screen.getByRole("button"), "pressIn");
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(onPressIn).toHaveBeenCalled();
  });
});
```

---

*Testing analysis: 2026-04-01*
