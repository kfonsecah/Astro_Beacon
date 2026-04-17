---
phase: 09-autenticaci-n
plan: 03
subsystem: authentication
tags: [auth, jwt, express, middleware, endpoints]
dependency_graph:
  requires:
    - 09-02 (auth service + JWT utils)
  provides:
    - AUTH-01 (register endpoint)
    - AUTH-02 (login endpoint)
    - AUTH-03 (JWT middleware)
    - AUTH-05 (rate limiting)
    - API-06 (auth routes in app.ts)
    - API-07 (auth middleware integration)
  affects:
    - app.ts (mounts /api/v1/auth)
key_decisions:
  - "Response envelope: { success, data, error? } for all endpoints"
  - "Rate limiting: 5 attempts per 15 minutes on register/login (AUTH-05)"
  - "Logout requires Bearer token via authenticate middleware"
tech_stack:
  added:
    - express-rate-limit (for auth rate limiting)
  patterns:
    - Controller pattern (register → service → response envelope)
    - Middleware pattern (authenticate extracts Bearer token)
    - Route grouping (auth routes mounted at /api/v1/auth)
key_files:
  created:
    - api/src/controllers/auth.controller.ts
    - api/src/routes/auth.routes.ts
    - api/src/middlewares/auth.middleware.ts
  modified:
    - api/src/app.ts
---

# Phase 09 Plan 03: Auth Controller, Routes, and Middleware

**One-liner:** HTTP handlers for register/login/refresh/logout with JWT auth middleware and rate limiting

## Overview

Created the HTTP layer for authentication: controller with 4 endpoints, routes with rate limiting, and JWT verification middleware. Wired everything into app.ts.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create auth controller | ed5de16 | auth.controller.ts |
| 2 | Create auth routes | ed5de16 | auth.routes.ts |
| 3 | Create auth middleware and wire routes | ed5de16 | auth.middleware.ts, app.ts |

## Implementation Details

### Auth Controller (`api/src/controllers/auth.controller.ts`)
- **register**: POST /register — validates email/password with Zod, calls authService.register, returns 201 with user + tokens
- **login**: POST /login — validates credentials, calls authService.login, returns 200 with user + tokens
- **refresh**: POST /refresh — accepts refresh token, calls authService.refresh, returns 200 with new access token
- **logout**: POST /logout — requires auth (middleware), calls authService.logout, returns 200

All endpoints use response envelope: `{ success: true, data: ... }` and pass errors to `next()`.

### Auth Routes (`api/src/routes/auth.routes.ts`)
- Rate limiting on register/login: 5 attempts per 15 minutes (AUTH-05)
- No rate limit on refresh (uses refresh token)
- Logout protected by authenticate middleware

### Auth Middleware (`api/src/middlewares/auth.middleware.ts`)
- Extracts Bearer token from Authorization header
- Verifies JWT using jwt.util.ts
- Attaches decoded payload to `req.user`
- Returns 401 if no token or invalid

### App.ts Integration
- Mounted auth routes at `/api/v1/auth`
- Imported authenticate middleware for protected routes

## Verification

- [x] TypeScript compiles without errors
- [x] All 4 endpoints defined: register, login, refresh, logout
- [x] Rate limiting on register/login (5 attempts/15min)
- [x] Logout requires JWT (authenticate middleware)
- [x] Bearer token extraction in middleware

## Requirements Coverage

| Requirement | Status |
|-------------|--------|
| AUTH-01: Register endpoint | ✓ Implemented |
| AUTH-02: Login endpoint | ✓ Implemented |
| AUTH-03: Auth middleware validates JWT | ✓ Implemented |
| AUTH-05: Rate limiting | ✓ Implemented (5 attempts/15min) |
| API-06: Auth routes in app.ts | ✓ Implemented |
| API-07: Auth middleware integration | ✓ Implemented |

## Self-Check

- [x] api/src/controllers/auth.controller.ts exists
- [x] api/src/routes/auth.routes.ts exists
- [x] api/src/middlewares/auth.middleware.ts exists
- [x] api/src/app.ts modified with auth routes
- [x] Commit ed5de16 exists

## Self-Check: PASSED ✓