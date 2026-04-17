---
phase: 09-autenticaci-n
plan: 02
subsystem: auth
tags: [jwt, bcrypt, jsonwebtoken, authentication]

# Dependency graph
requires:
  - phase: 09-01
    provides: User model, auth schemas
provides:
  - JWT token generation and verification utilities
  - Auth service with register, login, refresh, logout
affects: [09-03, 10-endpoints-de-dominio]

# Tech tracking
tech-stack:
  added: [jsonwebtoken, bcryptjs]
  patterns: [SHA-256 token hashing, bcrypt password hashing, refresh token rotation]

key-files:
  created:
    - api/src/utils/jwt.util.ts
    - api/src/services/auth.service.ts
    - api/src/utils/AppError.ts

key-decisions:
  - "Access token: 1 hour expiry via config.JWT.EXPIRES_IN"
  - "Refresh token: 7 days expiry via config.JWT.REFRESH_EXPIRES_IN"
  - "Refresh tokens stored as SHA-256 hashes for revocability"
  - "bcrypt 12 rounds for password hashing"

patterns-established:
  - "Service singleton pattern (authService exported as instance)"
  - "AppError extends Error with statusCode and isOperational flags"
  - "Refresh token rotation: new token issued on each refresh"

requirements-completed: [AUTH-02, AUTH-04]

# Metrics
duration: 5min
completed: 2026-04-17
---

# Phase 09 Plan 02: JWT Utilities and Auth Service Summary

**JWT auth with refresh token rotation — access tokens (1hr), refresh tokens (7d) stored as SHA-256 hashes in MongoDB**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-17T02:17:32Z
- **Completed:** 2026-04-17T02:22:XXZ
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- JWT utility functions with configurable token expiry
- SHA-256 refresh token hashing for secure revocable storage
- Auth service with register/login returning JWT tokens
- Refresh token rotation with multi-device support

## Task Commits

1. **Task 1: Create JWT utility functions** - `6c265f3` (feat)
2. **Task 2: Create Auth service** - `47a5e54` (feat)

**Plan metadata:** (to be added on final commit)

## Files Created/Modified

- `api/src/utils/AppError.ts` - Custom error class with statusCode
- `api/src/utils/jwt.util.ts` - signToken, verifyToken, hashToken, generateRefreshToken
- `api/src/services/auth.service.ts` - AuthService with register, login, refresh, logout methods

## Decisions Made

- Used SignOptions['expiresIn'] type for expiresIn parameter (compatibility with jsonwebtoken v9)
- Created AppError utility first as dependency for jwt.util.ts
- Services directory created as it didn't exist

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **jsonwebtoken v9 type issue:** expiresIn parameter required specific type casting
- **Resolution:** Imported SignOptions type and cast expiresIn values appropriately

## Next Phase Readiness

- Auth service ready for controller integration (09-03)
- JWT utilities ready for middleware/protection (09-03)
- No blockers

---
*Phase: 09-autenticaci-n*
*Completed: 2026-04-17*
