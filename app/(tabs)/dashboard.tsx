import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";

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
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>PANEL DE CONTROL</Text>
        <Text style={styles.subHeader}>DÍA 47 · PLANETA DESCONOCIDO</Text>

        {mockAlerts.map((alert) => (
          <View key={alert.id} style={styles.alertBanner}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertText}>{alert.message}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>RECURSOS ACTIVOS</Text>

        {mockResources.map((resource) => {
          const percentage = (resource.current / resource.max) * 100;
          const segments = 10;
          const filledSegments = Math.round((percentage / 100) * segments);

          return (
            <View key={resource.id} style={styles.resourceRow}>
              <Text style={styles.resourceLabel}>{resource.name}</Text>
              <View style={styles.resourceBarContainer}>
                {Array.from({ length: segments }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.segment,
                      i < filledSegments
                        ? resource.critical
                          ? styles.segmentCritical
                          : styles.segmentActive
                        : styles.segmentInactive,
                    ]}
                  />
                ))}
              </View>
              <Text
                style={[
                  styles.resourceValue,
                  resource.critical && styles.resourceValueCritical,
                ]}
              >
                {Math.round(percentage)}{resource.unit}
              </Text>
            </View>
          );
        })}

        <View style={styles.missionSection}>
          <Text style={styles.sectionTitle}>PROGRESO DE MISIÓN</Text>
          <View style={styles.missionCard}>
            <Text style={styles.missionLabel}>ESTADO</Text>
            <Text style={styles.missionValue}>ACTIVA</Text>
            <Text style={styles.missionLabel}>SEÑAL</Text>
            <Text style={styles.missionValue}>ESTABLE · 847ms</Text>
            <Text style={styles.missionLabel}>PRÓXIMO SUMINISTRO</Text>
            <Text style={styles.missionValue}>ETA: 2d 14h</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <View style={styles.actionButton}>
            <Text style={styles.actionIcon}>🚀</Text>
            <Text style={styles.actionText}>EXPEDICIÓN</Text>
          </View>
          <View style={styles.actionButton}>
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionText}>TOMAR FOTO</Text>
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
  },
  header: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 18,
    letterSpacing: 4,
    marginBottom: 4,
  },
  subHeader: {
    color: "#4B5563",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 20,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 146, 60, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(251, 146, 60, 0.3)",
    padding: 12,
    marginBottom: 16,
  },
  alertIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  alertText: {
    color: "#FB923C",
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 1,
  },
  sectionTitle: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 12,
  },
  resourceRow: {
    marginBottom: 12,
  },
  resourceLabel: {
    color: "#9CA3AF",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  resourceBarContainer: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 4,
  },
  segment: {
    flex: 1,
    height: 8,
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
  resourceValue: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 12,
    textAlign: "right",
  },
  resourceValueCritical: {
    color: "#EF4444",
  },
  missionSection: {
    marginTop: 8,
  },
  missionCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 16,
  },
  missionLabel: {
    color: "#4B5563",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 8,
  },
  missionValue: {
    color: "#E5E7EB",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 1,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingVertical: 20,
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 2,
  },
});
