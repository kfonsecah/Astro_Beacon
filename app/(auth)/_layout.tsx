import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  // At auth layout level, theme context may not be available yet — use static styles.
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Text style={{ color: '#ff4444', fontFamily: 'monospace' }}>[ ERROR DEL SISTEMA ]</Text>
      <Text style={{ color: '#888', fontFamily: 'monospace', marginTop: 8 }}>{error.message}</Text>
    </View>
  );
}
