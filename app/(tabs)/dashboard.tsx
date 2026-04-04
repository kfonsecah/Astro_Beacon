import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/constants/colors";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { HudHeader } from "@/components/ui/HudHeader";

const mockResources = [
  { id: "o2", name: "OXÍGENO", current: 87, max: 100, unit: "%", critical: false },
  { id: "h2o", name: "AGUA", current: 62, max: 100, unit: "%", critical: false },
  { id: "food", name: "COMIDA", current: 45, max: 100, unit: "%", critical: false },
  { id: "med", name: "MÉDICO", current: 78, max: 100, unit: "%", critical: false },
];

const mockAlerts = [
  { id: 1, type: "warning", message: "Suministro #47 expira en 2 días" },
];

export default function DashboardScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <HudHeader title="PANEL DE CONTROL" subtitle="DÍA 47 · PLANETA DESCONOCIDO" />

        {mockAlerts.map((alert) => (
          <View key={alert.id} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.warningMuted, borderWidth: 1, borderColor: colors.warningBorder, padding: 12, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
            <Text style={{ color: tc.warning, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>{alert.message}</Text>
          </View>
        ))}

        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>RECURSOS ACTIVOS</Text>

        {mockResources.map((resource) => (
          <ProgressBar
            key={resource.id}
            label={resource.name}
            value={resource.current}
            max={resource.max}
            criticalThreshold={resource.critical ? 15 : 100}
          />
        ))}

        <View style={{ marginTop: 8 }}>
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>PROGRESO DE MISIÓN</Text>
          <Card>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>ESTADO</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>ACTIVA</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>SEÑAL</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>ESTABLE · 847ms</Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 8 }}>PRÓXIMO SUMINISTRO</Text>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>ETA: 2d 14h</Text>
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
