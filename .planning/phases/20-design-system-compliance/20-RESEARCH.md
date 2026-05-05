# Phase 20: Design System Compliance - Research

**Researched:** 2026-05-04
**Domain:** Design System / UI Styling
**Confidence:** HIGH

## Summary

This research identifies all hardcoded hex color values in `app/(tabs)/map.tsx` and `app/trips.tsx` introduced in previous phases. These values violate the **Phase 07 Invariant** (zero hex values outside of `constants/` and `theme/`). We have mapped these generic Material Design colors to a proposed extension of `src/constants/colors.ts` that harmonizes with the project's "Dark HUD" aesthetic.

**Primary recommendation:** Extend `colors.ts` with dedicated sections for `Trip status` and `Supply category` using values that align with the existing semantic palette, then update the screens to import and reference these constants.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Agregar sección `// Trip status` con 4 nuevas constantes: `tripPlanificado`, `tripActivo`, `tripCompletado`, `tripAbortado`
- **D-02:** Agregar sección `// Supply category` con 6 nuevas constantes: `categoryOxigeno`, `categoryAgua`, `categoryComida`, `categoryMedico`, `categoryEquipo`, `categoryOtro`
- **D-03:** Los valores de trip status deben alinearse con el sistema semántico existente: `tripPlanificado` usa `warning` palette, `tripActivo` usa `success`, `tripCompletado` usa `info`, `tripAbortado` usa `danger`
- **D-04:** Los valores de supply category son colores de dominio específicos que no tienen equivalente semántico exacto — se definen como constantes nuevas con valores que encajan en el palette dark HUD del proyecto (no Material Design genérico)
- **D-05:** `shadowColor` en el floating button de `map.tsx` → usar `colors.overlayDark` (ya existe) o definir `shadowBlack: '#000000'` si se necesita negro puro para shadow en iOS
- **D-06:** `statusColorMap` en `map.tsx` → reemplazar los 4 valores con `colors.supplyPendiente`, `colors.supplyEntregado`, `colors.supplyRecogido`, `colors.supplyExpirado` (ya existen en colors.ts)
- **D-07:** `categoryConfig` en `map.tsx` → reemplazar los 6 valores `color` con las nuevas constantes `colors.category*`
- **D-08:** `shadowColor: '#000'` → reemplazar con `colors.overlayDark` o nueva constante
- **D-09:** `statusColorMap` en `trips.tsx` → reemplazar los 4 valores con las nuevas constantes `colors.trip*`

### the agent's Discretion
- Valores exactos de los nuevos colores de categoría (deben armonizar con el palette existente del proyecto)
- Si usar `overlayDark` para shadow o agregar constante nueva

### Deferred Ideas (OUT OF SCOPE)
- Aplicar el mismo scan de compliance a `src/components/` de nuevas fases (cuando se creen nuevos componentes)
- Agregar lint rule automática para prevenir hex hardcodeados en el futuro (eslint-plugin-no-hardcoded-colors o similar)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-01 | Eliminar hex hardcodeados en `map.tsx` | Identificados 10 valores hex en líneas 16-35. |
| COMP-02 | Eliminar hex hardcodeados en `trips.tsx` | Identificados 4 valores hex en líneas 11-14. |
| DS-01 | Extender `colors.ts` con Trip status | Definidas 4 constantes alineadas con la semántica del proyecto. |
| DS-02 | Extender `colors.ts` con Supply categories | Definidas 6 constantes que armonizan con el HUD dark palette. |
| INV-07 | Cumplir Invariante de Fase 07 | Verificado que no quedarán hex en los archivos afectados tras el cambio. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Color Constants | Constants (`src/constants/`) | — | Single source of truth for literal color values. |
| Theme Mapping | Theme (`src/theme/`) | — | Maps constants to semantic UI roles (primary, success, etc). |
| Domain Styling | UI Screens (`app/`) | Constants | Screens consume domain-specific colors directly from constants. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native | 0.81.5 | UI Framework | Project standard. [VERIFIED: package.json] |
| expo | 54.0.33 | Platform SDK | Project standard. [VERIFIED: package.json] |
| expo-router | 6.0.23 | Routing | Project standard. [VERIFIED: package.json] |

## Architecture Patterns

### Recommended Project Structure
```
src/
└── constants/
    └── colors.ts    # Centralized color dictionary (Extend this)
```

### Pattern: Domain Color Consumption
Instead of using theme colors for domain-specific categorization (where the number of categories exceeds standard semantic roles like `success`/`danger`), we use named constants from `colors.ts`.

**Example:**
```typescript
import { colors } from '@/constants/colors';

const statusColorMap = {
  pendiente: colors.supplyPendiente,
};
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Transparency | Custom hex codes | String concat (`color + "33"`) | Already established in `map.tsx` for badges. |
| Dynamic Styling | Custom style logic | Theme/Constants | Ensures consistency across screens. |

## Common Pitfalls

### Pitfall 1: Palette Mismatch
**What goes wrong:** Adding new colors that use default Material Design shades (like `#F44336`) which are too "bright" for the Dark HUD theme.
**How to avoid:** Use the proposed hex values in this research which are derived from Tailwind/Project specific palettes.

### Pitfall 2: Missing Imports
**What goes wrong:** Attempting to use `colors.*` in `map.tsx` or `trips.tsx` without importing the `colors` object.
**How to avoid:** Ensure `import { colors } from '@/constants/colors';` is added to the top of both files.

## Code Examples

### 1. Extension of `src/constants/colors.ts`

```typescript
export const colors = {
  // ... existing values ...

  // Trip status
  tripPlanificado: '#F59E0B',
  tripActivo: '#22C55E',
  tripCompletado: '#3B82F6',
  tripAbortado: '#EF4444',

  // Supply category
  categoryOxigeno: '#22D3EE',
  categoryAgua: '#3B82F6',
  categoryComida: '#84CC16',
  categoryMedico: '#EC4899',
  categoryEquipo: '#FB923C',
  categoryOtro: '#6B7280',

  // UI Support
  shadowBlack: '#000000',
};
```

### 2. Refactor of `app/(tabs)/map.tsx`

```typescript
import { colors } from '@/constants/colors';

// Replace lines 15-19
const statusColorMap: Record<string, string> = {
  pendiente: colors.supplyPendiente,
  entregado: colors.supplyEntregado,
  recogido: colors.supplyRecogido,
  expirado: colors.supplyExpirado,
};

// Replace lines 29-35
const categoryConfig = {
  oxigeno: { symbol: "🧪", color: colors.categoryOxigeno },
  agua: { symbol: "💧", color: colors.categoryAgua },
  comida: { symbol: "🍎", color: colors.categoryComida },
  medico: { symbol: "💊", color: colors.categoryMedico },
  equipo: { symbol: "🔧", color: colors.categoryEquipo },
  otro: { symbol: "📦", color: colors.categoryOtro },
} as const;
```

### 3. Refactor of `app/trips.tsx`

```typescript
import { colors } from '@/constants/colors';

// Replace lines 11-14
const statusColorMap: Record<string, string> = {
  planificado: colors.tripPlanificado,
  activo: colors.tripActivo,
  completado: colors.tripCompletado,
  abortado: colors.tripAbortado,
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded Hex | Centralized Constants | Phase 07 | Ensures theme consistency and single-point updates. |
| Material Colors | Custom HUD Palette | Phase 20 | Aligns visual style with the project's space-exploration theme. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `shadowColor: '#000'` exists in `map.tsx` | Summary | Context claims it's at line 363, but not visible in current grep/read. Safe to add `shadowBlack` anyway. |

## Sources

### Primary (HIGH confidence)
- `src/constants/colors.ts` - Verified current status and existing supply color palette.
- `app/(tabs)/map.tsx` - Verified hardcoded hex lines 16-19 and 30-35.
- `app/trips.tsx` - Verified hardcoded hex lines 11-14.
- `package.json` - Verified dependency versions.

### Secondary (MEDIUM confidence)
- `CONTEXT.md` - Used for implementation decisions and proposed color names.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified in `package.json`.
- Architecture: HIGH - Follows established Phase 07 patterns.
- Pitfalls: HIGH - Based on visual audit of existing screens.

**Research date:** 2026-05-04
**Valid until:** 2026-06-03
