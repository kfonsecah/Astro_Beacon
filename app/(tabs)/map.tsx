import { useState, useCallback } from "react";
import { View, Text, FlatList, SafeAreaView, RefreshControl, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { HudHeader } from "@/components/ui/HudHeader";
import { useSupplies } from "@/hooks/useSupplies";
import type { Suministro } from "@/types-dtos";

const statusColorMap: Record<string, string> = {
  pendiente: "#FFC107",
  entregado: "#4CAF50",
  recogido: "#2196F3",
  expirado: "#F44336",
};

const statusLabelMap: Record<string, string> = {
  pendiente: "PENDIENTE",
  entregado: "ENTREGADO",
  recogido: "RECOGIDO",
  expirado: "EXPIRADO",
};

export default function MapScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isFetching } = useSupplies(page, limit);

  const onRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const loadMore = () => {
    if (data && page < data.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const getStatusColor = (estado: string) => statusColorMap[estado] || tc.textMuted;
  const getStatusLabel = (estado: string) => statusLabelMap[estado] || estado.toUpperCase();

  if (isLoading && page === 1) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", marginTop: 8 }}>CARGANDO SUMINISTROS...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 14, marginBottom: 8 }}>ERROR DE CONEXIÓN</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          No se pudieron cargar los suministros. Verifica tu conexión.
        </Text>
      </SafeAreaView>
    );
  }

  const supplies = (data?.items || []) as Suministro[];

  const formatContents = (contenido: { resourceId: string; cantidad: number }[]) => {
    return contenido.map(item => `${item.resourceId.slice(-6)} x${item.cantidad}`).join(" + ");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <FlatList
        data={supplies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={tc.primary} />
        }
        ListHeaderComponent={
          <>
            <HudHeader title="MAPA DE EXPLORACIÓN" subtitle="SUMINISTROS DISPONIBLES" />
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 16 }}>
              {data?.total || 0} SUMINISTROS
            </Text>

            {/* Placeholder map view */}
            <View style={{ height: 180, backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, marginBottom: 20, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 40 }}>🗺️</Text>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 8, letterSpacing: 2, marginTop: 8 }}>
                MAPA DE ubicación próximamente
              </Text>
            </View>

            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>LISTA DE SUMINISTROS</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 12, marginBottom: 8 }}>
            <View style={{ paddingHorizontal: 8, paddingVertical: 4, marginRight: 12, backgroundColor: getStatusColor(item.estado) + "33" }}>
              <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 1, color: getStatusColor(item.estado) }}>
                {getStatusLabel(item.estado)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>
                {formatContents(item.contenido)}
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginTop: 2 }}>
                📍 {item.ubicacion.lat.toFixed(2)}, {item.ubicacion.lng.toFixed(2)}
              </Text>
            </View>
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
              NO HAY SUMINISTROS DISPONIBLES
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
