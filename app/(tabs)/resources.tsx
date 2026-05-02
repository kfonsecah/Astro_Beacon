import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { HudHeader } from "@/components/ui/HudHeader";
import { useResources, useResourceAlerts } from "@/hooks/useResources";
import { useState, useEffect } from "react";
import type { Recurso } from "@/types-dtos";

export default function ResourcesScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const insets = useSafeAreaInsets();

  const [page, setPage] = useState(1);
  const [allResources, setAllResources] = useState<Recurso[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, error, refetch } = useResources(page, 10);
  const { data: alerts } = useResourceAlerts();

  // Accumulate resources across pages
    useEffect(() => {
      const newItems = data?.items ?? [];
      if (newItems.length > 0) {
        setAllResources(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const filtered = newItems.filter(r => !existingIds.has(r.id));
          return filtered.length > 0 ? [...prev, ...filtered] : prev;
        });
        setHasMore((data?.total ?? 0) > allResources.length + newItems.length);
      }
    }, [data]);

  const loadMore = () => {
    if (hasMore && !isLoading && allResources.length < (data?.total ?? 0)) {
      setPage(p => p + 1);
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
      <View style={{ flex: 1, backgroundColor: tc.background, paddingTop: insets.top, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, marginTop: 12 }}>
          CARGANDO RECURSOS...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, paddingTop: insets.top, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          ERROR AL CARGAR RECURSOS
        </Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginTop: 8, textAlign: "center" }}>
          {error.message || 'Intente de nuevo más tarde'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tc.background, paddingTop: insets.top }}>
      <FlatList
        data={allResources}
        keyExtractor={(item: Recurso) => item.id || (item as any)._id || Math.random().toString()}
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
              RECURSOS ({allResources.length}/{data?.total ?? 0})
            </Text>
          </>
        )}
        renderItem={({ item }: { item: Recurso }) => {
            const current = item.currentAmount ?? 0;
            const max = item.threshold ? item.threshold * 2 : 100;
            const thresholdPercentage = max > 0 ? ((item.threshold ?? 0) / max) * 100 : 0;
          const isCritical = (current / max) * 100 < thresholdPercentage;

          return (
            <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14, marginBottom: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
                  {item.name.toUpperCase()}
                </Text>
                <Text style={{ color: isCritical ? tc.danger : tc.primary, fontFamily: "monospace", fontSize: 12 }}>
                   {current}/{max} {item.unit || ''}
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

    </View>
  );
}
