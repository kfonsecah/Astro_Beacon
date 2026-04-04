import { View, Text, ScrollView, SafeAreaView, RefreshControl } from "react-native";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";

const mockEntries = [
  { id: "1", date: "Día 47", description: "Nueva forma de vida cristalina descubierta cerca del río", species: "Cristalovoro", synced: true },
  { id: "2", date: "Día 46", description: "Actividad sísmica registrada en sector norte", species: null, synced: true },
  { id: "3", date: "Día 45", description: "Flora bioluminiscente en cavernas del este", species: "Xenoflora lumínica", synced: true },
  { id: "4", date: "Día 44", description: "Organismo microscópico en muestras de suelo", species: "Microbio radiactivo", synced: false },
  { id: "5", date: "Día 43", description: "Señal desconocida captada en frecuencia 1420MHz", species: null, synced: false },
];

export default function LogbookScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const { colors: tc } = theme;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tc.primary} />
        }
      >
        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 16, letterSpacing: 3, marginBottom: 4 }}>REGISTROS DE MISIÓN</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 20 }}>
          {mockEntries.length} ENTRADAS · {mockEntries.filter((e) => !e.synced).length} PENDIENTES
        </Text>

        {mockEntries.map((entry) => (
          <View key={entry.id} style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: tc.primary }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>{entry.date}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 10 }}>{entry.synced ? "✅" : "⏳"}</Text>
                <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 1, color: entry.synced ? tc.success : tc.warning }}>
                  {entry.synced ? "Sincronizado" : "Pendiente"}
                </Text>
              </View>
            </View>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, lineHeight: 18, marginBottom: 6 }}>{entry.description}</Text>
            {entry.species && (
              <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>🏷️ {entry.species}</Text>
            )}
          </View>
        ))}

        <View style={{ position: "absolute", bottom: 24, right: 24 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: tc.primary, justifyContent: "center", alignItems: "center", elevation: 4 }}>
            <Text style={{ color: tc.background, fontSize: 28, fontWeight: "bold", fontFamily: "monospace" }}>+</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
