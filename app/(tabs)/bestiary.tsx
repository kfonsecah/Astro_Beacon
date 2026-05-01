import { useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { HudHeader } from "@/components/ui/HudHeader";
import { useSpecies } from "@/hooks/useSpecies";
import type { Especie } from "@/types-dtos";

const classificationColorMap: Record<string, string> = {
  planta: "#4CAF50",
  animal: "#FF9800",
  recurso: "#2196F3",
  microorganismo: "#9C27B0",
  desconocido: "#9E9E9E",
  otro: "#607D8B",
};

const dangerColorMap: Record<string, string> = {
  amigable: "#4CAF50",
  cauteloso: "#FFC107",
  peligroso: "#FF5722",
  letal: "#F44336",
};

export default function BestiaryScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isFetching } = useSpecies(page, limit);

  const onRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const loadMore = () => {
    if (data && page < data.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", marginTop: 8 }}>CARGANDO ESPECIES...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 14, marginBottom: 8 }}>ERROR DE CONEXIÓN</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          No se pudo cargar el bestiario. Verifica tu conexión.
        </Text>
      </View>
    );
  }

  const species = (data?.items || []) as Especie[];

  return (
    <View style={{ flex: 1, backgroundColor: tc.background, paddingTop: insets.top }}>
      <FlatList
        data={species}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={tc.primary} />
        }
        ListHeaderComponent={() => (
          <>
            <HudHeader title="BITÁCORA DE ESPECIES" subtitle="BESTIARIO PLANETARIO" />
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 16 }}>
              {data?.total || 0} REGISTROS
            </Text>
          </>
        )}
        renderItem={({ item }) => {
          const classColor = classificationColorMap[item.classification] || tc.textMuted;
          const dngColor = dangerColorMap[item.dangerLevel] || tc.textMuted;

          return (
            <View style={{ flexDirection: "row", backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, marginBottom: 12, padding: 12 }}>
              <View style={{ width: 60, height: 60, backgroundColor: tc.surfaceElevated, marginRight: 12 }} />
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>
                  {item.name.toUpperCase()}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: classColor + "33" }}>
                    <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 1, color: classColor }}>
                      {item.classification.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: tc.textDisabled, alignItems: "center", justifyContent: "center" }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dngColor }} />
                  </View>
                  <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9 }}>
                     IA: {Math.round((item.iaConfidence || 0) * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          isFetching && page > 1 ? (
            <ActivityIndicator size="small" color={tc.primary} style={{ marginVertical: 16 }} />
          ) : null
        )}
      />
    </View>
  );
}
