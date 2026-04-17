# Phase 9: Autenticación - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement secure user authentication: register, login, JWT access tokens, refresh tokens, and auth middleware for protected routes.

</domain>

<decisions>
## Implementation Decisions

### Token Strategy
- **D-01:** Access token: 1 hour expiry (JWT)
- **D-02:** Refresh token: 7 days expiry
- **D-03:** Refresh tokens stored in MongoDB (revocable, trackable)
- **D-04:** POST /api/v1/auth/refresh — endpoint to exchange refresh token for new access token

### Authentication Flow
- **D-05:** POST /api/v1/auth/register — create user + return tokens
- **D-06:** POST /api/v1/auth/login — validate credentials + return tokens
- **D-07:** POST /api/v1/auth/logout — revoke refresh token
- **D-08:** Auth middleware extracts Bearer token from Authorization header

### Security
- **D-09:** Password hashed with bcrypt (12 rounds minimum)
- **D-10:** Zod validation on all auth endpoints
- **D-11:** Rate limiting: 5 attempts per 15 minutes on login/register
- **D-12:** JWT secret from .env (JWT_SECRET config)

### User Schema (MongoDB)
```
User {
  email: string (unique, indexed)
  passwordHash: string
  refreshTokens: string[] (token hashes)
  createdAt: Date
  updatedAt: Date
}
```

### the agent's Discretion
- Registration fields beyond email/password
- Zod validation schemas (email format, password strength)
- Astronaut profile creation after user registration
- Token response format details

</decisions>

<canonical_refs>
## Canonical References

### From Phase 08
- `.planning/phases/08-api-setup-y-estructura/08-CONTEXT.md` — API structure, layered architecture

### Research
- `.planning/research/STACK.md` — bcrypt, jsonwebtoken, zod recommendations
- `.planning/research/PITFALLS.md` — Security pitfalls (plain text passwords, weak JWT secret)

### Frontend Integration
- `src/services/api.ts` — Expects baseURL: /api/v1, Bearer token
- `src/stores/auth.store.ts` — Stores token in SecureStore, logout on 401

</canonical_refs>

<code_context>
## Existing Code Insights

### Integration Points
- Frontend sends `Authorization: Bearer {token}` header
- Frontend stores token in SecureStore
- Frontend logs out on 401 response
- Phase 10 (domain) will need auth middleware on all routes

### Folder Structure (from Phase 08)
```
api/src/
├── config/
├── controllers/
├── services/
├── models/
├── routes/
├── middlewares/
└── utils/
```

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond email/password registration.

</specifics>

<deferred>
## Deferred Ideas

### Future phases
- Frontend refresh token flow (Phase 10+)
- Password reset endpoint
- Email verification
- Astronaut profile fields and creation flow (Phase 10)

</deferred>

---

*Phase: 09-autenticaci-n*
*Context gathered: 2026-04-17*
