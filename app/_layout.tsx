import { Stack } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { useEffect } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, asyncStoragePersister } from "@/utils/queryClient";
import { RouteErrorFallback } from '@/components/common';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastContainer } from "@/components/ui";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { resourceService } from "@/services/resource.service";

function OfflineSyncMount() {
  useOfflineSync();
  return null;
}

export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const theme = useTheme();
  const { colors: tc } = theme;

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Pre-warm cache for offline use — uses same key as resources tab (1, 10)
    queryClient.prefetchQuery({
      queryKey: ['resources', 'list', 1, 10],
      queryFn: () => resourceService.getAll(1, 10),
    });
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <OfflineSyncMount />
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="trips" />
            <Stack.Screen name="reanimated-test" />
            <Stack.Screen name="species/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="species/identify" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="log-resource/index" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="resource/[id]" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
        <ToastContainer />
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
