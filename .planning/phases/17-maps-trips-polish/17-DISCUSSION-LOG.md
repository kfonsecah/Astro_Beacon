# Phase 17: Maps & Trips Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 17-maps-trips-polish
**Areas discussed:** Map display style, Supply contents format, Trip start behavior, Map-Trip integration

---

## Map Display Style

| Option | Description | Selected |
|--------|-------------|----------|
| Interactive map with markers (Recommended) | react-native-maps with supply drop markers | |
| Static overview only | Non-interactive placeholder with stats | |
| Full navigation mode | Turn-by-turn with route lines | ✓ |

**User's choice:** Full navigation mode with real GPS, routes based on real position.

---

## Supply Contents Format

| Option | Description | Selected |
|--------|-------------|----------|
| Resource names list (Recommended) | 'Oxigeno, Comida, Agua' — simple | |
| Resource names with quantities | 'Oxigeno x2, Comida x5' | |
| Categorized display | Group by category with color coding | |

**User's choice:** Map shows symbol for each category + quantity. Off-map, symbols and meanings are explained (legend).

---

## Trip Start Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Call API + refresh list (Recommended) | useStartTrip() mutation, refresh list | |
| Navigate to active trip view | New screen needed — scope creep | |
| Confirm dialog first | Oxygen warning before API call | |

**User's choice:** App displays real-time map with supply locations (GPS). User presses "START TRIP" → confirms with oxygen warning. During trip: oxygen decreases in real-time. On arrival/return: app records resources collected.

**Note:** This expanded scope significantly — includes real-time GPS tracking, oxygen countdown, and trip recording.

---

## Map-Trip Integration

**User decision:** Expand Phase 17 to include full trip execution feature (real-time GPS, oxygen countdown, resource recording) rather than deferring to future phase.

---

## Agent's Discretion

- Exact implementation of client-side route calculation (react-native-maps Polyline vs third-party routing service)
- Real-time oxygen countdown mechanism (setInterval vs requestAnimationFrame vs native timer)
- How resource collection is recorded (modal, inline form, or post-trip summary screen)

---

## Deferred Ideas

None — all discussed features included in Phase 17 scope.
