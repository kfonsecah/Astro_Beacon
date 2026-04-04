# Phase 1: Arquitectura y Diseño del Sistema - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Definir y documentar la arquitectura del sistema con diagramas claros para la entrega de Base Inicial (10%). Debe incluir diagrama de arquitectura (frontend, backend, API, base de datos), separación clara entre capas, y justificación de patrones de diseño.

**Rúbrica objetivo:** "Realiza un esfuerzo alto por agregar y entender las relaciones de los componentes de la aplicación, lo demuestra en un diagrama de draw.io o similar"

</domain>

<decisions>
## Implementation Decisions

### Arquitectura general
- **D-01:** Arquitectura cliente-servidor con separación clara entre frontend (React Native/Expo) y backend (API REST)
- **D-02:** Frontend organizado por funcionalidades dentro de la estructura de carpetas del profesor
- **D-03:** API versionada (v1) con documentación (Swagger/OpenAPI)

### Patrón de diseño frontend
- **D-04:** Presentación-contenedor (smart/dumb components) — componentes de pantalla manejan lógica, componentes UI son puros
- **D-05:** Custom hooks como capa de abstracción entre pantallas y servicios
- **D-06:** Servicios como única capa de comunicación externa (API, storage, device APIs)

### Patrón de diseño backend
- **D-07:** API REST con controladores, servicios y repositorios (3 capas)
- **D-08:** Base de datos NoSQL (MongoDB/Firebase) para flexibilidad con datos de bitácora y especies

### Navegación
- **D-09:** expo-router con route groups: `(auth)/` para login/register, `(app)/` para pantallas protegidas con tabs
- **D-10:** Bottom tabs para secciones principales: Dashboard, Bitácora, Mapa, Recursos, Perfil

### Referencia visual
- **D-11:** Estética HUD/espacial del proyecto `astro-beacon-reference/` como guía visual
- **D-12:** Adaptar componentes web (shadcn/ui, framer-motion) a equivalentes React Native

### the agent's Discretion
- Herramienta específica para diagramas (draw.io recomendado pero abierto)
- Formato exacto de documentación de arquitectura
- Nivel de detalle del diagrama de base de datos

</decisions>

<specifics>
## Specific Ideas

- "Quiero que se vea como un HUD de nave espacial" — inspirado en el reference project
- El diagrama debe mostrar claramente: App Móvil → API REST → Base de Datos
- Incluir en el diagrama: servicios externos (IA para clasificación, GPS, cámara)
- Justificar por qué React Native + Expo vs otras opciones
- Documentar por qué se eligió la organización por funcionalidades

</specifics>

<canonical_refs>
## Canonical References

### Requerimientos del curso
- `project-requirements.md` §147-173 — Arquitectura y tecnología (requerimientos no funcionales)
- `project-requirements.md` §342-450 — Rúbrica Base Inicial (arquitectura, diseño móvil, diseño de datos, API)

### Codebase maps
- `.planning/codebase/ARCHITECTURE.md` — Arquitectura actual del proyecto Expo
- `.planning/codebase/STACK.md` — Stack tecnológico actual
- `.planning/codebase/CONCERNS.md` — Áreas de preocupación y deuda técnica
- `astro-beacon-reference/.planning/codebase/ARCHITECTURE.md` — Arquitectura del proyecto referencia

### Estructura del proyecto
- `.planning/PROJECT.md` — Contexto del proyecto, estructura de carpetas requerida, constraints

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/_layout.tsx` — Root layout con Stack navigator (base para route groups)
- `app/index.tsx` — Entry point actual (placeholder)
- `package.json` — Expo SDK 54, React 19, RN 0.81.5, Reanimated 4, Gesture Handler 2

### Established Patterns
- expo-router file-based routing con `expo-router/entry`
- Path alias `@/*` mapeado al root
- TypeScript strict mode
- New Architecture enabled, React Compiler experimental

### Integration Points
- Route groups `(auth)/` y `(app)/` deben crearse en `app/`
- `src/` directory debe crearse con la estructura del profesor
- API service layer debe crearse en `src/services/api.ts`

</code_context>

<deferred>
## Deferred Ideas

- Implementación real de la API — Fase 5+ (solo se necesita conexión base en Base Inicial)
- Diseño de datos detallado — Phase 2
- Mockups de pantallas — Phase 3
- Design system implementation — Phase 4

</deferred>

---

*Phase: 01-arquitectura-y-diseno-del-sistema*
*Context gathered: 2026-04-02*
