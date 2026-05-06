---
phase: 27
plan: "01"
subsystem: resources-tab
tags: [bug-fix, dto, theme, flatlist, progress-bar]
dependency_graph:
  requires: []
  provides: [recurso-maxcapacity, warning-theme-tokens, resources-tab-fixes]
  affects: [app/(tabs)/resources.tsx, src/types-dtos/recurso.dto.ts, src/theme/dark.ts, src/theme/light.ts]
tech_stack:
  added: []
  patterns: [theme-token-extension, flatlist-renderitem-inline-history]
key_files:
  created: []
  modified:
    - src/types-dtos/recurso.dto.ts
    - src/theme/dark.ts
    - src/theme/light.ts
    - app/(tabs)/resources.tsx
decisions:
  - "Use item.maxCapacity ?? Math.round(item.threshold / 0.15) as fallback for max (D-02)"
  - "warningMuted/warningBorder tokens read from colors.ts — no new color values introduced (D-05)"
  - "Movement history moved inside renderItem, capped to 3 items to avoid card inflation (D-04)"
  - "keyExtractor simplified to index-based fallback to eliminate unsafe cast (D-06)"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-06"
  tasks_completed: 4
  files_modified: 4
---

# Phase 27 Plan 01: Fix Resource DTO, Theme Tokens, and resources.tsx Bugs Summary

Fixed five confirmed bugs in the resources tab: added `maxCapacity` to the DTO, exposed warning theme tokens in both themes, corrected ProgressBar max calculation using `maxCapacity` with a threshold-based fallback, moved inline movement history inside `renderItem`, replaced hardcoded rgba colors with semantic theme tokens, and cleaned up the unsafe `keyExtractor`.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add maxCapacity to Recurso DTO | e1c0aff | src/types-dtos/recurso.dto.ts |
| 2 | Extend darkTheme with warningMuted/warningBorder | e1c0aff | src/theme/dark.ts |
| 3 | Extend lightTheme with warningMuted/warningBorder | e1c0aff | src/theme/light.ts |
| 4 | Fix resources.tsx (B-01 through B-05) | e1c0aff | app/(tabs)/resources.tsx |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Checklist

- [x] `Recurso` interface has `maxCapacity?: number`
- [x] `darkTheme.colors.warningMuted` and `darkTheme.colors.warningBorder` exist
- [x] `lightTheme.colors.warningMuted` and `lightTheme.colors.warningBorder` exist
- [x] No `rgba(251` string remains in `resources.tsx`
- [x] No movement history rendering exists outside `</FlatList>` in `resources.tsx`
- [x] `renderItem` uses `item.maxCapacity` for `max` with correct fallback
- [x] `renderItem` shows movements inline under ProgressBar
- [x] `npx tsc --noEmit` — no new TypeScript errors introduced (pre-existing errors in unrelated files remain)

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary changes.

## Self-Check: PASSED

- src/types-dtos/recurso.dto.ts: FOUND
- src/theme/dark.ts: FOUND
- src/theme/light.ts: FOUND
- app/(tabs)/resources.tsx: FOUND
- Commit e1c0aff: FOUND
