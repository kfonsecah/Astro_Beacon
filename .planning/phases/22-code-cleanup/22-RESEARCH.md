# Phase 22: Code Cleanup & Documentation - Research

## Objective
Research how to execute the code cleanup, specifically eliminating dead code (`token-refresh.ts`, `auth.context.tsx`), removing dev artifacts (the reanimated test button), and updating the tracking docs (`REQUIREMENTS.md`, `STATE.md`).

## Technical Assessment

### Dead Code Identification
- **`src/services/token-refresh.ts`**: The context correctly notes this logic was moved directly into the Axios interceptor in `src/services/api.ts` (the `isRefreshing`, `failedQueue` implementation).
- **`src/context/auth.context.tsx`**: Migrated to Zustand hooks, rendering this file empty (except for an `export {}`).
- **Safety check**: We will verify these files are completely orphaned using `grep_search` before deleting them during the plan execution.

### Dev Artifacts Removal
- **`app/(tabs)/dashboard.tsx`**: There is a specific UI block (around lines 155-161) containing a `TouchableOpacity` with the text `{/* UAT: Reanimated Test */}` pushing to `/reanimated-test`. This block simply needs to be removed from the TSX tree.

### Documentation State Tracking
- **`REQUIREMENTS.md`**: Need to search for `AUTH-01`, `AUTH-05`, `AUTH-06`, `AUTH-07`, `AUTH-08`, `API-02`, `API-03`, `API-05`, `UI-04`, `UI-06`, `UI-08`, `UI-10`, `UI-12` and swap `- [ ]` to `- [x]`. Need to fix `Traceability` section to point `ERR-01` to `ERR-06` to `Phase 21`.
- **`STATE.md`**: Update `progress.completed_plans` and `progress.completed_phases` values, mark Phase 22 as in progress/completed, and update timestamp.

## Recommended Approach
Since this phase contains no architectural changes, the plan should consist of atomic operations targeting cleanup, followed by documentation updates.

### Plan 1: Dead Code & Artifact Cleanup
1. Use `grep_search` to verify `token-refresh` and `auth.context` imports are completely gone.
2. Delete `src/services/token-refresh.ts` and `src/context/auth.context.tsx`.
3. Use `multi_replace_file_content` on `app/(tabs)/dashboard.tsx` to remove the reanimated-test button block.
4. Update `REQUIREMENTS.md` and `STATE.md` to accurately reflect the completed milestone v1.2.

## Validation Architecture
- Verify app builds successfully via `npx tsc --noEmit` to ensure no dangling imports.
- Visually verify the test button is gone from the dashboard.
- Verify `REQUIREMENTS.md` reflects all v1.2 phases completed.
