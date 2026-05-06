---
phase: 27-resources-tab-complete
plan: "02"
subsystem: ui
tags: [react-native, resources, category-colors, validation, log-resource]

# Dependency graph
requires:
  - phase: 27-resources-tab-complete/27-01
    provides: maxCapacity in Recurso DTO, warningMuted/warningBorder theme tokens, bug fixes in resources.tsx
provides:
  - CATEGORY_CONFIG with 6 category-color mappings in resources.tsx
  - Colored left border on resource cards driven by category
  - category symbol text (O2, H2O, ALI, MED, EQP, OTR) on card header
  - selectedResource: Recurso | null state in log-resource (replaces selectedResourceId: string)
  - currentAmount + unit displayed in resource selector chips
  - Client-side egreso validation preventing over-draw before API call
affects: [log-resource, resources-tab, resource-card-display]

# Tech tracking
tech-stack:
  added: []
  patterns: [CATEGORY_CONFIG lookup pattern for icon/color dispatch, chip-shows-inventory pattern]

key-files:
  created: []
  modified:
    - app/(tabs)/resources.tsx
    - app/log-resource/index.tsx

key-decisions:
  - "D-08: CATEGORY_CONFIG maps lowercase category string to color from colors.ts and a short 3-char symbol — consistent with existing classification pattern in bestiary"
  - "D-09: Egreso validation happens before mutateAsync to avoid unnecessary API round-trips and give instant user feedback via existing setValidationError"
  - "D-10: selectedResource: Recurso | null replaces selectedResourceId: string so chip display and validation can read currentAmount/unit without a list lookup"

patterns-established:
  - "CATEGORY_CONFIG pattern: defined outside component as const Record, fallback to 'otro' via ?? operator"
  - "Chip content pattern: NOMBRE  23.5 L — name + double-space + amount + unit in single Text node"

requirements-completed: [UI-04, LOGR-01, ERR-05]

# Metrics
duration: 8min
completed: 2026-05-06
---

# Phase 27 Plan 02: Resources Tab UX Enhancements Summary

**Category-colored resource cards with O2/H2O/ALI symbols plus client-side egreso validation and currentAmount display in log-resource chips**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-06T06:40:39Z
- **Completed:** 2026-05-06T06:48:00Z
- **Tasks:** 4
- **Files modified:** 2

## Accomplishments

- Resource cards now have a 3px colored left border per category using `colors.categoryXxx` tokens
- Category symbol text (O2, H2O, ALI, MED, EQP, OTR) appears before resource name in card header
- Resource selector chips in log-resource show `NOMBRE  23.5 L` format so users know available stock
- Egreso validation blocks submission and shows error message when amount > currentAmount, preventing failed API calls

## Task Commits

All four tasks combined into a single atomic commit per plan specification:

1. **Tasks 1-4: category colors, egreso validation, amount display** - `bf79cb3` (feat)

## Files Created/Modified

- `app/(tabs)/resources.tsx` - Added `colors` import, CATEGORY_CONFIG, catConfig resolution in renderItem, borderLeftWidth/borderLeftColor and symbol Text on card header
- `app/log-resource/index.tsx` - Replaced selectedResourceId with selectedResource: Recurso | null, added egreso over-draw validation, updated chip text to show currentAmount+unit

## Decisions Made

- Used `CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG['otro']` fallback so unknown or null category silently degrades to grey OTR symbol (no crash)
- Chip text uses a single `Text` node with template literal for `currentAmount != null` guard, covering potential nullish values from old API responses
- Kept the ingreso/egreso type button colors as pre-existing rgba hardcoded values (tc.success/tc.danger equivalents) since they were pre-existing — out of scope for this plan

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript errors exist in `app/(tabs)/bestiary.tsx`, `app/species/[id].tsx`, `app/species/identify.tsx`, and `src/services/species.service.ts`. None are in files touched by this plan and none are new. Logged to deferred items.

## Known Stubs

None - all data flows from live API through existing `useResources` hook.

## Next Phase Readiness

- Resources tab is now visually complete with category identity per card
- log-resource form is functionally complete with client-side validation
- Resource Detail Screen (UI-05) remains deferred per D-12

---
*Phase: 27-resources-tab-complete*
*Completed: 2026-05-06*
