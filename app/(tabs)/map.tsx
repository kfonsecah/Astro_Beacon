import { CategoryLegend } from "@/components/map/CategoryLegend";
import { HudHeader } from "@/components/ui/HudHeader";
import { useTheme } from "@/hooks/use-theme";
import { useCreateSupply, useSupplies } from "@/hooks/useSupplies";
import { useAuthStore } from "@/stores/auth.store";
import { useTripStore } from "@/stores/trip.store";
import type { CreateSuministroDTO, Suministro } from "@/types-dtos";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

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

const categoryConfig = {
  oxigeno: { symbol: "🧪", color: "#00BCD4" },
  agua: { symbol: "💧", color: "#2196F3" },
  comida: { symbol: "🍎", color: "#8BC34A" },
  medico: { symbol: "💊", color: "#E91E63" },
  equipo: { symbol: "🔧", color: "#FF9800" },
  otro: { symbol: "📦", color: "#9E9E9E" },
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
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isFetching } = useSupplies(page, limit);
  const createSupplyMutation = useCreateSupply();
  const [suppliesList, setSuppliesList] = useState<Suministro[]>([]);

  const [region, setRegion] = useState<Region>({
    latitude: -12.0464, // Default to Lima, Peru
    longitude: -77.0428,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Trip store integration
  const { activeTrip, isTracking, startTracking, oxygenRemaining } = useTripStore();

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

    const startGpsTracking = async () => {
      if (activeTrip?.status === 'activo' && !isTracking) {
        let { status } = await Location.requestForegroundPermissionsAsync();
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
      }
    };

    startGpsTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [activeTrip?.status, isTracking, startTracking]);

  // Oxygen countdown management
  useEffect(() => {
    if (activeTrip?.status === 'activo') {
      // Start oxygen countdown - decrease 1 unit per minute (1/60 per second)
      const oxygenRate = activeTrip.oxygenBudgeted / 60; // Adjust as needed
      useTripStore.getState().startOxygenCountdown(oxygenRate);
    } else {
      useTripStore.getState().stopOxygenCountdown();
    }

    return () => {
      useTripStore.getState().stopOxygenCountdown();
    };
  }, [activeTrip?.status]);

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

  const supplies = suppliesList;

  const getEta = (status: string) => {
    if (status === "pendiente") return "ETA: 2d 14h";
    if (status === "entregido") return "Recogido";
    return "";
  };

  function formatContents(contents: string[]): string {
    if (!contents || contents.length === 0) return "Vacío";
    return contents.join(" + ");
  }

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
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      {/* Fixed header section with map - outside FlatList for independent panning */}
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <HudHeader title="MAPA DE EXPLORACIÓN" subtitle="SUMINISTROS DISPONIBLES" />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 16 }}>
          {data?.total || 0} SUMINISTROS
        </Text>

        {/* Map View with supply markers - fixed section */}
        <View style={{ height: 200, marginBottom: 20, position: 'relative' }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {supplies.map((supply) => (
              <Marker
                key={String(supply.id)}
                coordinate={{
                  latitude: supply.location.lat,
                  longitude: supply.location.lng,
                }}
                pinColor={categoryConfig[getSupplyCategory(supply.contents)].color}
                title={`Supply ${String(supply.id || '').slice(-4)}`}
                description={`${categoryConfig[getSupplyCategory(supply.contents)].symbol} ${supply.contents.join(", ")}`}
              >
                <View
                  style={{
                    backgroundColor: tc.surface,
                    borderColor: categoryConfig[getSupplyCategory(supply.contents)].color,
                    borderWidth: 2,
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
            ))}
          </MapView>

          {/* Active trip indicator */}
          {activeTrip?.status === 'activo' && (
            <View style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1000 }}>
              <View style={{ backgroundColor: tc.success + 'CC', padding: 8, borderRadius: 4 }}>
                <Text style={{ color: 'white', fontFamily: 'monospace', fontSize: 10, textAlign: 'center' }}>
                  🚀 VIAJE ACTIVO - Rastreo GPS activo
                </Text>
              </View>
            </View>
          )}

          {/* Oxygen countdown display */}
          {activeTrip?.status === 'activo' && (
            <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 1000 }}>
              <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.danger, padding: 12, borderRadius: 8 }}>
                <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 24, textAlign: 'center', fontWeight: 'bold' }}>
                  O₂: {Math.round(oxygenRemaining)} / {activeTrip.oxygenBudgeted}
                </Text>
                <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, textAlign: 'center', marginTop: 4 }}>
                  Consumo en tiempo real
                </Text>
              </View>
            </View>
          )}

          {/* Floating "Request Supply" button */}
          <TouchableOpacity
            onPress={handleRequestSupply}
            disabled={createSupplyMutation.isPending}
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: createSupplyMutation.isPending ? tc.textMuted : tc.primary,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              zIndex: 1001,
            }}
          >
            <Text style={{ fontSize: 24, color: tc.background }}>
              {createSupplyMutation.isPending ? '⏳' : '📦'}
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
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 12, marginBottom: 8 }}>
            <View style={{ paddingHorizontal: 8, paddingVertical: 4, marginRight: 12, backgroundColor: getStatusColor(item.status) + "33" }}>
              <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 1, color: getStatusColor(item.status) }}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>
                {categoryConfig[getSupplyCategory(item.contents)].symbol} {formatContents(item.contents)}
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginTop: 2 }}>
                📍 {item.location.lat.toFixed(2)}, {item.location.lng.toFixed(2)}
                {getEta(item.status)}
              </Text>
            </View>
          </View>
        )}
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
    </SafeAreaView>
  );
}
