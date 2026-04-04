import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { HudHeader } from "@/components/ui/HudHeader";

const mockResources = [
  { id: "o2", name: "OXÍGENO", category: "oxigeno", current: 87, max: 100, unit: "%", threshold: 15 },
  { id: "h2o", name: "AGUA", category: "agua", current: 62, max: 100, unit: "%", threshold: 15 },
  { id: "food", name: "COMIDA", category: "comida", current: 45, max: 100, unit: "%", threshold: 15 },
  { id: "med", name: "MÉDICO", category: "medico", current: 78, max: 100, unit: "%", threshold: 10 },
  { id: "equip", name: "EQUIPO", category: "equipo", current: 92, max: 100, unit: "%", threshold: 20 },
];

const mockMovements = [
  { id: "1", type: "ingreso", resource: "AGUA", amount: 15, reason: "Suministro #46", date: "Día 47" },
  { id: "2", type: "egreso", resource: "OXÍGENO", amount: 8, reason: "Expedición al norte", date: "Día 46" },
  { id: "3", type: "egreso", resource: "COMIDA", amount: 3, reason: "Ración diaria", date: "Día 46" },
  { id: "4", type: "ingreso", resource: "MÉDICO", amount: 10, reason: "Suministro #45", date: "Día 44" },
];

export default function ResourcesScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <HudHeader title="GESTIÓN DE RECURSOS" subtitle="INVENTARIO ACTUAL" />

        {mockResources.map((resource) => {
          const isCritical = (resource.current / resource.max) * 100 < resource.threshold;
          return (
            <View key={resource.id} style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14, marginBottom: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>{resource.name}</Text>
                <Text style={{ color: isCritical ? tc.danger : tc.primary, fontFamily: "monospace", fontSize: 12 }}>
                  {resource.current}/{resource.max} {resource.unit}
                </Text>
              </View>
              <ProgressBar value={resource.current} max={resource.max} criticalThreshold={resource.threshold} showValue={false} />
              {isCritical && <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 6 }}>⚠️ NIVEL CRÍTICO</Text>}
            </View>
          );
        })}

        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12, marginTop: 24 }}>HISTORIAL DE MOVIMIENTOS</Text>

        {mockMovements.map((movement) => (
          <View key={movement.id} style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 12, marginBottom: 8 }}>
            <Text style={{ fontSize: 18, marginRight: 12 }}>{movement.type === "ingreso" ? "📥" : "📤"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>{movement.resource}</Text>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginTop: 2 }}>{movement.reason}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: "monospace", fontSize: 14, fontWeight: "bold", color: movement.type === "ingreso" ? tc.success : tc.danger }}>
                {movement.type === "ingreso" ? "+" : "-"}{movement.amount}
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 8 }}>{movement.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
