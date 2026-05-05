# Phase 24: Species Detail Screen + Camera Setup - Research

**Researched:** 2026-05-05
**Domain:** Mobile Application (React Native / Expo) - Camera Integration & Species Management
**Confidence:** HIGH

## Summary

Esta fase se centra en la visualización detallada de especies y la capacidad de registrar nuevas mediante la cámara o galería. Se integrará `expo-image-picker` para la captura de imágenes y `expo-image-manipulator` para cumplir con los requisitos de compresión y redimensionamiento (800px, quality 0.4) antes de enviar el Base64 al backend. Los hooks `useSpeciesById` y `useCreateSpecies` ya están disponibles en la base de código, lo que facilita la conexión con los servicios existentes. La navegación se configurará en Expo Router para permitir una transición fluida al detalle y una apertura tipo modal para la identificación.

**Primary recommendation:** Utilizar `expo-image-manipulator` en conjunto con `expo-image-picker` para asegurar que las imágenes cumplan con el límite de ~400KB y las dimensiones requeridas, garantizando la estabilidad del payload Base64 enviado al backend.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Captura de Imagen | Browser / Client | — | Responsabilidad directa del hardware del dispositivo. |
| Compresión de Imagen | Browser / Client | — | Debe ocurrir antes de la transmisión para ahorrar ancho de banda y cumplir límites de payload. |
| Gestión de Estado (Species) | API / Backend | Client (React Query) | El backend es la fuente de verdad; el cliente cachea mediante hooks. |
| Navegación (Modal/Detail) | Browser / Client | — | Expo Router gestiona el stack de navegación local. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-image-picker | ~16.0.x | Captura de fotos y selección de galería | Estándar de la industria en el ecosistema Expo; maneja permisos de forma nativa. |
| expo-image-manipulator | ~9.0.x | Redimensionamiento y compresión | Herramienta oficial de Expo para procesamiento de imágenes post-captura. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5.100.6 | Sincronización de datos | Ya integrado; se usa para `useSpeciesById` y `useCreateSpecies`. |
| expo-router | ~6.0.23 | Navegación basada en archivos | Estándar del proyecto para la navegación entre pantallas. |

**Installation:**
```bash
npx expo install expo-image-picker expo-image-manipulator
```

**Version verification:** 
- `expo-image-picker`: 16.0.3 (Verified via expo registry for SDK 54) [VERIFIED: npm registry]
- `expo-image-manipulator`: 9.0.3 (Verified via expo registry for SDK 54) [VERIFIED: npm registry]

## Architecture Patterns

### Recommended Project Structure
```
app/
├── species/
│   ├── [id].tsx        # Detalle de especie
│   └── identify.tsx    # Modal de identificación/formulario
src/
├── components/
│   └── species/
│       ├── SpeciesForm.tsx     # Formulario reutilizable
│       ├── ImagePreview.tsx    # Preview con placeholder HUD
│       └── AttributeBadge.tsx  # Badge para clasificación/peligro
```

### Pattern 1: Image Capture & Compression Flow
1. Llamar a `ImagePicker.launchCameraAsync` con `quality: 1` (para obtener la mejor fuente posible).
2. Procesar el resultado con `ImageManipulator.manipulateAsync`.
3. Aplicar `resize: { width: 800 }` y `compress: 0.4`.
4. Obtener el `base64` directamente desde el manipResult.

### Anti-Patterns to Avoid
- **Enviar Base64 sin comprimir:** Provoca fallos en el backend por tamaño de payload (413 Payload Too Large) y lentitud en la red.
- **Hardcodear colores:** Debe usarse el objeto `colors` de `@/constants/colors` para mantener la estética HUD/Dark.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gestión de Permisos | Lógica manual de `PermissionsAndroid` | Hooks de `expo-image-picker` | Manejo consistente de permisos en iOS y Android con estados reactivos. |
| Redimensionamiento | Algoritmos de canvas manuales | `expo-image-manipulator` | Optimizado nativamente y maneja correctamente los metadatos y rotación. |

## Common Pitfalls

### Pitfall 1: Permissions in app.json
**What goes wrong:** La aplicación crashea al intentar abrir la cámara en producción.
**Why it happens:** Los permisos no están declarados en el manifest (Android) o Info.plist (iOS).
**How to avoid:** Configurar el plugin de `expo-image-picker` en `app.json` con los mensajes de descripción adecuados.

### Pitfall 2: Modal Configuration
**What goes wrong:** La pantalla `identify.tsx` aparece como una pantalla normal, no como un modal deslizante.
**Why it happens:** Falta la configuración de `presentation: 'modal'` en el `_layout.tsx`.
**How to avoid:** Definir explícitamente `Stack.Screen` para `species/identify` con la opción de presentación modal.

## Code Examples

### Image Capture & Processing
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/image-manipulator/
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const handleCapture = async () => {
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7, // Fuente razonable
  });

  if (!result.canceled) {
    const manipResult = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 800 } }],
      { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    
    const base64Image = `data:image/jpeg;base64,${manipResult.base64}`;
    // Enviar al backend
  }
};
```

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | El backend acepta el prefijo `data:image/jpeg;base64,` | Code Examples | Error de parsing en el servidor si solo espera el raw base64. |
| A2 | El componente FAB no existe aún en `bestiary.tsx` | Summary | Duplicación de código si ya se estaba implementando. |

## Open Questions (RESOLVED)

1. **¿El DTO `CreateEspecieDTO` debe ser actualizado?** (RESOLVED)
   - Decisión: Sí, el DTO será extendido en la Phase 24 para incluir todos los campos del formulario. Ver Plan 24-01.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| expo-image-picker | Cámara/Galería | ✗ | — | Instalar mediante npx expo install |
| expo-image-manipulator | Compresión | ✗ | — | Instalar mediante npx expo install |

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
| AI-04 | Permisos configurados en app.json | Static | N/A (Manual check) | ✅ |
| AI-05 | Lógica de compresión (800px, 0.4) | Unit | `npm test src/utils/image.test.ts` | ❌ Wave 0 |
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
| Inyección de Base64 malicioso | Tampering | Validación de tipo MIME y tamaño de imagen en el frontend y backend. |

## Sources

### Primary (HIGH confidence)
- `/expo/expo` - Documentación de `expo-image-picker` y `expo-image-manipulator`.
- `app.json` - Configuración actual del proyecto.
- `src/hooks/useSpecies.ts` - Implementación de hooks de React Query.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Bibliotecas oficiales de Expo.
- Architecture: HIGH - Patrones estándar de React Native y Expo Router.
- Pitfalls: HIGH - Basado en problemas comunes de permisos y navegación en Expo.

**Research date:** 2026-05-05
**Valid until:** 2026-06-04
