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
      <View style={{ flex: 1, backgroundColor: tc.background, paddingTop: insets.top, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", marginTop: 8 }}>CARGANDO ESPECIES...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, paddingTop: insets.top, justifyContent: "center", alignItems: "center", padding: 20 }}>
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
        keyExtractor={(item) => item.id || (item as any)._id || Math.random().toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={tc.primary} />
        }
        ListHeaderComponent={() => (
          <>
            <HudHeader title="BESTIARIO" subtitle="ESPECIES DESCUBIERTAS" />
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 16 }}>
              {data?.total || 0} ESPECIES
            </Text>
          </>
        )}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
                {item.name.toUpperCase()}
              </Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <View style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: classificationColorMap[item.classification] + "33" }}>
                  <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 1, color: classificationColorMap[item.classification] }}>
                    {item.classification.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {item.description && (
              <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, lineHeight: 18, marginBottom: 8 }}>
                {item.description}
              </Text>
            )}

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9 }}>
                IA: {item.iaConfidence}%
              </Text>
              <View style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: dangerColorMap[item.dangerLevel] + "33" }}>
                <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 1, color: dangerColorMap[item.dangerLevel] }}>
                  {item.dangerLevel.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          isFetching && page > 1 ? (
            <ActivityIndicator size="small" color={tc.primary} style={{ marginVertical: 16 }} />
          ) : null
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 12 }}>
              NO HAY ESPECIES REGISTRADAS
            </Text>
          </View>
        }
      />
    </View>
  );
}
