import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl } from "react-native";
import { useState } from "react";

const mockEntries = [
  { id: "1", date: "Día 47", description: "Nueva forma de vida cristalina descubierta cerca del río", species: "Cristalovoro", synced: true },
  { id: "2", date: "Día 46", description: "Actividad sísmica registrada en sector norte", species: null, synced: true },
  { id: "3", date: "Día 45", description: "Flora bioluminiscente en cavernas del este", species: "Xenoflora lumínica", synced: true },
  { id: "4", date: "Día 44", description: "Organismo microscópico en muestras de suelo", species: "Microbio radiactivo", synced: false },
  { id: "5", date: "Día 43", description: "Señal desconocida captada en frecuencia 1420MHz", species: null, synced: false },
];

export default function LogbookScreen() {
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
        <Text style={styles.header}>REGISTROS DE MISIÓN</Text>
        <Text style={styles.subHeader}>{mockEntries.length} ENTRADAS · {mockEntries.filter((e) => !e.synced).length} PENDIENTES</Text>

        {mockEntries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>{entry.date}</Text>
              <View style={styles.syncBadge}>
                <Text style={styles.syncIcon}>{entry.synced ? "✅" : "⏳"}</Text>
                <Text
                  style={[
                    styles.syncText,
                    entry.synced ? styles.syncedText : styles.pendingText,
                  ]}
                >
                  {entry.synced ? "Sincronizado" : "Pendiente"}
                </Text>
              </View>
            </View>
            <Text style={styles.entryDescription}>{entry.description}</Text>
            {entry.species && (
              <Text style={styles.entrySpecies}>
                🏷️ {entry.species}
              </Text>
            )}
          </View>
        ))}

        <View style={styles.fabContainer}>
          <View style={styles.fab}>
            <Text style={styles.fabText}>+</Text>
          </View>
        </View>
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
    paddingBottom: 100,
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
  entryCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#6EE7B7",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  entryDate: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 2,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  syncIcon: {
    fontSize: 10,
  },
  syncText: {
    fontFamily: "monospace",
    fontSize: 8,
    letterSpacing: 1,
  },
  syncedText: {
    color: "#22C55E",
  },
  pendingText: {
    color: "#F59E0B",
  },
  entryDescription: {
    color: "#E5E7EB",
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 6,
  },
  entrySpecies: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
  },
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6EE7B7",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  fabText: {
    color: "#0B1120",
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
});
