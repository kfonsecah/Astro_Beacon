# Phase 26 Validation: Gestures + Log Resource Screen

This document defines the verification strategy for the Gestures and Log Resource screen implementation, following the Validation Architecture defined in `26-RESEARCH.md`.

## Phase Goal
Enhance user interaction with native gestures in the Bestiary and complete the resource management lifecycle with the "Log Resource" screen.

## Goal-Backward Verification

| Outcome | Observable Truth | Required Artifact | Wiring Check |
|---------|------------------|-------------------|--------------|
| **Native Gestures Support** | Swipe and Long-press work on Android and iOS. | `app/_layout.tsx` | Wrapped in `GestureHandlerRootView` |
| **Interactive Bestiary** | User can reveal actions via swipe and see previews via long-press. | `app/(tabs)/bestiary.tsx` | `Swipeable` wraps items; `onLongPress` triggers Modal |
| **Resource Logging** | User can record movement and see stock update. | `app/log-resource/index.tsx` | Connected to `useRecordResourceMovement` |
| **Data Integrity** | Frontend Spanish DTO maps correctly to Backend English schema. | `src/services/resource.service.ts` | Manual mapping in `recordMovement` |

## Automated Verification

Run these commands to verify implementation patterns:

```bash
# Verify GestureHandlerRootView in layout
grep -q "GestureHandlerRootView" app/_layout.tsx

# Verify Swipeable and LongPress in Bestiary
grep -q "Swipeable" app/(tabs)/bestiary.tsx
grep -q "onLongPress" app/(tabs)/bestiary.tsx

# Verify DTO Mapping in Service
grep -q "type: data.tipo" src/services/resource.service.ts
grep -q "amount: data.cantidad" src/services/resource.service.ts
grep -q "notes: data.razon" src/services/resource.service.ts

# Verify navigation target exists
ls app/log-resource/index.tsx
```

## User Acceptance Testing (UAT)

### Scenario 1: Bestiary Gestures
1. **Navigate** to Bestiary tab.
2. **Gesture (Swipe):** Swipe left on "Astro-Oruga".
   - **Expected:** Cyan "VER" button is revealed.
3. **Action:** Tap "VER".
   - **Expected:** Navigates to Species Detail screen.
4. **Gesture (Long-press):** Press and hold "Astro-Oruga" for 1 second.
   - **Expected:** Modal appears with "Astro-Oruga" details (Classification: Insecto, Danger: Bajo).
5. **Dismiss:** Tap "CERRAR" or outside the modal.
   - **Expected:** Modal disappears.

### Scenario 2: Log Resource Movement
1. **Navigate** to Resources tab.
2. **Navigate:** Tap the "+" or "REGISTRAR MOVIMIENTO" button.
   - **Expected:** Navigates to `/log-resource` screen.
3. **Form Entry:**
   - Resource: Select "Oxígeno".
   - Type: Choose "INGRESO".
   - Amount: Enter "50".
   - Reason: Enter "Recarga de estación".
4. **Submit:** Tap "REGISTRAR".
   - **Expected:** Screen closes, returns to Resources tab.
5. **Verify State:** Check "Oxígeno" stock in the list.
   - **Expected:** Current amount has increased by 50.

## Error Handling & Edge Cases
- **Negative Amount:** Try to register a movement with a negative number.
  - **Expected:** UI prevents submission or shows validation error.
- **Empty Fields:** Try to register with missing resource or amount.
  - **Expected:** "Registrar" button is disabled or shows errors.
- **No Connection:** Record movement while offline.
  - **Expected:** Offline banner appears (from Phase 21) and TanStack Query handles the retry logic or shows error.
