# Phase 21: Error Handling & Offline - Pattern Map

## Files to be Created/Modified

| File | Role | Data Flow |
|------|------|-----------|
| `src/components/common/RouteErrorFallback.tsx` | Common UI Component | Presentational, uses `useTheme` |
| `src/utils/queryClient.ts` | Config | Native module hook integration |
| `app/_layout.tsx` | Route | Exposes `ErrorBoundary` |
| `app/(auth)/_layout.tsx` | Route | Exposes `ErrorBoundary` |
| `app/(auth)/login.tsx` | Route | Exposes `ErrorBoundary` |
| `app/(tabs)/_layout.tsx` | Route | Render `OfflineBanner` |
| `app/(tabs)/dashboard.tsx` | Route | Exposes `ErrorBoundary` |
| `app/(tabs)/resources.tsx` | Route | Exposes `ErrorBoundary` |
| `app/(tabs)/bestiary.tsx` | Route | Exposes `ErrorBoundary` |
| `app/(tabs)/logbook.tsx` | Route | Exposes `ErrorBoundary` |
| `app/(tabs)/map.tsx` | Route | Exposes `ErrorBoundary` |
| `app/trips.tsx` | Route | Exposes `ErrorBoundary` |

## Existing Code Excerpts

### Pattern: Component Theming
**File:** `src/components/common/OfflineBanner.tsx`
```typescript
import { useTheme } from '@/hooks/use-theme';

export function OfflineBanner({ message }: OfflineBannerProps) {
  const theme = useTheme();
  const { colors: tc } = theme;
  return <Text style={{ color: tc.warning }}>{message}</Text>;
}
```

### Pattern: Route Layout
**File:** `app/(tabs)/_layout.tsx`
```typescript
import { Tabs } from 'expo-router';
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="dashboard" />
    </Tabs>
  );
}
```
