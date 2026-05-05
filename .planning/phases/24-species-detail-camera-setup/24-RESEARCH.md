# Phase 24: Species Detail Screen + Camera Setup - Research

**Researched:** 2026-05-05
**Domain:** Mobile Application (React Native / Expo) - Camera Integration & Species Management
**Confidence:** HIGH

## Summary

Esta fase se centra en la visualización detallada de especies y la capacidad de registrar nuevas mediante la cámara o galería. Se usa `expo-image-picker` (ya incluido en Expo SDK 54 — sin instalación adicional) con compresión directa via parámetros `quality: 0.4, allowsEditing: true, aspect: [4, 3], base64: true, exif: false`. Los hooks `useSpeciesById` y `useCreateSpecies` ya están disponibles. La navegación se configura en Expo Router para detalle y modal de identificación.

**Primary recommendation:** Usar `expo-image-picker` directamente con sus parámetros de compresión — no se requiere `expo-image-manipulator` ya que `quality: 0.4` + `aspect: [4, 3]` es suficiente para mantener el payload bajo ~400KB.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Captura de Imagen | Browser / Client | — | Responsabilidad directa del hardware del dispositivo. |
| Compresión de Imagen | Browser / Client | — | Manejada por expo-image-picker con quality: 0.4 antes de transmisión. |
| Gestión de Estado (Species) | API / Backend | Client (React Query) | El backend es la fuente de verdad; el cliente cachea mediante hooks. |
| Navegación (Modal/Detail) | Browser / Client | — | Expo Router gestiona el stack de navegación local. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-image-picker | incluido SDK 54 | Captura de fotos, selección de galería y compresión | Estándar de la industria en el ecosistema Expo; maneja permisos y compresión de forma nativa. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5.100.6 | Sincronización de datos | Ya integrado; se usa para `useSpeciesById` y `useCreateSpecies`. |
| expo-router | ~6.0.23 | Navegación basada en archivos | Estándar del proyecto para la navegación entre pantallas. |

**Installation:**
No se requiere instalación adicional. `expo-image-picker` ya viene incluido en Expo SDK 54.
Solo declarar permisos en `app.json`:
```json
{
  "ios": { "infoPlist": { "NSCameraUsageDescription": "Para fotografiar especies del planeta" } },
  "android": { "permissions": ["android.permission.CAMERA"] }
}
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── species/
│   ├── [id].tsx        # Detalle de especie
│   └── identify.tsx    # Modal de identificación/formulario
src/
├── hooks/
│   └── useImagePicker.ts   # Hook encapsula permisos + captura + base64
```

### Pattern 1: Image Capture & Compression Flow
1. Solicitar permiso: `ImagePicker.requestCameraPermissionsAsync()`.
2. Llamar a `ImagePicker.launchCameraAsync()` con `{ quality: 0.4, allowsEditing: true, aspect: [4, 3], base64: true, exif: false }`.
3. Construir la data URI: `data:image/jpeg;base64,${result.assets[0].base64}`.
4. Almacenar en estado `image: { uri, base64 }` y pasar como `imageUrl` al backend.

### Anti-Patterns to Avoid
- **Instalar expo-image-manipulator innecesariamente:** `expo-image-picker` ya provee compresión suficiente via `quality` y `aspect`. Añadir manipulator agrega complejidad sin beneficio real en este caso.
- **Hardcodear colores:** Usar `useTheme()` + `tc.*` tokens. Nunca replicar el `classificationColorMap` de bestiary.tsx en pantallas nuevas.
- **Usar Picker nativo para selectores:** Los selectores de clasificación y peligro deben ser chips HUD (botones en fila, zero border-radius).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gestión de Permisos | Lógica manual de `PermissionsAndroid` | `ImagePicker.requestCameraPermissionsAsync()` | Manejo consistente de permisos en iOS y Android. |
| Compresión de Imagen | Algoritmos manuales | Parámetros de expo-image-picker | `quality: 0.4` + `aspect: [4,3]` produce ~400KB sin dependencias extra. |

## Common Pitfalls

### Pitfall 1: Permissions in app.json
**What goes wrong:** La aplicación crashea al intentar abrir la cámara en producción.
**Why it happens:** Los permisos no están declarados en el manifest (Android) o Info.plist (iOS).
**How to avoid:** Declarar `NSCameraUsageDescription` en iOS y `android.permission.CAMERA` en Android dentro de `app.json`.

### Pitfall 2: Modal Configuration
**What goes wrong:** La pantalla `identify.tsx` aparece como pantalla normal, no como modal deslizante.
**Why it happens:** Falta `presentation: 'modal'` en `_layout.tsx`.
**How to avoid:** Definir `Stack.Screen` para `species/identify` con `options={{ presentation: 'modal', headerShown: false }}`.

### Pitfall 3: base64 en React Native Image
**What goes wrong:** La imagen no se muestra tras captura.
**Why it happens:** Se pasa `assets[0].base64` directo sin el prefijo de data URI.
**How to avoid:** Construir siempre `data:image/jpeg;base64,${assets[0].base64}` antes de asignar al estado.

## Code Examples

### Hook useImagePicker
```typescript
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export function useImagePicker() {
  const [image, setImage] = useState<{ uri: string; base64: string } | null>(null);

  const pickFromCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.4,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
      exif: false,
    });
    if (!result.canceled && result.assets[0].base64) {
      setImage({
        uri: result.assets[0].uri,
        base64: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.4,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
      exif: false,
    });
    if (!result.canceled && result.assets[0].base64) {
      setImage({
        uri: result.assets[0].uri,
        base64: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  const clearImage = () => setImage(null);

  return { pickFromCamera, pickFromGallery, image, clearImage };
}
```

### Mostrar imagen base64 en React Native
```tsx
// uri acepta data:image/jpeg;base64,... directamente
<Image source={{ uri: image.uri }} style={{ width: '100%', height: 200 }} />
```

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | El backend acepta el prefijo `data:image/jpeg;base64,` | Code Examples | Error de parsing en el servidor si solo espera raw base64. |
| A2 | El componente FAB no existe aún en `bestiary.tsx` | Summary | Duplicación de código si ya estaba implementado. |
| A3 | quality: 0.4 + aspect [4,3] produce payload < 400KB | Summary | Fallos 413 en backend si las imágenes siguen siendo muy grandes. |

## Open Questions (RESOLVED)

1. **¿El DTO `CreateEspecieDTO` debe ser actualizado?** (RESOLVED)
   - Decisión: Sí, el DTO será extendido en la Phase 24 para incluir todos los campos del formulario. Ver Plan 24-01.

2. **¿Se necesita expo-image-manipulator?** (RESOLVED)
   - Decisión: No. `expo-image-picker` con `quality: 0.4` es suficiente (D-03). SDK 54 ya incluye el picker.

## Environment Availability

| Dependency | Required By | Available | Version | Notes |
|------------|------------|-----------|---------|-------|
| expo-image-picker | Cámara/Galería/Compresión | ✓ | SDK 54 incluido | Sin instalación adicional |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + React Native Testing Library |
| Config file | `jest.config.js` |
| Quick run command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AI-04 | Permisos configurados en app.json | Static | `grep "NSCameraUsageDescription" app.json` | ✅ |
| AI-05 | Compresión quality: 0.4 en hook | Unit | `npm test src/hooks/useImagePicker.test.ts` | ❌ Wave 0 |
| UI-09 | Renderizado de detalle de especie | Component | `npm test app/species/[id].test.tsx` | ❌ Wave 0 |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Validación de campos de formulario (nombre, notas) para evitar inyecciones básicas. |
| V13 Communications | yes | Uso de HTTPS para la subida de Base64 (gestionado por Axios/API config). |

### Known Threat Patterns for React Native

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Inyección de Base64 malicioso | Tampering | Validación de tipo MIME y tamaño de imagen en frontend y backend. |

## Sources

### Primary (HIGH confidence)
- `/expo/expo` - Documentación de `expo-image-picker` SDK 54.
- `app.json` - Configuración actual del proyecto.
- `src/hooks/useSpecies.ts` - Implementación de hooks de React Query.
- `.planning/phases/24-species-detail-camera-setup/24-CONTEXT.md` - Decisiones de diseño de la fase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Biblioteca oficial de Expo, ya incluida en SDK 54.
- Architecture: HIGH - Patrones estándar de React Native y Expo Router.
- Pitfalls: HIGH - Basado en problemas comunes de permisos y navegación en Expo.

**Research date:** 2026-05-05
**Valid until:** 2026-06-04
