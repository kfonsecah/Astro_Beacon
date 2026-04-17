# Research Summary: Astro_Beacon REST API

**Project:** Astro_Beacon API Backend
**Synthesized:** 2026-04-16
**Confidence:** HIGH

---

## Executive Summary

Astro_Beacon is a planetary exploration survival app REST API built with Node.js + Express v4 + TypeScript + MongoDB. The API serves a single-astronaut mobile app that tracks resources (O2, water, food), logs discoveries in a bitácora, identifies species with AI, manages exploration trips with oxygen budgets, and collects NASA supply drops via GPS. **Critical architectural insight:** This is a single-user system where all queries filter by `astronautId = currentUser`, simplifying authorization but requiring robust offline-sync support since astronauts work disconnected.

The recommended stack (Node.js 20 LTS, Express v4, TypeScript 5, MongoDB 7, Mongoose 8) provides the stability and TypeScript-first ecosystem needed. Authentication uses JWT with bcrypt hashing. The layered architecture pattern (Routes → Controllers → Services → Models) ensures testability and maintainability as the project scales. **MVP priority:** Authentication, Resources, Species (no AI), Logbook — defer AI classification, GPS tracking, and full offline sync to Phase 2.

---

## Stack Recommendations

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Node.js** | 20+ LTS | Runtime | LTS stability, ESM support, modern async patterns |
| **Express** | ^4.21.x | Web framework | User requirement, mature ecosystem, middleware model |
| **TypeScript** | ^5.x | Language | Type safety, better DX, catches errors at compile time |
| **MongoDB** | 7.x | Primary database | Flexible schema for evolving species/resource classifications |
| **Mongoose** | ^8.x | ODM | TypeScript support, schema validation, lifecycle hooks |
| **jsonwebtoken** | ^9.x | JWT handling | RFC-compliant, supports HS256/RS256, async API |
| **bcryptjs** | ^2.x | Password hashing | Async API, 12 rounds for production |
| **zod** | ^3.x | Schema validation | TypeScript-first, type inference, modern API |
| **helmet** | ^8.x | Security headers | CSP, HSTS, X-Frame-Options automatically |
| **cors** | ^2.x | Cross-origin | Configurable origins, supports credentials |
| **express-rate-limit** | ^7.x | Rate limiting | Brute force protection, configurable windows |
| **jest + supertest** | ^29.x / ^6.x | Testing | Industry standard, in-memory MongoDB for tests |

### Avoid These Patterns
- **Passport.js** — Adds complexity without value for simple JWT auth
- **Joi/Yup** — Zod has better TypeScript inference
- **Role-based access control** — Single user = single role ("astronaut")
- **Session cookies** — Mobile apps use JWT in Authorization headers

---

## Feature Priorities

### Table Stakes (MVP — Phase 1)

#### Authentication
| Feature | Endpoint | Complexity |
|---------|----------|------------|
| User Registration | POST /api/v1/auth/register | Low |
| Login (JWT) | POST /api/v1/auth/login | Low |
| Token Refresh | POST /api/v1/auth/refresh | Medium |
| Logout | POST /api/v1/auth/logout | Low |
| Password Reset | POST /api/v1/auth/forgot-password | Medium |

#### Domain Entities
| Entity | Key Endpoints | Notes |
|--------|--------------|-------|
| **Resources** | GET/POST/PATCH /resources, POST /resources/:id/movements, GET /resources/alerts | Movement history, critical alerts below threshold |
| **Species** | GET/POST/PATCH /species | Basic CRUD only, no AI classification in MVP |
| **Logbook** | GET/POST/PATCH/DELETE /logbook | Journal entries with photo upload |
| **Astronaut** | GET/PATCH /astronauts/me, GET /astronauts/me/stats | Own profile, dashboard aggregates |
| **Trips** | GET/POST /trips, POST /trips/:id/start/end | Status: planned → active → completed/aborted |
| **Supplies** | GET /supplies, GET /supplies/nearby, PATCH /supplies/:id/collect | NASA drop collection |

### Differentiators (Phase 2+)

| Feature | Value | Complexity | When |
|---------|-------|------------|------|
| **AI Species Classification** | Identify species from photos | High | Requires external API (OpenAI Vision) |
| **Offline Sync** | Full offline support with conflict resolution | High | Complex queue management |
| **Trip GPS Tracking** | Real-time location during EVA | Medium | Background location on mobile |
| **Push Notifications** | Low resource alerts | Medium | Expo Notifications setup |
| **Supply Drop Expiration** | Background job for expiry | Low | Cron/scheduled job |
| **OAuth2 Social Login** | Faster onboarding | Medium | Only if multi-user later |

### Anti-Features (Avoid)

| Don't Build | Why | Instead |
|------------|-----|---------|
| Multi-tenant architecture | One astronaut per deployment | Single astronaut context |
| Complex RBAC | Single user = single role | User ID filtering |
| Real-time WebSocket | Not required by spec | Polling if needed |
| GraphQL | Adds complexity without benefit | REST is simpler for mobile |

---

## Architecture Decisions

### Layered Pattern (Routes → Controllers → Services → Models)

```
src/
├── config/          # Environment variables, DB config, JWT secrets
├── controllers/     # HTTP handling only: parse request, call service, send response
├── services/        # Business logic: ALL rules, transformations, external calls
├── models/          # Database schemas: Mongoose schemas only
├── routes/          # URL mapping: path definitions, middleware binding
├── middlewares/     # Cross-cutting: auth, validation, error handling
├── utils/           # Shared helpers: response formatter, async wrapper
├── app.js           # Express app setup
└── server.js        # Entry point
```

### Critical Architecture Principles

1. **Business logic ALWAYS in services** — Routes/controllers are thin HTTP wrappers
2. **Dependency injection** — Pass models to services via constructor for testability
3. **Standardized response envelope** — `{ success, data, pagination?, error? }`
4. **Global error handler** — Single middleware for all error formatting
5. **Input validation at middleware** — Zod schemas before hitting controllers

### API Versioning
- All endpoints under `/api/v1/` prefix
- Example: `GET /api/v1/resources`, `POST /api/v1/auth/login`

### Offline Sync Design (Backend Requirements)
```javascript
// Delta sync endpoint
GET /api/v1/sync/state?since=2026-04-10T00:00:00Z
// Returns: { resources, species, logbook, supplies } with lastModified timestamps

// Bulk sync endpoint
POST /api/v1/{entity}/sync
// Body: { operations: [{ type, localId, data, timestamp }] }
// Response: { synced: [{ localId, serverId }], conflicts: [...], failed: [...] }
```

---

## Watch Out For

### CRITICAL — Implement from Day One

| Pitfall | Prevention |
|---------|------------|
| **Plain text passwords** | ALWAYS use bcrypt with 12 rounds |
| **Missing JWT secret** | Environment variable from `.env`, never hardcoded |
| **No input validation** | Zod middleware on all routes, sanitize MongoDB queries |
| **Offline not supported** | Design sync endpoints now, not as afterthought |

### HIGH — Implement Before Integration

| Pitfall | Prevention |
|---------|------------|
| **Business logic in routes** | Layered architecture from project init |
| **No error handling** | Global error handler middleware, consistent response format |
| **N+1 queries** | Use Mongoose `.populate()` for related data, avoid loops |
| **Missing pagination** | Helper class with `page/limit/skip`, max 100 per page |
| **CORS misconfiguration** | Configure for mobile: `ALLOWED_ORIGINS` env variable |
| **No rate limiting** | Auth endpoints: 5 attempts/15min; General: 100/15min |

### API Design Standards

```javascript
// Response envelope (ALWAYS)
{ success: true, data: {...}, pagination?: {...} }
{ success: false, error: { code: "...", message: "..." } }

// HTTP Status Codes
200 OK        GET success, PUT/PATCH success
201 Created   POST creates resource
204 No Body  DELETE success
400 Bad Req  Validation error
401 Unauth   Missing/invalid token
404 Not Found Resource doesn't exist
409 Conflict Duplicate key
422 Unprocessable Business rule violation
429 Too Many Requests Rate limited
500 Server Error (never expose stack in prod)
```

### Integration Pitfalls (Test on Mobile!)

| Issue | Prevention |
|-------|------------|
| **Mobile can't connect** | Test CORS on actual device, not browser; Expo uses `10.0.2.2` for emulator localhost |
| **Token expires mid-session** | Implement refresh token flow: 15m access + 7d refresh |
| **App hangs on poor network** | Server: 10s timeout middleware; Client: axios with retry logic |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack (Node/Express/Mongo) | HIGH | Battle-tested, excellent TypeScript support |
| Zod validation | HIGH | Clear winner for TypeScript in 2026 |
| JWT + bcrypt | HIGH | RFC-compliant, industry standard |
| Layered architecture | HIGH | Multiple authoritative sources confirm |
| Offline sync patterns | MEDIUM | Theory sound, needs validation on actual mobile |
| AI classification | LOW | No provider selected, defer decision |

### Gaps to Address in Planning

1. **Image storage** — Where to store uploaded photos? (Cloudinary vs S3 vs local)
2. **AI provider** — OpenAI Vision vs Google Cloud Vision? (defer to Phase 2)
3. **Push notifications** — Expo Notifications setup? (defer to Phase 2)
4. **Session expiration** — 15 min inactivity requirement with server-side tracking?

---

## Phase Structure Recommendation

| Phase | Deliverables | Key Features | Pitfalls to Avoid |
|-------|--------------|--------------|-------------------|
| **Phase 1: Foundation** | Project scaffold, folder structure, config | Express setup, MongoDB connection, TypeScript config, error handler, response formatter | Business logic in routes, circular deps |
| **Phase 2: Authentication** | User auth complete | Register, login, JWT generation, middleware, rate limiting | Plain text passwords, weak JWT secret, no validation |
| **Phase 3: Core Domain** | All CRUD endpoints | Resources (movements/alerts), Species, Logbook, Astronaut profile | N+1 queries, missing pagination, inconsistent responses |
| **Phase 4: Trips & Supplies** | Exploration management | Trip lifecycle, supply drop collection, GPS endpoints | No validation, poor error handling |
| **Phase 5: Integration** | Frontend connected | CORS for mobile, token refresh, offline sync design | CORS blocking mobile, token expiration |
| **Phase 6: Polish** | Production-ready | Pagination everywhere, sync endpoints, notifications | Performance issues, missing features |

---

## Sources

| Source | Quality | Relevance |
|--------|---------|-----------|
| Express.js TypeScript REST API Guide (2026) | HIGH | Stack & architecture |
| JWT Authentication in Express (2026) | HIGH | Auth implementation |
| Zod vs Joi vs Class-Validator (2026) | HIGH | Validation choice |
| Node.js + TypeScript + MongoDB Guide (2026) | MEDIUM | Stack integration |
| Express 4.x API Reference | HIGH | Official docs |
| Express Security Best Practices | HIGH | Pitfall prevention |
| Offline-First Backend Design (2026) | MEDIUM | Sync patterns |
| Project requirements (project-requirements.md) | HIGH | Domain requirements |

---

**Ready for Requirements:** All research synthesized. Key decisions documented. Proceed to roadmap creation.
