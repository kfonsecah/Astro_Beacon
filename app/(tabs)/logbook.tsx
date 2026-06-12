import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTrips, useCompleteTrip, useAbortTrip } from "@/hooks/useTrips";
import { useTripStore } from "@/stores/trip.store";
import type { Viaje } from "@/types-dtos";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteErrorFallback } from '@/components/common';

const statusColorMap: Record<string, string> = {
  planificado: colors.tripPlanificado,
  activo: colors.tripActivo,
  completado: colors.tripCompletado,
  abortado: colors.tripAbortado,
};

const statusLabelMap: Record<string, string> = {
  planificado: "PLANIFICADO",
  activo: "ACTIVO",
  completado: "COMPLETADO",
  abortado: "ABORTADO",
};

export default function LogbookScreen() {
  const theme = useTheme();
  const tc = theme.colors;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading, isError, refetch, isFetching } = useTrips(page, limit);
  const completeMutation = useCompleteTrip();
  const abortMutation = useAbortTrip();
  const [allMissions, setAllMissions] = useState<Viaje[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [aborting, setAborting] = useState(false);

  const activeTrip = useTripStore(state => state.activeTrip);
  const oxygenRemaining = useTripStore(state => state.oxygenRemaining);
  const startTime = useTripStore(state => state.startTime);

  const [elapsed, setElapsed] = useState("0m");

  useEffect(() => {
    if (!startTime) return;
    const tick = () => {
      const elapsedMin = Math.floor((Date.now() - startTime) / 60000);
      const h = Math.floor(elapsedMin / 60);
      const m = elapsedMin % 60;
      setElapsed(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [startTime]);

  useEffect(() => {
    const newItems = data?.items ?? [];
    const filtered = newItems.filter(
      (t) => t.status === "completado" || t.status === "abortado"
    );
    if (filtered.length > 0) {
      setAllMissions(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const deduped = filtered.filter(t => !existingIds.has(t.id));
        const next = deduped.length > 0 ? [...prev, ...deduped] : prev;
        setHasMore((data?.total ?? 0) > next.length);
        return next;
      });
    }
  }, [data]);

  const getStatusColor = (status: string) => statusColorMap[status] || tc.textMuted;
  const getStatusLabel = (status: string) => statusLabelMap[status] || status.toUpperCase();

  const handleComplete = () => {
    if (!activeTrip) return;
    Alert.alert(
      "COMPLETAR MISIÓN",
      "La misión activa se marcará como completada. ¿Confirmar?",
      [
        { text: "CANCELAR" },
        {
          text: "COMPLETAR",
          onPress: () => {
            setCompleting(true);
            completeMutation.mutate(
              { id: activeTrip.id },
              {
                onSettled: () => setCompleting(false),
                onError: () => Alert.alert("ERROR", "No se pudo completar la misión"),
              }
            );
          },
        },
      ]
    );
  };

  const handleAbort = () => {
    if (!activeTrip) return;
    Alert.alert(
      "ABORTAR MISIÓN",
      "Se perderá el oxígeno restante y el progreso de la misión actual. ¿Continuar?",
      [
        { text: "CANCELAR", style: "cancel" },
        {
          text: "ABORTAR",
          style: "destructive",
          onPress: () => {
            setAborting(true);
            abortMutation.mutate(
              { id: activeTrip.id },
              {
                onSettled: () => setAborting(false),
                onError: () => Alert.alert("ERROR", "No se pudo abortar la misión"),
              }
            );
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(async () => {
    setPage(1);
    setAllMissions([]);
    setHasMore(true);
    await refetch();
  }, [refetch]);

  const loadMore = () => {
    if (hasMore && !isFetching && allMissions.length < (data?.total ?? 0)) {
      setPage(p => p + 1);
    }
  };

  const pastMissionsCount = allMissions.length || data?.total || 0;

  if (isLoading && page === 1) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, paddingTop: insets.top, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, letterSpacing: 2, marginTop: 12 }}>
          CARGANDO EXPEDICIONES...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, paddingTop: insets.top, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 14, marginBottom: 8 }}>ERROR DE CONEXIÓN</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          No se pudieron cargar las expediciones. Verifica tu conexión.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tc.background, paddingTop: insets.top }}>
      <FlatList
        data={allMissions}
        keyExtractor={(item, index) => item.id || `mission-${index}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={tc.primary} />}
        ListHeaderComponent={() => (
          <>
            {activeTrip ? (
              <Card accent>
                <Text style={{ color: tc.primary, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" }}>
                  {activeTrip.destination
                    ? `LAT: ${activeTrip.destination.lat.toFixed(2)} LNG: ${activeTrip.destination.lng.toFixed(2)}`
                    : "EXPEDICIÓN ACTIVA"}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: spacing.sm }}>
                  <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 9, letterSpacing: 1 }}>
                    O₂: {oxygenRemaining.toFixed(0)}/{activeTrip.oxygenBudgeted}
                  </Text>
                  <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 9, letterSpacing: 1 }}>
                    DURACIÓN: {elapsed}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <Button
                    title={completing ? "COMPLETANDO..." : "COMPLETAR MISIÓN"}
                    variant="primary"
                    onPress={handleComplete}
                    disabled={completing || aborting}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={aborting ? "ABORTANDO..." : "ABORTAR"}
                    variant="danger"
                    onPress={handleAbort}
                    disabled={completing || aborting}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            ) : (
              <Card>
                <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, letterSpacing: 2, textAlign: "center" }}>
                  SIN EXPEDICIÓN ACTIVA
                </Text>
              </Card>
            )}

            <Button
              title="INICIAR EXPEDICIÓN"
              variant="primary"
              onPress={() => Alert.alert("PRÓXIMAMENTE", "Las caminatas estarán disponibles pronto.")}
              style={{ marginTop: spacing.lg, marginBottom: spacing["2xl"] }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.lg }}>
              <View style={{ flex: 1, height: 1, backgroundColor: tc.border }} />
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginHorizontal: 12 }}>
                HISTORIAL
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: tc.border }} />
            </View>

            {pastMissionsCount > 0 && (
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: spacing.lg }}>
                {pastMissionsCount} MISIONES
              </Text>
            )}
          </>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/missions/${item.id}`)}>
            <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14, marginBottom: spacing.lg }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
                  MISIÓN #{item.id.slice(-4).toUpperCase()}
                </Text>
                <Badge label={getStatusLabel(item.status)} color={getStatusColor(item.status)} />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9 }}>
                  O₂: {item.oxygenConsumed}/{item.oxygenBudgeted}
                </Text>
                <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9 }}>
                  RECURSOS: {item.resourcesCollected || 0}
                </Text>
              </View>
              {item.notes && (
                <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, lineHeight: 18 }}>
                  {item.notes}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          isFetching && page > 1 ? (
            <ActivityIndicator size="small" color={tc.primary} style={{ marginVertical: spacing.lg }} />
          ) : null
        )}
        ListEmptyComponent={
          pastMissionsCount === 0 && !activeTrip ? (
            <EmptyState
              icon="🚀"
              title="SIN EXPEDICIONES"
              description="Sin expediciones registradas. Inicia tu primera expedición."
            />
          ) : (
            <View style={{ alignItems: "center", paddingTop: spacing["5xl"] }}>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 12 }}>
                SIN REGISTROS DE MISIÓN
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
