---
phase: 23
slug: backend-ai-identify
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-05
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest |
| **Config file** | api/jest.config.js |
| **Quick run command** | `cd api && npm test` |
| **Full suite command** | `cd api && npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run the automated command for the task
- **After every plan wave:** Run `cd api && npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 23-01-01 | 01 | 1 | AI-01, AI-03 | static | `grep "identifySpeciesSchema" api/src/schemas/species.schema.ts -c` | ✅ | ⬜ pending |
| 23-01-02 | 01 | 1 | AI-01, AI-03 | static | `grep "identify" api/src/services/species.service.ts -c` | ✅ | ⬜ pending |
| 23-01-03 | 01 | 1 | AI-01, AI-03 | static | `grep "router.post('/identify'" api/src/routes/species.routes.ts -c` | ✅ | ⬜ pending |
| 23-02-01 | 02 | 2 | AI-02 | unit | `npm test -- --testPathPattern=species.service.test.ts` | ❌ W0 | ⬜ pending |
| 23-02-02 | 02 | 2 | AI-02 | unit | `npm test -- --testPathPattern=species.controller.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `api/src/services/species.service.test.ts` — stubs for REQ-AI-02
- [ ] `api/src/controllers/species.controller.test.ts` — stubs for REQ-AI-02

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| API integration | AI-01, AI-03 | Vision API is external | Check response via Postman |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-05