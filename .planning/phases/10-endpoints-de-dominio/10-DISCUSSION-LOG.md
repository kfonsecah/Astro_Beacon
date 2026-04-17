# Phase 10: Endpoints de Dominio - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 10-endpoints-de-dominio
**Areas discussed:** Resource Thresholds, Trip Oxygen Tracking

---

## Resource Thresholds

| Option | Description | Selected |
|--------|-------------|----------|
| Both (Recommended) | Default thresholds per category, user can override per resource | ✓ |
| Per resource only | Each resource has its own threshold, no defaults | |
| Global defaults only | Fixed defaults per category | |

**User's choice:** Both - configurable defaults with user override

---

## Trip Oxygen Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid (Recommended) | Auto-calculate base rate, user can add manual adjustments | ✓ |
| Manual only | User logs O2 consumption at each checkpoint | |
| Automatic | System calculates based on trip duration/distance | |

**User's choice:** Hybrid - base rate + manual adjustments

---

## the agent's Discretion

- Exact O2 consumption rate per hour
- Default threshold values per category
- How to store movement history
- Dashboard stats aggregation logic

## Deferred Ideas

- Delta sync endpoint (Phase 11)
- Bulk sync endpoint (Phase 11)
- TTS narration (Phase 12)
- AI species classification (Future)
