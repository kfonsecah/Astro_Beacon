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

## Project Structure

Estructura oficial definida por la cátedra (obligatoria):

```
project/
├── app/                          # Rutas principales (expo-router)
│   ├── (auth)/                   # Grupo de rutas públicas
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (app)/                    # Grupo de rutas protegidas
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── profile.tsx
│   │   
│   └── _layout.tsx               # Layout raíz
│
├── src/                          # Lógica de la app
│   ├── components/               # Componentes reutilizables
│   │   ├── ui/                   # Botones, inputs, etc.
│   │   ├── common/               # Headers, footers, etc.
│   │
│   ├── hooks/                    # Custom hooks
│   ├── services/                 # APIs y servicios externos
│   │   ├── api.ts                # Configuración base
│   │
│   ├── context/                  # Context API y state global
│   ├── constants/                # Constantes de la app
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── api.ts
│   │
│   ├── theme/                    # Sistema de temas
│   │   ├── colors.ts
│   │   ├── fonts.ts
│   │   ├── dark.ts
│   │   └── light.ts
│   │
│   ├── types-dtos/               # TypeScript types/interfaces
│   ├── utils/                    # Funciones auxiliares
│   └── screens/                  # Pantallas
│       └── UserProfile/
│           ├── UserProfile.tsx
│           └── UserProfile.styles.ts
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── package.json
```

## Constraints

- **[Tech Stack]**: React Native con Expo - obligatorio mantener compatibilidad con Expo en todo momento
- **[Versiones]**: Mantener versiones compatibles con Expo; no romper dependencias del scaffold inicial
- **[Plataforma]**: Siempre React Native - no usar librerías web-only
- **[Librerías]**: Permitidas las que sean necesarias, siempre que sean compatibles con Expo
- **[Estilo visual]**: Replicar el estilo del proyecto `astro-beacon-reference/`
- **[Estructura]**: Seguir la estructura de carpetas definida por la cátedra (ver Project Structure)
- **[Design System]**: Obligatorio usar un design system consistente para toda la UI (colores, tipografía, espaciado, componentes reutilizables) — definido en `src/constants/` y `src/theme/`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar Expo como base | Requisito del curso, facilita desarrollo y deployment | ✓ Good |
| TypeScript obligatorio | Requisito del curso, mejor mantenibilidad | ✓ Good |
| Referencia visual de Lovable | Acelera diseño, mantiene coherencia visual | — Pending |
| IA asistida en desarrollo | Requisito explícito del curso | — Pending |

---
*Last updated: 2026-04-01 after project initialization*
