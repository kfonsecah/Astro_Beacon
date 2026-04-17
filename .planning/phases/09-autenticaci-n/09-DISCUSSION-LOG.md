# Phase 9: Autenticación - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 09-autenticaci-n
**Areas discussed:** Token Strategy

---

## Token Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Access + Refresh (1hr/7d) | Best UX, requires refresh endpoint + frontend support | ✓ |
| Access only | Simpler for Phase 9, user re-logs hourly | |
| Long-lived access | Simple, less secure | |

**User's choice:** Access + Refresh with 1 hour access token
**Notes:** User prefers better UX with refresh tokens, but wanted 1 hour (not 15min) for access token

---

## Refresh Token Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Database (Recommended) | Stored in MongoDB with user. Revocable, trackable. Safer. | ✓ |
| httpOnly cookie | Browser-only. Not ideal for mobile. | |

**User's choice:** Database
**Notes:** Safer for mobile apps - can revoke tokens if needed

---

## the agent's Discretion

- Registration fields beyond email/password
- Zod validation schemas (email format, password strength)
- Astronaut profile creation after user registration
- Token response format details

## Deferred Ideas

- Frontend refresh token flow
- Password reset endpoint
- Email verification
- Astronaut profile fields
