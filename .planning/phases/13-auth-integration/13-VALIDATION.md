---
phase: 13
slug: auth-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-28
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest (React Native testing) |
| **Config file** | `jest.config.js` (or existing) |
| **Quick run command** | `npm test -- --selectProjects=auth` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `grep -check` for expected patterns in modified files
- **After every plan wave:** Verify all plan truths are achievable
- **Before `/gsd-verify-work`:** All automated checks must pass
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | AUTH-01, AUTH-03, API-02, API-05, API-06 | static | `grep -q 'access_token\|refresh_token' src/stores/auth.store.ts` | ✅ W0 | ⬜ pending |
| 13-01-02 | 01 | 1 | AUTH-02, AUTH-04 | static | `test -f app/(auth)/register.tsx` | ✅ W0 | ⬜ pending |
| 13-02-01 | 02 | 1 | AUTH-05, AUTH-07 | static | `grep -q 'refresh' src/services/api.ts` | ✅ W0 | ⬜ pending |
| 13-02-02 | 02 | 1 | AUTH-06, AUTH-08 | static | `grep -q 'Stack.Protected\|router.replace' app/_layout.tsx app/(auth)/login.tsx` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/stores/auth.store.ts` — stubs for Zustand persist with SecureStore
- [ ] `src/services/api.ts` — response interceptor with refresh token logic
- [ ] `app/(app)/_layout.tsx` — Protected route wrapper exists
- [ ] `app/(auth)/register.tsx` — Register screen exists

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Login flow works end-to-end | AUTH-01, AUTH-08 | Requires real backend + user interaction | 1. Enter valid email/password 2. Tap login 3. Verify redirected to home 4. Verify no back button to login |
| Register flow works end-to-end | AUTH-02 | Requires real backend + user interaction | 1. Enter new email/password 2. Tap register 3. Verify redirected to home 4. Verify user is logged in |
| Token refresh works | AUTH-07 | Requires expired token simulation | 1. Login 2. Wait for token expiry (or force expiry) 3. Make API call 4. Verify silent refresh + retry |
| Protected routes redirect | AUTH-06 | Requires auth state manipulation | 1. Clear tokens 2. Try access protected route 3. Verify redirected to login |

*All phase behaviors require some manual verification due to backend dependency.*

---

## Validation Sign-Off

- [ ] All tasks have `<verify>` with automated command
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
