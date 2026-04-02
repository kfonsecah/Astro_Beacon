# External Integrations

**Analysis Date:** 2026-04-01

## APIs & External Services

**Currently:** No external API integrations configured yet. The project is in initial scaffold state.

**Required per project requirements (`project-requirements.md`):**
- **Backend API** - Custom REST API for:
  - Bitácora (logbook) entry management with image classification
  - Resource tracking (oxygen, water, food, energy)
  - Species identification and catalog
  - Supply drop GPS coordinates
  - Offline sync when reconnection occurs
  - Session management and authentication
- **AI/ML Service** - Image classification for species detection (auto-classify photos into resources, animals, plants, etc.)
- **Text-to-Speech** - Audio narration of logbook entries (requirement: narrar audio)

**Reference project patterns (`astro-beacon-reference/`):**
- Uses TanStack Query (`@tanstack/react-query` ^5.8.0) for data fetching — recommended pattern for mobile API layer
- Uses Zod (`zod` ^3.25.76) for schema validation — recommended for API request/response validation
- Uses React Hook Form (`react-hook-form` ^7.61.1) with `@hookform/resolvers/zod` — recommended for form handling
- Reference pages structure: `Dashboard`, `Login`, `Logbook`, `Bestiary`, `Resources`, `Exploration`, `ExplorationMap`, `SpeciesIdentification`, `SpeciesDetail`, `LogResource`, `Splash`, `NotFound`
- Custom space-themed components: `SpaceCard`, `ResourceBar`, `HudIndicator`, `MissionProgress`, `ScanAnimation`, `BottomNav`, `FloatingActionButton`, `NavLink`
- Uses React Hook Form (`react-hook-form` ^7.61.1) with `@hookform/resolvers/zod` — recommended for form handling
- Reference pages structure: `Dashboard`, `Login`, `Logbook`, `Bestiary`, `Resources`, `Exploration`, `ExplorationMap`, `SpeciesIdentification`, `SpeciesDetail`, `LogResource`, `Splash`, `NotFound`
- Custom space-themed components: `SpaceCard`, `ResourceBar`, `HudIndicator`, `MissionProgress`, `ScanAnimation`, `BottomNav`, `FloatingActionButton`, `NavLink`

## Data Storage

**Databases:**
- Not yet configured. Requirements specify a separate backend API with database.
- Recommended: PostgreSQL or MongoDB for the backend API (student's choice per requirements)

**Local Storage (mobile):**
- Not yet configured. Required for offline mode (requirement: download bitácora for offline use).
- Recommended Expo packages to add:
  - `expo-sqlite` - Local SQLite database for offline bitácora entries
  - `@react-native-async-storage/async-storage` - Simple key-value storage for session/cache
  - `expo-file-system` - Store photos locally before upload

**File Storage:**
- Local filesystem only (via `expo-file-system` when added)
- Backend will need cloud storage (e.g., AWS S3, Cloudinary) for uploaded photos

**Caching:**
- None currently
- Recommended: React Query cache for API responses, AsyncStorage for session data

## Authentication & Identity

**Auth Provider:**
- Not yet implemented
- Requirements specify: authentication with session expiration after inactivity
- Reference project (`astro-beacon-reference/src/pages/Login.tsx`): Simple agent ID login (mock)
- Recommended approaches for Expo:
  - `expo-secure-store` - Secure credential storage
  - Custom JWT-based auth via backend API
  - Session timeout tracking via app state listeners

## Monitoring & Observability

**Error Tracking:**
- None configured
- Recommended: Sentry via `@sentry/react-native` for production error tracking

**Logs:**
- Console logging only (development)
- Recommended: Custom logger module for structured logging (required by project rubric)

## CI/CD & Deployment

**Hosting:**
- Mobile: App Store (iOS) / Google Play (Android) via EAS Build
- Web: Static output (configured in `app.json`)
- Backend API: Not yet determined (student's choice per requirements)

**CI Pipeline:**
- None configured
- GitHub repository required per project requirements
- Recommended: GitHub Actions for linting, type checking, build validation

## Environment Configuration

**Required env vars (planned):**
- `API_URL` - Backend API base URL
- `API_KEY` - API authentication key (if applicable)
- `AI_SERVICE_URL` - Image classification service endpoint
- `TTS_SERVICE_URL` - Text-to-speech service endpoint

**Secrets location:**
- No `.env` files present yet
- Should use `dotenv` for development, EAS Secrets for production

## Webhooks & Callbacks

**Incoming:**
- None currently
- Potential: Push notifications for supply drop alerts, resource warnings

**Outgoing:**
- None currently
- Potential: POST to backend API for bitácora entries, resource updates, species data

## Expo Native Modules (Planned per Requirements)

Based on `project-requirements.md`, the following Expo modules will need integration:

| Requirement | Expo Package | Purpose |
|---|---|---|
| Take photos | `expo-camera` or `expo-image-picker` | Capture/upload images for bitácora |
| Image classification | Custom API call or `expo-ml` | Auto-classify species |
| Audio narration | `expo-av` (TTS) | Narrate logbook entries |
| GPS/Maps | `expo-location` + `react-native-maps` | Show supply drop locations |
| Offline support | `expo-sqlite` + `expo-net-info` | Local storage + connectivity detection |
| Haptic feedback | `expo-haptics` (already installed) | Gesture feedback |
| Session timeout | Custom implementation | Inactivity detection |
| Animations | `react-native-reanimated` (already installed) | UI animations and microinteractions |

## Reference Design System (astro-beacon-reference/)

The reference project defines the visual language that should be translated to React Native:

**Color Palette (HSL):**
- `--space-black`: 240 100% 3% — Background
- `--deep-navy`: 220 68% 11% — Secondary background
- `--cyan-glow`: 160 100% 70% — Primary/accent
- `--warning-orange`: 20 100% 70% — Alerts/destructive
- `--alien-green`: 100 100% 70% — Success/accent
- `--faint-gray`: 220 18% 61% — Muted text
- `--cosmic-blue`: 217 91% 60% — Links/interactive

**Typography:**
- `IBM Plex Mono` — Headings, labels, data (monospace HUD style)
- `Space Grotesk` — Body text

**Design Tokens:**
- Zero border radius (`--radius: 0rem`) — Sharp, technical aesthetic
- Glow effects via text-shadow/box-shadow — Neon HUD aesthetic
- Scanline overlay pattern — CRT monitor effect

---

*Integration audit: 2026-04-01*
