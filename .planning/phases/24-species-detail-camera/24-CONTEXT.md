# Phase 24: Species Detail Screen + Camera Setup - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Construir la pantalla de detalle de especie `app/species/[id].tsx`, instalar y configurar `expo-image-picker` para captura de fotos/galería con compresión, y crear el modal `app/species/identify.tsx` que contiene el formulario de registro de nueva especie con preview de imagen.

### In Scope
- Instalación de `expo-image-picker` y configuración de permisos en `app.json`.
- Implementación de la pantalla `app/species/[id].tsx` consumiendo el hook `useSpeciesById`.
- Implementación de la pantalla `app/species/identify.tsx` (modal) para captura e ingreso manual de datos.
- Lógica de compresión de imagen (quality: 0.4, maxWidth: 800) y conversión a Base64.
- Conexión del formulario de nueva especie con `useCreateSpecies`.
- Navegación desde FAB en `bestiary.tsx` hacia el modal de identificación.
- Cumplimiento del Design System (cero hex hardcodeados, uso de tokens).

### Out of Scope
- Integración real con el endpoint de IA (esto sucede en la Phase 25).
- Animaciones complejas de escaneo (Phase 25).
- Audio narración (Phase 25).
- Gestos avanzados (Phase 26).
</domain>

<requirements>
- **AI-04**: `expo-image-picker` instalado con permisos declarados en `app.json`.
- **AI-05**: Imagen comprimida (quality: 0.4, maxWidth: 800) antes de Base64.
- **AI-06**: Pantalla `app/species/identify.tsx` con formulario completo (nombre, clasificación, peligro, notas, preview).
- **UI-09**: `app/species/[id].tsx` muestra todos los campos de la especie consumiendo datos reales.
</requirements>

<decisions>
- **D-01**: Usar `expo-image-picker` para simplicidad y compatibilidad con el flujo de "elegir de galería" o "tomar foto".
- **D-02**: El modal de identificación será una ruta de Expo Router (`app/species/identify.tsx`) con presentación tipo "modal".
- **D-03**: La imagen se enviará al backend como string Base64 dentro del campo `imageUrl` (que fue relajado en la Phase 23).
- **D-04**: Mantener el límite de ~400KB para el payload de base64 mediante la compresión configurada en el picker.
</decisions>

<technical_notes>
- El backend ya está configurado con **Gemini 2.0 Flash** y acepta Base64 (Phase 23).
- El hook `useSpeciesById` ya debería estar definido (verificar en Phase 15 artifacts).
- Se debe asegurar que el `FlatList` de especies en `bestiary.tsx` navegue correctamente al detalle pasando el `id`.
</technical_notes>

---
*Phase: 24-species-detail-camera*
*Context gathered: 2026-05-05*
