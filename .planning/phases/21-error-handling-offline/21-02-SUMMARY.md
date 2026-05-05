# Phase 21: error-handling-offline - Plan 02 Summary

## Objective
Implement global offline support via TanStack Query's onlineManager and display a persistent offline banner.

## Changes Made
- Connected `@react-native-community/netinfo` to `@tanstack/react-query`'s `onlineManager` in `src/utils/queryClient.ts` to automatically pause and resume API queries based on network status.
- Added `OfflineBanner` to `app/(tabs)/_layout.tsx` to display a persistent offline warning across all tabs when `isConnected` is false (driven by `useNetworkStatus`).

## Status
Completed successfully. The app now handles network disconnects gracefully at the API layer, and users are notified via the HUD-style banner when they go offline.
