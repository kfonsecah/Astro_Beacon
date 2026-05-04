# Phase 20: Design System Compliance - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Eliminar todos los colores hex hardcodeados introducidos en las Fases 17 en `map.tsx` y `trips.tsx`, extendiendo `colors.ts` con las constantes de dominio faltantes.

La Fase 07 estableció el invariante: cero valores hex en `app/` y `src/components/` fuera de `src/constants/` y `src/theme/`. Las fases posteriores (16, 17) introdujeron nuevos mapas de colores con valores Material Design hardcodeados que no estaban en `colors.ts`.

**Violaciones actuales:**
- `app/(tabs)/map.tsx:15-34` — `statusColorMap` (supply status) y `categoryConfig` (6 categorías de suministro) con hex hardcodeados
- `app/(tabs)/map.tsx:363` — `shadowColor: '#000'`
- `app/trips.tsx:11-14` — `statusColorMap` (trip status) con hex hardcodeados
- `app/reanimated-test.tsx` — múltiples hex hardcodeados (archivo de dev, se limpia en Phase 22)

**In scope:**
- Agregar constantes faltantes en `src/constants/colors.ts`
- Reemplazar todos los hex hardcodeados en `map.tsx` y `trips.tsx` con referencias a `colors.*`

**Out of scope:**
- NO modificar `src/theme/dark.ts` ni `src/theme/light.ts`
- NO tocar `reanimated-test.tsx` (se elimina en Phase 22)
- NO cambiar lógica, layout ni comportamiento de las pantallas
</domain>

<decisions>
## Implementation Decisions

### Extensión de colors.ts

- **D-01:** Agregar sección `// Trip status` con 4 nuevas constantes: `tripPlanificado`, `tripActivo`, `tripCompletado`, `tripAbortado`
- **D-02:** Agregar sección `// Supply category` con 6 nuevas constantes: `categoryOxigeno`, `categoryAgua`, `categoryComida`, `categoryMedico`, `categoryEquipo`, `categoryOtro`
- **D-03:** Los valores de trip status deben alinearse con el sistema semántico existente: `tripPlanificado` usa `warning` palette, `tripActivo` usa `success`, `tripCompletado` usa `info`, `tripAbortado` usa `danger`
- **D-04:** Los valores de supply category son colores de dominio específicos que no tienen equivalente semántico exacto — se definen como constantes nuevas con valores que encajan en el palette dark HUD del proyecto (no Material Design genérico)
- **D-05:** `shadowColor` en el floating button de `map.tsx` → usar `colors.overlayDark` (ya existe) o definir `shadowBlack: '#000000'` si se necesita negro puro para shadow en iOS

### Reemplazo en map.tsx

- **D-06:** `statusColorMap` en `map.tsx` → reemplazar los 4 valores con `colors.supplyPendiente`, `colors.supplyEntregado`, `colors.supplyRecogido`, `colors.supplyExpirado` (ya existen en colors.ts)
- **D-07:** `categoryConfig` en `map.tsx` → reemplazar los 6 valores `color` con las nuevas constantes `colors.category*`
- **D-08:** `shadowColor: '#000'` → reemplazar con `colors.overlayDark` o nueva constante

### Reemplazo en trips.tsx

- **D-09:** `statusColorMap` en `trips.tsx` → reemplazar los 4 valores con las nuevas constantes `colors.trip*`

### The Agent's Discretion
- Valores exactos de los nuevos colores de categoría (deben armonizar con el palette existente del proyecto)
- Si usar `overlayDark` para shadow o agregar constante nueva
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Archivo de constantes (modificar)
- `src/constants/colors.ts` — fuente de verdad de colores; agregar las nuevas secciones ANTES de tocar pantallas

### Archivos de pantalla (modificar)
- `app/(tabs)/map.tsx` — `statusColorMap` (líneas 14-19), `categoryConfig` (líneas 28-35), `shadowColor` (línea ~363)
- `app/trips.tsx` — `statusColorMap` (líneas 11-14)

### Referencia del design system
- `src/theme/dark.ts` — ver la paleta base para asegurar que los nuevos colores armonizan
- `src/theme/light.ts` — idem
- `src/hooks/use-theme.ts` — no se modifica; los colores de dominio van en constants, no en theme

### Colores existentes relevantes en colors.ts
- `supplyPendiente: '#F59E0B'` — ya existe para supply status pendiente
- `supplyEntregado: '#22C55E'` — ya existe
- `supplyRecogido: '#6B7280'` — ya existe
- `supplyExpirado: '#EF4444'` — ya existe
- `success`, `warning`, `danger`, `info` — base semántica para trip status colors
- `overlayDark: 'rgba(11, 17, 32, 0.8)'` — candidato para shadow

### Verificación post-implementación
- Grep: `Select-String -Path "app\**\*.tsx" -Pattern '#[0-9a-fA-F]{3,8}'` debe retornar 0 resultados en `map.tsx` y `trips.tsx`

### Requirements
- `.planning/REQUIREMENTS.md` — invariante de Fase 07: "Cero colores hex hardcodeados en app/ y src/components/ (excepto constants/ y theme/)"
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `colors.ts` ya tiene la estructura de secciones comentadas — seguir el mismo patrón al agregar
- El import de `colors` en las pantallas: `import { colors } from '@/constants/colors'` — ya existe en `OfflineBanner.tsx` como referencia de cómo importar

### Established Patterns
- Las pantallas usan `tc.*` (theme colors via `useTheme()`) para colores UI generales
- Las pantallas usan `colors.*` (constants) para colores de dominio semántico (clasificación, peligro, estado)
- `categoryConfig` en `map.tsx` tiene estructura `{ symbol: string, color: string }` — el `color` es el que se reemplaza, el `symbol` queda igual

### Integration Points
- `categoryConfig[category].color` se usa en: color de borde del Marker (línea ~299), `pinColor` del Marker (línea ~299)
- `statusColorMap` se usa en: color del badge de estado en la lista, `getStatusColor()` helper function
- Ambas pantallas ya importan lo que necesitan — solo agregar import de `colors` si no está

### Gotchas conocidos
- `map.tsx` actualmente NO importa `colors` desde constants — hay que agregar el import
- `trips.tsx` actualmente NO importa `colors` desde constants — hay que agregar el import
- Los valores `+33` para transparencia en badges (ej: `getStatusColor(item.status) + "33"`) seguirán funcionando con las nuevas constantes ya que son concatenación de string hex
</code_context>

<specifics>
## Specific Ideas

Valores sugeridos para las nuevas constantes que armonizan con el HUD dark palette del proyecto:

**Trip status** (alineados con semántica existente):
- `tripPlanificado: '#F59E0B'` — mismo que `warning` (amber, indica "pendiente de acción")
- `tripActivo: '#22C55E'` — mismo que `success` (verde, activo/en progreso)
- `tripCompletado: '#3B82F6'` — mismo que `info` (azul, finalizado)
- `tripAbortado: '#EF4444'` — mismo que `danger` (rojo, fallido/cancelado)

**Supply categories** (específicos de dominio, encajan en palette oscuro):
- `categoryOxigeno: '#22D3EE'` — cyan claro (aire/gas), cerca del primary del tema
- `categoryAgua: '#3B82F6'` — azul (agua), mismo que `info`
- `categoryComida: '#84CC16'` — verde lima (alimento/orgánico)
- `categoryMedico: '#EC4899'` — rosa (médico/urgente)
- `categoryEquipo: '#FB923C'` — naranja (herramientas), mismo que `warning`
- `categoryOtro: '#6B7280'` — gris, mismo que `textMuted`
</specifics>

<deferred>
## Deferred Ideas

- Aplicar el mismo scan de compliance a `src/components/` de nuevas fases (cuando se creen nuevos componentes)
- Agregar lint rule automática para prevenir hex hardcodeados en el futuro (eslint-plugin-no-hardcoded-colors o similar)
</deferred>

---
*Phase: 20-design-system-compliance*
*Context gathered: 2026-05-04*
