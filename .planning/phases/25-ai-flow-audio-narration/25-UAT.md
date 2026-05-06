---
status: testing
phase: 25-ai-flow-audio-narration
source: [25-01-SUMMARY.md, 25-02-SUMMARY.md, 25-03-SUMMARY.md]
started: 2026-05-05T18:30:00Z
updated: 2026-05-05T18:30:00Z
---

## Tests

### 1. AI Identification Button Active
expected: In the identify modal, after selecting an image, the "IDENTIFICAR CON IA" button is enabled and has a HUD-themed background.
result: [pending]

### 2. Scan Animation
expected: Tap "IDENTIFICAR CON IA". A semi-transparent overlay appears over the image with a horizontal scan line moving up and down. Text "ANALIZANDO ESPÉCIMEN..." pulses in the center.
result: [pending]

### 3. AI Result Auto-fill
expected: After the scan animation finishes, the form fields (Name, Classification, Danger Level, Notes) are automatically filled with data returned from the backend AI service.
result: [pending]

### 4. Confidence Display
expected: After identification, a "CONFIANZA: XX%" chip appears below the identification button. The color should be green for high confidence (>=75%), orange for medium (50-74%), or red for low (<50%).
result: [pending]

### 5. Non-blocking error feedback
expected: If the identification fails (e.g., no internet), an alert is shown: "ANÁLISIS NO DISPONIBLE — Completa los datos manualmente." The modal and form remain open for manual entry.
result: [pending]

### 6. Audio Narration Toggle
expected: In the species detail screen, tap "NARRAR". The device begins speaking the species name and details. The button text changes to "DETENER" and turns red.
result: [pending]

### 7. Stop Narration
expected: While the device is speaking, tap "DETENER". The audio stops immediately, and the button reverts to "NARRAR" (primary color).
result: [pending]

### 8. Cleanup Narration
expected: Start narration and navigate back to the bestiary. The audio should stop automatically.
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps

[none]
