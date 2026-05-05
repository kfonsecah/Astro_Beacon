# Phase 25: AI Identification Flow + Audio Narration - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Activar las dos funcionalidades que quedaron como placeholder en Phase 24:

1. **Botón "IDENTIFICAR CON IA"** en `app/species/identify.tsx`: crear hook `useIdentifySpecies`, llamar a `POST /api/v1/species/identify`, pre-llenar el formulario con la respuesta, mostrar animación de escaneo (Reanimated 4) y chip de confianza.

2. **Botón "NARRAR"** en `app/species/[id].tsx`: instalar `expo-speech`, leer en voz alta nombre + clasificación + descripción de la especie.

Depende de Phase 23 (endpoint /identify listo) y Phase 24 (pantallas y cámara listas).

</domain>

<decisions>
## Implementation Decisions

### Hook useIdentifySpecies
- **D-01:** Agregar a `src/services/species.service.ts` el método `identify(imageBase64: string)`
  ```ts
  async identify(imageBase64: string): Promise<IdentifyResult>
  // POST /api/v1/species/identify con body { imageBase64 }
  // Retorna { classification, dangerLevel, name, description, confidence }
  ```
- **D-02:** Agregar a `src/hooks/useSpecies.ts` el hook `useIdentifySpecies()`:
  ```ts
  export function useIdentifySpecies() {
    return useMutation({
      mutationFn: (imageBase64: string) => speciesService.identify(imageBase64),
    });
  }
  ```
- **D-03:** Tipo `IdentifyResult` en `src/types-dtos/especie.dto.ts`:
  ```ts
  export interface IdentifyResult {
    classification: string;
    dangerLevel: string;
    name: string;
    description: string;
    confidence: number;  // 0.0 a 1.0
  }
  ```

### Flujo de identificación en identify.tsx
- **D-04:** Flujo al presionar "IDENTIFICAR CON IA":
  1. Validar que haya imagen capturada (si no, mostrar alerta)
  2. Llamar `mutate(image.base64)` → activar animación de escaneo
  3. Al recibir respuesta: pre-llenar campos `name`, `classification`, `dangerLevel`, `description`
  4. Desactivar animación, mostrar chip de confianza
  5. Campos siguen siendo editables
- **D-05:** Si `mutate` retorna error: mostrar mensaje "ANÁLISIS NO DISPONIBLE — Completa los datos manualmente" sin bloquear el formulario

### Animación de escaneo (Reanimated 4)
- **D-06:** Durante el análisis: overlay semitransparente sobre el preview de imagen con línea de escaneo horizontal animada que recorre de arriba hacia abajo en loop
- **D-07:** Implementar con `useSharedValue` + `withRepeat` + `withTiming` de Reanimated 4
- **D-08:** Texto pulsante: "ANALIZANDO ESPÉCIMEN..." con opacidad oscilante
- **D-09:** La animación se detiene (`cancelAnimation`) cuando `isPending` pasa a `false`

### Chip de confianza
- **D-10:** Mostrar después de identificación exitosa: "CONFIANZA: 91%"
- **D-11:** Color según nivel:
  - `>= 0.75` → `tc.success` (verde)
  - `0.50–0.74` → `tc.warning` (naranja)
  - `< 0.50` → `tc.danger` (rojo)
- **D-12:** Si `confidence === 0` (fallback): "CONFIANZA: N/D" en `tc.textMuted`

### expo-speech — Audio Narration
- **D-13:** Instalar: `npx expo install expo-speech`
- **D-14:** En `app/species/[id].tsx`, botón "NARRAR":
  ```ts
  import * as Speech from 'expo-speech';
  const narrate = () => {
    const text = `${species.name}. Clasificación: ${species.classification}. ${species.description}`;
    Speech.speak(text, { language: 'es-MX', rate: 0.9 });
  };
  ```
- **D-15:** Manejar estado de narración: si `Speech.isSpeakingAsync()` retorna true, mostrar botón "DETENER" en vez de "NARRAR"
- **D-16:** Limpiar al desmontar el componente: `Speech.stop()` en `useEffect` cleanup

</decisions>

<canonical_refs>
## Canonical References

### Archivos a modificar
- `src/services/species.service.ts` — Agregar método `identify(imageBase64)`
- `src/hooks/useSpecies.ts` — Agregar `useIdentifySpecies()`
- `src/types-dtos/especie.dto.ts` — Agregar interfaz `IdentifyResult`
- `app/species/identify.tsx` — Activar botón IA, agregar animación, agregar chip de confianza
- `app/species/[id].tsx` — Activar botón NARRAR con expo-speech

### Backend (Phase 23)
- `POST /api/v1/species/identify` — Body: `{ imageBase64: string }` — Response: `{ success: true, data: IdentifyResult }`

### Reanimated 4 — ya en el proyecto
- `react-native-reanimated ~4.1.1` instalado (ver package.json)
- New Architecture habilitada — worklets sin babel plugin requerido
- Referencia de uso: `app/reanimated-test.tsx` y animaciones en login.tsx

### Design system
- `src/hooks/use-theme.ts` — `tc.success`, `tc.warning`, `tc.danger`, `tc.textMuted`, `tc.primary`

### Requirements
- `.planning/REQUIREMENTS.md` §AI Camera Detection — AI-07, AI-08, AI-09

</canonical_refs>

<code_context>
## Existing Code Insights

### Reanimated 4 pattern (de login.tsx en el proyecto)
```ts
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const scanY = useSharedValue(0);
// Iniciar animación de escaneo:
scanY.value = withRepeat(withTiming(imageHeight, { duration: 1500 }), -1, false);
// Detener:
cancelAnimation(scanY);
scanY.value = 0;

const scanStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: scanY.value }],
}));
```

### TanStack Query useMutation pattern (del proyecto)
```ts
const { mutate, isPending, isError } = useIdentifySpecies();
// En el componente:
mutate(image.base64, {
  onSuccess: (result) => {
    setName(result.name);
    setClassification(result.classification);
    setDangerLevel(result.dangerLevel);
    setDescription(result.description);
    setConfidence(result.confidence);
  },
  onError: () => {
    // mostrar mensaje de error no bloqueante
  }
});
```

### expo-speech — API simple
```ts
import * as Speech from 'expo-speech';
// Hablar:
Speech.speak('texto', { language: 'es-MX', rate: 0.9 });
// Detener:
Speech.stop();
// Verificar si está hablando:
const speaking = await Speech.isSpeakingAsync();
```

### species.service.ts — dónde añadir identify
```ts
// Agregar al objeto speciesService:
async identify(imageBase64: string): Promise<IdentifyResult> {
  const response = await api.post<{ success: boolean; data: IdentifyResult }>(
    '/species/identify',
    { imageBase64 }
  );
  return response.data.data;
},
```

</code_context>

<specifics>
## Specific Notes

- `expo-speech` es parte del Expo ecosystem — usar `npx expo install expo-speech` para versión compatible con SDK 54
- La animación de escaneo solo se muestra sobre el preview de imagen (no a pantalla completa) para mantener el formulario visible
- El texto de narración debe concatenar solo los campos disponibles — `description` puede estar vacío, manejar con fallback "Sin descripción disponible"
- En iOS, `Speech.speak()` puede requerir interacción del usuario previo (Apple policy) — documentar como limitación conocida
- La imagen base64 enviada a `/identify` debe ser el campo `base64` del resultado de expo-image-picker (sin el prefijo `data:image/jpeg;base64,` si el backend lo maneja por separado — verificar con Phase 23)

</specifics>

<deferred>
## Deferred Ideas

- Selección de idioma para narración (español/inglés) — fuera de scope
- Velocidad de narración configurable por el usuario — fuera de scope
- Guardar resultado de identificación en caché local para re-narrar sin reconexión — fuera de scope
- Gestos en pantallas → Phase 26

</deferred>

---

*Phase: 25-ai-flow-audio-narration*
*Context gathered: 2026-05-05*
