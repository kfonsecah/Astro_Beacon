# Phase 8: API Setup y Estructura - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 08-api-setup-y-estructura
**Areas discussed:** API Location

---

## API Location

| Option | Description | Selected |
|--------|-------------|----------|
| Separate /api folder | Clean separation, easy to deploy independently | ✓ |
| /backend folder | More common naming, same benefits | |
| Monorepo with shared packages | Overkill for course project | |

**User's choice:** Separate /api folder
**Notes:** Clean separation, mirrors project structure

---

## the agent's Discretion

- Exact folder names within `/api/src/`
- MongoDB connection string (local vs Atlas)
- Pagination helper implementation details
- Error code standardization

## Deferred Ideas

- JWT token expiry duration
- Refresh token strategy
- Zod validation schemas specifics
- Security middleware configuration
- AI classification provider
- Image storage strategy
