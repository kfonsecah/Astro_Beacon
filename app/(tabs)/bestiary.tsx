import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl } from "react-native";
import { useState } from "react";

const mockSpecies = [
  { id: "1", name: "Xenoflora lumínica", classification: "planta", danger: "amigable", confidence: 0.92 },
  { id: "2", name: "Desconocido", classification: "desconocido", danger: "cauteloso", confidence: 0.34 },
  { id: "3", name: "Cristalovoro", classification: "recurso", danger: "amigable", confidence: 0.87 },
  { id: "4", name: "Fauna sísmica", classification: "animal", danger: "peligroso", confidence: 0.76 },
  { id: "5", name: "Microbio radiactivo", classification: "microorganismo", danger: "letal", confidence: 0.95 },
  { id: "6", name: "Desconocido", classification: "desconocido", danger: "neutral", confidence: 0.21 },
];

const classificationColors: Record<string, string> = {
  planta: "#22C55E",
  animal: "#3B82F6",
  recurso: "#6EE7B7",
  microorganismo: "#A855F7",
  desconocido: "#6B7280",
  otro: "#F59E0B",
};

const dangerColors: Record<string, string> = {
  amigable: "#22C55E",
  cauteloso: "#F59E0B",
  peligroso: "#EF4444",
  letal: "#A855F7",
};

export default function BestiaryScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6EE7B7" />
        }
      >
        <Text style={styles.header}>BITÁCORA DE ESPECIES</Text>
        <Text style={styles.subHeader}>{mockSpecies.length} REGISTROS · 3 SIN CLASIFICAR</Text>

        {mockSpecies.map((species) => (
          <View key={species.id} style={styles.speciesCard}>
            <View style={styles.speciesThumbnail} />
            <View style={styles.speciesInfo}>
              <Text style={styles.speciesName}>{species.name.toUpperCase()}</Text>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: classificationColors[species.classification] + "33" },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: classificationColors[species.classification] },
                    ]}
                  >
                    {species.classification.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.dangerDot}>
                  <View
                    style={[
                      styles.dangerDotInner,
                      { backgroundColor: dangerColors[species.danger] },
                    ]}
                  />
                </View>
                <Text style={styles.confidenceText}>
                  IA: {Math.round(species.confidence * 100)}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 16,
    letterSpacing: 3,
    marginBottom: 4,
  },
  subHeader: {
    color: "#4B5563",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 20,
  },
  speciesCard: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 12,
    padding: 12,
  },
  speciesThumbnail: {
    width: 60,
    height: 60,
    backgroundColor: "#1F2937",
    marginRight: 12,
  },
  speciesInfo: {
    flex: 1,
    justifyContent: "center",
  },
  speciesName: {
    color: "#E5E7EB",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: "monospace",
    fontSize: 8,
    letterSpacing: 1,
  },
  dangerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  confidenceText: {
    color: "#6B7280",
    fontFamily: "monospace",
    fontSize: 9,
  },
});
