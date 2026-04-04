import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/constants/colors";

const mockSupplyDrops = [
  { id: "1", status: "pendiente", distance: "2.4 km", contents: "O₂ + Agua", eta: "6h" },
  { id: "2", status: "entregado", distance: "0.8 km", contents: "Comida + Médico", eta: null },
  { id: "3", status: "recogido", distance: "1.1 km", contents: "Equipo", eta: null },
];

const statusColorMap: Record<string, string> = {
  pendiente: colors.supplyPendiente,
  entregado: colors.supplyEntregado,
  recogido: colors.supplyRecogido,
  expirado: colors.supplyExpirado,
};

export default function MapScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 16, letterSpacing: 3, marginBottom: 4 }}>MAPA DE EXPLORACIÓN</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 16 }}>COORDENADAS: 47.2°N · 123.8°W</Text>

        <View style={{ height: 220, backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, position: "relative", overflow: "hidden", marginBottom: 20 }}>
          <View style={{ position: "absolute", top: "50%", left: "50%", marginLeft: -20, marginTop: -20, alignItems: "center" }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: tc.primary, borderWidth: 2, borderColor: tc.background }} />
            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 8, letterSpacing: 1, marginTop: 4 }}>TÚ</Text>
          </View>
          <View style={{ position: "absolute", top: 30, left: 60, alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>📍</Text>
            <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 8, letterSpacing: 1, marginTop: 2 }}>2.4km</Text>
          </View>
          <View style={{ position: "absolute", top: 80, right: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>📦</Text>
            <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 8, letterSpacing: 1, marginTop: 2 }}>0.8km</Text>
          </View>
          <View style={{ position: "absolute", bottom: 40, left: 80, alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>🏕️</Text>
            <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 8, letterSpacing: 1, marginTop: 2 }}>BASE</Text>
          </View>
          <Text style={{ position: "absolute", bottom: 8, left: 0, right: 0, color: tc.border, fontFamily: "monospace", fontSize: 8, letterSpacing: 4, textAlign: "center" }}>— SCANNING —</Text>
        </View>

        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>SUMINISTROS</Text>

        {mockSupplyDrops.map((drop) => {
          const statusColor = statusColorMap[drop.status] || tc.textMuted;
          return (
            <View key={drop.id} style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 12, marginBottom: 8 }}>
              <View style={{ paddingHorizontal: 8, paddingVertical: 4, marginRight: 12, backgroundColor: statusColor + "33" }}>
                <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 1, color: statusColor }}>{drop.status.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>{drop.contents}</Text>
                <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginTop: 2 }}>{drop.distance}</Text>
              </View>
              {drop.eta && (
                <Text style={{ color: tc.warning, fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>ETA: {drop.eta}</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
