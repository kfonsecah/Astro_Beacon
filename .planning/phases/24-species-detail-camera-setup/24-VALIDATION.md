---
phase: 24
slug: species-detail-camera-setup
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-05
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## 1. Automated Verification (Grep/CI)

| ID | Truth | Verification Command | Gate |
|----|-------|----------------------|------|
| V-01 | Permisos en app.json | `grep "NSCameraUsageDescription" app.json` | commit |
| V-02 | Hook useImagePicker | `ls src/hooks/useImagePicker.ts` | commit |
| V-03 | API correcta del hook | `grep "pickFromCamera\|pickFromGallery" src/hooks/useImagePicker.ts` | commit |
| V-04 | Componente SpeciesDetail | `ls app/species/[id].tsx` | commit |
| V-05 | Componente IdentifyModal | `ls app/species/identify.tsx` | commit |
| V-06 | Ruta modal en _layout | `grep "presentation: 'modal'" app/_layout.tsx` | commit |
| V-07 | Sin expo-image-manipulator | `grep -v "image-manipulator" package.json` | commit |

## 2. Integrated Test Suites (Nyquist Gaps)

| Req ID | Behavior | Test Command | Strategy |
|--------|----------|--------------|----------|
| AI-05 | Compresión quality: 0.4 en hook | `npm test src/hooks/useImagePicker.test.ts` | Unit (Wave 0) |
| UI-09 | Renderizado de detalle | `npm test app/species/[id].test.tsx` | Component (Wave 0) |

## 3. Human Feedback Sampling (UAT)

| Sample | Context | Intent |
|--------|---------|--------|
| Camera Modal | Device | Verificar que la cámara abre correctamente y muestra el preview. |
| Gallery Picker | Device | Verificar que la selección de galería funciona y carga la imagen. |
| Detail Layout | Device | Verificar que la estética HUD se mantiene en la pantalla de detalle. |
| Identify Form | Device | Verificar que chips de clasificación/peligro son seleccionables y el formulario envía correctamente. |

## 4. Continuity & Governance
- [x] No side-effects: no external API calls in unit tests
- [x] Context continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] `nyquist_compliant: true` set in frontmatter
- [x] Sin dependencias adicionales — expo-image-picker ya incluido en SDK 54

**Approval:** pending
