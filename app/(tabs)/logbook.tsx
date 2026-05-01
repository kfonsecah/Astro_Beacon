import { useState, useCallback } from "react";
import { View, Text, FlatList, SafeAreaView, RefreshControl, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { HudHeader } from "@/components/ui/HudHeader";
import { useLogbookEntries } from "@/hooks/useLogbook";
import type { BitacoraEntradaResponse } from "@/types-dtos";

export default function LogbookScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isFetching } = useLogbookEntries(page, limit);

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
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", marginTop: 8 }}>CARGANDO BITÁCORA...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 14, marginBottom: 8 }}>ERROR DE CONEXIÓN</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          No se pudo cargar la bitácora. Verifica tu conexión.
        </Text>
      </SafeAreaView>
    );
  }

  const entries = (data?.items || []) as BitacoraEntradaResponse[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={tc.primary} />
        }
        ListHeaderComponent={() => (
          <>
            <HudHeader title="REGISTROS DE MISIÓN" subtitle="BITÁCORA ACTUAL" />
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 16 }}>
              {data?.total || 0} ENTRADAS
            </Text>
          </>
        )}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: tc.primary }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
              {item.title ? item.title.toUpperCase() : `DÍA ${item.createdAt ? new Date(item.createdAt).getDate() : '?'}`}
            </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 10 }}>{item.updatedAt ? "✅" : "⏳"}</Text>
                <Text style={{ fontFamily: "monospace", fontSize: 8, color: item.updatedAt ? tc.success : tc.warning }}>
                  {item.updatedAt ? "Sincronizado" : "Pendiente"}
                </Text>
              </View>
            </View>
            <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, lineHeight: 18, marginBottom: 6 }}>{item.description}</Text>
            {item.title && (
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginBottom: 6 }}>{item.title}</Text>
            )}
            {item.speciesName && (
              <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>🏷️ {item.speciesName}</Text>
            )}
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          isFetching && page > 1 ? (
            <ActivityIndicator size="small" color={tc.primary} style={{ marginVertical: 16 }} />
          ) : null
        )}
      />
    </SafeAreaView>
  );
}
