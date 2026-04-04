# Roadmap: Astro_Beacon

## Overview

Desarrollo de una aplicación móvil de exploración planetaria para la materia EIF411 (UNACR). El proyecto simula la asistencia a una astronauta varada en un planeta desconocido, con funcionalidades de bitácora, gestión de recursos, navegación GPS y soporte offline. La referencia visual proviene del proyecto `astro-beacon-reference/` generado por Lovable.

## Milestones

- 🚧 **v1.0 Base Inicial** - Fases 1-5 (in progress) - Entrega 1: 08 de abril
- 📋 **v1.1 Aplicación Base** - Fases 6-10 (planned) - Entrega 2: 06 de mayo
- 📋 **v1.2 Defensa Final** - Fases 11-14 (planned) - Entrega: 03 de junio

## Phases

### 🚧 v1.0 Base Inicial (In Progress)

**Milestone Goal:** Cumplir con los criterios de la primera entrega (10%): arquitectura y diseño del trabajo, diseño de datos, diseño móvil (mockups), y una base de la app con conexión a la API.

#### Phase 1: Arquitectura y Diseño del Sistema
**Goal**: Definir y documentar la arquitectura del sistema con diagramas claros
**Depends on**: Nothing (first phase)
**Requirements**: [Arquitectura y diseño del trabajo - Rúbrica Base Inicial]
**Success Criteria** (what must be TRUE):
  1. Diagrama de arquitectura draw.io (o similar) con componentes y relaciones
  2. Separación clara entre frontend (React Native) y backend (API)
  3. Documentación de la arquitectura en `.planning/docs/ARCHITECTURE-DESIGN.md`
  4. Justificación de patrones de diseño y organización por capas
**Plans**: 2 plans

Plans:
- [x] 01-01: Crear diagrama de arquitectura (frontend, backend, API, base de datos)
- [x] 01-02: Documentar arquitectura, patrones de diseño y justificaciones

#### Phase 2: Diseño de Datos
**Goal**: Definir entidades, documentos, atributos y relaciones del sistema
**Depends on**: Phase 1
**Requirements**: Diseño de datos - Rúbrica Base Inicial
**Success Criteria** (what must be TRUE):
  1. Diagrama de entidades/documentos con relaciones
  2. Definición completa de tipos TypeScript (types-dtos)
  3. Documentación del diseño de datos en `.planning/docs/DATA-DESIGN.md`
  4. Entidades cubren: astronauta, recursos, bitácora, especies, viajes, suministros
**Plans**: 2 plans

Plans:
- [x] 02-01: Definir entidades y relaciones (diagrama + documentación)
- [x] 02-02: Implementar tipos TypeScript en `src/types-dtos/`

#### Phase 3: Diseño Móvil (Mockups)
**Goal**: Crear mockups completos de las principales pantallas de la app
**Depends on**: Phase 1, Phase 2
**Requirements**: [Diseño móvil - Rúbrica Base Inicial]
**Success Criteria** (what must be TRUE):
  1. Mockups de todas las pantallas principales (login, dashboard, bitácora, recursos, mapa, perfil)
  2. Diseño coherente con la referencia visual de `astro-beacon-reference/`
  3. Documentación de rutas y navegación en `.planning/docs/MOCKUPS.md`
  4. Conocimiento de todas las posibles rutas de la app
**Plans**: 2 plans

Plans:
- [x] 03-01: Crear mockups basados en referencia visual de Lovable
- [x] 03-02: Documentar rutas, navegación y flujos de usuario

#### Phase 4: Design System y Estructura Visual
**Goal**: Implementar el design system y la estructura visual basada en la referencia
**Depends on**: Phase 3
**Requirements**: [Diseño, animaciones y estilos temáticos - Requerimientos Generales]
**Success Criteria** (what must be TRUE):
  1. Design system implementado en `src/constants/` (colores, spacing, typography)
  2. Tema dark/light en `src/theme/` inspirado en estética espacial/HUD
  3. Componentes UI base en `src/components/ui/` (Button, Card, Input, etc.)
  4. Estructura de carpetas alineada con la requerida por la cátedra
**Plans**: 3 plans

Plans:
- [x] 04-01: Crear constantes de diseño (colores con opacidad, escala spacing, tipografía con Platform.OS)
- [x] 04-02: Implementar temas dark/light con ThemeProvider, hooks y carga de fuentes
- [x] 04-03: Crear componentes UI reutilizables (Button, Card, Input, Badge, ProgressBar, EmptyState, HudHeader)

#### Phase 6: Refactorización de Estilos
**Goal**: Eliminar todos los estilos hardcodeados de las pantallas y migrar al design system
**Depends on**: Phase 4, Phase 5
**Requirements**: [Diseño, animaciones y estilos temáticos - Requerimientos Generales]
**Success Criteria** (what must be TRUE):
  1. Cero colores hardcodeados en pantallas de `app/` (todos via `theme.colors`)
  2. Cero valores de spacing hardcodeados (todos via `theme.spacing` o `spacing`)
  3. Cero tipografía hardcodeada (todos via `typography`)
  4. Pantallas responden correctamente a cambio de tema (dark/light)
  5. Componentes UI reutilizables usados en lugar de estilos inline repetidos
**Plans**: 3 plans

Plans:
- [x] 06-01: Fix UI components (Card, Badge, ProgressBar, EmptyState) to use theme colors + fix typography.ts import
- [x] 06-02: Refactorizar dashboard, logbook, resources para usar theme y componentes UI
- [x] 06-03: Refactorizar bestiary, map para usar theme, constantes de color y componentes UI

#### Phase 7: Verificación de Design System
**Goal**: Verificar que hay 0 valores hardcodeados y todo sigue el design system
**Depends on**: Phase 6
**Requirements**: [Diseño, animaciones y estilos temáticos - Requerimientos Generales]
**Success Criteria** (what must be TRUE):
  1. Cero colores hex hardcodeados en `app/` y `src/` (scan con grep)
  2. Cero valores de spacing numéricos hardcodeados (excepto en `constants/` y `theme/`)
  3. Todos los componentes UI usan `useTheme()` o `colors` constants
  4. Todas las pantallas responden a cambio de tema (dark/light)
  5. Tab bar, status bar y login cambian con el tema
**Plans**: 2 plans

Plans:
- [ ] 07-01: Eliminar colores hex hardcodeados en app/ y src/components/
- [ ] 07-02: Verificar dark/light mode en todas las pantallas y navegación

#### Phase 5: Base de la App y Conexión API
**Goal**: Establecer la estructura base de la app con rutas, layouts y conexión a la API
**Depends on**: Phase 2, Phase 4
**Requirements**: [Conexión con la API - Rúbrica Base Inicial]
**Success Criteria** (what must be TRUE):
  1. Rutas configuradas con expo-router: `(auth)/` y `(app)/` groups
  2. Layouts raíz y de tabs implementados
  3. Servicio de API configurado en `src/services/api.ts`
  4. Al menos una pantalla funcional conectada a la API
  5. Estructura de carpetas completa según requerimiento del profesor
**Plans**: 4 plans

Plans:
- [x] 05-01: Configurar rutas expo-router y layouts
- [x] 05-02: Implementar servicio de API base
- [x] 05-03: Crear pantallas base (login placeholder, dashboard placeholder)
- [x] 05-04: Integrar navegación con design system

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Arquitectura y Diseño | v1.0 | 2/2 | Complete | 2026-04-02 |
| 2. Diseño de Datos | v1.0 | 2/2 | Complete | 2026-04-03 |
| 3. Diseño Móvil (Mockups) | v1.0 | 2/2 | Complete | 2026-04-03 |
| 4. Design System y Estructura Visual | v1.0 | 3/3 | Complete | 2026-04-03 |
| 5. Base de la App y Conexión API | v1.0 | 4/4 | Complete | 2026-04-03 |
| 6. Refactorización de Estilos | v1.0 | 3/3 | Complete | 2026-04-04 |
| 7. Verificación de Design System | v1.0 | 0/2 | Not started | - |
