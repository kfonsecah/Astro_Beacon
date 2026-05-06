import { CategoryLegend } from "@/components/map/CategoryLegend";
import { HudHeader } from "@/components/ui/HudHeader";
import { colors } from "@/constants/colors";
import { useTheme } from "@/hooks/use-theme";
import { useCollectSupply, useCreateSupply, useSupplies } from "@/hooks/useSupplies";
import { useAuthStore } from "@/stores/auth.store";
import { useTripStore } from "@/stores/trip.store";
import type { CreateSuministroDTO, Suministro, Viaje } from "@/types-dtos";
import { useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { RouteErrorFallback } from '@/components/common';

const statusColorMap: Record<string, string> = {
  pendiente: colors.supplyPendiente,
  entregado: colors.supplyEntregado,
  recogido: colors.supplyRecogido,
  expirado: colors.supplyExpirado,
};

const statusLabelMap: Record<string, string> = {
  pendiente: "PENDIENTE",
  entregado: "ENTREGADO",
  recogido: "RECOGIDO",
  expirado: "EXPIRADO",
};

const categoryConfig = {
  oxigeno: { symbol: "🧪", color: colors.categoryOxigeno },
  agua: { symbol: "💧", color: colors.categoryAgua },
  comida: { symbol: "🍎", color: colors.categoryComida },
  medico: { symbol: "💊", color: colors.categoryMedico },
  equipo: { symbol: "🔧", color: colors.categoryEquipo },
  otro: { symbol: "📦", color: colors.categoryOtro },
} as const;

type SupplyCategory = keyof typeof categoryConfig;

function normalizeCategory(raw: string): SupplyCategory {
  if (raw === "medicinas") return "medico";
  if (raw === "herramientas") return "equipo";
  if (raw in categoryConfig) return raw as SupplyCategory;
  return "otro";
}

function getSupplyCategory(contents: string[]): SupplyCategory {
  if (!contents || contents.length === 0) return "otro";
  const firstKnown = contents.find((item) => normalizeCategory(item) !== "otro");
  return normalizeCategory(firstKnown || contents[0]);
}

export default function MapScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isFetching } = useSupplies(page, limit);
  const createSupplyMutation = useCreateSupply();
  const collectSupplyMutation = useCollectSupply();
  const [suppliesList, setSuppliesList] = useState<Suministro[]>([]);
  const [selectedSupplyId, setSelectedSupplyId] = useState<string | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [supplyDistances, setSupplyDistances] = useState<Record<string, number>>({});
  const [collectibleSupplies, setCollectibleSupplies] = useState<Set<string>>(new Set());

  const [region, setRegion] = useState<Region>({
    latitude: -12.0464, // Default to Lima, Peru
    longitude: -77.0428,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Trip store integration
  const { activeTrip, isTracking, startTracking, oxygenRemaining, setActiveTrip } = useTripStore();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  // GPS tracking during active trip
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    if (activeTrip?.status !== 'activo') return;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setRegion((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        }
      );
      startTracking();
    })();

    return () => {
      subscription?.remove();
    };
  }, [activeTrip?.status]);

  // Oxygen countdown management
  useEffect(() => {
    if (activeTrip?.status !== 'activo') {
      useTripStore.getState().stopOxygenCountdown();
      return;
    }
    const oxygenRate = activeTrip.oxygenBudgeted / 60;
    useTripStore.getState().startOxygenCountdown(oxygenRate);

    return () => {
      useTripStore.getState().stopOxygenCountdown();
    };
  }, [activeTrip?.status, activeTrip?.oxygenBudgeted]);

  useEffect(() => {
    if (!data?.items) return;

    setSuppliesList((prev) => {
      if (page === 1) {
        return data.items;
      }

      const merged = [...prev];
      const existingIds = new Set(prev.map((item) => String(item.id)));
      for (const item of data.items) {
        const itemId = String(item.id);
        if (!existingIds.has(itemId)) {
          merged.push(item);
        }
      }
      return merged;
    });
  }, [data?.items, page]);

  const calculateDistanceKm = (fromLat: number, fromLng: number, toLat: number, toLng: number): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(toLat - fromLat);
    const dLng = toRad(toLng - fromLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  // Calcular distancias y detectar proximidad (100m)
  useEffect(() => {
    const distances: Record<string, number> = {};
    const collectible = new Set<string>();

    const isTripActive = activeTrip?.status === 'activo';

    suppliesList.forEach((supply) => {
      const distKm = calculateDistanceKm(
        region.latitude,
        region.longitude,
        supply.location.lat,
        supply.location.lng,
      );
      const distMeters = distKm * 1000;
      distances[String(supply.id)] = distKm;

      const isInRange = distMeters < 1000;
      const isPendiente = supply.status === 'pendiente';

      if (isInRange && isPendiente && isTripActive) {
        collectible.add(String(supply.id));
      }
    });


    setSupplyDistances(distances);
    setCollectibleSupplies(collectible);
  }, [region, suppliesList, activeTrip]);

  const onRefresh = () => {
    setPage(1);
    setSuppliesList([]);
    refetch();
  };

  const loadMore = () => {
    if (!isFetching && data && page < data.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const getStatusColor = (status: string) => statusColorMap[status] || tc.textMuted;
  const getStatusLabel = (status: string) => statusLabelMap[status] || status.toUpperCase();

  if (isLoading && page === 1) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", marginTop: 8 }}>CARGANDO SUMINISTROS...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 14, marginBottom: 8 }}>ERROR DE CONEXIÓN</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          No se pudieron cargar los suministros. Verifica tu conexión.
        </Text>
      </View>
    );
  }

  const getEta = (status: string) => {
    if (status === "pendiente") return "ETA: 2d 14h";
    if (status === "entregado") return "Recogido";
    return "";
  };

  function formatContents(contents: string[]): string {
    if (!contents || contents.length === 0) return "Vacío";
    return contents.join(" + ");
  }

  // Auto-sort por distancia cuando trip activo
  const sortedSupplies = activeTrip?.status === 'activo'
    ? [...suppliesList].sort((a, b) => {
        const distA = supplyDistances[String(a.id)] ?? Infinity;
        const distB = supplyDistances[String(b.id)] ?? Infinity;
        return distA - distB;
      })
    : suppliesList;

  const supplies = sortedSupplies;
  const selectedSupply = supplies.find((s) => String(s.id) === String(selectedSupplyId));

  const estimateOxygenBudget = (supply: Suministro): number => {
    const distanceKm = calculateDistanceKm(
      region.latitude,
      region.longitude,
      supply.location.lat,
      supply.location.lng,
    );

    const roundTripKm = distanceKm * 2;
    const movementCost = roundTripKm * 18;
    const operationReserve = 40;
    return Math.max(60, Math.ceil(movementCost + operationReserve));
  };

  const handleStartTripFromSupply = () => {
    if (!selectedSupply) return;

    const oxygenBudget = estimateOxygenBudget(selectedSupply);
    const distanceKm = calculateDistanceKm(
      region.latitude,
      region.longitude,
      selectedSupply.location.lat,
      selectedSupply.location.lng,
    );

    Alert.alert(
      "INICIAR VIAJE",
      `Destino: ${selectedSupply.name}\nDistancia estimada: ${distanceKm.toFixed(2)} km\nCosto O₂ estimado: ${oxygenBudget} unidades\n\n¿Deseas iniciar este viaje?`,
      [
        { text: "CANCELAR", style: "cancel" },
        {
          text: "INICIAR",
          onPress: () => {
            const userId = useAuthStore.getState().user?.id;
            if (!userId) {
              Alert.alert("ERROR", "No se pudo obtener el ID de usuario.");
              return;
            }
            const localTrip: Viaje = {
              id: `local-${Date.now()}`,
              astronautId: userId,
              destination: selectedSupply.location,
              status: "activo" as const,
              startedAt: new Date(),
              oxygenBudgeted: oxygenBudget,
              oxygenConsumed: 0,
              resourcesCollected: 0,
              notes: `Viaje iniciado hacia suministro ${selectedSupply.name}`,
            };

            setActiveTrip(localTrip);
            startTracking();
          },
        },
      ],
    );
  };

  const handleRequestSupply = async () => {
    try {
      // Get current GPS location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const userLat = location.coords.latitude;
      const userLng = location.coords.longitude;

      // Generate random location near user (±0.01° lat/lng)
      const randomLat = userLat + (Math.random() - 0.5) * 0.02;
      const randomLng = userLng + (Math.random() - 0.5) * 0.02;

      // Randomize supply data
      const supplyNames = ["Suministro de emergencia", "Reserva de recursos", "Caché de suministros", "Paquete de ayuda", "Contenedor de supervivencia"];
      const supplyDescriptions = ["Suministro urgente para supervivencia", "Recursos esenciales para exploración", "Equipo de emergencia", "Reserva de campaña", "Caché de supervivencia"];
      const resourceTypes = ["oxigeno", "agua", "comida", "medicinas", "herramientas"];

      const randomName = supplyNames[Math.floor(Math.random() * supplyNames.length)];
      const randomDesc = supplyDescriptions[Math.floor(Math.random() * supplyDescriptions.length)];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const selectedResources = [...resourceTypes].sort(() => Math.random() - 0.5).slice(0, numItems);

      const contents: string[] = selectedResources;

      // Set expiresAt to random 24-72 hours from now
      const expiresInHours = Math.floor(Math.random() * 48) + 24; // 24-72 hours
      const expiresAt = new Date(Date.now() + expiresInHours * 3600000);

      // Get userId from auth store
      const user = useAuthStore.getState().user;
      if (!user) {
        console.warn("User not authenticated");
        return;
      }

      // Create supply object
      const newSupply: CreateSuministroDTO = {
        name: randomName,
        description: randomDesc,
        location: {
          lat: randomLat,
          lng: randomLng,
        },
        contents,
        expiresAt,
      };

      // Call mutation
      await createSupplyMutation.mutateAsync(newSupply);
      setPage(1);
      setSuppliesList([]);
      await refetch();
    } catch (error) {
      console.error("Error requesting supply:", error);
      Alert.alert(
        "ERROR",
        error instanceof Error ? error.message : "No se pudo solicitar el suministro. Intente de nuevo."
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: tc.background }}>
      <Modal visible={isMapFullscreen} animationType="slide" onRequestClose={() => setIsMapFullscreen(false)}>
        <View style={{ flex: 1, backgroundColor: tc.background }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: tc.border }}>
            <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 }}>
              MAPA EN PANTALLA COMPLETA
            </Text>
            <TouchableOpacity onPress={() => setIsMapFullscreen(false)}>
              <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 12 }}>✕ CERRAR</Text>
            </TouchableOpacity>
          </View>

          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {supplies.map((supply) => {
              const isSelected = String(selectedSupplyId) === String(supply.id);
              return (
                <Marker
                  key={`fullscreen-${String(supply.id)}`}
                  coordinate={{
                    latitude: supply.location.lat,
                    longitude: supply.location.lng,
                  }}
                  pinColor={categoryConfig[getSupplyCategory(supply.contents)].color}
                  title={`Supply ${String(supply.id || '').slice(-4)}`}
                  description={`${categoryConfig[getSupplyCategory(supply.contents)].symbol} ${supply.contents.join(", ")}`}
                  onPress={() => setSelectedSupplyId(String(supply.id))}
                >
                  <View
                    style={{
                      backgroundColor: tc.surface,
                      borderColor: isSelected
                        ? tc.primary
                        : categoryConfig[getSupplyCategory(supply.contents)].color,
                      borderWidth: isSelected ? 3 : 2,
                      borderRadius: 16,
                      width: 30,
                      height: 30,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {categoryConfig[getSupplyCategory(supply.contents)].symbol}
                    </Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>
        </View>
      </Modal>

      {/* Fixed header section with map - outside FlatList for independent panning */}
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <HudHeader title="MAPA DE EXPLORACIÓN" subtitle="SUMINISTROS DISPONIBLES" />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 16 }}>
          {data?.total || 0} SUMINISTROS
        </Text>

        {/* Map View with supply markers - fixed section */}
        <View style={{ height: 200, marginBottom: 12, position: 'relative' }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {supplies.map((supply) => {
              const isSelected = String(selectedSupplyId) === String(supply.id);
              return (
                <Marker
                  key={String(supply.id)}
                  coordinate={{
                    latitude: supply.location.lat,
                    longitude: supply.location.lng,
                  }}
                  pinColor={categoryConfig[getSupplyCategory(supply.contents)].color}
                  title={`Supply ${String(supply.id || '').slice(-4)}`}
                  description={`${categoryConfig[getSupplyCategory(supply.contents)].symbol} ${supply.contents.join(", ")}`}
                  onPress={() => setSelectedSupplyId(String(supply.id))}
                >
                  <View
                    style={{
                      backgroundColor: tc.surface,
                      borderColor: isSelected
                        ? tc.primary
                        : categoryConfig[getSupplyCategory(supply.contents)].color,
                      borderWidth: isSelected ? 3 : 2,
                      borderRadius: 16,
                      width: 30,
                      height: 30,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {categoryConfig[getSupplyCategory(supply.contents)].symbol}
                    </Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>

          <TouchableOpacity
            onPress={() => setIsMapFullscreen(true)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: tc.surface,
              borderWidth: 1,
              borderColor: tc.primary,
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 6,
              zIndex: 1001,
            }}
          >
            <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10 }}>
              ⛶ PANTALLA COMPLETA
            </Text>
          </TouchableOpacity>

          {/* Active trip indicator */}
          {activeTrip?.status === 'activo' && (
            <View style={{ position: 'absolute', top: 10, left: 10, right: 170, zIndex: 1000 }}>
              <View style={{ backgroundColor: tc.success + 'CC', padding: 8, borderRadius: 4 }}>
                <Text style={{ color: 'white', fontFamily: 'monospace', fontSize: 10, textAlign: 'center' }}>
                  🚀 VIAJE ACTIVO - Rastreo GPS activo
                </Text>
              </View>
            </View>
          )}

          {/* Oxygen countdown display */}
          {activeTrip?.status === 'activo' && (
            <View style={{ position: 'absolute', bottom: 14, left: 14, right: 14, zIndex: 1000 }}>
              <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.danger, padding: 10, borderRadius: 8 }}>
                <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 18, textAlign: 'center', fontWeight: 'bold' }}>
                  O₂: {Math.round(oxygenRemaining)} / {activeTrip.oxygenBudgeted}
                </Text>
                <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, textAlign: 'center', marginTop: 2 }}>
                  Consumo en tiempo real
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          <TouchableOpacity
            onPress={handleRequestSupply}
            disabled={createSupplyMutation.isPending}
            style={{
              flex: 1,
              backgroundColor: createSupplyMutation.isPending ? tc.textMuted : tc.primary,
              borderRadius: 6,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: tc.background, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 }}>
              {createSupplyMutation.isPending ? '⏳ SOLICITANDO...' : '📦 SOLICITAR SUMINISTRO'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStartTripFromSupply}
            disabled={!selectedSupply || activeTrip?.status === 'activo'}
            style={{
              flex: 1,
              backgroundColor: !selectedSupply || activeTrip?.status === 'activo' ? tc.textMuted : tc.success,
              borderRadius: 6,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: tc.background, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 }}>
              {activeTrip?.status === 'activo'
                ? '🚀 VIAJE ACTIVO'
                : selectedSupply
                  ? '🚀 INICIAR VIAJE'
                  : 'SELECCIONA SUMINISTRO'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Legend */}
        <CategoryLegend />

        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12, marginTop: 12 }}>LISTA DE SUMINISTROS</Text>
      </View>

      {/* Scrollable FlatList for supply list only */}
      <FlatList
        data={supplies}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={tc.primary} />
        }
        renderItem={({ item }) => {
          const isSelected = String(selectedSupplyId) === String(item.id);
          const isCollectible = collectibleSupplies.has(String(item.id));
          const distKm = supplyDistances[String(item.id)] ?? 0;
          const distMeters = Math.round(distKm * 1000);



          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isCollectible ? tc.success + "22" : tc.surface,
                borderWidth: isCollectible ? 2 : (isSelected ? 2 : 1),
                borderColor: isCollectible ? tc.success : (isSelected ? tc.primary : tc.border),
                padding: 12,
                marginBottom: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => setSelectedSupplyId(String(item.id))}
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <View style={{ paddingHorizontal: 8, paddingVertical: 4, marginRight: 12, backgroundColor: isCollectible ? tc.success + "44" : getStatusColor(item.status) + "33" }}>
                  <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 1, color: isCollectible ? tc.success : getStatusColor(item.status) }}>
                    {isCollectible ? "✓ RECOGIBLE" : getStatusLabel(item.status)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>
                    {categoryConfig[getSupplyCategory(item.contents)].symbol} {formatContents(item.contents)}
                  </Text>
                  <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginTop: 2 }}>
                    📍 {distMeters}m {activeTrip?.status === 'activo' ? `(${distKm.toFixed(2)} km)` : ""}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Botón Recoger */}
              {isCollectible && (
                <TouchableOpacity
                  onPress={() => {
                    collectSupplyMutation.mutate(
                      { id: String(item.id) },
                      {
                        onSuccess: () => {
                          Alert.alert("✓ ÉXITO", `Suministro ${item.name} recogido!`);
                          // Invalidate all affected queries
                          queryClient.invalidateQueries({ queryKey: ['supplies'] });
                          queryClient.invalidateQueries({ queryKey: ['astronaut', 'dashboard'] });
                          queryClient.invalidateQueries({ queryKey: ['resources'] });
                          queryClient.invalidateQueries({ queryKey: ['resource-alerts'] });
                        },
                      }
                    );
                  }}
                  disabled={collectSupplyMutation.isPending}
                  style={{
                    marginLeft: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    backgroundColor: collectSupplyMutation.isPending ? tc.textMuted : tc.success,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: "white", fontFamily: "monospace", fontSize: 9, fontWeight: "bold" }}>
                    {collectSupplyMutation.isPending ? "..." : "🎒 RECOGER"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
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
    </View>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
