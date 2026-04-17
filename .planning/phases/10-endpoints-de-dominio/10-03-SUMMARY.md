---
phase: 10-endpoints-de-dominio
plan: 03
subsystem: services-controllers
tags: [services, controllers, astronaut, trip, supply]

# Dependency graph
requires:
  - phase: 10-01
    provides: Models and schemas
provides:
  - Astronaut service and controller
  - Trip service and controller  
  - Supply service and controller
affects: [10-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [service-class-pattern, controller-handlers]

key-files:
  created:
    - api/src/services/astronaut.service.ts
    - api/src/services/trip.service.ts
    - api/src/services/supply.service.ts
    - api/src/controllers/astronaut.controller.ts
    - api/src/controllers/trip.controller.ts
    - api/src/controllers/supply.controller.ts
  modified: []

key-decisions:
  - "All services use response envelope { success, data } pattern"
  - "All endpoints require auth middleware"

requirements-completed: []

# Metrics
duration: 15min
completed: 2026-04-16
---

# Phase 10 Plan 03: Services and Controllers Summary

**Astronaut, Trip, and Supply services and controllers implemented**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-16T21:00:00Z
- **Completed:** 2026-04-16T21:15:00Z
- **Tasks:** 6
- **Files modified:** 6

## Task Commits

Each task was committed atomically:

1. **Task 1: astronaut.service.ts** - `17b0898`
2. **Task 2: trip.service.ts** - `9711919`
3. **Task 3: supply.service.ts** - `1bc0730`
4. **Task 4: astronaut.controller.ts** - `882a211`
5. **Task 5: trip.controller.ts** - `9c24db4`
6. **Task 6: supply.controller.ts** - `07cfa71`

## Service Methods

### Astronaut Service (astronaut.service.ts)
- `createOrUpdate(userId, data)` - Create or update profile
- `findByUser(userId)` - Find by userId  
- `update(userId, id, data)` - Update by ID
- `getDashboard(userId)` - Stats: resources count, active trips, species discovered

### Trip Service (trip.service.ts)
- `create(userId, data)` - Create trip
- `findAll(userId, pagination, status?)` - List with filters
- `findOne(userId, id)` - Get one
- `update(userId, id, data)` - Update
- `start(userId, id)` - Status: planificado → activo
- `complete(userId, id)` - Status: activo → completado
- `abort(userId, id)` - Status: activo → abortado
- `calculateO2(tripId)` - Base rate 1 unit/hour + manual adjustments
- `addManualO2(userId, tripId, amount)` - Add manual O2

### Supply Service (supply.service.ts)
- `findAll(userId, pagination, status?)` - List with filters
- `findOne(userId, id)` - Get one
- `collect(userId, id)` - Status: pendiente → recogido
- `expire(id)` - Status: pendiente → expirado
- `findNearby(userId, lat, lng, radius)` - Geospatial query

## Controller Endpoints

### Astronaut Controller
- POST /api/v1/astronauts - createOrUpdate
- GET /api/v1/astronauts - get profile  
- PUT /api/v1/astronauts/:id - update profile
- GET /api/v1/astronauts/dashboard - get stats

### Trip Controller
- POST /api/v1/trips - create
- GET /api/v1/trips - list
- GET /api/v1/trips/:id - get one
- PUT /api/v1/trips/:id - update
- POST /api/v1/trips/:id/start - start trip
- POST /api/v1/trips/:id/complete - complete trip
- POST /api/v1/trips/:id/abort - abort trip
- GET /api/v1/trips/:id/o2 - get O2 consumed
- POST /api/v1/trips/:id/o2 - add manual O2

### Supply Controller
- GET /api/v1/supplies - list
- GET /api/v1/supplies/:id - get one
- POST /api/v1/supplies/:id/collect - collect supply
- POST /api/v1/supplies/:id/expire - expire supply
- GET /api/v1/supplies/nearby - geospatial query

## Decisions Made

- All services use response envelope { success, data }
- All endpoints require auth middleware
- O2 calculation: baseRate * durationHours + manualAdjustments sum

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all methods fully implemented.

## Dependencies for Next Phase (10-04)

- Need to add route files to wire controllers to Express app
- Auth middleware already in place (09-01)