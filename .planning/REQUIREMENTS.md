# Requirements: Astro_Beacon REST API

**Defined:** 2026-04-16
**Core Value:** Ayudar al astronauta a sobrevivir en un planeta desconocido mediante información accesible, gestión de recursos y comunicación con la Tierra.

## v1.1 Requirements (This Milestone)

### API Foundation

- [ ] **API-01**: Project scaffold with Express v4 + TypeScript + Node.js 20
- [ ] **API-02**: Layered architecture (routes, controllers, services, models)
- [ ] **API-03**: MongoDB connection with Mongoose ODM
- [ ] **API-04**: Global error handler with consistent response envelope
- [ ] **API-05**: Environment configuration (.env for secrets)
- [ ] **API-06**: Security middleware (helmet, cors, rate limiting)
- [ ] **API-07**: Input validation middleware with Zod
- [ ] **API-08**: Pagination helper for list endpoints

### Authentication

- [ ] **AUTH-01**: User can register with email and password
- [ ] **AUTH-02**: User can login and receive JWT access token
- [ ] **AUTH-03**: Auth middleware validates JWT on protected routes
- [ ] **AUTH-04**: Password hashing with bcrypt (minimum 12 rounds)
- [ ] **AUTH-05**: Rate limiting on auth endpoints (5 attempts/15min)

### Resources (Gestión de recursos)

- [ ] **RES-01**: User can create, read, update, delete resources
- [ ] **RES-02**: User can record resource movements (income/expense)
- [ ] **RES-03**: User can get resource alerts when below threshold
- [ ] **RES-04**: Resource types: oxígeno, comida, agua, y otros definidos por usuario
- [ ] **RES-05**: Resource movement history tracking

### Species / Logbook (Bitácora de lo desconocido)

- [ ] **SPEC-01**: User can create species entries with classification
- [ ] **SPEC-02**: User can list and filter species by type
- [ ] **SPEC-03**: User can mark species as dangerous/friendly
- [ ] **LBK-01**: User can create logbook entries with photo
- [ ] **LBK-02**: User can link logbook entry to species
- [ ] **LBK-03**: User can narrate species (TTS endpoint for future)

### Astronaut (Profile)

- [ ] **ASTR-01**: User can view own astronaut profile
- [ ] **ASTR-02**: User can update astronaut information
- [ ] **ASTR-03**: User can get dashboard stats (aggregated resource counts)

### Trips (Recursos y viajes)

- [ ] **TRIP-01**: User can create trip plan with destination
- [ ] **TRIP-02**: User can start a trip (status: planned → active)
- [ ] **TRIP-03**: User can end a trip (status: active → completed/aborted)
- [ ] **TRIP-04**: User can view active and past trips
- [ ] **TRIP-05**: Trip tracks oxygen consumption (to be integrated with frontend)

### Supplies (NASA Suministros)

- [ ] **SUPP-01**: User can view available supply drops with GPS location
- [ ] **SUPP-02**: User can collect supply drop
- [ ] **SUPP-03**: User can view nearby supplies
- [ ] **SUPP-04**: Supplies have status: available, collected, expired

### Offline Sync Support

- [ ] **SYNC-01**: Endpoints include lastModified timestamps
- [ ] **SYNC-02**: Delta sync endpoint for getting changes since timestamp
- [ ] **SYNC-03**: Bulk sync endpoint for batch operations

## v1.2 Requirements (Future)

### AI Classification
- **AI-01**: Species photo classification using external AI API
- **AI-02**: User can verify/correct AI classification

### Enhanced Features
- **PUSH-01**: Push notifications for low resource alerts
- **GPS-01**: Real-time GPS tracking during trips
- **EXP-01**: Data export for offline viewing

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time WebSocket updates | Not required by spec, polling is sufficient |
| GraphQL API | REST is simpler for mobile, adds complexity without benefit |
| Multi-user/tenant | Single astronaut per deployment |
| Role-based access control | Single user = single role |
| Admin panel | Not in course requirements |

## Traceability

### Phase 8: API Setup y Estructura

| Requirement | Description | Status |
|-------------|-------------|--------|
| API-01 | Project scaffold with Express v4 + TypeScript | ✓ Complete (Plan 08-01) |
| API-02 | Layered architecture (routes, controllers, services, models) | Pending |
| API-03 | MongoDB connection with Mongoose ODM | Pending |
| API-04 | Global error handler with consistent response envelope | Pending |
| API-05 | Environment configuration (.env for secrets) | ✓ Complete (Plan 08-01) |
| API-08 | Pagination helper for list endpoints | Pending |

### Phase 9: Autenticación

| Requirement | Description | Status |
|-------------|-------------|--------|
| AUTH-01 | User can register with email and password | Pending |
| AUTH-02 | User can login and receive JWT access token | Pending |
| AUTH-03 | Auth middleware validates JWT on protected routes | Pending |
| AUTH-04 | Password hashing with bcrypt (minimum 12 rounds) | Pending |
| AUTH-05 | Rate limiting on auth endpoints (5 attempts/15min) | Pending |
| API-06 | Security middleware (helmet, cors, rate limiting) | Pending |
| API-07 | Input validation middleware with Zod | Pending |

### Phase 10: Endpoints de Dominio

| Requirement | Description | Status |
|-------------|-------------|--------|
| RES-01 | CRUD operations for resources | Pending |
| RES-02 | Record resource movements (income/expense) | Pending |
| RES-03 | Resource alerts when below threshold | Pending |
| RES-04 | Resource types: oxígeno, comida, agua, otros | Pending |
| RES-05 | Resource movement history tracking | Pending |
| SPEC-01 | Create species entries with classification | Pending |
| SPEC-02 | List and filter species by type | Pending |
| SPEC-03 | Mark species as dangerous/friendly | Pending |
| LBK-01 | Create logbook entries with photo | Pending |
| LBK-02 | Link logbook entry to species | Pending |
| LBK-03 | Narrate species (TTS endpoint for future) | Pending |
| ASTR-01 | View own astronaut profile | Pending |
| ASTR-02 | Update astronaut information | Pending |
| ASTR-03 | Get dashboard stats (aggregated resource counts) | Pending |
| TRIP-01 | Create trip plan with destination | Pending |
| TRIP-02 | Start a trip (status: planned → active) | Pending |
| TRIP-03 | End a trip (status: active → completed/aborted) | Pending |
| TRIP-04 | View active and past trips | Pending |
| TRIP-05 | Trip tracks oxygen consumption | Pending |
| SUPP-01 | View available supply drops with GPS location | Pending |
| SUPP-02 | Collect supply drop | Pending |
| SUPP-03 | View nearby supplies | Pending |
| SUPP-04 | Supplies have status: available, collected, expired | Pending |
| SYNC-01 | Endpoints include lastModified timestamps | Pending |

### Phase 11: Offline Sync y Middleware

| Requirement | Description | Status |
|-------------|-------------|--------|
| SYNC-02 | Delta sync endpoint for getting changes since timestamp | Pending |
| SYNC-03 | Bulk sync endpoint for batch operations | Pending |

### Phase 12: Documentación y Testing

| Requirement | Description | Status |
|-------------|-------------|--------|
| DOC-01 | API documentation (OpenAPI/Swagger) | Pending |
| TEST-01 | Unit tests for auth endpoints | Pending |
| TEST-02 | Unit tests for core domain services | Pending |

**Coverage:**
- v1.1 requirements: 35 total (API: 8, Auth: 5, Domain: 22)
- Mapped to phases: 35
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-16 — Roadmap v1.1 created with phase traceability*
