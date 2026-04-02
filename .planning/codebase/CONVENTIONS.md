# Coding Conventions

**Analysis Date:** 2026-04-01

## Naming Patterns

**Files:**
- **kebab-case** for components: `themed-text.tsx`, `themed-view.tsx`, `external-link.tsx`, `haptic-tab.tsx`, `hello-wave.tsx`, `parallax-scroll-view.tsx`
- **kebab-case** for hooks: `use-color-scheme.ts`, `use-theme-color.ts` (prefixed with `use-`)
- **Platform suffixes** for platform-specific files: `use-color-scheme.web.ts`, `icon-symbol.ios.tsx`
- **lowercase** for Expo Router files: `_layout.tsx`, `index.tsx`, `modal.tsx`, `explore.tsx`
- **Parenthesized directories** for route groups: `app/(tabs)/`
- **PascalCase** for reference project components: `SpaceCard.tsx`, `BottomNav.tsx`, `ScanAnimation.tsx`
- camelCase for utility files: `utils.ts`

**Functions:**
- **camelCase** for regular functions: `genId()`, `dispatch()`, `addToRemoveQueue()`, `handleLogin()`
- **PascalCase** for React components: `export default function RootLayout()`, `export function ThemedText()`
- Custom hooks use camelCase with `use` prefix: `useToast()`, `useColorScheme()`, `useThemeColor()`

**Variables:**
- **camelCase** for variables: `toastTimeouts`, `memoryState`, `borderColor`, `colorScheme`, `scrollRef`
- **UPPER_SNAKE_CASE** for constants: `TOAST_LIMIT`, `TOAST_REMOVE_DELAY`, `HEADER_HEIGHT`
- Action type constants as object with `as const`: `actionTypes = { ADD_TOAST: "ADD_TOAST" } as const`

**Types/Interfaces:**
- **PascalCase** for interfaces: `SpaceCardProps`, `ButtonProps`, `State`, `ThemedTextProps`
- **PascalCase** for type aliases: `ToasterToast`, `ActionType`, `Toast`, `ThemedViewProps`
- Props interfaces suffixed with `Props`: `SpaceCardProps`, `ButtonProps`, `ThemedTextProps`

## Code Style

**Formatting:**
- No Prettier config detected in the Expo project root
- VS Code settings enforce auto-fix on save (`.vscode/settings.json`):
  - `source.fixAll`: explicit
  - `source.organizeImports`: explicit
  - `source.sortMembers`: explicit
- Expo's `eslint-config-expo` provides default formatting rules
- Single quotes for strings (observed in `app-example/` files)
- Semicolons used consistently

**Linting:**
- ESLint v9.25.0 with flat config (`eslint.config.js`)
- Extends `eslint-config-expo/flat` — Expo's recommended React Native rules
- Ignores `dist/*` directory
- Run via `npm run lint` → `expo lint`

## Import Organization

**Order (observed in reference project):**
1. External library imports (React, react-native, expo packages, third-party)
2. Internal alias imports (`@/` path)
3. Relative imports (`./`, `../`)

**Path Aliases:**
- `@/*` maps to project root (`"./*"`) via `tsconfig.json`
- Example: `import { cn } from "@/lib/utils"`

**Import Style:**
- Named imports preferred: `import { Stack } from "expo-router"`
- Default imports for components: `import SpaceCard from "@/components/space/SpaceCard"`
- Namespace imports for React: `import * as React from "react"` (in shadcn/ui components)
- Type-only imports with `type` keyword: `import type { ToastActionElement } from "@/components/ui/toast"`

## Error Handling

**Patterns:**
- No custom error boundary detected in Expo app yet
- Reference project uses no explicit error handling in components
- TypeScript `strict: true` catches type errors at compile time
- Expo Router handles navigation errors internally
- Early returns for guard conditions: `if (!agentId.trim()) return;`
- Null coalescing for safe defaults: `useColorScheme() ?? 'light'`
- Conditional rendering with null returns: `if (!isScanning) return null;`

**Recommended for Expo project:**
- Use `ErrorBoundary` from `expo-router` for route-level error handling
- Wrap async operations in try/catch
- Use `expo-status-bar` for visual error feedback

## Logging

**Framework:**
- No dedicated logging framework detected
- Standard `console.log`, `console.warn`, `console.error` expected

**Patterns:**
- No logging observed in current codebase
- Use `console.warn` for deprecation notices
- Use `console.error` for caught errors

## Comments

**When to Comment:**
- Minimal commenting observed — self-documenting code preferred
- Section comments used for visual organization in JSX: `{/* Scanline overlay */}`
- Inline comments for non-obvious logic: `// ! Side effects !`

**JSDoc/TSDoc:**
- No JSDoc comments detected
- TypeScript types serve as documentation
- Interface definitions are self-documenting

## Function Design

**Size:**
- Components kept small: 5-47 lines for simple components
- Complex pages up to ~200 lines (Dashboard.tsx)
- Utility functions: 1-6 lines

**Parameters:**
- Destructured props with defaults: `({ children, className = "", variant = "default", title })`
- TypeScript interfaces for complex prop objects
- `forwardRef` pattern for components needing ref forwarding: `React.forwardRef<HTMLButtonElement, ButtonProps>`

**Return Values:**
- JSX returned from React components
- Utility functions return typed values
- Hooks return objects with state and actions: `{ id, dismiss, update }`

## Module Design

**Exports:**
- **Named exports** for reusable components: `export function ThemedText(...)`, `export function HapticTab(...)`
- **Default exports** for screens/routes: `export default function RootLayout()`, `export default function HomeScreen()`
- Named exports for utilities and hooks: `export { useToast, toast }`, `export function cn()`
- Re-exported variants alongside components: `export { Button, buttonVariants }`
- Type exports with `export type`: `export type ThemedTextProps = ...`
- Intersection types for props: `TextProps & { lightColor?: string; ... }`

**Barrel Files:**
- No barrel files (index.ts re-exports) detected
- Direct imports from source files preferred
- shadcn/ui pattern: each component in its own file under `components/ui/`

## React Native Specific Conventions

**StyleSheet:**
- `StyleSheet.create()` used for all inline styles in `app-example/`
- Styles defined at bottom of component file
- Named style objects: `styles.container`, `styles.titleContainer`, `styles.stepContainer`
- Inline style objects for simple cases: `style={{ flex: 1, justifyContent: "center" }}`
- Reference project uses Tailwind CSS via `cn()` utility — not applicable to React Native

**Components:**
- Functional components only — no class components
- `forwardRef` used when ref forwarding is needed: `React.forwardRef<HTMLButtonElement, ButtonProps>`
- `displayName` set on forwardRef components: `Button.displayName = "Button"`
- `export default function` pattern for screens/routes
- `export function` pattern for reusable components

**Hooks:**
- Custom hooks in `hooks/` directory with `use-` prefix
- React hooks follow Rules of Hooks
- `useEffect` cleanup functions used for listener removal
- Simple re-export hooks: `export { useColorScheme } from 'react-native'`

**Platform-Specific Code:**
- `Platform.select()` for platform-specific values: fonts, dev tools shortcuts
- `.ios.tsx` and `.web.tsx` file suffixes for platform-specific implementations: `use-color-scheme.web.tsx`, `icon-symbol.ios.tsx`
- `process.env.EXPO_OS` for runtime platform checks

**Component Structure:**
- Functional components only (no class components)
- `export default function ComponentName()` pattern for screens
- `export function ComponentName()` pattern for reusable components

**TypeScript:**
- `strict: true` enabled in `tsconfig.json`
- Type imports with `type` keyword: `import { type ViewProps } from 'react-native'`
- Intersection types for props: `TextProps & { lightColor?: string; ... }`
- `as const` for literal type narrowing: `actionTypes` object

---

*Convention analysis: 2026-04-01*
