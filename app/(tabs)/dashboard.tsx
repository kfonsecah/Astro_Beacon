import { Card } from "@/components/ui/Card";
import { HudHeader } from "@/components/ui/HudHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTheme } from "@/hooks/use-theme";
import { useAstronautDashboard, useAstronautProfile } from "@/hooks/useAstronaut";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useResourceAlerts, useResources } from "@/hooks/useResources";
import { useRouter } from "expo-router";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function DashboardScreen() {
  const theme = useTheme();
  const tc = theme.colors;
  const router = useRouter();

  const { data: astronaut, isLoading: loadingProfile, error: errorProfile } = useAstronautProfile();
  const { data: stats, isLoading: loadingStats, error: errorStats } = useAstronautDashboard();
  const { data: alerts, isLoading: loadingAlerts } = useResourceAlerts();
  const { data: resourcesData, isLoading: loadingResources } = useResources(1, 10);
  const networkStatus = useNetworkStatus();

  const isLoading = loadingProfile || loadingStats || loadingAlerts || loadingResources;
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

  const resources = resourcesData?.items ?? [];
  const supplyETA = "2d 14h";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <HudHeader
          title="PANEL DE CONTROL"
          subtitle={astronaut?.name ? `${String(astronaut.name).toUpperCase()} · ${String(astronaut.status ?? '').toUpperCase()}` : "CARGANDO..."}
        />

        {/* Alerts - only show when there are alerts */}
            {alerts && alerts.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            {alerts.map((alert) => (
              <View key={alert.resourceId} style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.warning, padding: 12, marginBottom: 8 }}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
                <Text style={{ color: tc.warning, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Signal Status */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 3 }}>DÍA 47 · PLANETA DESCONOCIDO</Text>
          <Text style={{ color: networkStatus.isConnected ? tc.success : tc.danger, fontFamily: "monospace", fontSize: 9, letterSpacing: 1 }}>
            {networkStatus.isConnected ? 'EN LÍNEA' : 'SIN CONEXIÓN'}
          </Text>
        </View>

        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>RECURSOS ACTIVOS</Text>

        {resources.length > 0 ? resources.map((resource: any) => {
            const resId = resource._id || resource.id;
            const resName = resource.name || resource.nombre || 'UNKNOWN';
            const current = resource.currentAmount ?? 0;
            const max = resource.capacidadMaxima ?? resource.capacity ?? 100;
            const thresholdPercentage = max > 0 ? ((resource.threshold ?? 0) / max) * 100 : 0;
            const isCritical = (current / max) * 100 < thresholdPercentage;
            return (
              <View key={resId} style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14, marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>{resName.toUpperCase()}</Text>
                  <Text style={{ color: isCritical ? tc.danger : tc.primary, fontFamily: "monospace", fontSize: 12 }}>
                    {current}/{max} {resource.unidad || resource.unit || ''}
                  </Text>
                </View>
                <ProgressBar value={current} max={max} criticalThreshold={thresholdPercentage} showValue={true} />
                {isCritical && <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 6 }}>⚠️ NIVEL CRÍTICO</Text>}
              </View>
            );
          }) : (
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>NO ACTIVE RESOURCES</Text>
          )}

        <View style={{ marginTop: 8 }}>
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>PROGRESO DE MISIÓN</Text>
          <Card>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>ESTADO</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>{(astronaut?.status ?? 'N/A').toUpperCase()}</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>SEÑAL</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>{networkStatus.isConnected ? 'ESTABLE · 847ms' : 'OFFLINE'}</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>PRÓXIMO SUMINISTRO</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>ETA: {supplyETA}</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>RECURSOS ACTIVOS</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>{resourcesCount}</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>VIAJES EN CURSO</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>{activeTrips}</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>ESPECIES DESCUBIERTAS</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>{speciesDiscovered}</Text>
          </Card>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 12 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "transparent", borderWidth: 1, borderColor: tc.border, paddingVertical: 20, alignItems: "center" }}
            onPress={() => router.push("/trips")}
          >
            <Text style={{ fontSize: 24, marginBottom: 8 }}>🚀</Text>
            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>EXPEDICIÓN</Text>
           </TouchableOpacity>
          <TouchableOpacity>
            style={{ flex: 1, backgroundColor: "transparent", borderWidth: 1, borderColor: tc.border, paddingVertical: 20, alignItems: "center" }}
            onPress={() => router.push("/(tabs)/logbook")}
          >
            <Text style={{ fontSize: 24, marginBottom: 8 }}>📷</Text>
            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>TOMAR FOTO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
