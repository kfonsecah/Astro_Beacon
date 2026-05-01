import { useState, useCallback } from "react";
import { View, Text, FlatList, SafeAreaView, RefreshControl, ActivityIndicator, Pressable } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { HudHeader } from "@/components/ui/HudHeader";
import { useTrips } from "@/hooks/useTrips";
import type { Viaje } from "@/types-dtos";

const statusColorMap: Record<string, string> = {
  planificado: "#FFC107",
  activo: "#4CAF50",
  completado: "#2196F3",
  abortado: "#F44336",
};

const statusLabelMap: Record<string, string> = {
  planificado: "PLANIFICADO",
  activo: "ACTIVO",
  completado: "COMPLETADO",
  abortado: "ABORTADO",
};

export default function TripsScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isFetching } = useTrips(page, limit);

  const onRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const loadMore = () => {
    if (data && page < data.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const getStatusColor = (status: string) => statusColorMap[status] || tc.textMuted;
  const getStatusLabel = (status: string) => statusLabelMap[status] || status.toUpperCase();

  if (isLoading && page === 1) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", marginTop: 8 }}>CARGANDO VIAJES...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 14, marginBottom: 8 }}>ERROR DE CONEXIÓN</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          No se pudieron cargar los viajes. Verifica tu conexión.
        </Text>
      </SafeAreaView>
    );
  }

  const trips = (data?.items || []) as Viaje[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={tc.primary} />
        }
        ListHeaderComponent={
          <>
            <HudHeader title="REGISTROS DE VIAJE" subtitle="BITÁCORA DE EXPLORACIÓN" />
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 16 }}>
              {data?.total || 0} VIAJES
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
                VIAJE #{item.id.slice(-4)}
              </Text>
              <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: getStatusColor(item.status) + "33" }}>
                <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 1, color: getStatusColor(item.status) }}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9 }}>
                O₂: {item.oxygenConsumed}/{item.oxygenBudgeted}
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9 }}>
                Recursos: {item.resourcesCollected || 0}
              </Text>
            </View>

            {item.notes && (
              <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, lineHeight: 18, marginBottom: 6 }}>
                 {item.notes}
              </Text>
            )}

              {item.status === 'planificado' && (
              <Pressable
                style={{ backgroundColor: tc.primary, padding: 8, alignItems: "center", marginTop: 8 }}
                onPress={() => {}}
              >
                <Text style={{ color: tc.background, fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>INICIAR VIAJE</Text>
              </Pressable>
            )}
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching && page > 1 ? (
            <ActivityIndicator size="small" color={tc.primary} style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 12 }}>
              NO HAY VIAJES REGISTRADOS
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
