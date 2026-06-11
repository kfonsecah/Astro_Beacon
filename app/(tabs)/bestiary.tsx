import { HudHeader } from "@/components/ui/HudHeader";
import { useTheme } from "@/hooks/use-theme";
import { useSpecies, useDeleteSpecies } from "@/hooks/useSpecies";
import type { Especie } from "@/types-dtos";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View, Image, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteErrorFallback } from '@/components/common';
import { Swipeable } from "react-native-gesture-handler";

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

const MONTH_LABELS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDayLabel(date: Date, dayOffset: number): string {
  const formatted = `${String(date.getDate()).padStart(2, '0')} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
  if (dayOffset === 0) return `HOY · ${formatted}`;
  if (dayOffset === 1) return `AYER · ${formatted}`;
  return formatted;
}

export default function BestiaryScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isFetching } = useSpecies(page, limit);
  const [allSpecies, setAllSpecies] = useState<Especie[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [previewSpecies, setPreviewSpecies] = useState<Especie | null>(null);
  // 0 = hoy, 1 = ayer, 2 = anteayer...
  const [dayOffset, setDayOffset] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const selectedDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - dayOffset);
    return d;
  }, [dayOffset]);

  const filteredSpecies = useMemo(() => {
    if (showAll) return allSpecies;
    return allSpecies.filter(
      (s) => s.discoveredAt && isSameDay(new Date(s.discoveredAt), selectedDate),
    );
  }, [allSpecies, selectedDate, showAll]);

  const dayLabel = showAll ? 'TODOS LOS DÍAS' : formatDayLabel(selectedDate, dayOffset);

  const { mutateAsync: deleteSpecies } = useDeleteSpecies();

  // FIX: Separate synchronization of items to avoid disappearance on refresh/delete
  useEffect(() => {
    if (data?.items) {
      if (page === 1) {
        // Reset list for page 1 (refresh)
        setAllSpecies(data.items);
      } else {
        // Append unique items for subsequent pages
        setAllSpecies(prev => {
          const uniqueMap = new Map(prev.map(a => [a.id, a]));
          data.items.forEach(a => uniqueMap.set(a.id, a));
          return Array.from(uniqueMap.values());
        });
      }
      setHasMore(data.page < data.totalPages);
    }
  }, [data, page]);

  // Si el día seleccionado no tiene registros en las páginas cargadas,
  // sigue paginando hasta encontrarlos o agotar los datos
  useEffect(() => {
    if (filteredSpecies.length === 0 && hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [filteredSpecies.length, hasMore, isFetching]);

  const onRefresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await refetch();
  }, [refetch]);

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "ELIMINAR ESPECIE",
      `¿ESTÁS SEGURO DE QUE DESEAS ELIMINAR A ${name.toUpperCase()}?`,
      [
        { text: "CANCELAR", style: "cancel" },
        { 
          text: "ELIMINAR", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSpecies(id);
              // Local update to avoid waiting for query invalidation
              setAllSpecies(prev => prev.filter(s => s.id !== id));
            } catch (error) {
              Alert.alert("ERROR", "NO SE PUDO ELIMINAR LA ESPECIE");
            }
          }
        }
      ]
    );
  };

  const renderLeftActions = (id: string, name: string) => {
    return (
      <TouchableOpacity
        onPress={() => handleDelete(id, name)}
        style={{
          backgroundColor: tc.danger,
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: tc.background, fontFamily: 'monospace', fontWeight: 'bold', fontSize: 10 }}>ELIMINAR</Text>
      </TouchableOpacity>
    );
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        onPress={() => router.push('/species/' + id)}
        style={{
          backgroundColor: tc.primary,
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: tc.background, fontFamily: 'monospace', fontWeight: 'bold', fontSize: 10 }}>VER</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading && page === 1) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", marginTop: 8 }}>CARGANDO ESPECIES...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 14, marginBottom: 8 }}>ERROR DE CONEXIÓN</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          No se pudo cargar el bestiario. Verifica tu conexión.
        </Text>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <FlatList
        data={filteredSpecies}
        keyExtractor={(item, index) => item.id ?? `${item.name ?? 'specie'}-${index}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={tc.primary} />
        }
        ListHeaderComponent={() => (
          <>
            <HudHeader title="BITÁCORA DE ESPECIES" />

            {/* Day selector: el día actúa como subtítulo, con navegación a días anteriores */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => setDayOffset((o) => o + 1)}
                disabled={showAll}
                style={{
                  borderWidth: 1,
                  borderColor: tc.border,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  opacity: showAll ? 0.3 : 1,
                }}
              >
                <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 12 }}>◀</Text>
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  color: tc.textMuted,
                  fontFamily: 'monospace',
                  fontSize: 10,
                  letterSpacing: 2,
                }}
              >
                {dayLabel}
              </Text>
              <TouchableOpacity
                onPress={() => setDayOffset((o) => Math.max(0, o - 1))}
                disabled={showAll || dayOffset === 0}
                style={{
                  borderWidth: 1,
                  borderColor: tc.border,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  opacity: showAll || dayOffset === 0 ? 0.3 : 1,
                }}
              >
                <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 12 }}>▶</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowAll((prev) => {
                    if (prev) setDayOffset(0);
                    return !prev;
                  });
                }}
                style={{
                  borderWidth: 1,
                  borderColor: showAll ? tc.primary : tc.border,
                  backgroundColor: showAll ? tc.primaryMuted : 'transparent',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 }}>
                  {showAll ? 'HOY' : 'TODOS'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 8, marginBottom: 8 }}>
              ← DESLIZA PARA VER | ELIMINAR →
            </Text>
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 16 }}>
              {filteredSpecies.length} REGISTROS
            </Text>
          </>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>
              {showAll ? 'SIN REGISTROS' : 'SIN REGISTROS ESTE DÍA'}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const classColor = classificationColorMap[item.classification] || tc.textMuted;
          const dngColor = dangerColorMap[item.dangerLevel] || tc.textMuted;

          return (
            <Swipeable 
              renderLeftActions={() => renderLeftActions(item.id, item.name)}
              renderRightActions={() => renderRightActions(item.id)}
              overshootLeft={false}
              overshootRight={false}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/species/' + item.id)}
                onLongPress={() => setPreviewSpecies(item)}
                delayLongPress={500}
                style={{ flexDirection: "row", backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, marginBottom: 12, padding: 12 }}
              >
                {item.imageUrl ? (
                  <Image 
                    source={{ uri: item.imageUrl }} 
                    style={{ width: 60, height: 60, backgroundColor: tc.surfaceElevated, marginRight: 12 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: 60, height: 60, backgroundColor: tc.surfaceElevated, marginRight: 12, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: tc.textMuted, fontSize: 8, fontFamily: 'monospace' }}>N/A</Text>
                  </View>
                )}
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
              </TouchableOpacity>
            </Swipeable>
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
      
      <Modal
        visible={previewSpecies !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewSpecies(null)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setPreviewSpecies(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
        >
          <View 
            onStartShouldSetResponder={() => true}
            style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.primary, padding: 20, width: '100%', maxWidth: 400 }}
          >
            <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 16, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: tc.primary + '33' }}>
              PREVIEW RÁPIDO
            </Text>
            
            <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
              {previewSpecies?.name.toUpperCase()}
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10 }}>
                CLASE: {previewSpecies?.classification.toUpperCase()}
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10 }}>
                PELIGRO: {previewSpecies?.dangerLevel.toUpperCase()}
              </Text>
            </View>

            <Text style={{ color: tc.textSecondary, fontFamily: 'monospace', fontSize: 12, marginBottom: 20 }}>
              {previewSpecies?.description || 'Sin descripción disponible.'}
            </Text>

            <TouchableOpacity 
              onPress={() => setPreviewSpecies(null)}
              style={{ backgroundColor: tc.surfaceElevated, borderWidth: 1, borderColor: tc.border, padding: 10, alignItems: 'center' }}
            >
              <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 12 }}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        onPress={() => router.push('/species/identify')}
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
      >
        <Text style={{ color: tc.background, fontFamily: 'monospace', fontSize: 24, lineHeight: 26 }}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
