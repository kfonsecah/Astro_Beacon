import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/constants/colors";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useTripById } from "@/hooks/useTrips";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { RouteErrorFallback } from '@/components/common';

const statusColorMap: Record<string, string> = {
  planificado: colors.tripPlanificado,
  activo: colors.tripActivo,
  completado: colors.tripCompletado,
  abortado: colors.tripAbortado,
};

const statusLabelMap: Record<string, string> = {
  planificado: "PLANIFICADO",
  activo: "ACTIVO",
  completado: "COMPLETADO",
  abortado: "ABORTADO",
};

export default function MissionDetailScreen() {
  const theme = useTheme();
  const tc = theme.colors;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: mission, isLoading, isError } = useTripById(id || "");

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, marginTop: 12 }}>
          CARGANDO MISIÓN...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || !mission) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 14, marginBottom: 8 }}>ERROR DE CONEXIÓN</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          No se pudo cargar la misión. Verifica tu conexión.
        </Text>
      </SafeAreaView>
    );
  }

  const dest = mission.destination;
  const elapsedMin = mission.startedAt
    ? Math.floor(((mission.completedAt ? new Date(mission.completedAt).getTime() : Date.now()) - new Date(mission.startedAt).getTime()) / 60000)
    : 0;
  const h = Math.floor(elapsedMin / 60);
  const m = elapsedMin % 60;
  const duration = elapsedMin > 0 ? (h > 0 ? `${h}h ${m}m` : `${m}m`) : "--";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: tc.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 14 }}>← VOLVER</Text>
        </TouchableOpacity>
        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, flex: 1 }}>
          MISIÓN #{mission.id.slice(-4).toUpperCase()}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Badge label={statusLabelMap[mission.status] || mission.status.toUpperCase()} color={statusColorMap[mission.status]} />
        </View>

        <Card>
          {dest && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>DESTINO</Text>
              <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>
                LAT: {dest.lat.toFixed(4)} / LNG: {dest.lng.toFixed(4)}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>O₂ CONSUMIDO</Text>
              <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 14 }}>
                {mission.oxygenConsumed}/{mission.oxygenBudgeted}
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>RECURSOS</Text>
              <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 14 }}>
                {mission.resourcesCollected || 0}
              </Text>
            </View>
          </View>

          <View>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>DURACIÓN</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>{duration}</Text>
          </View>
        </Card>

        {mission.notes && (
          <Card style={{ marginTop: 16 }}>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>NOTAS</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, lineHeight: 18 }}>{mission.notes}</Text>
          </Card>
        )}

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/logbook")}
          style={{ marginTop: 24, alignItems: "center", borderWidth: 1, borderColor: tc.border, paddingVertical: 14 }}
        >
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>← VOLVER A EXPEDICIONES</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
