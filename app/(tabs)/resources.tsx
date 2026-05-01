import { View, Text, FlatList, RefreshControl, ActivityIndicator, SafeAreaView } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { HudHeader } from "@/components/ui/HudHeader";
import { useResources, useResourceAlerts } from "@/hooks/useResources";
import { useState } from "react";

export default function ResourcesScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;

  const [page, setPage] = useState(1);
  const [allResources, setAllResources] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, error, refetch } = useResources(page, 10);
  const { data: alerts } = useResourceAlerts();

  // Accumulate resources across pages
  const resources = data?.items ?? [];
  const total = data?.total ?? 0;

  // Load more when page changes
  if (resources.length > 0 && allResources.length < total) {
    const newItems = resources.filter(
      (r: any) => !allResources.some((existing: any) => existing._id === r._id)
    );
    if (newItems.length > 0) {
      setAllResources(prev => [...prev, ...newItems]);
    }
  }

  const loadMore = () => {
    if (hasMore && !isLoading && allResources.length < total) {
      setPage(p => p + 1);
      setHasMore(allResources.length + (data?.items?.length ?? 0) < total);
    }
  };

  const onRefresh = async () => {
    setPage(1);
    setAllResources([]);
    setHasMore(true);
    await refetch();
  };

  if (isLoading && page === 1) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, marginTop: 12 }}>
          CARGANDO RECURSOS...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          ERROR AL CARGAR RECURSOS
        </Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginTop: 8, textAlign: "center" }}>
          {error.message || 'Intente de nuevo más tarde'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <FlatList
        data={allResources}
        keyExtractor={(item: any) => item._id || item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={onRefresh}
            colors={[tc.primary]}
            tintColor={tc.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => (
          <>
            <HudHeader title="GESTIÓN DE RECURSOS" subtitle="INVENTARIO ACTUAL" />

            {/* Alerts */}
            {alerts && alerts.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                {alerts.map((alert: any) => (
                  <View key={alert.resourceId} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(251,146,60,0.1)", borderWidth: 1, borderColor: "rgba(251,146,60,0.3)", padding: 12, marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
                    <Text style={{ color: tc.warning, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>
                      {alert.message}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12, marginTop: 8 }}>
              RECURSOS ({allResources.length}/{total})
            </Text>
          </>
        )}
        renderItem={({ item: resource }: { item: any }) => {
          const current = resource.currentAmount ?? 0;
          const max = resource.capacidadMaxima ?? 100;
          const thresholdPercentage = max > 0 ? ((resource.threshold ?? 0) / max) * 100 : 0;
          const isCritical = (current / max) * 100 < thresholdPercentage;

          return (
            <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14, marginBottom: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
                  {(resource.nombre || resource.name || 'UNKNOWN').toUpperCase()}
                </Text>
                <Text style={{ color: isCritical ? tc.danger : tc.primary, fontFamily: "monospace", fontSize: 12 }}>
                  {current}/{max} {resource.unidad || resource.unit || ''}
                </Text>
              </View>
              <ProgressBar value={current} max={max} criticalThreshold={thresholdPercentage} showValue={true} />
              {isCritical && (
                <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 6 }}>
                  ⚠️ NIVEL CRÍTICO
                </Text>
              )}
            </View>
          );
        }}
        ListFooterComponent={() =>
          isLoading && page > 1 ? (
            <View style={{ padding: 16, alignItems: "center" }}>
              <ActivityIndicator size="small" color={tc.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
              NO HAY RECURSOS ACTIVOS
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
