# Astro_Beacon

## What This Is

Aplicación móvil de exploración planetaria para la materia EIF411 (UNACR). Simula la asistencia a una astronauta varada en un planeta desconocido, proporcionando herramientas de supervivencia: bitácora de descubrimientos, gestión de recursos, navegación GPS, y funcionalidades offline.

## Core Value

Ayudar al astronauta a sobrevivir en un planeta desconocido mediante información accesible, gestión de recursos y comunicación con la Tierra.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Bitácora de lo desconocido (fotos, clasificación IA, audio, offline)
- [ ] Gestión de recursos (oxígeno, comida, agua, alertas)
- [ ] Recursos y viajes (mapa GPS, consumo de oxígeno, conteo)
- [ ] Pantalla principal con métricas del campamento
- [ ] Seguridad y autenticación
- [ ] Diseño, animaciones y estilos temáticos
- [ ] Gestos (mínimo 2) para procesos clave
- [ ] Uso de IA asistida en desarrollo
- [ ] Offline con sincronización
- [ ] Responsive y rendimiento optimizado

### Out of Scope

- Backend/API completa (se requiere pero el foco es el frontend móvil)
- Funcionalidades web-only (siempre React Native compatible)

## Context

- **Framework**: Expo (React Native + TypeScript)
- **Iniciado con**: `npx create-expo-app@latest Astro_Beacon`
- **Referencia visual**: `astro-beacon-reference/` - Proyecto generado por Lovable (IA) que define el estilo visual a replicar
- **Requerimientos detallados**: `project-requirements.md`
- **Entregas**: 3 etapas (Base Inicial 10%, Aplicación Base 15%, Defensa 20%)

## Constraints

- **[Tech Stack]**: React Native con Expo - obligatorio mantener compatibilidad con Expo en todo momento
- **[Versiones]**: Mantener versiones compatibles con Expo; no romper dependencias del scaffold inicial
- **[Plataforma]**: Siempre React Native - no usar librerías web-only
- **[Librerías]**: Permitidas las que sean necesarias, siempre que sean compatibles con Expo
- **[Estilo visual]**: Replicar el estilo del proyecto `astro-beacon-reference/`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar Expo como base | Requisito del curso, facilita desarrollo y deployment | ✓ Good |
| TypeScript obligatorio | Requisito del curso, mejor mantenibilidad | ✓ Good |
| Referencia visual de Lovable | Acelera diseño, mantiene coherencia visual | — Pending |
| IA asistida en desarrollo | Requisito explícito del curso | — Pending |

---
*Last updated: 2026-04-01 after project initialization*
