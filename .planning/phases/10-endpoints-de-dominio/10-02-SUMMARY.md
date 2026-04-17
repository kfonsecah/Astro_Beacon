---
phase: 10-endpoints-de-dominio
plan: "02"
subsystem: api
tags: [mongoose, mongodb, rest-api, services, controllers]
dependency-graph:
  requires:
    - phase: 09-autenticaci-n
      provides: User model, JWT authentication
    - phase: 10-01
      provides: Domain models (Resource, Species, Logbook), Zod schemas
  provides:
    - Resource CRUD + movements + alerts
    - Species CRUD with filtering
    - Logbook CRUD with species linking
  affects: [phase-11, phase-12]
tech-stack:
  added: []
  patterns: [service-layer, controller-pattern, response-envelope, auth-middleware]
key-files:
  created:
    - api/src/services/resource.service.ts
    - api/src/services/species.service.ts
    - api/src/services/logbook.service.ts
    - api/src/controllers/resource.controller.ts
    - api/src/controllers/species.controller.ts
    - api/src/controllers/logbook.controller.ts
  modified: []
key-decisions:
  - "Response envelope: { success, data, pagination? }"
  - "All endpoints require authenticate middleware"
  - "Movement tracking: ingreso adds, egreso subtracts, validates non-negative"
  - "Alerts return resources where currentAmount < threshold"
requirements-completed: [RES-01, RES-02, RES-03, RES-04, RES-05, SPEC-01, SPEC-02, SPEC-03, LBK-01, LBK-02]
---

# Phase 10 Plan 02: Services and Controllers Summary

**Implemented services and controllers for Resources, Species, and Logbook with CRUD operations, movement tracking, alerts, and filtering.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-17
- **Completed:** 2026-04-17
- **Tasks:** 4
- **Files created:** 6

## Task Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Resource service (CRUD + movements + alerts) | b0510aa |
| 2 | Resource controller (7 endpoints) | b0510aa |
| 3 | Species service + controller (CRUD + filtering) | b0510aa |
| 4 | Logbook service + controller (CRUD + species linking) | b0510aa |

**Plan metadata:** `b0510aa` (feat: complete services and controllers)

## Files Created

### Services

**api/src/services/resource.service.ts**
- `create(userId, input)` - Create resource with default threshold
- `findAll(userId, page, limit)` - Paginated list
- `findOne(userId, resourceId)` - Single resource or 404
- `update(userId, resourceId, input)` - Update fields
- `delete(userId, resourceId)` - Remove resource
- `recordMovement(userId, resourceId, input)` - ingreso/egreso with validation
- `getAlerts(userId)` - Resources below threshold

**api/src/services/species.service.ts**
- `create(userId, input)` - Create with classification/dangerLevel
- `findAll(userId, page, limit, classification?, dangerLevel?)` - Filtered list
- `findOne(userId, speciesId)` - Single species or 404
- `update(userId, speciesId, input)` - Update fields
- `delete(userId, speciesId)` - Remove species

**api/src/services/logbook.service.ts**
- `create(userId, input, speciesId?)` - Create with optional species link
- `findAll(userId, page, limit, speciesId?)` - Filtered list
- `findOne(userId, entryId)` - Single entry or 404
- `update(userId, entryId, input)` - Update fields
- `delete(userId, entryId)` - Remove entry

### Controllers

**api/src/controllers/resource.controller.ts** - 7 endpoints:
- `GET /api/v1/resources` - List with pagination
- `GET /api/v1/resources/alerts` - Below threshold
- `GET /api/v1/resources/:id` - Single resource
- `POST /api/v1/resources` - Create
- `PUT /api/v1/resources/:id` - Update
- `DELETE /api/v1/resources/:id` - Delete
- `POST /api/v1/resources/:id/movements` - Record movement

**api/src/controllers/species.controller.ts** - 5 endpoints:
- `GET /api/v1/species` - List with pagination, classification/dangerLevel filter
- `GET /api/v1/species/:id` - Single species
- `POST /api/v1/species` - Create
- `PUT /api/v1/species/:id` - Update
- `DELETE /api/v1/species/:id` - Delete

**api/src/controllers/logbook.controller.ts** - 5 endpoints:
- `GET /api/v1/logbook` - List with pagination, speciesId filter
- `GET /api/v1/logbook/:id` - Single entry
- `POST /api/v1/logbook` - Create
- `PUT /api/v1/logbook/:id` - Update
- `DELETE /api/v1/logbook/:id` - Delete

## Decisions Made

- Response envelope: `{ success, data, pagination? }` for all endpoints
- All endpoints protected by `authenticate` middleware
- Movement validation: newAmount >= 0 enforced
- Alerts only include resources with threshold > 0 and below threshold

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript compiles without errors
- All 6 files created matching plan specification
- Build passes: `npm run build` ✓

## Next Phase Readiness

- Services ready for route registration (Plan 03)
- Movement tracking ready for integration
- Alert generation ready for use
- Pagination utility ready for all list endpoints

---
*Phase: 10-endpoints-de-dominio*
*Completed: 2026-04-17*
