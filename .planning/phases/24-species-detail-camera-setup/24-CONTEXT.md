# Phase 24: Species Detail Screen + Camera Setup - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Tres entregas independientes en paralelo:
1. Instalar y configurar expo-image-picker con compresión (hook reutilizable)
2. Crear `app/species/[id].tsx` — pantalla de detalle de especie consumiendo `useSpeciesById`
3. Crear `app/species/identify.tsx` — modal de cámara + formulario de nueva especie; añadir FAB en `bestiary.tsx`

El backend de identificación IA (Phase 23) puede estar en progreso — el formulario de `identify.tsx` debe funcionar también como creación manual sin IA, conectándose a `useCreateSpecies` existente. El botón "IDENTIFICAR CON IA" se habilita en Phase 25 cuando el hook `useIdentifySpecies` esté listo.

</domain>

<decisions>
## Implementation Decisions

### expo-image-picker — configuración
- **D-01:** Usar `expo-image-picker` (ya incluido en Expo SDK 54, sin instalación adicional necesaria)
- **D-02:** Compresión: `quality: 0.4, allowsEditing: true, aspect: [4, 3], base64: true, exif: false`
- **D-03:** `maxWidth` se controla con `allowsEditing` + aspect ratio (no hay `maxWidth` directo en expo-image-picker, la compresión es suficiente)
- **D-04:** Solicitar permisos antes de abrir cámara: `ImagePicker.requestCameraPermissionsAsync()`
- **D-05:** Permisos declarados en `app.json`:
  ```json
  "ios": { "infoPlist": { "NSCameraUsageDescription": "Para fotografiar especies del planeta" } },
  "android": { "permissions": ["android.permission.CAMERA"] }
  ```
- **D-06:** Hook `useImagePicker` en `src/hooks/useImagePicker.ts` — encapsula lógica de permisos + compresión + base64. Retorna `{ pickFromCamera, pickFromGallery, image, clearImage }` donde `image = { uri, base64 }`

### app/species/[id].tsx — Species Detail Screen
- **D-07:** Ruta dinámica: `app/species/[id].tsx` — `useLocalSearchParams()` para obtener `id`
- **D-08:** Consume `useSpeciesById(id)` hook existente (TanStack Query)
- **D-09:** Contenido: imagen (si existe `imageUrl`), nombre, clasificación badge, nivel de peligro badge, descripción, notas, confianza IA (si existe)
- **D-10:** Si `imageUrl` existe y es base64: mostrar con `<Image source={{ uri: imageUrl }}>`
- **D-11:** Botón de audio "NARRAR" — placeholder en esta fase, funcional en Phase 25 con expo-speech
- **D-12:** El tap en una species card en `bestiary.tsx` debe navegar a `router.push('/species/' + id)`

### app/species/identify.tsx — Camera Modal + New Species Form
- **D-13:** Ruta: `app/species/identify.tsx` (per MOCKUPS.md §3.8 y Flujo 4 — NO renombrar)
- **D-14:** Navegación: FAB en `bestiary.tsx` llama a `router.push('/species/identify')`
- **D-15:** Layout de la pantalla:
  1. Sección superior: preview de imagen capturada (o placeholder HUD "SIN IMAGEN")
  2. Botones: "CÁMARA" | "GALERÍA" usando `useImagePicker`
  3. Botón "IDENTIFICAR CON IA" — disabled en esta fase (habilitado en Phase 25)
  4. Formulario: nombre (Input), clasificación (picker/selector), nivel de peligro (selector), notas (Input multiline)
  5. Botón "GUARDAR ESPECIE" — llama a `useCreateSpecies` con los datos + `imageUrl` (base64)
- **D-16:** Selectores de clasificación y peligro: usar botones tipo chip en fila (no Picker nativo) para mantener estética HUD
- **D-17:** Tras guardar exitosamente: `router.back()` + invalidación de cache (ya manejada por `useCreateSpecies`)

### Design system
- **D-18:** Cero hex hardcodeados — usar `useTheme()` + `tc.*` en todas las pantallas nuevas
- **D-19:** Estética HUD: zero border-radius, tipografía monospace, letter-spacing amplio

</decisions>

<canonical_refs>
## Canonical References

### Hooks existentes (listos para usar)
- `src/hooks/useSpecies.ts` — `useSpeciesById(id)`, `useCreateSpecies()`
- `src/hooks/use-theme.ts` — `useTheme()` para design system

### Servicios existentes
- `src/services/species.service.ts` — `getById(id)`, `create(data: CreateEspecieDTO)`

### Tipos
- `src/types-dtos/especie.dto.ts` — `Especie`, `CreateEspecieDTO` (verificar campos: name, classification, dangerLevel, description, imageUrl, notes)

### Pantalla de referencia (bestiary.tsx)
- `app/(tabs)/bestiary.tsx` — Lista de especies, donde añadir el FAB y el `onPress` en cards para navegar a `/species/[id]`

### Componentes UI disponibles
- `src/components/ui/Button` — variantes primary, secondary, danger
- `src/components/ui/Input` — default, con error
- `src/components/ui/Badge` — success, warning, danger, info
- `src/components/ui/Card` — contenedor estándar
- `src/components/ui/HudHeader` — header de pantalla

### MOCKUPS de referencia
- `docs/MOCKUPS.md` §3.7 — Species Detail: foto, nombre, clasificación, peligro, descripción, audio button, confianza
- `docs/MOCKUPS.md` §3.8 — Species Identify: vista cámara fullscreen, overlay escaneo, resultado IA, confirmar/corregir
- `docs/MOCKUPS.md` Flujo 4 — Tab Bitácora → FAB → /species/identify → foto → IA → confirmar → guardar

### Requirements
- `.planning/REQUIREMENTS.md` §AI Camera Detection — AI-04, AI-05, AI-06, SCREEN-01, SCREEN-02

</canonical_refs>

<code_context>
## Existing Code Insights

### useSpeciesById — ya implementado
```ts
export function useSpeciesById(id: string) {
  return useQuery({
    queryKey: ['species', 'detail', id],
    queryFn: () => speciesService.getById(id),
    enabled: !!id,
  });
}
```

### useCreateSpecies — ya implementado
```ts
export function useCreateSpecies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEspecieDTO) => speciesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species'] });
    },
  });
}
```

### bestiary.tsx — dónde añadir FAB y onPress en cards
```tsx
// Añadir FAB flotante sobre la FlatList
<TouchableOpacity onPress={() => router.push('/species/identify')} style={styles.fab}>
  <Text style={styles.fabText}>+</Text>
</TouchableOpacity>

// En cada card, añadir onPress:
onPress={() => router.push(`/species/${item.id}`)}
```

### Patrón de ruta dinámica (expo-router)
```tsx
// app/species/[id].tsx
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams<{ id: string }>();
const { data: species, isLoading } = useSpeciesById(id);
```

### imageUrl como base64 data URI
```tsx
// Mostrar imagen base64 en React Native
<Image source={{ uri: species.imageUrl }} style={{ width: '100%', height: 200 }} />
// uri acepta data:image/jpeg;base64,... directamente
```

### Clasificación en bestiary.tsx (ya tiene los colores — referencia para design)
```tsx
const classificationColorMap: Record<string, string> = {
  planta: "#4CAF50",   // <- estos son hex hardcodeados, NO replicar en pantallas nuevas
  animal: "#FF9800",
  // ...
};
// En las pantallas nuevas usar tc.success, tc.warning, etc.
```

</code_context>

<specifics>
## Specific Notes

- `expo-image-picker` viene incluido en Expo SDK 54 — NO requiere `npx expo install`, solo importar
- El resultado de `ImagePicker.launchCameraAsync()` tiene `assets[0].base64` (cuando `base64: true`)
- La data URI para React Native Image: `data:image/jpeg;base64,${assets[0].base64}`
- El botón "NARRAR" en species/[id].tsx debe existir en el UI pero estar disabled/placeholder hasta Phase 25
- El botón "IDENTIFICAR CON IA" en identify.tsx debe existir pero estar disabled hasta Phase 25

</specifics>

<deferred>
## Deferred Ideas

- Botón "NARRAR" funcional con expo-speech → Phase 25
- Botón "IDENTIFICAR CON IA" funcional → Phase 25 (hook useIdentifySpecies)
- Animación de escaneo HUD sobre la cámara → Phase 25
- Chip de confianza IA en identify.tsx → Phase 25
- Swipe gestures en species cards → Phase 26

</deferred>

---

*Phase: 24-species-detail-camera-setup*
*Context gathered: 2026-05-05*
