import { useTheme } from "@/hooks/use-theme";
import { useLogbookEntries, useDeleteLogbookEntry } from "@/hooks/useLogbook";
import type { BitacoraEntradaResponse } from "@/types-dtos";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { RouteErrorFallback } from '@/components/common';
import { Swipeable, FlatList } from "react-native-gesture-handler";

function RecDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }, style]}
    />
  );
}

function formatEntryDate(value?: string | Date): string {
  if (!value) return '';
  const d = new Date(value);
  const date = d.toLocaleDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

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

  const listHeader = (
    <>
      {/* Indicador de grabación estilo HUD */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: tc.surface,
          borderWidth: 1,
          borderColor: tc.border,
          borderLeftWidth: 3,
          borderLeftColor: tc.danger,
          paddingHorizontal: 14,
          paddingVertical: 12,
          marginBottom: 12,
          gap: 10,
        }}
      >
        <RecDot color={tc.danger} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 9, letterSpacing: 3 }}>
            REC · BITÁCORA ACTIVA
          </Text>
          <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8, letterSpacing: 1, marginTop: 3 }}>
            ← DESLIZA PARA ELIMINAR →
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 18, lineHeight: 22 }}>
            {data?.total || 0}
          </Text>
          <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 7, letterSpacing: 2 }}>
            ENTRADAS
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <FlatList
        data={allEntries}
        keyExtractor={(item, index) => item.id ?? `entry-fallback-${index}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={tc.primary} />
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item, index }) => (
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
              {/* Encabezado: número de registro + título + fecha/hora */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                  <View style={{ backgroundColor: tc.primaryMuted, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 }}>
                    <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 8, letterSpacing: 1 }}>
                      REG-{String((data?.total || allEntries.length) - index).padStart(3, '0')}
                    </Text>
                  </View>
                  <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2, flex: 1 }} numberOfLines={1}>
                    {item.title ? item.title.toUpperCase() : `DÍA ${item.createdAt ? new Date(item.createdAt).getDate() : '?'}`}
                  </Text>
                </View>
                <Text style={{ fontFamily: "monospace", fontSize: 8, color: tc.textMuted }}>
                  {formatEntryDate(item.updatedAt ?? item.createdAt)}
                </Text>
              </View>

              <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, lineHeight: 18 }}>
                {item.description}
              </Text>

              {item.speciesName && (
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: tc.primaryBorder, paddingHorizontal: 8, paddingVertical: 3, gap: 6 }}>
                    <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10 }}>◈</Text>
                    <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 9, letterSpacing: 1 }}>
                      {item.speciesName.toUpperCase()}
                    </Text>
                  </View>
                </View>
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
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>
              SIN ENTRADAS REGISTRADAS
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
