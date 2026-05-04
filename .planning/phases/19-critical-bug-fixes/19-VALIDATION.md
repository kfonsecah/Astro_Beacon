---
phase: 19
slug: critical-bug-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-04
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — proyecto React Native/Expo sin framework de tests configurado |
| **Config file** | none |
| **Quick run command** | N/A — verificación manual (smoke tests) |
| **Full suite command** | N/A |
| **Estimated runtime** | ~5 min (manual smoke) |

---

## Sampling Rate

- **After every task commit:** Verificación manual del criterio de aceptación de la tarea
- **After every plan wave:** Smoke test completo de los 4 criterios de éxito de la fase
- **Before `/gsd-verify-work`:** Todos los criterios de éxito deben estar verificados manualmente
- **Max feedback latency:** N/A — sin automated tests

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | BUG-1 (trip activation) | — | N/A | manual | — | N/A | ⬜ pending |
| 19-01-02 | 01 | 1 | BUG-2 (double setAuth) | — | N/A | manual | — | N/A | ⬜ pending |
| 19-02-01 | 02 | 1 | BUG-3 (pagination bestiary) | — | N/A | manual | — | N/A | ⬜ pending |
| 19-02-02 | 02 | 1 | BUG-3 (pagination logbook) | — | N/A | manual | — | N/A | ⬜ pending |
| 19-02-03 | 02 | 1 | BUG-3 (pagination trips) | — | N/A | manual | — | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No hay infrastructure de tests que crear. Todos los fixes son cambios de código puro — la verificación es manual.

*Existing infrastructure covers all phase requirements.* (N/A — no test infrastructure)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Iniciar viaje activa GPS + O2 en map.tsx | BUG-1 SC-1 | Sin test framework instalado | 1. Ir a Trips. 2. Iniciar un viaje. 3. Navegar al tab Mapa. 4. Verificar banner "VIAJE ACTIVO - Rastreo GPS activo" y contador O2. |
| Completar/abortar limpia TripStore | BUG-1 SC-2 | Sin test framework instalado | 1. Con viaje activo, completar o abortar viaje. 2. Navegar al tab Mapa. 3. Verificar que el banner desaparece y O2 counter se detiene. |
| setAuth llamado exactamente una vez | BUG-2 SC-3 | Sin test framework instalado | 1. Agregar console.log temporal en setAuth. 2. Hacer login. 3. Verificar un solo log en consola. |
| Scroll en Bestiary carga pag 2 sin perder pag 1 | BUG-3 SC-4 | Sin test framework instalado | 1. Abrir Bestiary. 2. Scrollear al final. 3. Verificar que items de pag 1 siguen visibles + items nuevos aparecen. |
| Scroll en Logbook carga pag 2 sin perder pag 1 | BUG-3 SC-4 | Sin test framework instalado | Mismo procedimiento que Bestiary, en pantalla Logbook. |
| Scroll en Trips carga pag 2 sin perder pag 1 | BUG-3 SC-4 | Sin test framework instalado | Mismo procedimiento que Bestiary, en pantalla Trips. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s (manual smoke)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
