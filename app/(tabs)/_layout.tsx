import { RouteErrorFallback } from '@/components/common';
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OfflineBanner } from "@/components/common";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function TabLayout() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const { isConnected } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      {!isConnected && (
        <View style={{ paddingTop: insets.top, backgroundColor: tc.background }}>
          <OfflineBanner />
        </View>
      )}
      <Tabs
        screenOptions={{
        tabBarActiveTintColor: tc.primary,
        tabBarInactiveTintColor: tc.textMuted,
        tabBarActiveBackgroundColor: tc.primaryMuted,
        tabBarStyle: {
          position: "absolute",
          bottom: insets.bottom + 4,
          marginHorizontal: 16,
          height: 64,
          borderRadius: 32,
          backgroundColor: tc.surfaceElevated,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: tc.primaryBorder,
          paddingTop: 0,
          paddingBottom: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarItemStyle: {
          marginHorizontal: 6,
          marginVertical: 8,
          borderRadius: 24,
          overflow: "hidden",
        },
        headerStyle: {
          backgroundColor: tc.background,
        },
        headerStatusBarHeight: !isConnected ? 0 : undefined,
        headerTintColor: tc.primary,
        headerTitleStyle: {
          fontFamily: "monospace",
          letterSpacing: 2,
          fontSize: 14,
        },
        tabBarLabelStyle: {
          fontFamily: "monospace",
          fontSize: 9,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Panel",
          headerTitle: "PANEL DE CONTROL",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "planet" : "planet-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bestiary"
        options={{
          title: "Bitácora",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "bug" : "bug-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: "Recursos",
          headerTitle: "GESTIÓN DE RECURSOS",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "map" : "map-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logbook"
        options={{
          title: "Registros",
          headerTitle: "REGISTROS DE MISIÓN",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "journal" : "journal-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
