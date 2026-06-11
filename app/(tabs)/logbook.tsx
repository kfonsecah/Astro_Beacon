import { HudHeader } from "@/components/ui/HudHeader";
import { useTheme } from "@/hooks/use-theme";
import { useLogbookEntries, useDeleteLogbookEntry } from "@/hooks/useLogbook";
import type { BitacoraEntradaResponse } from "@/types-dtos";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { RouteErrorFallback } from '@/components/common';
import { Swipeable, FlatList } from "react-native-gesture-handler";

export default function LogbookScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isFetching } = useLogbookEntries(page, limit);
  const [allEntries, setAllEntries] = useState<BitacoraEntradaResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { mutateAsync: deleteEntry } = useDeleteLogbookEntry();

  useEffect(() => {
    const newItems = data?.items ?? [];
    if (newItems.length > 0) {
      setAllEntries(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const filtered = newItems.filter(e => !existingIds.has(e.id));
        const next = filtered.length > 0 ? [...prev, ...filtered] : prev;
        setHasMore((data?.total ?? 0) > next.length);
        return next;
      });
    }
  }, [data]);

  const onRefresh = useCallback(async () => {
    setPage(1);
    setAllEntries([]);
    setHasMore(true);
    await refetch();
  }, [refetch]);

  const loadMore = () => {
    if (hasMore && !isFetching && !isError && allEntries.length < (data?.total ?? 0)) {
      setPage(p => p + 1);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "ELIMINAR ENTRADA",
      "¿ESTÁS SEGURO DE QUE DESEAS ELIMINAR ESTA ENTRADA DE LA BITÁCORA?",
      [
        { text: "CANCELAR", style: "cancel" },
        { 
          text: "ELIMINAR", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEntry(id);
              setAllEntries(prev => prev.filter(e => e.id !== id));
            } catch (error) {
              Alert.alert("ERROR", "NO SE PUDO ELIMINAR LA ENTRADA");
            }
          }
        }
      ]
    );
  };

  const renderDeleteAction = (id: string) => {
    return (
      <TouchableOpacity
        onPress={() => handleDelete(id)}
        style={{
          backgroundColor: tc.danger,
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: tc.background, fontFamily: 'monospace', fontWeight: 'bold', fontSize: 10 }}>ELIMINAR</Text>
      </TouchableOpacity>
    );
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
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 32, marginBottom: 20 }}>⬡</Text>
        <View style={{ borderWidth: 1, borderColor: tc.danger + '40', borderLeftWidth: 3, borderLeftColor: tc.danger, padding: 20, width: '100%' }}>
          <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 8, letterSpacing: 3, marginBottom: 10 }}>
            ERROR DEL SISTEMA
          </Text>
          <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 13, marginBottom: 8 }}>
            SEÑAL PERDIDA
          </Text>
          <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, lineHeight: 16 }}>
            No se pudo cargar la bitácora.{'\n'}Verifica tu conexión e intenta de nuevo.
          </Text>
        </View>
        <TouchableOpacity
          onPress={onRefresh}
          style={{ marginTop: 24, borderWidth: 1, borderColor: tc.primaryBorder, paddingVertical: 12, paddingHorizontal: 24 }}
        >
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 11, letterSpacing: 2 }}>
            [ REINTENTAR ]
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <FlatList
        data={allEntries}
        keyExtractor={(item, index) => item.id ?? `entry-fallback-${index}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={tc.primary} />
        }
        ListHeaderComponent={() => (
          <>
            <HudHeader title="REGISTROS DE MISIÓN" subtitle="BITÁCORA ACTUAL" />
            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 8, marginBottom: 8 }}>
              ← DESLIZA PARA ELIMINAR →
            </Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 16 }}>
              {data?.total || 0} ENTRADAS
            </Text>
          </>
        )}
        renderItem={({ item }) => (
          <Swipeable 
            renderLeftActions={() => renderDeleteAction(item.id)}
            renderRightActions={() => renderDeleteAction(item.id)}
            overshootLeft={false}
            overshootRight={false}
          >
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {}}
              style={{ 
                backgroundColor: tc.surface, 
                borderWidth: 1, 
                borderColor: tc.border, 
                padding: 14, 
                marginBottom: 10, 
                borderLeftWidth: 3, 
                borderLeftColor: tc.primary 
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
                  {item.title ? item.title.toUpperCase() : `DÍA ${item.createdAt ? new Date(item.createdAt).getDate() : '?'}`}
                </Text>
                <Text style={{ fontFamily: "monospace", fontSize: 8, color: tc.textMuted }}>
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ""}
                </Text>
              </View>
              <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, lineHeight: 18, marginBottom: 6 }}>{item.description}</Text>
              {item.title && (
                <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginBottom: 6 }}>{item.title}</Text>
              )}
              {item.speciesName && (
                <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>🏷️ {item.speciesName}</Text>
              )}
            </TouchableOpacity>
          </Swipeable>
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

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
