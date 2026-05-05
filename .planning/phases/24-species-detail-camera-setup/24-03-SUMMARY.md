---
phase: "24"
plan: "03"
subsystem: mobile-frontend
tags: [modal, camera, form, chips, species-identify]
key-files:
  modified: [app/_layout.tsx, app/(tabs)/bestiary.tsx]
  created: [app/species/identify.tsx]
requirements-completed: [AI-06]
duration: "~5 min"
completed: "2026-05-05"
---

# Phase 24 Plan 03: Identify Modal + FAB Summary

Species identification modal created with HUD chip form for classification and danger level, image capture via useImagePicker, and useCreateSpecies integration; FAB added to bestiary screen; identify modal route registered with modal presentation style.

## Tasks Completed

| Task | Files | Commit |
|------|-------|--------|
| Configure modal route + FAB | app/_layout.tsx, app/(tabs)/bestiary.tsx | 5c16256 |
| Create identify modal | app/species/identify.tsx | e763bef |

## Success Criteria Verification

- [x] `species/identify` registered in `_layout.tsx` with `presentation: 'modal'`
- [x] FAB in bestiary navigates to `/species/identify`
- [x] `useImagePicker` integrated — `pickFromCamera` and `pickFromGallery` wired to buttons
- [x] Image preview shown; placeholder "SIN IMAGEN" when no image
- [x] Classification and dangerLevel chips with `flexWrap: 'wrap'`
- [x] "GUARDAR ESPECIE" disabled if name/classification/dangerLevel missing
- [x] "GUARDAR ESPECIE" disabled during mutation (isSubmitting guard)
- [x] Alert shown on mutation error
- [x] `router.back()` called on success
- [x] "IDENTIFICAR CON IA" button exists but is disabled (Phase 25)
- [x] `KeyboardAvoidingView` + `ScrollView` wrapping for small screen usability
- [x] Zero hex hardcoded — all colors via `useTheme()` + `tc.*`

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED
