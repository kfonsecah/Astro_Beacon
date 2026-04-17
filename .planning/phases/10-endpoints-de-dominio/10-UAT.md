---
status: complete
phase: 10-endpoints-de-dominio
source: [10-01-SUMMARY.md, 10-02-SUMMARY.md, 10-03-SUMMARY.md, 10-04-SUMMARY.md]
started: 2026-04-17
updated: 2026-04-17
---

## Current Test

[testing complete]

## Tests

### 1. Resources CRUD
expected: CRUD + movements + alerts
result: pass

### 2. Species CRUD
expected: CRUD operations
result: pass

### 3. Logbook CRUD
expected: CRUD operations
result: pass

### 4. Astronaut Profile
expected: PUT /astronaut, GET, GET /stats
result: pass

### 5. Trip Lifecycle
expected: Create, start, complete
result: pass

### 6. Resource Alerts
expected: Resources below threshold
result: pass

### 7. Supply CRUD
expected: Create + list
result: pass
notes: Added missing createSupply method

### 8. Supply Nearby
expected: Geospatial query with parsed query params
result: pass
notes: Fixed nearbyQuerySchema with z.coerce

### 9. Auth Blocking
expected: 401 without token
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

[none - all fixed]

## Fixes Applied
- Added createSupply method to supply.service.ts
- Added createSupply controller to supply.controller.ts  
- Added POST /supplies route
- Fixed nearbyQuerySchema to use z.coerce.number() for query params

---
*UAT completed: 2026-04-17*
*All domain endpoints verified working*