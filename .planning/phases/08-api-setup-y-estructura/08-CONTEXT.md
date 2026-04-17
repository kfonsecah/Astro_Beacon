# Phase 8: API Setup y Estructura - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the backend API foundation: Express v4 + TypeScript project scaffold, layered architecture (routes → controllers → services → models), MongoDB connection via Mongoose, global error handler with response envelope, and pagination helper.

</domain>

<decisions>
## Implementation Decisions

### Project Structure
- **D-01:** API lives in `/api` folder at repo root (separate from React Native app)
- **D-02:** Express v4 + TypeScript + MongoDB + Mongoose stack (from research)
- **D-03:** Layered architecture: routes → controllers → services → models
- **D-04:** Response envelope: `{ success, data, pagination?, error? }`

### Folder Layout
```
api/
├── src/
│   ├── config/           # Environment, DB config
│   ├── controllers/      # HTTP handlers only
│   ├── services/         # Business logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # URL mapping
│   ├── middlewares/      # Auth, validation, error
│   ├── utils/            # Helpers
│   ├── app.js            # Express app
│   └── server.js         # Entry point
├── tests/
├── package.json
└── .env.example
```

### the agent's Discretion
- Exact folder names within `/api/src/`
- MongoDB connection string (local vs Atlas)
- Pagination helper implementation details
- Error code standardization

</decisions>

<canonical_refs>
## Canonical References

### Research (from milestone v1.1)
- `.planning/research/STACK.md` — Tech stack: Express v4, MongoDB 7, Mongoose 8, TypeScript 5
- `.planning/research/ARCHITECTURE.md` — Layered architecture pattern, response envelope format, folder structure
- `.planning/research/PITFALLS.md` — Security pitfalls to avoid: no hardcoded secrets, business logic in routes

### Requirements
- `.planning/REQUIREMENTS.md` §Phase 8 — API-01 to API-05, API-08 requirements

### Existing Frontend
- `src/services/api.ts` — Frontend expects baseURL: `localhost:3000/api/v1`

</canonical_refs>

<code_context>
## Existing Code Insights

### Integration Points
- Frontend axios instance: `baseURL: http://localhost:3000/api/v1` (api.ts)
- Frontend auth store: JWT token management (useAuthStore)
- Design system NOT needed in backend (separate codebase)

### Constraints
- API must be REST (not GraphQL)
- Single astronaut per deployment (no multi-tenant)
- Offline sync support needed (timestamps on entities)

</code_context>

<specifics>
## Specific Ideas

No specific references — standard Express + MongoDB approach.

</specifics>

<deferred>
## Deferred Ideas

### Phase 9+ decisions
- JWT token expiry duration (15min? 1hr?)
- Refresh token strategy (httpOnly cookies vs client storage)
- Zod validation schemas specifics
- Security middleware exact configuration

### Future phases
- AI species classification provider (OpenAI Vision vs alternatives)
- Image storage (Cloudinary vs S3 vs local)
- Push notifications setup

</deferred>

---

*Phase: 08-api-setup-y-estructura*
*Context gathered: 2026-04-16*
