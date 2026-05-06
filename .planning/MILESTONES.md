# Milestones: Astro_Beacon

Track what shipped in each milestone.

---

## v1.0 Base Inicial — COMPLETE ✓

**Date:** 2026-04-04
**Goal:** Cumplir con los criterios de la primera entrega (10%): arquitectura y diseño del trabajo, diseño de datos, diseño móvil (mockups), y una base de la app con conexión a la API.

**Phases Completed:**
- Phase 1: Arquitectura y Diseño del Sistema ✓
- Phase 2: Diseño de Datos ✓
- Phase 3: Diseño Móvil (Mockups) ✓
- Phase 4: Design System y Estructura Visual ✓
- Phase 5: Base de la App y Conexión API ✓
- Phase 6: Refactorización de Estilos ✓
- Phase 7: Verificación de Design System ✓

**Deliverables:**
- Arquitectura documentada en `docs/ARCHITECTURE-DESIGN.md`
- Diseño de datos en `docs/DATA-DESIGN.md`
- Mockups en `docs/MOCKUPS.md`
- Design system implementado (colors, spacing, typography, themes)
- Componentes UI base (Button, Card, Input, Badge, ProgressBar, EmptyState, HudHeader)
- Estructura de carpetas según requerimiento del profesor
- API service configurado en `src/services/api.ts`

---

## v1.1 Aplicación Base — IN PROGRESS 🚧

**Date:** 2026-04-16 (started)
**Goal:** Implementar una API REST funcional con Node.js + Express v4 para soportar todas las funcionalidades de la app móvil.

**Target Phases:**
- Phase 8: API Setup y Estructura (foundation)
- Phase 9: Autenticación (register, login, JWT)
- Phase 10: Endpoints de Dominio (all CRUD operations)
- Phase 11: Offline Sync y Middleware (delta sync, bulk sync)
- Phase 12: Documentación y Testing (API docs, unit tests)

**Requirements Coverage:**
| Category | Count | Phase |
|----------|-------|-------|
| API Foundation | 6 | Phase 8 |
| Authentication | 5 + 2 security | Phase 9 |
| Domain Entities | 22 + timestamps | Phase 10 |
| Offline Sync | 2 endpoints | Phase 11 |
| Documentation | 3 | Phase 12 |

**Status:** Roadmap defined, ready for Phase 8 planning

---

## v1.2 Defensa Final — IN PROGRESS 🚧

**Date:** 2026-06-03
**Goal:** Completar todas las funcionalidades del proyecto incluyendo detección de especies por IA con cámara, narración por audio, bugfixes críticos, y limpieza de código.

**Target Phases:**
- Phase 19: Critical Bug Fixes (trip activation, pagination)
- Phase 22: Code Cleanup (dead code, dev artifacts)
- Phase 23: Backend AI Identify Endpoint (Google Cloud Vision)
- Phase 24: Species Detail Screen + Camera Setup (expo-image-picker)
- Phase 25: AI Flow + Audio Narration (expo-speech)
- Phase 26: Gestures + Log Resource Screen ✓

**Key Deliverables:**
- `species/[id].tsx` — Pantalla de detalle de especie con foto, clasificación, audio
- `species/identify.tsx` — Modal de identificación IA con cámara (per MOCKUPS.md)
- `log-resource/index.tsx` — Formulario de movimiento de recursos (per MOCKUPS.md)
- Clasificación automática de especies por IA (Google Cloud Vision)
- Captura de foto con compresión (expo-image-picker, quality: 0.4)
- Narración por audio de especies descubiertas (expo-speech)
- Mínimo 2 gestos con react-native-gesture-handler (requisito del curso)
- Base64 de imágenes almacenadas en MongoDB Atlas M0

**Status:** Phases 23-26 planned 2026-05-05
