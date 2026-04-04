import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";

const mockSupplyDrops = [
  { id: "1", status: "pendiente", distance: "2.4 km", contents: "O₂ + Agua", eta: "6h" },
  { id: "2", status: "entregado", distance: "0.8 km", contents: "Comida + Médico", eta: null },
  { id: "3", status: "recogido", distance: "1.1 km", contents: "Equipo", eta: null },
];

const statusColors: Record<string, string> = {
  pendiente: "#F59E0B",
  entregado: "#22C55E",
  recogido: "#6B7280",
  expirado: "#EF4444",
};

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>MAPA DE EXPLORACIÓN</Text>
        <Text style={styles.subHeader}>COORDENADAS: 47.2°N · 123.8°W</Text>

        <View style={styles.mapPlaceholder}>
          <View style={styles.gridOverlay} />
          <View style={styles.centerMarker}>
            <View style={styles.centerDot} />
            <Text style={styles.centerLabel}>TÚ</Text>
          </View>
          <View style={[styles.marker, { top: 30, left: 60 }]}>
            <Text style={styles.markerText}>📍</Text>
            <Text style={styles.markerLabel}>2.4km</Text>
          </View>
          <View style={[styles.marker, { top: 80, right: 40 }]}>
            <Text style={styles.markerText}>📦</Text>
            <Text style={styles.markerLabel}>0.8km</Text>
          </View>
          <View style={[styles.marker, { bottom: 40, left: 80 }]}>
            <Text style={styles.markerText}>🏕️</Text>
            <Text style={styles.markerLabel}>BASE</Text>
          </View>
          <Text style={styles.scanLine}>— SCANNING —</Text>
        </View>

        <Text style={styles.sectionTitle}>SUMINISTROS</Text>

        {mockSupplyDrops.map((drop) => (
          <View key={drop.id} style={styles.supplyCard}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[drop.status] + "33" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusColors[drop.status] },
                ]}
              >
                {drop.status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.supplyInfo}>
              <Text style={styles.supplyContents}>{drop.contents}</Text>
              <Text style={styles.supplyDistance}>{drop.distance}</Text>
            </View>
            {drop.eta && (
              <Text style={styles.etaText}>ETA: {drop.eta}</Text>
            )}
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
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 220,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    position: "relative",
    overflow: "hidden",
    marginBottom: 20,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0,
  },
  centerMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
    alignItems: "center",
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6EE7B7",
    borderWidth: 2,
    borderColor: "#0B1120",
  },
  centerLabel: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 4,
  },
  marker: {
    position: "absolute",
    alignItems: "center",
  },
  markerText: {
    fontSize: 20,
  },
  markerLabel: {
    color: "#9CA3AF",
    fontFamily: "monospace",
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 2,
  },
  scanLine: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    color: "#1F2937",
    fontFamily: "monospace",
    fontSize: 8,
    letterSpacing: 4,
    textAlign: "center",
  },
  sectionTitle: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 12,
  },
  supplyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 12,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  statusText: {
    fontFamily: "monospace",
    fontSize: 8,
    letterSpacing: 1,
  },
  supplyInfo: {
    flex: 1,
  },
  supplyContents: {
    color: "#E5E7EB",
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 1,
  },
  supplyDistance: {
    color: "#6B7280",
    fontFamily: "monospace",
    fontSize: 9,
    marginTop: 2,
  },
  etaText: {
    color: "#F59E0B",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
  },
});
