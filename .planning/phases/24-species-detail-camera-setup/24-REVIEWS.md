---
phase: 24
reviewers: [gemini, codex]
reviewed_at: 2026-05-05T00:00:00Z
plans_reviewed: [24-01-PLAN.md, 24-02-PLAN.md, 24-03-PLAN.md]
---

# Cross-AI Plan Review — Phase 24

## Gemini Review

# Plan Review: Phase 24 - Species Detail Screen + Camera Setup

## 1. Summary
The implementation plan for Phase 24 is well-structured, logically ordered, and demonstrates a deep understanding of the project's specific constraints (HUD aesthetic, TanStack Query, and Expo SDK 54). The progression from infrastructure (permissions and hooks) to data consumption (detail screen) and finally data creation (identification modal) minimizes risk and ensures that dependencies are satisfied at each step. The choice to use chips instead of native pickers and the strict adherence to `useTheme` tokens ensures visual consistency with the existing codebase.

## 2. Strengths
- **Architectural Consistency:** Continues the established pattern of using TanStack Query hooks and the `useTheme` design system.
- **HUD Aesthetic Fidelity:** Explicitly mentions zero border-radius, monospace fonts, and chip-based selection.
- **Effective Hook Abstraction:** The creation of `useImagePicker` centralizes camera logic, permissions, and compression, making it reusable.
- **Pragmatic Image Handling:** Correctly identifies that `expo-image-picker` is part of SDK 54 and utilizes the base64 URI pattern.

## 3. Concerns
- **MEDIUM: Permission Denial Handling** — While `useImagePicker` requests permissions, the plan doesn't specify how to handle users who permanently deny them (e.g., directing them to settings via `canAskAgain`).
- **MEDIUM: Form Validation Logic** — Plan 03 mentions "GUARDAR ESPECIE" but lacks a strategy for basic form validation (e.g., ensuring name is entered, image captured) before triggering the mutation.
- **LOW: Base64 Prefixing** — Must confirm if `useCreateSpecies` or the backend expects the `data:image/jpeg;base64,...` prefix or just the raw base64 string.
- **LOW: Large Payload Performance** — Even at 0.4 quality, base64 strings can be heavy. The `image` state should be cleared promptly after successful upload.

## 4. Suggestions
- In `useImagePicker`, check `canAskAgain` property. If `granted` is false and `canAskAgain` is false, show a HUD-styled Alert to guide users to System Settings.
- For `identify.tsx`, disable "GUARDAR ESPECIE" until mandatory fields (name, image, classification) are populated.
- In `app/species/[id].tsx`, handle image loading delay with placeholder for base64 decoding.
- Since `exif: false` is set, verify image orientation is handled correctly by the `allowsEditing: true` crop tool.

## 5. Risk Assessment: LOW
The plan is safe because it uses built-in Expo modules (no native rebuilds), the data layer is already implemented, UI is additive to existing `bestiary.tsx`, and the Wave structure provides clear verification checkpoints. The most complex part (camera integration) is mitigated by SDK 54 defaults and clear compression parameters.

---

## Codex Review

# Phase 24 Plan Review

## Plan 01 (Wave 1)

### Summary
Este plan separa bien la base tecnica de permisos e imagen antes de tocar UI. El problema es que no cubre por completo el flujo real de camara/galeria ni cierra el contrato de datos con las siguientes olas, asi que como fundacion es util pero incompleta.

### Strengths
- Descompone correctamente la fase en una base reusable (`useImagePicker`) en vez de duplicar logica en pantallas.
- Respeta las decisiones D-01, D-02 y D-06 sin meter complejidad extra como `expo-image-manipulator`.
- Fija parametros de compresion concretos y consistentes.
- Deja explicito que la imagen se entregara como data URI.

### Concerns
- **HIGH: AI-04 incompleto** — El plan solo menciona permiso de camara; para galeria falta definir permisos declarativos/runtime segun plataforma, especialmente iOS photo library (`NSPhotoLibraryUsageDescription` en app.json).
- **HIGH: Inconsistencia de contrato** — `CreateEspecieDTO` hace `description` obligatorio, pero Plan 03 no incluye campo `description` ni estrategia de valor por defecto. Uno de los dos debe ajustarse.
- **MEDIUM: Comportamiento ante cancelacion/error** — `useImagePicker` no define comportamiento ante cancelacion, permiso denegado o error del sistema. La UI siguiente queda obligada a improvisar.
- **MEDIUM: MIME type assumption** — Fijar siempre el prefijo `data:image/jpeg;base64,...` puede ser incorrecto si el asset no es JPEG (ej. PNG desde galeria).
- **LOW: Sin limites de tamano** — `quality: 0.4` ayuda, pero no garantiza requests razonables. Conviene documentar el limite esperado.

### Suggestions
- Añadir `NSPhotoLibraryUsageDescription` en app.json para galeria iOS.
- Definir el contrato del hook ante `cancel`, `denied` y `error`.
- Resolver la inconsistencia de `description`: hacerlo opcional en DTO o agregar el campo al formulario.
- Derivar el MIME type del asset en vez de asumir JPEG siempre.
- Especificar `mediaTypes: ImagePicker.MediaTypeOptions.Images` para evitar activos no soportados.

### Risk Assessment: MEDIUM
La base es solida pero esta incompleta en permisos y contrato de datos; si eso no se corrige aqui, las olas siguientes heredan fallos estructurales.

---

## Plan 02 (Wave 2)

### Summary
El plan de detalle cubre bien el objetivo funcional de UI-09 y aprovecha el hook existente. El principal riesgo no es de alcance sino de robustez: falta definir casos invalidos del parametro `id` y vacios de contenido.

### Strengths
- Usa `useSpeciesById(id)` como pide la fase, sin reinventar state management.
- Incluye estados de carga y error, lo cual es correcto para TanStack Query.
- Respeta decisiones de diseno: HUD, `useTheme()`, boton `NARRAR` placeholder.
- La navegacion desde `bestiary.tsx` esta alineada con D-12.

### Concerns
- **HIGH: `id` sin normalizar** — `useLocalSearchParams()` puede devolver `string | string[] | undefined`; el plan no define normalizacion ni manejo de `id` invalido antes de consultar.
- **MEDIUM: Archivos compartidos con Plan 03** — `app/_layout.tsx` y `bestiary.tsx` tambien son modificados en Plan 03; esto aumenta riesgo de conflictos.
- **MEDIUM: Placeholders de contenido ausente** — No se especifican placeholders para ausencia de imagen, descripcion o notas. La pantalla puede quedar visualmente rota con datos parciales.
- **LOW: `imageUrl` asumida como base64** — Deberia aceptar tambien URL remota.

### Suggestions
- Normalizar `id` con `const id = Array.isArray(rawId) ? rawId[0] : rawId` y manejar undefined.
- Anadir placeholders explicitamente: imagen placeholder HUD si no hay `imageUrl`, guiones si no hay `confidence`, etc.
- Asegurar que `imageUrl` funcione tanto como base64 como URL remota.
- Considerar un estado "retry" ademas del error generico.

### Risk Assessment: MEDIUM
La pantalla probablemente saldra, pero la robustez del routing y los datos parciales estan subespecificados.

---

## Plan 03 (Wave 3)

### Summary
Este plan cubre la mayor parte del valor visible de la fase, pero es el mas riesgoso. El flujo modal, preview y submit estan bien orientados, pero falta validacion, UX de mutacion y manejo de campo `description` que rompe el contrato con Plan 01.

### Strengths
- El modal `species/identify` esta alineado con D-13 y D-15.
- Reutiliza `useImagePicker` y `useCreateSpecies`, evitando duplicacion.
- El FAB en `bestiary.tsx` cumple el criterio de navegacion esperado.
- Mantiene el placeholder de IA deshabilitado, evitando scope creep.
- Chips en vez de Picker nativo encaja con el HUD y D-16.

### Concerns
- **HIGH: Campo `description` faltante** — El formulario no incluye `description`, pero el DTO del Plan 01 lo vuelve obligatorio. La pantalla de detalle espera mostrarlo.
- **HIGH: Sin validacion de formulario** — No hay validacion antes de llamar `useCreateSpecies`; se pueden enviar payloads invalidos.
- **MEDIUM: Sin estado de carga/doble submit** — No se define estado de carga ni prevencion de doble submit ni feedback de error.
- **MEDIUM: Sin manejo de teclado** — En un modal movil, un `KeyboardAvoidingView` es casi siempre necesario.
- **MEDIUM: Archivos compartidos con Plan 02** — `_layout.tsx` y `bestiary.tsx` se tocan en ambas olas.
- **LOW: Chips en fila unica** — Pueden desbordarse si el numero o largo de opciones crece.

### Suggestions
- Resolver la inconsistencia de `description`: agregar el campo al formulario O hacer `description` opcional en el DTO.
- Definir validaciones minimas antes de habilitar "GUARDAR ESPECIE".
- Deshabilitar "GUARDAR ESPECIE" durante la mutacion y mostrar feedback claro de error/exito.
- Envolver el formulario en `KeyboardAvoidingView` + `ScrollView`.
- Permitir wrap de chips en vez de asumir fila rigida.

### Risk Assessment: HIGH
Es el plan mas cercano al objetivo funcional pero tambien el que mas depende de detalles no resueltos; hoy no garantiza un flujo de creacion estable.

---

## Consensus Summary

### Agreed Strengths (2+ reviewers)
- **Buena abstraccion del hook `useImagePicker`** — Centraliza permisos, compresion y base64. Reutilizable y limpio.
- **Correcta decision de no usar `expo-image-manipulator`** — Los parametros de expo-image-picker son suficientes para el caso de uso.
- **Adherencia al design system** — Ambos reviewers destacan el uso de `useTheme()`, tokens `tc.*`, zero border-radius y chips.
- **Wave ordering correcto** — La progresion infraestructura → detalle → modal minimiza riesgo de dependencias.
- **Botones placeholder correctamente definidos** — "NARRAR" e "IDENTIFICAR CON IA" disabled evitan scope creep.

### Agreed Concerns (2+ reviewers)

| Concern | Severidad | Plans Afectados |
|---------|-----------|-----------------|
| Validacion del formulario antes de submit | HIGH | Plan 03 |
| Campo `description` inconsistente entre DTO y formulario | HIGH | Plan 01 + 03 |
| Permisos de galeria iOS (`NSPhotoLibraryUsageDescription`) faltantes | HIGH | Plan 01 |
| Comportamiento del hook ante cancelacion/permiso denegado | MEDIUM | Plan 01 |
| Archivos `_layout.tsx` y `bestiary.tsx` compartidos entre Wave 2 y 3 | MEDIUM | Plan 02 + 03 |
| Placeholders para datos parciales (imagen, notas, descripcion) | MEDIUM | Plan 02 |
| `id` de ruta sin normalizacion/validacion | MEDIUM/HIGH | Plan 02 |

### Divergent Views
- **Risk overall**: Gemini califica la fase como LOW risk; Codex califica Plan 03 como HIGH risk. La diferencia es que Gemini evalua la arquitectura y Codex evalua los detalles de implementacion. Ambas perspectivas son validas.
- **base64 prefix**: Gemini lo marca como LOW (confirmar con backend); Codex lo eleva a MEDIUM (el MIME type puede no ser JPEG siempre). Codex tiene razon en ser mas cauteloso aqui.

### Top 3 Actions Before Execution
1. **Resolver `description`** — Hacerlo `description?: string` (opcional) en el DTO O agregar el campo al formulario de identify.tsx. Sin esto, Plan 01 y Plan 03 son incompatibles.
2. **Agregar `NSPhotoLibraryUsageDescription`** en app.json para AI-04 completo en iOS.
3. **Definir contrato de error/cancel en `useImagePicker`** y validacion minima en "GUARDAR ESPECIE" para que Plan 03 sea ejecutable de forma estable.
