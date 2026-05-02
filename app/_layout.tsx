import { Stack, usePathname } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/queryClient";

export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const theme = useTheme();
  const { colors: tc } = theme;
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Protected group="authenticated" guard={() => isAuthenticated}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="trips" />
          <Stack.Screen name="reanimated-test" />
        </Stack.Protected>
      </Stack>
    </QueryClientProvider>
  );
}
