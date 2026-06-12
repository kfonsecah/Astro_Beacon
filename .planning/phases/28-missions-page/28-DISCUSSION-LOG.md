# Phase 28: Missions Page - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-11
**Phase:** 28-missions-page
**Areas discussed:** Page purpose, Content & layout, Navigation & entry point, Interactions

---

## Page Purpose

| Option | Description | Selected |
|--------|-------------|----------|
| New tab for mission logs/reports | Pantalla dedicada a misiones con historial | ✓ |
| Standalone active mission management | Solo manejo de misión activa sin historial | |
| Revamp of existing /trips page | Convertir /trips en la misión page | |

**User's choice:** New tab for mission logs/reports — separada de /trips que maneja lógica de viaje activo. La missions page es el "log": historial + misión activa + planear nueva.

---

## Content & Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Cards con stats | Cards con duración, recursos, distancia | ✓ |
| Timeline | Línea de tiempo visual de misiones | |
| Simple list | Solo nombres y fechas | |

**User's choice:** Cards con stats clave (duración, recursos usados, distancia). Header con panel de control de misión activa. Botón para planear nueva expedición. HUD aesthetic.

---

## Navigation & Entry Point

| Option | Description | Selected |
|--------|-------------|----------|
| Tab dedicado + dashboard | Ambos accesos | ✓ |
| Solo tab | Solo desde tab bar | |
| Solo dashboard | Solo desde botón EXPEDICIÓN | |

**User's choice:** Ambos — tab dedicado (descubrible) + botón "EXPEDICIÓN" en dashboard (flujo principal en contexto).

---

## Interactions

| Option | Description | Selected |
|--------|-------------|----------|
| Activa → panel, sin activa → planear | Panel de control con oxígeno + botón completar; si no hay activa, botón iniciar | ✓ |
| Siempre iniciar primero | Siempre preguntar destino incluso si hay activa | |
| Inline cancel sin confirmación | Botón de cancelar inmediato | |

**User's choice:** 
- Sin misión activa: botón "INICIAR EXPEDICIÓN" → usePlanTrip flow
- Con misión activa: panel con oxígeno en tiempo real + botón "COMPLETAR"
- Tap en pasada → detalle (read-only)
- Cancelación con confirmación explícita (acción destructiva con Alert)

---

## Deferred Ideas

None — discussion stayed within phase scope
