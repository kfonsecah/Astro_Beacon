# Astro_Beacon

## What This Is

Aplicación móvil de exploración planetaria para la materia EIF411 (UNACR). Simula la asistencia a una astronauta varada en un planeta desconocido, proporcionando herramientas de supervivencia: bitácora de descubrimientos, gestión de recursos, navegación GPS, y funcionalidades offline.

## Core Value

Ayudar al astronauta a sobrevivir en un planeta desconocido mediante información accesible, gestión de recursos y comunicación con la Tierra.

## Current Milestone: v1.2 Integración API-Frontend

**Goal:** Conectar el frontend React Native/Expo con el backend Node.js/Express existente, integrando todas las pantallas actuales con sus respectivos endpoints (sin crear nuevos endpoints ni pantallas).

**Target features:**
- Auditar y listar todos los endpoints existentes en el backend
- Identificar pantallas frontend mockeadas que necesitan datos reales
- Integrar endpoints de autenticación (register, login, refresh token)
- Integrar endpoints de dominio (astronauts, resources, logbook, species, trips, supplies)
- Aplicar patrones de programación: servicios, capas de abstracción, manejo de errores
- Asegurar que todas las pantallas existentes consuman datos reales del API

## Requirements

### Validated

| Requirement | Phase | Status |
|-------------|-------|--------|
| Bitácora de lo desconocido | v1.0 | Complete |
| Gestión de recursos | v1.0 | Complete |
| Recursos y viajes | v1.0 | Complete |
| Pantalla principal | v1.0 | Complete |
| Diseño y estilos | v1.0 | Complete |

### Active

- [ ] API REST con Node.js + Express v4
- [ ] Autenticación (register, login, JWT, sesión)
- [ ] Endpoints de dominio (astronautas, recursos, bitácora, especies, viajes, suministros)
- [ ] Conexión a base de datos y modelos
- [ ] Middleware de seguridad (JWT, validación)
- [ ] Manejo de errores y documentación de API
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

- Frontend móvil (ya implementado en v1.0)
- Funcionalidades web-only (siempre React Native compatible)

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

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

## Design System

**Regla absoluta:** TODO el código UI debe usar el design system. Cero valores hardcodeados.

### Ubicación
- **Constants:** `src/constants/` — `colors.ts`, `spacing.ts`, `typography.ts`
- **Themes:** `src/theme/` — `dark.ts`, `light.ts`, `fonts.ts`
- **Components:** `src/components/ui/` — Button, Card, Input, Badge, ProgressBar, EmptyState, HudHeader
- **Common:** `src/components/common/` — OfflineBanner

### Cómo usar
```tsx
// ❌ NUNCA hacer esto
backgroundColor: '#0B1120'
padding: 16
color: '#6EE7B7'

// ✅ SIEMPRE hacer esto
const theme = useTheme();
const { colors: tc } = theme;
backgroundColor: tc.background
padding: theme.spacing.lg  // o 16 si no hay spacing token
color: tc.primary
```

### Paleta (dark theme)
| Token | Valor | Uso |
|-------|-------|-----|
| `background` | `#0B1120` | Fondo principal |
| `surface` | `#111827` | Tarjetas |
| `primary` | `#6EE7B7` | Acentos, headers |
| `warning` | `#FB923C` | Alertas |
| `danger` | `#EF4444` | Errores, crítico |
| `success` | `#22C55E` | Éxito, ingresos |
| `text` | `#E5E7EB` | Texto principal |
| `textMuted` | `#6B7280` | Texto secundario |

### Estética HUD
- Zero border-radius (esquinas rectas)
- Tipografía monospace con letter-spacing amplio
- Barras de progreso segmentadas
- Bordes sutiles (`#1F2937`)
- Overlays de scanlines (decorativo)

## Cross-Platform (iOS + Android)

**La app debe funcionar correctamente en ambas plataformas.**

### Consideraciones obligatorias
| Aspecto | iOS | Android |
|---------|-----|---------|
| **KeyboardAvoidingView** | `behavior="padding"` + `keyboardVerticalOffset={60}` | `behavior={undefined}` |
| **SafeAreaView** | Respeta notch y home indicator | Respeta status bar y navegación |
| **StatusBar** | `style="light"` (dark bg) | `style="light"` (dark bg) |
| **Haptic feedback** | `expo-haptics` nativo | `expo-haptics` funciona igual |
| **Fonts** | System monospace fallback | System monospace fallback |
| **Touch targets** | Mínimo 44x44pt | Mínimo 48x48dp |
| **Elevation** | Usar `elevation` + sombra | `elevation` nativo de Android |

### Patrón recomendado
```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : undefined}
  keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
>
```

### Testing
- Probar en iOS Simulator (iPhone 15)
- Probar en Android Emulator (Pixel 7)
- Verificar que el teclado no tapa inputs en ambas plataformas
- Verificar que SafeAreaView funciona en notch y sin notch

## Constraints

- **[Tech Stack]**: React Native con Expo - obligatorio mantener compatibilidad con Expo en todo momento
- **[Versiones]**: Mantener versiones compatibles con Expo; no romper dependencias del scaffold inicial
- **[Plataforma]**: Siempre React Native - no usar librerías web-only
- **[Librerías]**: Permitidas las que sean necesarias, siempre que sean compatibles con Expo
- **[Estilo visual]**: Replicar el estilo del proyecto `astro-beacon-reference/`
- **[Estructura]**: Seguir la estructura de carpetas definida por la cátedra (ver Project Structure)
- **[Design System]**: Obligatorio usar el design system para TODA la UI — cero valores hardcodeados (ver sección Design System arriba)
- **[Cross-Platform]**: La app debe funcionar en iOS y Android — usar `Platform.OS` para diferencias específicas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar Expo como base | Requisito del curso, facilita desarrollo y deployment | ✓ Good |
| TypeScript obligatorio | Requisito del curso, mejor mantenibilidad | ✓ Good |
| Referencia visual de Lovable | Acelera diseño, mantiene coherencia visual | ✓ In progress |
| IA asistida en desarrollo | Requisito explícito del curso | ✓ In progress |
| New Architecture enabled | Reanimated 4 no necesita babel plugin | ✓ Good |
| Cross-platform iOS + Android | Requisito del curso | ✓ Good |
| API REST con Node + Express v4 | Requisito del curso para Entrega 2 | ✓ Planned |

---
*Last updated: 2026-04-27 — Milestone v1.2 Integración API-Frontend started*
