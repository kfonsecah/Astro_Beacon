# Phase 3: Diseño Móvil (Mockups) - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Crear mockups completos de las principales pantallas de la app y documentar la navegación. Debe cumplir con la rúbrica de "Diseño móvil" de la Base Inicial: "Presenta un diseño completo de las principales pantallas, utiliza metáforas comunes del desarrollo móvil, demuestra interés y creatividad, el mockup es bastante completo. Conoce todas las posibles rutas."

**Entregable:** `.planning/docs/MOCKUPS.md` con mockups visuales, diagramas de navegación y documentación de rutas.

</domain>

<decisions>
## Implementation Decisions

### Enfoque de mockups
- **D-01:** Mockups en código React Native (no Figma) — pantallas placeholder con datos mock que se pueden ejecutar en Expo Go
- **D-02:** 6 pantallas principales implementadas como componentes visuales: Login, Dashboard, Bitácora, Recursos, Mapa, Perfil
- **D-03:** Pantallas secundarias documentadas como wireframes descriptivos en MOCKUPS.md: Species Detail, Exploration, Log Resource, Species Identify, Not Found

### Navegación
- **D-04:** 5 bottom tabs: Dashboard, Bitácora, Recursos, Mapa, Registros
- **D-05:** Route groups: `(auth)/` para login, `(app)/(tabs)/` para pantallas protegidas
- **D-06:** Stack navigation para pantallas de detalle (species/[id], exploration, log-resource)
- **D-07:** Modal presentation para species identification

### Estética visual
- **D-08:** Paleta HUD del reference project: deep navy (#0B1120), cyan (#6EE7B7), orange (#FB923C), green (#A3E635)
- **D-09:** Tipografía monospace para datos, zero border-radius, card-based layouts
- **D-10:** Adaptar layouts del reference a patrones móviles nativos (no max-w-lg)

### Metáforas móviles
- **D-11:** Documentar al menos 6 metáforas: bottom tabs, stack navigation, pull-to-refresh, swipe gestures, FAB, haptic feedback

### the agent's Discretion
- Nivel exacto de detalle visual en los placeholders
- Contenido mock específico de cada pantalla
- Formato exacto del diagrama de navegación en MOCKUPS.md

</decisions>

<specifics>
## Specific Ideas

- Las pantallas deben verse como un HUD de nave espacial — inspirado en el reference
- Bottom tabs con iconos de Ionicons (planet, bug, cube, map, journal)
- Dashboard con barras de recursos estilo HUD (como el ResourceBar del reference)
- Bitácora con grid de tarjetas de especies (SpaceCard pattern)
- Mapa con placeholder indicando dónde irá el mapa GPS
- Login con campo de ID de agente y botón estilizado HUD
- Anotar en MOCKUPS.md dónde van las animaciones (scan effects, glow, transitions)

</specifics>

<canonical_refs>
## Canonical References

### Requerimientos
- `project-requirements.md` §374-400 — Rúbrica Diseño Móvil (Base Inicial)
- `.planning/ROADMAP.md` — Phase 3 definition, success criteria

### Research
- `.planning/phases/03-diseno-movil-mockups/03-RESEARCH.md` — Navegación, patrones, pitfalls, code examples

### Arquitectura
- `.planning/codebase/ARCHITECTURE.md` — Reference project screens (13 páginas)
- `astro-beacon-reference/.planning/codebase/ARCHITECTURE.md` — Screens y componentes del reference
- `astro-beacon-reference/.planning/codebase/CONVENTIONS.md` — UI patterns del reference

### Diseño de datos
- `.planning/docs/DATA-DESIGN.md` — Entidades que las pantallas deben mostrar
- `.planning/docs/ARCHITECTURE-DESIGN.md` — Patrones de diseño frontend

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types-dtos/` — Todos los tipos TypeScript ya definidos (Phase 2)
- `@expo/vector-icons` — Ionicons para tab icons
- `react-native-reanimated` + `react-native-gesture-handler` — Para gestos y animaciones
- `expo-haptics` — Para feedback háptico en tabs

### Established Patterns
- expo-router file-based routing con `expo-router/entry`
- Path alias `@/*` mapeado al root
- StyleSheet.create() para estilos (no Tailwind)

### Integration Points
- `app/` directory necesita reestructurarse con route groups `(auth)/` y `(tabs)/`
- `app/_layout.tsx` necesita auth guard
- Los componentes placeholder pueden ir directamente en `app/` como rutas

</code_context>

<deferred>
## Deferred Ideas

- Implementación real de la lógica de negocio — Phase 5+
- Design system completo (constants, theme) — Phase 4
- Componentes UI reutilizables — Phase 4
- Conexión a API — Phase 5
- Animaciones avanzadas — Fases posteriores

</deferred>

---

*Phase: 03-diseno-movil-mockups*
*Context gathered: 2026-04-03*
