---
phase: 19-critical-bug-fixes
plan: 02
status: complete
completed: 2026-05-04
commit: 0103640
---

# Plan 19-02 Summary: Pagination Accumulation Fix (Bestiary, Logbook, Trips)

## What Was Built

Applied the `resources.tsx` accumulation pattern to the three screens that had broken infinite scroll (items replaced rather than accumulated on page load).

## Changes Made

### app/(tabs)/bestiary.tsx — 6 changes

1. Added `useEffect` to React import
2. Added `allSpecies: Especie[]` state (starts empty)
3. Added `hasMore: boolean` state (starts true)
4. Added `useEffect([data])` that deduplicates new items via `Set<string>` of IDs and appends to `allSpecies`
5. Updated `loadMore` to use `hasMore && !isFetching` guard instead of `page < data.totalPages`
6. Updated `onRefresh` to reset `allSpecies` and `hasMore` before refetch
7. Removed `const species = (data?.items || []) as Especie[]` direct assignment
8. Updated `<FlatList data={allSpecies}` (was `data={species}`)

### app/(tabs)/logbook.tsx — 6 changes (same pattern)

1. Added `useEffect` to React import
2. Added `allEntries: BitacoraEntradaResponse[]` state
3. Added `hasMore: boolean` state
4. Added `useEffect([data])` with Set deduplication accumulating into `allEntries`
5. Updated `loadMore` to use `hasMore && !isFetching && allEntries.length < data?.total` guard
6. Updated `onRefresh` (now async) to reset accumulated state
7. Removed `const entries = (data?.items || [])` direct assignment
8. Updated `<FlatList data={allEntries}` (was `data={entries}`)

### app/trips.tsx — 6 changes (same pattern)

1. Added `useEffect` to React import
2. Added `allTrips: Viaje[]` state
3. Added `hasMore: boolean` state
4. Added `useEffect([data])` with Set deduplication accumulating into `allTrips`
5. Updated `loadMore` to use `hasMore && !isFetching && allTrips.length < data?.total` guard
6. Updated `onRefresh` (now async) to reset accumulated state
7. Removed `const trips = (data?.items || [])` direct assignment
8. Updated `<FlatList data={allTrips}` (was `data={trips}`)

## Deduplication Pattern Used (canonical from resources.tsx)

```typescript
useEffect(() => {
  const newItems = data?.items ?? [];
  if (newItems.length > 0) {
    setState(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const filtered = newItems.filter(item => !existingIds.has(item.id));
      return filtered.length > 0 ? [...prev, ...filtered] : prev;
    });
    setHasMore((data?.total ?? 0) > state.length + newItems.length);
  }
}, [data]);
```

## Verification Gates

```bash
# allSpecies: 5+ references
grep -n "allSpecies" app/(tabs)/bestiary.tsx  # ✓ 6+ lines

# allEntries: 5+ references  
grep -n "allEntries" app/(tabs)/logbook.tsx  # ✓ 6+ lines

# allTrips: 5+ references
grep -n "allTrips" app/trips.tsx  # ✓ 6+ lines

# Old direct assignment gone
grep -n "data={species}" app/(tabs)/bestiary.tsx  # ✓ 0 results
grep -n "data={entries}" app/(tabs)/logbook.tsx  # ✓ 0 results
grep -n "data={trips}" app/trips.tsx  # ✓ 0 results

# Old totalPages bug gone
grep -rn "page < data.totalPages" app/(tabs)/bestiary.tsx app/(tabs)/logbook.tsx app/trips.tsx  # ✓ 0 results
```

## Impact

- **Bestiary**: Scroll to bottom now appends species from page 2+ without losing page 1
- **Logbook**: Scroll to bottom now appends entries from page 2+ without losing page 1
- **Trips**: Scroll to bottom now appends trips from page 2+ without losing page 1
- **Pull-to-refresh**: Resets accumulated state in all three screens and returns to page 1
- **FlatList `keyExtractor`**: Already correct in all three files — no key conflicts with deduplication

## Self-Check: PASSED

All grep gates verified. Pattern matches `resources.tsx` canonical implementation. Old buggy assignment variables removed from all three files.

## key-files

### created
- (none — fixes to existing files only)

### modified
- app/(tabs)/bestiary.tsx
- app/(tabs)/logbook.tsx
- app/trips.tsx
