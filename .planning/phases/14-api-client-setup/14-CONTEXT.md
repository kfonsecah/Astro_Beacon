# Phase 14: API Client Setup - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Configure TanStack Query for server state management and network detection. Set up QueryClientProvider in root layout and create useNetworkStatus hook for offline awareness.

Scope: ONLY setup - no actual API calls yet (that's Phase 15-16).

</domain>

<decisions>
## Implementation Decisions

### QueryClient Setup
- **D-01:** QueryClientProvider wrapper in `app/_layout.tsx`
- **D-02:** Default stale time: 1 minute
- **D-03:** Cache time: 5 minutes

### Network Detection
- **D-04:** Create `useNetworkStatus()` hook in `src/hooks/`
- **D-05:** Returns `{ isConnected: boolean, isInternetReachable: boolean }`
- **D-06:** Use `@react-native-community/netinfo` package

### Package Installation
- **D-07:** Install `@tanstack/react-query@^5.0.0`
- **D-08:** Install `@react-native-community/netinfo`

</decisions>

<canonical_refs>
## Canonical References

### Frontend Code
- `app/_layout.tsx` — Where QueryClientProvider goes
- `src/hooks/` — Where useNetworkStatus hook goes
- `src/services/api.ts` — Existing axios instance

### References
- `.planning/REQUIREMENTS.md` § API Client Setup (API-01, API-04)
- `astro-beacon-reference/package.json` — TanStack Query version reference

</canonical_refs>

<code_context>
## Existing Code Insights

### Already Available
- `app/_layout.tsx` — Has AuthGuard wrapper, needs QueryClientProvider added
- `api.ts` — Axios instance exists, works with JWT interceptor

### Integration Points
- QueryClientProvider wraps entire app in _layout.tsx
- Each screen uses useQuery/useMutation after this phase
- useNetworkStatus available for all components

</code_context>

<specifics>
## Specific Ideas

- QueryClient created once at app level
- useQuery/useMutation available in ALL screens after this phase
- Network status usable in Phase 17 for OfflineBanner

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---
*Phase: 14-api-client-setup*
*Context gathered: 2026-04-28*