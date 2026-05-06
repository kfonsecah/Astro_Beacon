# Phase 26: Gestures + Log Resource Screen - Research

**Researched:** 2026-05-05
**Domain:** React Native Gestures & Inventory Management
**Confidence:** HIGH

## Summary

This phase focuses on enhancing the user experience through native gestures and completing the resource management lifecycle by implementing the "Log Resource" screen. We will use `react-native-gesture-handler` for swipe and long-press interactions in the bestiary, and create a new form-based screen to record resource movements (ingresos/egresos).

**Primary recommendation:** Use the standard `Swipeable` component from `react-native-gesture-handler` for the bestiary cards and implement the long-press preview using `TouchableOpacity`'s `onLongPress` for simplicity and consistency with the existing design system.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Native Gestures | Browser/Client | — | Handled by native gesture engine on the device for low latency. |
| Gesture Logic (Routing/Modals) | Browser/Client | — | Client-side navigation or state changes triggered by gestures. |
| Log Resource Form | Browser/Client | — | Handles user input and local validation. |
| Resource Movement Processing | API/Backend | Browser/Client | The backend validates inventory rules (e.g., non-negative stock) and persists history. |
| Resource State Sync | Browser/Client | — | React Query handles cache invalidation after a movement is recorded. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-native-gesture-handler` | `~2.28.0` | Native gestures (Swipe, Long Press) | Standard Expo/React Native gesture library. [VERIFIED: package.json] |
| `expo-router` | `~6.0.23` | Screen navigation | File-based routing for Expo apps. [VERIFIED: package.json] |
| `react-native-reanimated` | `~4.1.1` | Optimized animations | Powering smooth UI transitions (used by GH). [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| `expo-haptics` | `~15.0.8` | Tactical feedback | Optional: Use to provide feedback on gesture completion. [CITED: package.json] |

**Installation:**
```bash
# Already installed in the project
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (tabs)/
│   ├── bestiary.tsx    # Inject Swipeable and Long-press
│   └── resources.tsx   # Add navigation button to log-resource
└── log-resource/
    └── index.tsx       # New Form Screen
src/
├── components/
│   └── species/
│       └── SpeciesPreviewModal.tsx  # Extracted preview component
└── types-dtos/
    └── recurso.dto.ts  # DTO definitions
```

### Pattern 1: Swipeable Wrap
**What:** Wrapping list items with `Swipeable` to reveal action buttons.
**When to use:** For secondary actions like "View Details" or "Quick Delete".
**Example:**
```tsx
// Source: https://docs.swmansion.com/react-native-gesture-handler/docs/components/swipeable/
import { Swipeable } from 'react-native-gesture-handler';

const renderRightActions = () => (
  <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
    <Text style={styles.actionText}>VER</Text>
  </TouchableOpacity>
);

<Swipeable renderRightActions={renderRightActions}>
  <ListItemContent />
</Swipeable>
```

### Anti-Patterns to Avoid
- **Nesting FlatList inside GestureHandlerRootView incorrectly:** Ensure `GestureHandlerRootView` is at the very root (`_layout.tsx`) to avoid touch conflicts on Android.
- **Manual State Management for Inventory:** Avoid recalculating `currentAmount` in the frontend; always rely on the backend response or invalidation of queries to get the authoritative state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Swipe Interactions | Custom PanResponder logic | `Swipeable` (GH) | Handling friction, velocity, and bounce-back is complex. |
| Gesture Conflicts | Manual `stopPropagation` | `GestureHandlerRootView` | Native gesture system coordinates between multiple active gestures. |

## Common Pitfalls

### Pitfall 1: Gestures Not Registering on Android
**What goes wrong:** Swipeable items don't slide or long-press doesn't trigger on Android devices.
**Why it happens:** Missing `GestureHandlerRootView` in the root layout.
**How to avoid:** Explicitly wrap the root component in `app/_layout.tsx`. [VERIFIED: Missing in current codebase]

### Pitfall 2: DTO Property Mismatch
**What goes wrong:** API returns 400 Bad Request when recording movements.
**Why it happens:** Frontend DTO uses Spanish names (`tipo`, `cantidad`, `razon`) while the backend API expects English names (`type`, `amount`, `notes`).
**How to avoid:** Map the frontend DTO to the backend schema in the service layer or update the DTO. [VERIFIED: Mismatch found between src/types-dtos/recurso.dto.ts and api/src/schemas/resource.schema.ts]

## Code Examples

### Verified Pattern for Record Movement
```typescript
// Mapping logic required in src/services/resource.service.ts
async recordMovement(resourceId: string, data: CreateRecursoMovimientoDTO): Promise<Recurso> {
  const apiData = {
    type: data.tipo,
    amount: data.cantidad,
    notes: data.razon
  };
  const response = await api.post<{ success: boolean; data: Recurso }>(
    `/resources/${resourceId}/movement`, 
    apiData
  );
  return response.data.data;
}
```

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `Swipeable` is standard for this GH version | Standard Stack | Minor implementation detail change if ReanimatedSwipeable is required. |
| A2 | `TouchableOpacity` is enough for Long-press | Summary | Might need `LongPressGestureHandler` if `TouchableOpacity` conflicts with `Swipeable`. |

## Open Questions (RESOLVED)

1. **Should we use ReanimatedSwipeable?** (RESOLVED)
   - What we know: Standard `Swipeable` is easier to implement and sufficient for simple reveal actions.
   - Resolution: We will use the standard `Swipeable` component. It provides the required functionality with less complexity and is well-supported by the installed version of `react-native-gesture-handler`. Performance is acceptable for the intended use case (revealing a single button).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `react-native-gesture-handler` | Gestures | ✓ | 2.28.0 | — |
| `GestureHandlerRootView` | Android Gestures | ✗ | — | **Action: Add to _layout.tsx** |
| `useRecordResourceMovement` | Log Resource | ✓ | — | — |

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
| GEST-01 | Swipe reveals action | E2E/Manual | — | ❌ |
| GEST-02 | Long-press shows modal | Unit/Component | `npm test` | ❌ |
| LOGR-01 | Form submits movement | Integration | `npm test` | ❌ |

## Security Domain

### Known Threat Patterns for Gestures/Forms

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Input Over-injection | Tampering | Zod schema validation on Backend (already in place). |
| Resource Exhaustion (Inventory) | Tampering | Backend validates `newAmount >= 0`. |

## Sources

### Primary (HIGH confidence)
- `package.json` - Verified library versions.
- `app/_layout.tsx` - Confirmed missing `GestureHandlerRootView`.
- `src/types-dtos/recurso.dto.ts` - Confirmed DTO naming mismatch.
- `api/src/schemas/resource.schema.ts` - Confirmed backend expectation.

### Secondary (MEDIUM confidence)
- `react-native-gesture-handler` official docs - Verified import and usage patterns.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified in package.json.
- Architecture: HIGH - Clear separation of concerns.
- Pitfalls: HIGH - Found direct evidence of missing root view and DTO mismatch.

**Research date:** 2026-05-05
**Valid until:** 2026-06-05
