# Phase 14: API Client Setup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 14-API Client Setup
**Areas discussed:** QueryClient setup, NetInfo network detection

---

## QueryClient Setup

| Option | Description | Selected |
|--------|-------------|----------|
| _layout.tsx (Recommended) | Wrap in app/_layout.tsx with children prop | ✓ |
| Separate provider | Create separate query-provider.tsx file | |

**User's choice:** _layout.tsx (Recommended)

---

## Query Default Stale Time

| Option | Description | Selected |
|--------|-------------|----------|
| 5m stale / 24h cache (Recommended) | 5 min stale time, 24h cache time (standard for data) | |
| 1m stale / 5m cache | 1 min stale time, 5 min cache (fresher data) | ✓ |
| No cache | Disable caching (always fetch fresh) | |

**User's choice:** 1m stale / 5m cache

**Notes:** Preferencia por datos más frescos para la app de exploración.

---

## Network Detection

| Option | Description | Selected |
|--------|-------------|----------|
| useNetworkStatus hook (Recommended) | Create useNetworkStatus hook in src/hooks/ | ✓ |
| NetworkContext | Put in src/context/NetworkContext.tsx | |

**User's choice:** useNetworkStatus hook (Recommended)

---

## The Agent's Discretion

- Exact QueryClient configuration (beyond defaults)
- Default query/export settings
- NetInfo additional properties to expose

## Deferred Ideas

None — discussion stayed within phase scope.