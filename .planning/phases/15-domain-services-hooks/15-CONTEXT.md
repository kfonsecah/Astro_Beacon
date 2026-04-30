# Phase 15: Domain Services + Hooks - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Create service layer (src/services/) and custom hooks (src/hooks/) for all domain entities. Each domain has typed API functions matching backend DTOs and TanStack Query hooks.

Scope: Crear services + hooks para consume en Phase 16. NO consumir en pantallas aún.

</domain>

<decisions>
## Implementation Decisions

### Domain Structure
- **D-01:** Create all 6 domain services + hooks
- **D-02:** Services in `src/services/` matching backend service names
- **D-03:** Hooks wrap TanStack Query useQuery/useMutation
- **D-04:** Use backend DTOs from Phase 9-10

### Domains to Implement

| Domain | Service | Hooks |
|--------|---------|-------|
| auth | auth.service.ts | useLogin, useRegister, useLogout |
| astronauts | astronaut.service.ts | useAstronautProfile |
| resources | resource.service.ts | useResources, useResourceById, useCreateResource, useConsumeResource |
| logbook | logbook.service.ts | useLogbookEntries, useLogbookEntryById, useCreateLogbookEntry |
| species | species.service.ts | useSpecies, useSpeciesById, useCreateSpecies |
| trips | trip.service.ts | useTrips, useTripById, usePlanTrip, useStartTrip, useCompleteTrip |
| supplies | supply.service.ts | useSupplies, useNearbySupplies, useCollectSupply |

### Query Keys
- **D-05:** Use consistent query key pattern: `['domain', 'operation', id?]`
- **D-06:** Example: `['resources', 'list', page]`, `['resources', 'detail', id]`

### Types
- **D-07:** Import DTOs from backend or create matching types in `src/types-dtos/`
- **D-08:** All API functions typed with request/response shapes

</decisions>

<canonical_refs>
## Canonical References

### Backend Services (Phase 9-10)
- `api/src/services/auth.service.ts`
- `api/src/services/astronaut.service.ts`
- `api/src/services/resource.service.ts`
- `api/src/services/logbook.service.ts`
- `api/src/services/species.service.ts`
- `api/src/services/trip.service.ts`
- `api/src/services/supply.service.ts`

### Backend DTOs
- `src/types-dtos/*.dto.ts` — Existing DTOs in frontend

### API Client
- `src/services/api.ts` — Axios instance from Phase 14
- `.planning/REQUIREMENTS.md` § DOM-01 to DOM-09

</canonical_refs>

<specifics>
## Specific Ideas

- Services call `api.get/post/put/delete()` from src/services/api.ts
- Hooks use `useQuery` for reads, `useMutation` for writes
- Query keys use flat array format for proper cache management

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>

---
*Phase: 15-domain-services-hooks*
*Context gathered: 2026-04-28*