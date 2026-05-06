---
status: pass
phase: 24-species-detail-camera-setup
source: [24-01-SUMMARY.md, 24-02-SUMMARY.md, 24-03-SUMMARY.md]
started: 2026-05-05T23:55:00Z
updated: 2026-05-05T18:15:00Z
---

## Tests

### 1. FAB visible in Bestiary
expected: Open the app and go to the Bestiary tab (BITÁCORA DE ESPECIES). A square "+" button should be visible in the lower-right corner, floating over the species list.
result: pass

### 2. Navigate to species detail
expected: Tap any species card in the bestiary list. The screen navigates to a detail page showing the species name in uppercase, classification badge, danger level badge, a CONFIANZA IA value (or "--" if absent), a DESCRIPCIÓN field, and a disabled "NARRAR" button at the bottom.
result: pass

### 3. Species image placeholder
expected: On the species detail screen — if the species has no image stored, a grey rectangle with the text "SIN IMAGEN" is shown in place of the photo.
result: pass

### 4. Identify modal opens from FAB
expected: Tap the "+" FAB in the bestiary. A modal slides up titled "IDENTIFICACIÓN DE ESPECIE". It contains a "SIN IMAGEN" placeholder area, two buttons "CÁMARA" and "GALERÍA", a disabled "IDENTIFICAR CON IA" button, and a form below.
result: pass

### 5. Identify form — save button disabled until fields filled
expected: In the identify modal, the "GUARDAR ESPECIE" button is disabled (greyed out) when the form is empty. It remains disabled if only the name is filled. It becomes active only after name, classification chip, AND danger level chip are all selected.
result: pass

### 6. Camera/Gallery permission request
expected: In the identify modal, tap "CÁMARA". The OS permission dialog appears asking for camera access (first time only). After granting, the device camera opens.
result: pass

### 7. Image preview after capture
expected: After capturing or selecting an image (via CÁMARA or GALERÍA), the "SIN IMAGEN" placeholder is replaced by a preview of the selected image. An "ELIMINAR" button appears over the image to remove it.
result: pass

### 8. Save species and return
expected: Fill in a species name, select a classification chip, select a danger level chip, then tap "GUARDAR ESPECIE". The button shows "GUARDANDO..." while saving. On success, the modal closes and the new species appears in the bestiary list.
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
