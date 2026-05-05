import { RouteErrorFallback } from '@/components/common';
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { View } from "react-native";
import { OfflineBanner } from "@/components/common";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function TabLayout() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const { isConnected } = useNetworkStatus();

  return (
    <View style={{ flex: 1 }}>
      {!isConnected && <OfflineBanner />}
      <Tabs
        screenOptions={{
        tabBarActiveTintColor: tc.primary,
        tabBarInactiveTintColor: tc.textMuted,
        tabBarStyle: {
          backgroundColor: tc.background,
          borderTopColor: tc.primaryBorder,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: tc.background,
        },
        headerTintColor: tc.primary,
        headerTitleStyle: {
          fontFamily: "monospace",
          letterSpacing: 2,
          fontSize: 14,
        },
        tabBarLabelStyle: {
          fontFamily: "monospace",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Panel",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bestiary"
        options={{
          title: "Bitácora",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bug-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: "Recursos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logbook"
        options={{
          title: "Registros",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="journal-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
