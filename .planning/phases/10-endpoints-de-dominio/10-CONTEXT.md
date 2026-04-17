# Phase 10: Endpoints de Dominio - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete CRUD operations for all domain entities: resources, species, logbook, astronaut, trips, and supplies. All endpoints protected by JWT authentication middleware. Include lastModified timestamps for offline sync support.

</domain>

<decisions>
## Implementation Decisions

### Resources (Gestión de recursos)
- **D-01:** Resource categories: oxigeno, agua, comida, medico, equipo, otro (from frontend enums)
- **D-02:** Movement types: ingreso, egreso
- **D-03:** Default thresholds per category:
  - oxigeno: 20%
  - agua: 15%
  - comida: 10%
- **D-04:** User can override threshold per resource
- **D-05:** GET /api/v1/resources/alerts — returns resources below threshold

### Species (Bitácora)
- **D-06:** Classifications: animal, planta, recurso, microorganismo, desconocido, otro
- **D-07:** Danger levels: amigable, cauteloso, peligroso, letal
- **D-08:** Species can be linked to logbook entries

### Logbook (Bitácora)
- **D-09:** Entries include: title, description, photo URL, species reference
- **D-10:** TTS narration endpoint (LBK-03) — Phase 12 or later

### Astronaut (Profile)
- **D-11:** Astronaut profile linked to User (one-to-one)
- **D-12:** Dashboard stats: total resources, active trips, species discovered

### Trips (Recursos y viajes)
- **D-13:** Trip statuses: planificado → activo → completado/abortado
- **D-14:** O2 tracking: Hybrid approach
  - Base rate: 1 unit per hour (configurable)
  - User can add manual adjustments
- **D-15:** Track start/end timestamps and optional destination

### Supplies (NASA Suministros)
- **D-16:** Supply statuses: pendiente, entregado, recogido, expirado
- **D-17:** GPS location: GeoPoint { lat, lng } (matches frontend)
- **D-18:** GET /api/v1/supplies/nearby?lat=&lng=&radius= — finds supplies within radius

### Offline Sync
- **D-19:** All entities include: createdAt, updatedAt, lastModified (ISO timestamp)
- **D-20:** All list endpoints support pagination (page, limit)

### Auth
- **D-21:** All domain endpoints require JWT authentication
- **D-22:** Auth middleware from Phase 09

</decisions>

<canonical_refs>
## Canonical References

### From Prior Phases
- `.planning/phases/08-api-setup-y-estructura/08-CONTEXT.md` — API structure, layered architecture
- `.planning/phases/09-autenticaci-n/09-CONTEXT.md` — Auth middleware, JWT

### Frontend Integration
- `src/types-dtos/enums.ts` — Frontend enum definitions to match

### Requirements
- `.planning/REQUIREMENTS.md` §Phase 10 — RES-01 to RES-05, SPEC-01 to SPEC-03, LBK-01 to LBK-03, ASTR-01 to ASTR-03, TRIP-01 to TRIP-05, SUPP-01 to SUPP-04, SYNC-01

</canonical_refs>

<code_context>
## Existing Code Insights

### Frontend Enums (match these)
```
ResourceCategory: oxigeno, agua, comida, medico, equipo, otro
SpeciesClassification: animal, planta, recurso, microorganismo, desconocido, otro
DangerLevel: amigable, cauteloso, peligroso, letal
TripStatus: planificado, activo, completado, abortado
SupplyDropStatus: pendiente, entregado, recogido, expirado
MovementType: ingreso, egreso
GeoPoint: { lat: number, lng: number }
```

### Folder Structure (from Phase 08)
```
api/src/
├── models/        # Mongoose schemas
├── schemas/       # Zod validation
├── services/      # Business logic
├── controllers/   # HTTP handlers
├── routes/        # URL mapping
└── middlewares/   # Auth, pagination
```

</code_context>

<specifics>
## Specific Ideas

- Resource movement history tracking (not just current amount)
- Species can be marked as dangerous/friendly
- Logbook entries can have multiple photos
- Astronaut profile created automatically on user registration

</specifics>

<deferred>
## Deferred Ideas

### Phase 11
- Delta sync endpoint
- Bulk sync endpoint
- Conflict resolution for offline sync

### Phase 12
- TTS narration endpoint (LBK-03)
- API documentation (Swagger)
- Unit tests

### Future
- AI species classification from photos
- Push notifications for low resources
- GPS tracking during trips

</deferred>

---

*Phase: 10-endpoints-de-dominio*
*Context gathered: 2026-04-17*
