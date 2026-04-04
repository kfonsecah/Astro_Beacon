import { Stack, Redirect, usePathname } from "expo-router";
import { AuthProvider, useAuth } from "@/context/auth.context";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/use-theme";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();
  const { colors: tc } = theme;
  const pathname = usePathname();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
      </View>
    );
  }

  // Only redirect if not authenticated AND not already on an auth screen
  if (!isAuthenticated && !pathname?.includes("login")) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}

function RootLayoutContent() {
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

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
