import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { HudHeader } from "@/components/ui/HudHeader";
import { useResources, useResourceAlerts } from "@/hooks/useResources";
import { useState, useEffect } from "react";
import type { Recurso } from "@/types-dtos";
import { RouteErrorFallback } from '@/components/common';

export default function ResourcesScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [allResources, setAllResources] = useState<Recurso[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useResources(page, 10);
  const { data: alerts } = useResourceAlerts();

  // Accumulate resources across pages
  useEffect(() => {
    const newItems = data?.items ?? [];
    if (newItems.length > 0) {
      setAllResources(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const filtered = newItems.filter(r => !existingIds.has(r.id));
        const next = filtered.length > 0 ? [...prev, ...filtered] : prev;
        setHasMore((data?.total ?? 0) > next.length);
        return next;
      });
    }
  }, [data]);

  const loadMore = () => {
    if (hasMore && !isLoading && !isRefreshing && !error && allResources.length < (data?.total ?? 0)) {
      setPage(p => p + 1);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    setAllResources([]);
    setHasMore(true);
    await refetch();
    setIsRefreshing(false);
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
        keyExtractor={(item, index) => item.id ?? `resource-${index}`}
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
                  <View key={alert.resourceId} style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.warningMuted, borderWidth: 1, borderColor: tc.warningBorder, padding: 12, marginBottom: 8 }}>
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
          const max = item.maxCapacity ?? (item.threshold ? Math.round(item.threshold / 0.15) : 100);
          const thresholdPercentage = max > 0 ? (item.threshold / max) * 100 : 15;
          const isCritical = (current / max) * 100 < thresholdPercentage;

          return (
            <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14, marginBottom: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
                  {item.name.toUpperCase()}
                </Text>
                <Text style={{ color: isCritical ? tc.danger : tc.primary, fontFamily: "monospace", fontSize: 12 }}>
                  {current} / {max} {item.unit || ''}
                </Text>
              </View>
              <ProgressBar value={current} max={max} criticalThreshold={thresholdPercentage} showValue={false} />
              {isCritical && (
                <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 6 }}>
                  NIVEL CRITICO — {Math.round((current / max) * 100)}%
                </Text>
              )}
              {(item.movements ?? []).length > 0 && (
                <View style={{ borderTopWidth: 1, borderTopColor: tc.border, marginTop: 10, paddingTop: 10 }}>
                  <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, marginBottom: 6 }}>
                    ULTIMOS MOVIMIENTOS
                  </Text>
                  {(item.movements ?? []).slice(0, 3).map((mov, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ color: mov.type === 'ingreso' ? tc.success : tc.danger,
                                     fontFamily: 'monospace', fontSize: 11, width: 20 }}>
                        {mov.type === 'ingreso' ? '+' : '-'}
                      </Text>
                      <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 9, flex: 1 }}>
                        {mov.amount} {item.unit}
                      </Text>
                      <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8 }}>
                        {new Date(mov.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
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

      {/* FAB to register movement */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          backgroundColor: tc.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: 10,
        }}
        onPress={() => router.push('/log-resource')}
      >
        <Text style={{ color: tc.background, fontSize: 30, fontWeight: 'bold', marginTop: -2 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
