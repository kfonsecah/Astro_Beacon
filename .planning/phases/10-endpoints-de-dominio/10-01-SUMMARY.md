---
phase: 10-endpoints-de-dominio
plan: "01"
subsystem: api
tags: [mongoose, zod, mongodb, domain-models, validation]

# Dependency graph
requires:
  - phase: 09-autenticaci-n
    provides: User model, JWT authentication, auth schemas
provides:
  - Resource model with movements, thresholds
  - Species model with classification, dangerLevel
  - LogbookEntry model with GeoPoint, photos
  - Astronaut model with User relationship
  - Trip model with O2Config, manualAdjustments
  - Supply model with 2dsphere geospatial index
  - All Zod schemas with matching enums
affects: [phase-11, phase-12]

# Tech tracking
tech-stack:
  added: []
  patterns: [mongoose-models-with-timestamps, zod-validation-schemas, 2dsphere-index]

key-files:
  created:
    - api/src/models/resource.model.ts
    - api/src/models/species.model.ts
    - api/src/models/logbook.model.ts
    - api/src/models/astronaut.model.ts
    - api/src/models/trip.model.ts
    - api/src/models/supply.model.ts
    - api/src/schemas/resource.schema.ts
    - api/src/schemas/species.schema.ts
    - api/src/schemas/logbook.schema.ts
    - api/src/schemas/astronaut.schema.ts
    - api/src/schemas/trip.schema.ts
    - api/src/schemas/supply.schema.ts
  modified: []

key-decisions:
  - "Default thresholds: O2=20%, Water=15%, Food=10%, others=0%"
  - "All models include lastModified field for SYNC-01 offline sync"
  - "Supply model uses 2dsphere index for geospatial queries"
  - "Trip O2 tracking: baseRate + manualAdjustments array"

patterns-established:
  - "Mongoose models: timestamps: true, lastModified, userId index"
  - "Zod schemas: create/input/update/query variants with type exports"

requirements-completed: [RES-01, SPEC-01, LBK-01, ASTR-01, TRIP-01, SUPP-01, SYNC-01]

# Metrics
duration: 5min
completed: 2026-04-16
---

# Phase 10 Plan 01: Domain Models and Zod Schemas Summary

**All 6 Mongoose domain models created with Zod validation schemas, matching frontend enums and SYNC-01 requirements**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-17T02:58:06Z
- **Completed:** 2026-04-17T03:03:00Z
- **Tasks:** 7 (models + schemas)
- **Files modified:** 12

## Accomplishments

- Created 6 Mongoose models with timestamps and lastModified (SYNC-01)
- Created 6 Zod schemas with create/update/query variants
- All enums match frontend (src/types-dtos/enums.ts)
- Default thresholds: O2=20%, Water=15%, Food=10%
- Supply model includes 2dsphere geospatial index
- TypeScript compiles without errors

## Task Commits

Each task was committed atomically:

1. **All domain models + schemas** - `33e6e01` (feat)

**Plan metadata:** `33e6e01` (docs: complete plan)

## Files Created/Modified

- `api/src/models/resource.model.ts` - Resource with embedded movements, category enum, threshold defaults
- `api/src/models/species.model.ts` - Species with classification, dangerLevel enums
- `api/src/models/logbook.model.ts` - LogbookEntry with GeoPoint, photoUrl, optional species link
- `api/src/models/astronaut.model.ts` - Astronaut with User one-to-one relationship
- `api/src/models/trip.model.ts` - Trip with O2Config, manualAdjustments, status workflow
- `api/src/models/supply.model.ts` - Supply with 2dsphere index for geospatial queries
- `api/src/schemas/resource.schema.ts` - createResource, updateResource, createMovement, resourceQuery
- `api/src/schemas/species.schema.ts` - createSpecies, updateSpecies, speciesQuery
- `api/src/schemas/logbook.schema.ts` - createLogbook, updateLogbook, logbookQuery
- `api/src/schemas/astronaut.schema.ts` - createAstronaut, updateAstronaut
- `api/src/schemas/trip.schema.ts` - createTrip, updateTrip, startTrip, endTrip
- `api/src/schemas/supply.schema.ts` - createSupply, updateSupply, collectSupply, nearbyQuery

## Decisions Made

- Default thresholds applied via function: O2=20%, Water=15%, Food=10%
- All models include userId with index for efficient queries
- All models include lastModified field for offline sync (SYNC-01)
- GeoPoint schema shared across logbook and supply models
- Trip uses hybrid O2 tracking: baseRate + manualAdjustments array

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully on first pass.

## Next Phase Readiness

- All domain models ready for service layer implementation
- All Zod schemas ready for controller validation
- 2dsphere index ready for geospatial queries (SUPP-03)
- lastModified field ready for offline delta sync (SYNC-01)

---
*Phase: 10-endpoints-de-dominio*
*Completed: 2026-04-16*
