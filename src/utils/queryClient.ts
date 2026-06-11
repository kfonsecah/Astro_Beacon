import { QueryClient, onlineManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Pessimistic start: assume offline until NetInfo confirms
onlineManager.setOnline(false);
NetInfo.fetch().then((state) => {
  onlineManager.setOnline(!!state.isConnected && state.isInternetReachable !== false);
});

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    // isInternetReachable can be null (unknown) — only treat as offline if explicitly false
    setOnline(!!state.isConnected && state.isInternetReachable !== false);
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — reduces simultaneous burst on tab switch
      gcTime: 7 * 24 * 60 * 60 * 1000,
      retry: (failureCount, error: any) => {
        const status = error?.status ?? error?.response?.status ?? null;
        // Hard 4xx errors (bad request, not found, forbidden) → never retry
        if (status !== null && status >= 400 && status < 500 && status !== 429) return false;
        // 429 rate limit → retry up to 2x with exponential backoff
        if (status === 429 && failureCount >= 2) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex, error: any) => {
        const status = (error as any)?.status ?? (error as any)?.response?.status ?? null;
        // 429: back off hard — 3s, 9s
        const base = status === 429 ? 3000 : 1000;
        return Math.min(base * 3 ** attemptIndex + Math.random() * 500, 30000);
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000,
  key: '@astrobeacon_rq_cache',
});