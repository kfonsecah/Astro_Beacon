# Phase 26: Gestures + Log Resource Screen - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Dos entregas independientes que cierran los requerimientos pendientes del curso:

1. **Gestos (mínimo 2)** — requerimiento explícito de EIF411. Implementar con `react-native-gesture-handler` (ya instalado en el proyecto):
   - Gesto 1: Swipe-left en cards de bestiary para acción rápida (ej. ver detalle o eliminar)
   - Gesto 2: Long-press en species card para preview rápido de clasificación

2. **`app/log-resource/index.tsx`** — pantalla documentada en MOCKUPS.md §3.10 que no existe. Formulario de movimiento de recurso (ingreso/egreso) conectado a `useRecordResourceMovement` hook existente.

</domain>

<decisions>
## Implementation Decisions

### Gesto 1: Swipe en Bestiary (react-native-gesture-handler Swipeable)
- **D-01:** Usar `Swipeable` de `react-native-gesture-handler` en cada card de `bestiary.tsx`
- **D-02:** Swipe-left revela acción "VER DETALLE" (botón cyan) que navega a `/species/[id]`
- **D-03:** Mantener también el `onPress` normal en la card para navegar al detalle (consistencia)
- **D-04:** Color del action button: `tc.primary` (cyan HUD) con texto blanco
- **D-05:** Ancho del action button: 80px — suficiente para ser presionable con pulgar

### Gesto 2: Long-press en Species Card (react-native-gesture-handler LongPress o TouchableOpacity)
- **D-06:** `TouchableOpacity` con `onLongPress` — muestra un Modal/bottom sheet con preview rápido: nombre, clasificación badge, nivel de peligro
- **D-07:** El modal de preview usa `Modal` de React Native (no librería externa) con animación `fade`
- **D-08:** Dismiss del modal: tap fuera del contenido o botón "CERRAR"
- **D-09:** Este gesto se implementa sobre la misma card de `bestiary.tsx` donde ya existe el Swipeable

### Justificación de gestos para la defensa
- **D-10:** Documentar en pantalla los gestos: pequeño texto muted "← Desliza | Mantén presionado para preview" debajo del header de bestiary
- **D-11:** Los gestos cumplen el criterio del curso: "mínimo 2 gestos para procesos clave" — Swipe (navegación rápida) y Long-press (preview contextual)

### app/log-resource/index.tsx — Formulario de Movimiento de Recurso
- **D-12:** Ruta: `app/log-resource/index.tsx` (per MOCKUPS.md §3.10)
- **D-13:** Navegar desde `resources.tsx`: botón "REGISTRAR MOVIMIENTO" o "+" en el header/FAB
- **D-14:** Campos del formulario:
  - Selector de recurso (lista de recursos existentes — consume `useResources`)
  - Selector de tipo: "INGRESO" | "EGRESO" (botones chip)
  - Input numérico de cantidad
  - Input de razón/descripción (texto libre)
  - Selector opcional de viaje (dropdown con `useTrips` — puede simplificarse a input de texto para el scope)
- **D-15:** Al guardar: llama a `useRecordResourceMovement` hook existente
  ```ts
  mutate({ id: selectedResourceId, data: { type, quantity, reason, tripId? } })
  ```
- **D-16:** Tras guardar exitosamente: `router.back()` + datos de recursos actualizados automáticamente (cache invalidation ya en el hook)
- **D-17:** Validación mínima: recurso seleccionado + cantidad > 0

### Vinculación a viaje (simplificada)
- **D-18:** El campo de viaje es opcional y puede ser un simple Input de texto para el ID de viaje — no es necesario un picker complejo para el scope del proyecto
- **D-19:** Alternativamente: omitir la vinculación a viaje del UI y documentarlo como "funcionalidad completa en backend, UI simplificada"

</decisions>

<canonical_refs>
## Canonical References

### react-native-gesture-handler — ya instalado
- `react-native-gesture-handler ~2.28.0` en package.json — no requiere instalación adicional
- Import: `import { Swipeable } from 'react-native-gesture-handler'`
- `GestureHandlerRootView` ya debe estar en el root layout (verificar en `app/_layout.tsx`)

### Hooks existentes (listos para usar en log-resource)
- `src/hooks/useResources.ts` — `useResources()`, `useRecordResourceMovement()`
- `src/hooks/useTrips.ts` — `useTrips()` para el selector de viaje opcional

### Tipos relevantes
- `src/types-dtos/recurso.dto.ts` — `CreateRecursoMovimientoDTO` (verificar campos: resourceId, type, quantity, reason, tripId?)

### Pantalla de referencia
- `app/(tabs)/resources.tsx` — Dónde añadir el botón/FAB de navegación a `/log-resource`
- `app/(tabs)/bestiary.tsx` — Donde añadir Swipeable y long-press

### MOCKUPS de referencia
- `docs/MOCKUPS.md` §3.10 — Log Resource: selector recurso, tipo, cantidad, razón, vinculación a viaje
- `docs/MOCKUPS.md` §5 — Metáforas móviles documentadas: FAB ya listado como metáfora

### Requirements
- `.planning/REQUIREMENTS.md` §Gestures — GEST-01, GEST-02
- `.planning/REQUIREMENTS.md` §Log Resource — LOGR-01

</canonical_refs>

<code_context>
## Existing Code Insights

### react-native-gesture-handler Swipeable pattern
```tsx
import { Swipeable } from 'react-native-gesture-handler';

const renderRightActions = (speciesId: string) => (
  <TouchableOpacity
    style={{ width: 80, backgroundColor: tc.primary, justifyContent: 'center', alignItems: 'center' }}
    onPress={() => router.push(`/species/${speciesId}`)}
  >
    <Text style={{ color: tc.background, fontFamily: 'monospace' }}>VER</Text>
  </TouchableOpacity>
);

// En el render de cada item:
<Swipeable renderRightActions={() => renderRightActions(item.id)}>
  <TouchableOpacity onLongPress={() => setPreviewSpecies(item)} onPress={() => router.push(`/species/${item.id}`)}>
    {/* card content */}
  </TouchableOpacity>
</Swipeable>
```

### GestureHandlerRootView — verificar en _layout.tsx
```tsx
// app/_layout.tsx debe tener:
import { GestureHandlerRootView } from 'react-native-gesture-handler';
<GestureHandlerRootView style={{ flex: 1 }}>
  {/* resto de la app */}
</GestureHandlerRootView>
// Si no está, agregarlo como parte del plan 26-01
```

### useRecordResourceMovement — ya implementado
```ts
export function useRecordResourceMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRecursoMovimientoDTO }) =>
      resourceService.recordMovement(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['resources', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['resources', 'list'] });
    },
  });
}
```

### Long-press Modal pattern (React Native)
```tsx
const [previewSpecies, setPreviewSpecies] = useState<Especie | null>(null);

<Modal visible={!!previewSpecies} transparent animationType="fade" onRequestClose={() => setPreviewSpecies(null)}>
  <TouchableOpacity style={styles.modalOverlay} onPress={() => setPreviewSpecies(null)}>
    <View style={styles.modalContent}>
      <Text style={styles.modalName}>{previewSpecies?.name}</Text>
      <Badge label={previewSpecies?.classification} />
      <Badge label={previewSpecies?.dangerLevel} variant="warning" />
      <Button label="CERRAR" onPress={() => setPreviewSpecies(null)} />
    </View>
  </TouchableOpacity>
</Modal>
```

</code_context>

<specifics>
## Specific Notes

- `GestureHandlerRootView` es obligatorio para Swipeable — si no está en `_layout.tsx`, el swipe no funciona en producción (en Expo Go puede funcionar sin él)
- Long-press delay por defecto en TouchableOpacity: 500ms — está bien para el use case
- El formulario de log-resource no necesita ser sofisticado: campos básicos con el design system existente son suficientes para la defensa
- Documentar en la defensa los 2 gestos implementados con su justificación de UX
- `useRecordResourceMovement` espera `{ id: resourceId, data: CreateRecursoMovimientoDTO }` — verificar la forma exacta del DTO antes de ejecutar

</specifics>

<deferred>
## Deferred Ideas

- Swipe-to-delete con confirmación (más complejo, fuera de scope)
- Pinch-to-zoom en foto de species/[id].tsx (tercera opción de gesto, no necesaria si los 2 principales están bien justificados)
- Haptic feedback en gestos con expo-haptics (nice-to-have, no requerido)
- Selector visual de viaje con dropdown en log-resource (simplificado a input de texto o eliminado para el scope)

</deferred>

---

*Phase: 26-gestures-log-resource*
*Context gathered: 2026-05-05*
