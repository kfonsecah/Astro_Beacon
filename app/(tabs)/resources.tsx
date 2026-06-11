import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { TankGauge } from "@/components/ui/TankGauge";
import { WarnTriangle, RadarSweep } from "@/components/ui/Holo3D";
import { useResources, useResourceAlerts } from "@/hooks/useResources";
import { useState, useEffect, useMemo } from "react";
import type { Recurso } from "@/types-dtos";
import { RouteErrorFallback } from '@/components/common';
import { colors } from '@/constants/colors';

const CATEGORY_CONFIG: Record<string, { color: string; symbol: string }> = {
  oxigeno: { color: colors.categoryOxigeno, symbol: 'O2'  },
  agua:    { color: colors.categoryAgua,    symbol: 'H2O' },
  comida:  { color: colors.categoryComida,  symbol: 'ALI' },
  medico:  { color: colors.categoryMedico,  symbol: 'MED' },
  equipo:  { color: colors.categoryEquipo,  symbol: 'EQP' },
  otro:    { color: colors.categoryOtro,    symbol: 'OTR' },
};

function resourceMax(item: Recurso): number {
  return item.maxCapacity ?? (item.threshold ? Math.round(item.threshold / 0.15) : 100);
}

export default function ResourcesScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [page, setPage] = useState(1);
  const [allResources, setAllResources] = useState<Recurso[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useResources(page, 10);
  const { data: alerts } = useResourceAlerts();

  // Accumulate resources across pages, updating existing entries on refetch
  useEffect(() => {
    const newItems = data?.items ?? [];
    if (newItems.length === 0) return;
    setAllResources(prev => {
      const map = new Map(prev.map(r => [r.id, r]));
      for (const item of newItems) map.set(item.id, item);
      const next = [...map.values()];
      setHasMore((data?.total ?? 0) > next.length);
      return next;
    });
  }, [data]);

  const loadMore = () => {
    if (hasMore && !isLoading && !isRefreshing && !error && allResources.length < (data?.total ?? 0)) {
      setPage(p => p + 1);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    setHasMore(true);
    const result = await refetch();
    const newItems = result.data?.items ?? [];
    setAllResources(newItems);
    setHasMore((result.data?.total ?? 0) > newItems.length);
    setIsRefreshing(false);
  };

  // Resumen por categoría para el panel de almacenes
  const categorySummary = useMemo(() => {
    const acc = new Map<string, { current: number; max: number; threshold: number }>();
    for (const r of allResources) {
      const key = CATEGORY_CONFIG[r.category] ? r.category : 'otro';
      const entry = acc.get(key) ?? { current: 0, max: 0, threshold: 0 };
      entry.current += r.currentAmount ?? 0;
      entry.max += resourceMax(r);
      entry.threshold += r.threshold ?? 0;
      acc.set(key, entry);
    }
    return [...acc.entries()].map(([category, v]) => {
      const pct = v.max > 0 ? (v.current / v.max) * 100 : 0;
      const thresholdPct = v.max > 0 ? (v.threshold / v.max) * 100 : 0;
      return {
        category,
        pct,
        thresholdPct,
        critical: thresholdPct > 0 && pct <= thresholdPct,
        ...CATEGORY_CONFIG[category],
      };
    });
  }, [allResources]);

  const overallPct = useMemo(() => {
    const totals = allResources.reduce(
      (sum, r) => ({ current: sum.current + (r.currentAmount ?? 0), max: sum.max + resourceMax(r) }),
      { current: 0, max: 0 },
    );
    return totals.max > 0 ? Math.round((totals.current / totals.max) * 100) : 0;
  }, [allResources]);

  if (isLoading && page === 1) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, marginTop: 12 }}>
          CARGANDO RECURSOS...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          ERROR AL CARGAR RECURSOS
        </Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginTop: 8, textAlign: "center" }}>
          {error.message || 'Intente de nuevo más tarde'}
        </Text>
      </View>
    );
  }

  const listHeader = (
    <>
      {/* Alerts */}
      {alerts && alerts.filter((a: any) => a.message).length > 0 && (
        <View style={{ marginBottom: 16 }}>
          {alerts.filter((a: any) => a.message).map((alert: any) => (
            <View key={alert.resourceId} style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.warningMuted, borderWidth: 1, borderColor: tc.warningBorder, padding: 12, marginBottom: 8 }}>
              <View style={{ marginRight: 10 }}>
                <WarnTriangle size={14} color={tc.warning} />
              </View>
              <Text style={{ color: tc.warning, fontFamily: "monospace", fontSize: 11, letterSpacing: 1, flex: 1 }}>
                {alert.message}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Panel de almacenes por categoría */}
      {categorySummary.length > 0 && (
        <View
          style={{
            backgroundColor: tc.surface,
            borderWidth: 1,
            borderColor: tc.border,
            borderLeftWidth: 3,
            borderLeftColor: tc.primary,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <RadarSweep size={30} color={tc.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 }}>
                ESTADO DE ALMACENES
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8, letterSpacing: 1, marginTop: 2 }}>
                CAPACIDAD AGREGADA POR CATEGORÍA
              </Text>
            </View>
            <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 20 }}>
              {overallPct}<Text style={{ fontSize: 10 }}>%</Text>
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {categorySummary.map((cat) => (
              <View key={cat.category} style={{ alignItems: 'center', flex: 1 }}>
                <TankGauge
                  pct={cat.pct}
                  color={cat.critical ? tc.danger : cat.color}
                  width={18}
                  height={52}
                  thresholdPct={cat.thresholdPct}
                  critical={cat.critical}
                />
                <Text style={{ color: cat.critical ? tc.danger : cat.color, fontFamily: 'monospace', fontSize: 8, letterSpacing: 1, marginTop: 6 }}>
                  {cat.symbol}
                </Text>
                <Text style={{ color: cat.critical ? tc.danger : tc.textMuted, fontFamily: 'monospace', fontSize: 8, marginTop: 2 }}>
                  {Math.round(cat.pct)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 11, letterSpacing: 2, opacity: 0.9, marginBottom: 12, marginTop: 8 }}>
        RECURSOS ({allResources.length}/{data?.total ?? 0})
      </Text>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: tc.background }}>
      <FlatList
        data={allResources}
        keyExtractor={(item, index) => item.id ?? `resource-${index}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
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
        removeClippedSubviews={false}
        ListHeaderComponent={listHeader}
        renderItem={({ item }: { item: Recurso }) => {
          const current = item.currentAmount ?? 0;
          const max = resourceMax(item);
          const thresholdPercentage = max > 0 ? (item.threshold / max) * 100 : 15;
          const levelPct = max > 0 ? (current / max) * 100 : 0;
          const isCritical = levelPct <= thresholdPercentage;
          const catConfig = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG['otro'];
          const levelColor = isCritical ? tc.danger : catConfig.color;

          return (
            <TouchableOpacity
              onPress={() => router.push(`/resource/${item.id}`)}
              style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: isCritical ? tc.danger + '55' : tc.border, borderLeftWidth: 3, borderLeftColor: catConfig.color, padding: 14, marginBottom: 10 }}
            >
              <View style={{ flexDirection: 'row' }}>
                {/* Tanque con nivel animado */}
                <TankGauge
                  pct={levelPct}
                  color={levelColor}
                  width={26}
                  height={64}
                  thresholdPct={thresholdPercentage}
                  critical={isCritical}
                />

                {/* Datos del recurso */}
                <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ color: catConfig.color, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1, marginRight: 6 }}>
                      {catConfig.symbol}
                    </Text>
                    <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2, flex: 1 }} numberOfLines={1}>
                      {item.name.toUpperCase()}
                    </Text>
                    <View style={{ backgroundColor: levelColor + '22', paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: levelColor, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 }}>
                        {Math.round(levelPct)}%
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <Text style={{ color: isCritical ? tc.danger : tc.text, fontFamily: 'monospace', fontSize: 20, lineHeight: 24 }}>
                      {current}
                    </Text>
                    <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, marginLeft: 6, marginBottom: 2 }}>
                      / {max} {item.unit || ''}
                    </Text>
                  </View>

                  {isCritical ? (
                    <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 4 }}>
                      ⬡ NIVEL CRÍTICO
                    </Text>
                  ) : (
                    <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 8, letterSpacing: 1, marginTop: 4 }}>
                      UMBRAL {item.threshold ?? 0} {item.unit || ''}
                    </Text>
                  )}
                </View>
              </View>

              {(item.movements ?? []).length > 0 && (
                <View style={{ borderTopWidth: 1, borderTopColor: tc.border, marginTop: 12, paddingTop: 10 }}>
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
            </TouchableOpacity>
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
          bottom: insets.bottom + 84,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: tc.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 10,
        }}
        onPress={() => router.push('/log-resource')}
      >
        <Text style={{ color: tc.background, fontFamily: 'monospace', fontSize: 24, lineHeight: 26 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
