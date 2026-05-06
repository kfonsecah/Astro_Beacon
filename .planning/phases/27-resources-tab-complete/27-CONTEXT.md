# Phase 27: Resources Tab — Fix, Complete & Enhance

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

El tab de Recursos (`app/(tabs)/resources.tsx`) existe y está conectado a la API desde la Fase 16, pero contiene **bugs críticos de renderizado y cálculo** que hacen que la pantalla sea funcionalmente incorrecta. Adicionalmente, `app/log-resource/index.tsx` (implementada en Fase 26) carece de validación de egreso del lado del cliente.

Esta fase cierra completamente los requerimientos **UI-04** y **UI-05** (resources list + resource detail level), **LOGR-01** (log-resource funcional), y **DOM-03** (maxCapacity ausente del DTO).

### Bugs confirmados (auditados en código real)

**Bug B-01 — ProgressBar `max` incorrecto (`resources.tsx` línea 120)**
```tsx
// ACTUAL (INCORRECTO):
const max = item.threshold ? item.threshold * 2 : 100;
// item.threshold es el umbral de alerta (ej. 15), no la capacidad máxima.
// Resultado: max = 30 cuando threshold = 15, lo que da lecturas absurdas.

// CORRECTO:
const max = item.maxCapacity ?? 100;
// Requiere añadir maxCapacity al DTO de Recurso.
```

**Bug B-02 — Historial de movimientos fuera del FlatList (`resources.tsx` líneas 159-184)**
```tsx
// Actualmente el bloque está DESPUÉS del cierre </FlatList>.
// No es scrollable, aparece cortado bajo el FAB, y no está relacionado
// visualmente con la card del recurso correspondiente.
// Fix: mover el historial dentro de renderItem, bajo la barra de progreso.
```

**Bug B-03 — Colores hardcodeados en sección de alertas (`resources.tsx` línea 103)**
```tsx
// ACTUAL (viola Design System Invariante Fase 07):
backgroundColor: "rgba(251,146,60,0.1)", borderColor: "rgba(251,146,60,0.3)"
// CORRECTO: usar tokens del tema.
// warningMuted y warningBorder existen en colors.ts pero NO en darkTheme.
// Fix: extender darkTheme y lightTheme para exponer estos tokens.
```

**Bug B-04 — `maxCapacity` ausente del DTO `Recurso`**
El modelo de datos (docs/DATA-DESIGN.md §2.2) define `capacidadMaxima: number`.
El backend lo devuelve en la respuesta, pero `src/types-dtos/recurso.dto.ts` no lo mapea.
Sin este campo, la barra de progreso no puede calcular el porcentaje real.

**Bug B-05 — `keyExtractor` con cast inseguro (`resources.tsx` línea 83)**
```tsx
// ACTUAL:
keyExtractor={(item: Recurso) => item.id ?? (item as any)._id ?? item.name ?? `resource-fallback`}
// Puede generar duplicados si dos recursos tienen el mismo nombre.
// CORRECTO:
keyExtractor={(item, index) => item.id ?? `resource-${index}`}
```

**Bug B-06 — Egreso sin validación de cantidad disponible (`log-resource/index.tsx`)**
El formulario permite ingresar una cantidad de egreso mayor a `item.currentAmount`.
El backend rechaza esto, pero el usuario no recibe feedback hasta el error de API.
Fix: añadir validación cliente antes de `mutateAsync`.

### Mejoras planificadas (no bugs, pero necesarias para "funcionalmente completo")

**M-01 — Icono y color de categoría por recurso**
`colors.ts` ya tiene `categoryOxigeno`, `categoryAgua`, etc. (líneas 66-74).
Las cards de recurso no los usan. Añadir un símbolo y color lateral por categoría.

**M-02 — Mostrar cantidad actual vs. máxima como texto**
Actualmente se muestra `{current}/{max} {unit}` pero `max` es incorrecto (B-01).
Una vez corregido el DTO, mostrar correctamente: `23.5 L / 100 L`.

**M-03 — Selector de recurso en log-resource muestra cantidad disponible**
Los chips de selección de recurso solo muestran el nombre.
Mostrar `NOMBRE (23.5 L)` para que el usuario sepa si puede hacer un egreso.

**M-04 — Extender tema con tokens warningMuted / warningBorder**
Requerido para fix B-03. Modificar `dark.ts`, `light.ts` y el tipo de tema.

</domain>

<decisions>
## Implementation Decisions

### Plan 27-01: Corrección de bugs críticos

- **D-01:** Añadir `maxCapacity?: number` a `Recurso` en `src/types-dtos/recurso.dto.ts`. Campo opcional porque versiones viejas de la API podrían no retornarlo.
- **D-02:** En `resources.tsx`, usar `item.maxCapacity ?? (item.threshold ? item.threshold / 0.15 : 100)` como fallback razonable si `maxCapacity` aún no llega de la API. El 15% es el `umbralAlerta` por defecto según DATA-DESIGN.md §2.2.
- **D-03:** `thresholdPercentage` debe calcularse como `max > 0 ? (item.threshold / max) * 100 : 15`. Actualmente usa el mismo `max` incorrecto.
- **D-04:** El historial de movimientos se mueve dentro de `renderItem`, colapsado bajo la barra de progreso con un separador visual.
- **D-05:** Añadir `warningMuted` y `warningBorder` al objeto de colores en `dark.ts` y `light.ts`, y al tipo `DarkTheme`. Se leen de `colors.warningMuted` y `colors.warningBorder` (ya definidos en constants/colors.ts).
- **D-06:** `keyExtractor` simplificado: `(item, index) => item.id ?? \`resource-\${index}\``.
- **D-07:** No modificar `ProgressBar.tsx` — la corrección se hace en los props que se le pasan.

### Plan 27-02: Enhancements de UX

- **D-08:** Mapa de categoría → color y símbolo de texto:
  ```ts
  const CATEGORY_CONFIG = {
    oxigeno:  { color: colors.categoryOxigeno, symbol: 'O2' },
    agua:     { color: colors.categoryAgua,    symbol: 'H2O' },
    comida:   { color: colors.categoryComida,  symbol: 'ALI' },
    medico:   { color: colors.categoryMedico,  symbol: 'MED' },
    equipo:   { color: colors.categoryEquipo,  symbol: 'EQP' },
    otro:     { color: colors.categoryOtro,    symbol: 'OTR' },
  }
  ```
  Se aplica como borde izquierdo coloreado en la card del recurso (pattern consistente con Toast y ErrorFallback).
- **D-09:** Validación de egreso en `log-resource`: antes de `mutateAsync`, verificar que `parsedAmount <= selectedResource.currentAmount`. Mostrar error via `setValidationError` (ya existe en el componente tras Fase 26).
- **D-10:** Para mostrar `currentAmount` en el selector de chips, necesitamos acceso al objeto `Recurso` completo (no solo el `id`). Cambiar `selectedResourceId: string` por `selectedResource: Recurso | null` para tener el objeto completo disponible para validación y display.
- **D-11:** El chip de recurso en log-resource muestra: `NOMBRE (23.5 unidad)` cuando hay currentAmount disponible.
- **D-12:** No implementar Resource Detail Screen (`UI-05`) en esta fase — es una pantalla nueva que requiere su propio plan. Queda como deferred.

</decisions>

<canonical_refs>
## Canonical References

### Archivos afectados directamente
- `src/types-dtos/recurso.dto.ts` — Añadir `maxCapacity?: number` a `Recurso`
- `src/theme/dark.ts` — Añadir `warningMuted`, `warningBorder`
- `src/theme/light.ts` — Añadir `warningMuted`, `warningBorder`
- `app/(tabs)/resources.tsx` — Fix B-01, B-02, B-03, B-05 + M-01, M-02
- `app/log-resource/index.tsx` — Fix B-06 + M-03, D-10

### Constantes ya disponibles (no crear)
- `src/constants/colors.ts` líneas 27-29: `warningMuted`, `warningBorder` ya definidos
- `src/constants/colors.ts` líneas 66-73: `categoryOxigeno`…`categoryOtro` ya definidos
- `src/types-dtos/enums.ts`: `ResourceCategory` enum con valores lowercase

### Hooks disponibles (no crear)
- `useResources(page, limit)` — `src/hooks/useResources.ts`
- `useResourceAlerts()` — `src/hooks/useResources.ts`
- `useRecordResourceMovement()` — `src/hooks/useResources.ts`

### Backend API shape (confirmado en `resource.service.ts`)
- `GET /resources` → `{ success, data: Recurso[], pagination }`
- `POST /resources/:id/movements` → `{ success, data: Recurso }`
  Payload: `{ type, amount, notes, tripId? }`
  (nota: `resource.service.ts` ya mapea `tipo→type`, `cantidad→amount`, `razon→notes`)

### Requirements trazados
- `UI-04` — Resources list con FlatList + pagination + pull-to-refresh ✓ (ya cumplido, solo corregir bugs)
- `LOGR-01` — log-resource conectada y funcional
- `DOM-03` — `maxCapacity` en el tipo `Recurso`
- `ERR-05` — Form validation errors per-field (parcialmente cubierto por validationError en log-resource)

</canonical_refs>

<code_context>
## Existing Code Insights

### ProgressBar usage pattern (correcto)
```tsx
// Uso correcto una vez corregido max:
const max = item.maxCapacity ?? (item.threshold ? Math.round(item.threshold / 0.15) : 100);
const thresholdPercentage = max > 0 ? (item.threshold / max) * 100 : 15;

<ProgressBar
  value={item.currentAmount}
  max={max}
  criticalThreshold={thresholdPercentage}
  showValue={true}
/>
```

### Historial de movimientos — ubicación correcta (dentro de renderItem)
```tsx
renderItem={({ item }) => {
  const max = item.maxCapacity ?? 100;
  const thresholdPercentage = max > 0 ? (item.threshold / max) * 100 : 15;
  const catConfig = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.otro;
  const movements = item.movements ?? [];

  return (
    <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border,
                   borderLeftWidth: 3, borderLeftColor: catConfig.color, padding: 14, marginBottom: 10 }}>
      {/* Header: símbolo categoría + nombre + cantidad */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: catConfig.color, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 }}>
            {catConfig.symbol}
          </Text>
          <Text style={{ color: tc.textSecondary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>
            {item.name.toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: isCritical ? tc.danger : tc.primary, fontFamily: 'monospace', fontSize: 11 }}>
          {item.currentAmount} / {max} {item.unit}
        </Text>
      </View>
      <ProgressBar value={item.currentAmount} max={max} criticalThreshold={thresholdPercentage} showValue={false} />
      {isCritical && (
        <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginTop: 4 }}>
          NIVEL CRITICO — {Math.round((item.currentAmount / max) * 100)}%
        </Text>
      )}
      {/* Historial inline */}
      {movements.length > 0 && (
        <View style={{ borderTopWidth: 1, borderTopColor: tc.border, marginTop: 10, paddingTop: 10 }}>
          <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, marginBottom: 6 }}>
            ULTIMOS MOVIMIENTOS
          </Text>
          {movements.slice(0, 3).map((mov, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: mov.type === 'ingreso' ? tc.success : tc.danger,
                             fontFamily: 'monospace', fontSize: 11, width: 20 }}>
                {mov.type === 'ingreso' ? '+' : '-'}
              </Text>
              <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 9, flex: 1 }}>
                {mov.amount} {item.unit}
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8 }}>
                {new Date(mov.timestamp).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}}
```

### Egreso validation en log-resource
```tsx
// Añadir en handleRegister, antes de mutateAsync:
if (movementType === 'egreso' && selectedResource && parsedAmount > selectedResource.currentAmount) {
  setValidationError(
    `Solo hay ${selectedResource.currentAmount} ${selectedResource.unit} disponibles de ${selectedResource.name}`
  );
  return;
}
```

### Cambio de selectedResourceId → selectedResource
```tsx
// ANTES:
const [selectedResourceId, setSelectedResourceId] = useState<string>('');
// ...
data: { recursoId: selectedResourceId, ... }

// DESPUES:
const [selectedResource, setSelectedResource] = useState<Recurso | null>(null);
// ...
if (!selectedResource) { setValidationError('...'); return; }
data: { recursoId: selectedResource.id, ... }
```

### Tokens de tema faltantes (dark.ts / light.ts)
```ts
// Añadir a darkTheme.colors y lightTheme.colors:
warningMuted: colors.warningMuted,   // 'rgba(251, 146, 60, 0.1)'
warningBorder: colors.warningBorder, // 'rgba(251, 146, 60, 0.3)'
```

</code_context>

<specifics>
## Specific Notes

- `maxCapacity` en el DTO debe ser `optional` (`maxCapacity?: number`) porque:
  1. El campo puede no venir de versiones previas de la API
  2. El fallback `threshold / 0.15` es razonable para el umbral por defecto del 15%
- Los movimientos se muestran solo los últimos 3 (`movements.slice(0, 3)`) para no inflar las cards
- `warningMuted`/`warningBorder` YA existen en `colors.ts` — solo falta exponerlos en el tema
- El tipo `DarkTheme` (inferido con `typeof darkTheme`) se actualiza automáticamente al añadir los campos
- `log-resource` ya tiene `setValidationError` desde la Fase de toast notifications — solo agregar la nueva regla
- NO crear pantalla de Resource Detail (`UI-05`) en esta fase — queda diferida
- El FAB de resources.tsx a `/log-resource` funciona correctamente, no se toca
- La paginación de resources.tsx ya funciona bien — no se modifica la lógica de acumulación
- El campo de historial en `Recurso` ya existe como `movements: RecursoMovimiento[]` — no cambiar el tipo

</specifics>

<deferred>
## Deferred

- **Resource Detail Screen** (`UI-05`, `app/(tabs)/resources/[id].tsx`) — Pantalla de detalle completa con historial paginado. Requiere fase propia.
- **Optimistic updates** en `useRecordResourceMovement` — INT-01 diferido a v2
- **Selector de viaje con dropdown** en log-resource — simplificado a input de texto per decisión D-18 de Fase 26
- **Agrupación por categoría** en resources.tsx — mejoría visual significativa pero no crítica para la entrega

</deferred>

---

*Phase: 27-resources-tab-complete*
*Context gathered: 2026-05-06*
