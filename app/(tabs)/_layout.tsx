import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6EE7B7",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTintColor: "#6EE7B7",
        headerTitleStyle: styles.headerTitle,
        tabBarLabelStyle: styles.tabLabel,
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
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#0B1120",
    borderTopColor: "rgba(110, 231, 183, 0.3)",
    borderTopWidth: 1,
  },
  header: {
    backgroundColor: "#0B1120",
  },
  headerTitle: {
    fontFamily: "monospace",
    letterSpacing: 2,
    fontSize: 14,
  },
  tabLabel: {
    fontFamily: "monospace",
    fontSize: 10,
  },
});
