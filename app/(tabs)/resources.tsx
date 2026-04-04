import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";

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
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>GESTIÓN DE RECURSOS</Text>
        <Text style={styles.subHeader}>INVENTARIO ACTUAL</Text>

        {mockResources.map((resource) => {
          const percentage = (resource.current / resource.max) * 100;
          const segments = 10;
          const filledSegments = Math.round((percentage / 100) * segments);
          const isCritical = percentage < resource.threshold;

          return (
            <View key={resource.id} style={styles.resourceCard}>
              <View style={styles.resourceHeader}>
                <Text style={styles.resourceName}>{resource.name}</Text>
                <Text
                  style={[
                    styles.resourceValue,
                    isCritical && styles.resourceValueCritical,
                  ]}
                >
                  {resource.current}/{resource.max} {resource.unit}
                </Text>
              </View>
              <View style={styles.resourceBarContainer}>
                {Array.from({ length: segments }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.segment,
                      i < filledSegments
                        ? isCritical
                          ? styles.segmentCritical
                          : styles.segmentActive
                        : styles.segmentInactive,
                    ]}
                  />
                ))}
              </View>
              {isCritical && (
                <Text style={styles.criticalAlert}>⚠️ NIVEL CRÍTICO</Text>
              )}
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          HISTORIAL DE MOVIMIENTOS
        </Text>

        {mockMovements.map((movement) => (
          <View key={movement.id} style={styles.movementRow}>
            <View style={styles.movementIcon}>
              <Text style={styles.movementIconText}>
                {movement.type === "ingreso" ? "📥" : "📤"}
              </Text>
            </View>
            <View style={styles.movementInfo}>
              <Text style={styles.movementResource}>{movement.resource}</Text>
              <Text style={styles.movementReason}>{movement.reason}</Text>
            </View>
            <View style={styles.movementAmount}>
              <Text
                style={[
                  styles.movementValue,
                  movement.type === "ingreso"
                    ? styles.movementValueIncome
                    : styles.movementValueExpense,
                ]}
              >
                {movement.type === "ingreso" ? "+" : "-"}{movement.amount}
              </Text>
              <Text style={styles.movementDate}>{movement.date}</Text>
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
  resourceCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 14,
    marginBottom: 10,
  },
  resourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resourceName: {
    color: "#9CA3AF",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 2,
  },
  resourceValue: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 12,
  },
  resourceValueCritical: {
    color: "#EF4444",
  },
  resourceBarContainer: {
    flexDirection: "row",
    gap: 2,
  },
  segment: {
    flex: 1,
    height: 6,
  },
  segmentActive: {
    backgroundColor: "#6EE7B7",
  },
  segmentInactive: {
    backgroundColor: "#1F2937",
  },
  segmentCritical: {
    backgroundColor: "#EF4444",
  },
  criticalAlert: {
    color: "#EF4444",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 6,
  },
  sectionTitle: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 12,
  },
  movementRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 12,
    marginBottom: 8,
  },
  movementIcon: {
    marginRight: 12,
  },
  movementIconText: {
    fontSize: 18,
  },
  movementInfo: {
    flex: 1,
  },
  movementResource: {
    color: "#E5E7EB",
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 1,
  },
  movementReason: {
    color: "#6B7280",
    fontFamily: "monospace",
    fontSize: 9,
    marginTop: 2,
  },
  movementAmount: {
    alignItems: "flex-end",
  },
  movementValue: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "bold",
  },
  movementValueIncome: {
    color: "#22C55E",
  },
  movementValueExpense: {
    color: "#EF4444",
  },
  movementDate: {
    color: "#4B5563",
    fontFamily: "monospace",
    fontSize: 8,
  },
});
