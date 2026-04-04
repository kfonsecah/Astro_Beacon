import { View, Text, ScrollView, SafeAreaView, RefreshControl } from "react-native";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/constants/colors";

const mockSpecies = [
  { id: "1", name: "Xenoflora lumínica", classification: "planta", danger: "amigable", confidence: 0.92 },
  { id: "2", name: "Desconocido", classification: "desconocido", danger: "cauteloso", confidence: 0.34 },
  { id: "3", name: "Cristalovoro", classification: "recurso", danger: "amigable", confidence: 0.87 },
  { id: "4", name: "Fauna sísmica", classification: "animal", danger: "peligroso", confidence: 0.76 },
  { id: "5", name: "Microbio radiactivo", classification: "microorganismo", danger: "letal", confidence: 0.95 },
  { id: "6", name: "Desconocido", classification: "desconocido", danger: "neutral", confidence: 0.21 },
];

const classificationColorMap: Record<string, string> = {
  planta: colors.classificationPlanta,
  animal: colors.classificationAnimal,
  recurso: colors.classificationRecurso,
  microorganismo: colors.classificationMicroorganismo,
  desconocido: colors.classificationDesconocido,
  otro: colors.classificationOtro,
};

const dangerColorMap: Record<string, string> = {
  amigable: colors.dangerAmigable,
  cauteloso: colors.dangerCauteloso,
  peligroso: colors.dangerPeligroso,
  letal: colors.dangerLetal,
};

export default function BestiaryScreen() {
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
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tc.primary} />
        }
      >
        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 16, letterSpacing: 3, marginBottom: 4 }}>BITÁCORA DE ESPECIES</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 20 }}>{mockSpecies.length} REGISTROS · 3 SIN CLASIFICAR</Text>

        {mockSpecies.map((species) => {
          const classColor = classificationColorMap[species.classification] || tc.textMuted;
          const dngColor = dangerColorMap[species.danger] || tc.textMuted;

          return (
            <View key={species.id} style={{ flexDirection: "row", backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, marginBottom: 12, padding: 12 }}>
              <View style={{ width: 60, height: 60, backgroundColor: tc.surfaceElevated, marginRight: 12 }} />
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>{species.name.toUpperCase()}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: classColor + "33" }}>
                    <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 1, color: classColor }}>{species.classification.toUpperCase()}</Text>
                  </View>
                  <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: tc.textDisabled, alignItems: "center", justifyContent: "center" }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dngColor }} />
                  </View>
                  <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9 }}>IA: {Math.round(species.confidence * 100)}%</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
