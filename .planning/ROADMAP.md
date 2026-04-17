# Roadmap: Astro_Beacon

## Overview

Desarrollo de una aplicación móvil de exploración planetaria para la materia EIF411 (UNACR). El proyecto simula la asistencia a una astronauta varada en un planeta desconocido, con funcionalidades de bitácora, gestión de recursos, navegación GPS y soporte offline. La referencia visual proviene del proyecto `astro-beacon-reference/` generado por Lovable.

## Milestones

- ✅ **v1.0 Base Inicial** - Fases 1-7 (complete) - Entrega 1: 08 de abril
- 🚧 **v1.1 Aplicación Base** - Fases 8-12 (in progress) - Entrega 2: 06 de mayo
- 📋 **v1.2 Defensa Final** - Fases 13+ (planned) - Entrega: 03 de junio

## Phases

### 🚧 v1.1 Aplicación Base (In Progress)

**Milestone Goal:** Implementar una API REST funcional con Node.js + Express v4 para soportar todas las funcionalidades de la app móvil.

- [ ] **Phase 8: API Setup y Estructura** - Project scaffold, layered architecture, MongoDB connection
- [x] **Phase 9: Autenticación** - Register, login, JWT, bcrypt, rate limiting (completed 2026-04-17)
- [x] **Phase 10: Endpoints de Dominio** - All CRUD operations for resources, species, logbook, astronaut, trips, supplies (completed 2026-04-17)
- [ ] **Phase 11: Offline Sync y Middleware** - Delta sync, bulk sync, security hardening
- [ ] **Phase 12: Documentación y Testing** - API documentation, unit tests, final verification

---

### Phase 8: API Setup y Estructura

**Goal**: Establish the backend project foundation with Express v4, TypeScript, MongoDB connection, and layered architecture

**Depends on**: Nothing (first phase of v1.1)

**Requirements**: API-01, API-02, API-03, API-04, API-05, API-08

**Success Criteria** (what must be TRUE):

1. Server starts and responds to health check at `GET /api/v1/health`
2. All routes follow layered architecture: routes → controllers → services → models
3. MongoDB connection established via Mongoose with proper error handling
4. All API responses follow consistent envelope format: `{ success, data, pagination?, error? }`
5. Environment variables loaded from `.env` file (no hardcoded secrets)
6. List endpoints support pagination with `page` and `limit` query params

**Plans**: 4 plans

- [ ] 08-01-PLAN.md — Project scaffold with Express v4 + TypeScript
- [ ] 08-02-PLAN.md — Express app with security middleware and error handler
- [ ] 08-03-PLAN.md — MongoDB connection with Mongoose
- [ ] 08-04-PLAN.md — Pagination helper for list endpoints

---

### Phase 9: Autenticación

**Goal**: Users can securely register, login, and access protected endpoints with JWT authentication

**Depends on**: Phase 8

**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, API-06, API-07

**Success Criteria** (what must be TRUE):

1. User can register with email and password, receiving a success response
2. User can login with valid credentials and receive a JWT access token
3. Protected routes reject requests without valid JWT token
4. Passwords are stored hashed (bcrypt with minimum 12 rounds), never in plaintext
5. Auth endpoints (register/login) block after 5 failed attempts within 15 minutes
6. Input validation rejects malformed requests with clear error messages
7. Security headers (helmet) and CORS configured for mobile app access

**Plans**: 3 plans

- [ ] 09-01-PLAN.md — User model and Zod validation schemas
- [ ] 09-02-PLAN.md — Auth service with JWT utilities
- [ ] 09-03-PLAN.md — Auth controller, routes, and middleware

---

### Phase 10: Endpoints de Dominio

**Goal**: Complete CRUD operations for all domain entities: resources, species, logbook, astronaut, trips, and supplies

**Depends on**: Phase 9

**Requirements**: RES-01, RES-02, RES-03, RES-04, RES-05, SPEC-01, SPEC-02, SPEC-03, LBK-01, LBK-02, LBK-03, ASTR-01, ASTR-02, ASTR-03, TRIP-01, TRIP-02, TRIP-03, TRIP-04, TRIP-05, SUPP-01, SUPP-02, SUPP-03, SUPP-04, SYNC-01

**Success Criteria** (what must be TRUE):

1. User can create, read, update, and delete resources with movements tracking
2. User can view resource alerts when oxygen, food, or water drops below threshold
3. User can create species entries with classification and mark as dangerous/friendly
4. User can create logbook entries with optional species linking
5. User can view and update their astronaut profile with dashboard stats
6. User can create trips (planned), start trips (active), and complete/abort trips
7. User can view nearby supplies and collect supply drops
8. All endpoints include `lastModified` timestamps for offline sync support
9. All endpoints are protected by JWT authentication middleware

**Plans**: 5 plans

- [ ] 10-01-PLAN.md — Models + Schemas for all 6 entities
- [ ] 10-02-PLAN.md — Resources, Species, Logbook services + controllers
- [ ] 10-03-PLAN.md — Astronaut, Trips, Supplies services + controllers
- [ ] 10-04-PLAN.md — Routes wiring + app.ts integration
- [ ] 10-05-PLAN.md — Final verification + testing

---

### Phase 11: Offline Sync y Middleware

**Goal**: Implement delta sync and bulk sync endpoints for offline mobile app support

**Depends on**: Phase 10

**Requirements**: SYNC-02, SYNC-03

**Success Criteria** (what must be TRUE):

1. Delta sync endpoint returns all entities modified since a given timestamp
2. Bulk sync endpoint processes batch operations and returns server IDs for local IDs
3. Bulk sync handles conflicts gracefully with clear conflict resolution
4. All sync responses follow standardized format with success/conflict/failed arrays

**Plans**: TBD

---

### Phase 12: Documentación y Testing

**Goal**: Complete API documentation and unit tests for core functionality

**Depends on**: Phase 11

**Requirements**: Documentation (OpenAPI/Swagger), Unit Tests for auth and core services

**Success Criteria** (what must be TRUE):

1. API endpoints documented with OpenAPI/Swagger at `/api-docs`
2. Auth endpoints have unit tests covering register, login, and middleware
3. Core domain services have unit tests for business logic
4. All tests pass with `npm test`
5. README includes setup instructions and API usage examples

**Plans**: TBD

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Arquitectura y Diseño | v1.0 | 2/2 | Complete | 2026-04-02 |
| 2. Diseño de Datos | v1.0 | 2/2 | Complete | 2026-04-03 |
| 3. Diseño Móvil (Mockups) | v1.0 | 2/2 | Complete | 2026-04-03 |
| 4. Design System y Estructura Visual | v1.0 | 3/3 | Complete | 2026-04-03 |
| 5. Base de la App y Conexión API | v1.0 | 4/4 | Complete | 2026-04-03 |
| 6. Refactorización de Estilos | v1.0 | 3/3 | Complete | 2026-04-04 |
| 7. Verificación de Design System | v1.0 | 2/2 | Complete | 2026-04-04 |
| 8. API Setup y Estructura | v1.1 | 0/4 | Not started | - |
| 9. Autenticación | v1.1 | 0/3 | Complete    | 2026-04-17 |
| 10. Endpoints de Dominio | v1.1 | 0/5 | Complete    | 2026-04-17 |
| 11. Offline Sync y Middleware | v1.1 | 0/3 | Not started | - |
| 12. Documentación y Testing | v1.1 | 0/3 | Not started | - |
