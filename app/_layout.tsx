import { Stack, Redirect, usePathname } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { useEffect } from "react";

function AuthGuard({ children }: { children: React.ReactNode }) {
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

  if (!isAuthenticated && !pathname?.includes("login")) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const theme = useTheme();

  return (
    <AuthGuard>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthGuard>
  );
}
