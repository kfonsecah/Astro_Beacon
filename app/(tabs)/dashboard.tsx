import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/Card";
import { HudHeader } from "@/components/ui/HudHeader";
import { useAstronautProfile, useAstronautDashboard } from "@/hooks/useAstronaut";
import type { Astronauta } from "@/types-dtos";

export default function DashboardScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const router = useRouter();

  const { data: astronaut, isLoading: loadingProfile, error: errorProfile } = useAstronautProfile();
  const { data: stats, isLoading: loadingStats, error: errorStats } = useAstronautDashboard();

  const isLoading = loadingProfile || loadingStats;
  const error = errorProfile || errorStats;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, marginTop: 12 }}>CARGANDO DATOS...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>ERROR AL CARGAR DATOS</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginTop: 8, textAlign: "center" }}>{error.message || 'Intente de nuevo más tarde'}</Text>
      </SafeAreaView>
    );
  }

  const resourcesCount = stats?.recursosCount ?? 0;
  const activeTrips = stats?.activeTrips ?? 0;
  const speciesDiscovered = stats?.speciesDiscovered ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <HudHeader
          title="PANEL DE CONTROL"
          subtitle={astronaut ? `${astronaut.nombre.toUpperCase()} · ${astronaut.estado.toUpperCase()}` : "CARGANDO..."}
        />

        <View style={{ marginTop: 8 }}>
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>ESTADÍSTICAS DE MISIÓN</Text>
          <Card>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>ASTRONAUTA</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>{astronaut?.nombre || 'N/A'}</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>ESTADO</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>{astronaut?.estado || 'N/A'}</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>RECURSOS ACTIVOS</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>{resourcesCount}</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>VIAJES EN CURSO</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>{activeTrips}</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>ESPECIES DESCUBIERTAS</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>{speciesDiscovered}</Text>
          </Card>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: "transparent", borderWidth: 1, borderColor: tc.border, paddingVertical: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 24, marginBottom: 8 }}>🚀</Text>
            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>EXPEDICIÓN</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "transparent", borderWidth: 1, borderColor: tc.border, paddingVertical: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 24, marginBottom: 8 }}>📷</Text>
            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>TOMAR FOTO</Text>
          </View>
        </View>

        {/* UAT: Reanimated Test */}
        <TouchableOpacity
          style={{ borderWidth: 1, borderColor: tc.danger, paddingVertical: 14, alignItems: "center", marginTop: 8 }}
          onPress={() => router.push("/reanimated-test")}
        >
          <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>🧪 UAT: REANIMATED TEST</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
