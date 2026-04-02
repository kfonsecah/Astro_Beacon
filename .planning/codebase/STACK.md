# Technology Stack

**Analysis Date:** 2026-04-01

## Languages

**Primary:**
- TypeScript ~5.9.2 - All application code, strict mode enabled
- JSX/TSX - React Native component syntax

**Secondary:**
- JSON - Configuration files (app.json, tsconfig.json, package.json)
- JavaScript - ESLint configuration

## Runtime

**Environment:**
- Expo SDK ~54.0.33 - Managed workflow runtime
- React Native 0.81.5 - Mobile framework
- React 19.1.0 - UI library
- Node.js (via npm) - Package management and build tooling

**Package Manager:**
- npm (package-lock.json present)
- Lockfile: present

## Frameworks

**Core:**
- Expo ~54.0.33 - React Native framework with managed workflow
- Expo Router ~6.0.23 - File-based routing system
- React Navigation ^7.x - Underlying navigation primitives (bottom-tabs, native, elements)

**Animation:**
- React Native Reanimated ~4.1.1 - Declarative animations
- React Native Gesture Handler ~2.28.0 - Touch and gesture handling
- React Native Worklets 0.5.1 - JS thread isolation for animations

**UI/UX:**
- React Native Safe Area Context ~5.6.0 - Safe area insets
- React Native Screens ~4.16.0 - Native screen components
- Expo Image ~3.0.11 - Optimized image loading
- Expo Vector Icons ^15.0.3 - Icon library
- React Native Web ~0.21.0 - Web compatibility layer

**Build/Dev:**
- TypeScript ~5.9.2 - Type checking
- ESLint ^9.25.0 + eslint-config-expo ~10.0.0 - Linting
- Expo Compiler (React Compiler enabled) - Automatic memoization

## Key Dependencies

**Critical:**
- `expo-router` ~6.0.23 - File-based routing, entry point via `expo-router/entry`
- `react-native-reanimated` ~4.1.1 - Advanced animations (required for gesture-based interactions)
- `react-native-gesture-handler` ~2.28.0 - Touch handling for navigation and gestures

**Infrastructure:**
- `expo-constants` ~18.0.13 - App configuration access
- `expo-font` ~14.0.11 - Custom font loading
- `expo-haptics` ~15.0.8 - Haptic feedback
- `expo-linking` ~8.0.11 - Deep linking
- `expo-splash-screen` ~31.0.13 - Splash screen management
- `expo-status-bar` ~3.0.9 - Status bar control
- `expo-system-ui` ~6.0.9 - System UI customization
- `expo-web-browser` ~15.0.10 - In-app browser
- `expo-symbols` ~1.0.8 - SF Symbols support (iOS)

**Reference Project (astro-beacon-reference/) - Visual Style Guide:**
- Vite ^5.4.19 + React 18.3.1 (web only, not used in mobile app)
- Tailwind CSS ^3.4.17 - Utility-first styling reference
- shadcn/ui + Radix UI - Component library reference (space-themed)
- Framer Motion ^11.0.0 - Animation reference
- TanStack Query ^5.8.0 - Data fetching pattern reference
- Recharts ^2.15.4 - Charting reference
- Zod ^3.25.76 - Schema validation reference
- React Hook Form ^7.61.1 - Form handling reference
- Lucide React ^0.462.0 - Icon reference
- Vitest ^3.2.4 - Testing reference
- Playwright ^1.57.0 - E2E testing reference
- Sonner ^1.7.4 - Toast notification reference
- date-fns ^3.6.0 - Date utilities reference
- class-variance-authority + clsx + tailwind-merge - Conditional styling utilities
- Sonner ^1.7.4 - Toast notification reference
- date-fns ^3.6.0 - Date utilities reference
- class-variance-authority + clsx + tailwind-merge - Conditional styling utilities

## Configuration

**Environment:**
- No `.env` files currently present
- Configuration via `app.json` (Expo config)
- TypeScript via `tsconfig.json` extending `expo/tsconfig.base`
- Path alias: `@/*` maps to project root

**Build:**
- `app.json` - Expo app configuration (name, icon, splash, plugins, experiments)
- `tsconfig.json` - TypeScript config with strict mode and path aliases
- `eslint.config.js` - ESLint flat config using `eslint-config-expo`
- Entry point: `expo-router/entry` (via `package.json` main field)

**Expo Experiments Enabled:**
- `typedRoutes: true` - Type-safe route parameters
- `reactCompiler: true` - React Compiler for automatic optimization

**App Configuration (app.json):**
- Scheme: `astrobeacon` (deep linking)
- New Architecture: enabled
- iOS: tablet support
- Android: edge-to-edge, adaptive icons, predictive back disabled
- Web: static output
- Splash screen: custom image with light/dark variants

## Platform Requirements

**Development:**
- Node.js (npm)
- Expo CLI (`npx expo start`)
- Android Studio (for Android emulator)
- Xcode (for iOS simulator, macOS only)
- Expo Go app (for quick testing on physical devices)

**Production:**
- EAS Build (Expo Application Services) for native builds
- Target platforms: iOS, Android, Web (static)
- New Architecture (Fabric/TurboModules) enabled

---

*Stack analysis: 2026-04-01*
