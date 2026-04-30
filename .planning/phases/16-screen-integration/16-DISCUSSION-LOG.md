# Phase 16: Screen Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 16-Screen Integration
**Areas discussed:** Module structure, screen order

---

## Screen Scope

| Option | Description | Selected |
|--------|-------------|----------|
| All screens | All screens consuming API | ✓ |
| Lists + details | Just lists and detail screens | |
| Just lists | Only list screens | |

**User's choice:** All screens

---

## Module Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Module by module | Por grupos para probar y commitear cada uno | ✓ |
| One by one | Una pantalla a la vez | |
| All at once | Todo junto | |

**User's choice:** Module by module

---

## Module Order

1. **Module 1:** Dashboard + Profile ✓
2. **Module 2:** Resources ✓
3. **Module 3:** Logbook ✓
4. **Module 4:** Species ✓
5. **Module 5:** Trips ✓
6. **Module 6:** Supplies (last) ✓

---

## Common Patterns

- Loading: ActivityIndicator with theme colors
- Error: User-friendly messages (no raw API errors)
- Design: useTheme + constants (no hardcoded)
- Pull-to-refresh on lists
- Pagination on lists

---

## The Agent's Discretion

- Exact implementation details per screen
- Pull-to-refresh vs manual refresh
- Pagination approach (loadMore vs infinite scroll)
- Empty states

## Deferred Ideas

- Auth (Phase 13) - login/register integration