import { CategoryLegend } from "@/components/map/CategoryLegend";
import { HudHeader } from "@/components/ui/HudHeader";
import { colors } from "@/constants/colors";
import { useTheme } from "@/hooks/use-theme";
import { useRecordResourceMovement, useResources } from "@/hooks/useResources";
import { useCollectSupply, useCreateSupply, useSupplies } from "@/hooks/useSupplies";
import { useAuthStore } from "@/stores/auth.store";
import { useTripStore } from "@/stores/trip.store";
import type { CreateSuministroDTO, Recurso, Suministro, Viaje } from "@/types-dtos";
import { useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
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

const SIMULATION_TICK_MS = 1000;
const SIMULATION_SPEED_MPS = 5;
const SIMULATION_STOP_RADIUS_METERS = 35;
const OXYGEN_PER_KM = 18;
const FOOD_PER_KM = 4;

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
  const { data: resourcesData } = useResources(1, 50);
  const recordMovement = useRecordResourceMovement();
  const [suppliesList, setSuppliesList] = useState<Suministro[]>([]);
  const [selectedSupplyId, setSelectedSupplyId] = useState<string | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [supplyDistances, setSupplyDistances] = useState<Record<string, number>>({});
  const [collectibleSupplies, setCollectibleSupplies] = useState<Set<string>>(new Set());
  const [isSimulating, setIsSimulating] = useState(false);

  const regionRef = useRef<Region | null>(null);
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const consumptionBufferRef = useRef({ oxygen: 0, food: 0 });
  const consumptionInFlightRef = useRef(false);
  const consumptionErrorRef = useRef(false);

  const [region, setRegion] = useState<Region>({
    latitude: -12.0464, // Default to Lima, Peru
    longitude: -77.0428,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    regionRef.current = region;
  }, [region]);

  // Trip store integration
  const { activeTrip, isTracking, startTracking, setActiveTrip, reset } = useTripStore();

  const oxygenResource = useMemo(() => {
    const items = resourcesData?.items ?? [];
    return items.reduce<Recurso | null>((best, item) => {
      if (item.category !== 'oxigeno') return best;
      if (!best || item.currentAmount > best.currentAmount) return item;
      return best;
    }, null);
  }, [resourcesData?.items]);

  const foodResource = useMemo(() => {
    const items = resourcesData?.items ?? [];
    return items.reduce<Recurso | null>((best, item) => {
      if (item.category !== 'comida') return best;
      if (!best || item.currentAmount > best.currentAmount) return item;
      return best;
    }, null);
  }, [resourcesData?.items]);

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

    if (activeTrip?.status !== 'activo' || isSimulating) return;

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
  }, [activeTrip?.status, isSimulating]);

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
    if (activeTrip?.status !== 'activo') {
      setIsSimulating(false);
    }
  }, [activeTrip?.status]);

  useEffect(() => {
    consumptionBufferRef.current = { oxygen: 0, food: 0 };
    consumptionErrorRef.current = false;
  }, [activeTrip?.id]);

  useEffect(() => {
    if (!data?.items) return;

    setSuppliesList((prev) => {
      const mergedMap = new Map<string, Suministro>();
      prev.forEach((item) => mergedMap.set(String(item.id), item));
      data.items.forEach((item) => mergedMap.set(String(item.id), item));
      return Array.from(mergedMap.values());
    });
  }, [data?.items]);

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

  const moveTowards = (from: Region, to: { lat: number; lng: number }, stepMeters: number) => {
    const distanceKm = calculateDistanceKm(from.latitude, from.longitude, to.lat, to.lng);
    const distanceMeters = distanceKm * 1000;
    if (distanceMeters === 0) {
      return { next: from, movedMeters: 0, reached: true };
    }
    if (distanceMeters <= stepMeters) {
      return {
        next: { ...from, latitude: to.lat, longitude: to.lng },
        movedMeters: distanceMeters,
        reached: true,
      };
    }
    const ratio = stepMeters / distanceMeters;
    return {
      next: {
        ...from,
        latitude: from.latitude + (to.lat - from.latitude) * ratio,
        longitude: from.longitude + (to.lng - from.longitude) * ratio,
      },
      movedMeters: stepMeters,
      reached: false,
    };
  };

  const flushConsumption = async () => {
    if (consumptionInFlightRef.current || consumptionErrorRef.current) return;
    const oxygenAmount = Math.floor(consumptionBufferRef.current.oxygen);
    const foodAmount = Math.floor(consumptionBufferRef.current.food);
    if (oxygenAmount <= 0 && foodAmount <= 0) return;
    if (!oxygenResource || !foodResource) return;

    consumptionInFlightRef.current = true;
    try {
      const tasks: Promise<any>[] = [];
      if (oxygenAmount > 0) {
        tasks.push(
          recordMovement.mutateAsync({
            id: oxygenResource.id,
            data: {
              recursoId: oxygenResource.id,
              tipo: 'egreso',
              cantidad: oxygenAmount,
              razon: 'Consumo por caminata',
            },
          })
        );
      }
      if (foodAmount > 0) {
        tasks.push(
          recordMovement.mutateAsync({
            id: foodResource.id,
            data: {
              recursoId: foodResource.id,
              tipo: 'egreso',
              cantidad: foodAmount,
              razon: 'Consumo por caminata',
            },
          })
        );
      }

      await Promise.all(tasks);
      consumptionBufferRef.current.oxygen -= oxygenAmount;
      consumptionBufferRef.current.food -= foodAmount;
    } catch (error) {
      consumptionErrorRef.current = true;
      setIsSimulating(false);
      Alert.alert('ERROR', 'No se pudo registrar el consumo de recursos.');
    } finally {
      consumptionInFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (!isSimulating || activeTrip?.status !== 'activo') {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }

    consumptionErrorRef.current = false;
    const destination = activeTrip.destination;

    simulationIntervalRef.current = setInterval(() => {
      const current = regionRef.current;
      if (!current) return;

      const distanceKm = calculateDistanceKm(
        current.latitude,
        current.longitude,
        destination.lat,
        destination.lng,
      );
      const distanceMeters = distanceKm * 1000;

      if (distanceMeters <= SIMULATION_STOP_RADIUS_METERS) {
        setIsSimulating(false);
        return;
      }

      const stepMeters = SIMULATION_SPEED_MPS * (SIMULATION_TICK_MS / 1000);
      const { next, movedMeters } = moveTowards(current, destination, stepMeters);
      regionRef.current = next;
      setRegion(next);

      const movedKm = movedMeters / 1000;
      consumptionBufferRef.current.oxygen += movedKm * OXYGEN_PER_KM;
      consumptionBufferRef.current.food += movedKm * FOOD_PER_KM;
      flushConsumption();
    }, SIMULATION_TICK_MS);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, [isSimulating, activeTrip?.status, activeTrip?.destination]);

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
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
    }
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
        const aCollected = a.status === 'recogido';
        const bCollected = b.status === 'recogido';
        if (aCollected !== bCollected) return aCollected ? 1 : -1;
        const distA = supplyDistances[String(a.id)] ?? Infinity;
        const distB = supplyDistances[String(b.id)] ?? Infinity;
        return distA - distB;
      })
    : [...suppliesList].sort((a, b) => {
        const aCollected = a.status === 'recogido';
        const bCollected = b.status === 'recogido';
        if (aCollected !== bCollected) return aCollected ? 1 : -1;
        return 0;
      });

  const supplies = sortedSupplies;
  const availableOxygen = oxygenResource?.currentAmount ?? 0;
  const oxygenToDestination = activeTrip?.status === 'activo'
    ? Math.max(
        0,
        Math.ceil(
          calculateDistanceKm(
            region.latitude,
            region.longitude,
            activeTrip.destination.lat,
            activeTrip.destination.lng,
          ) * OXYGEN_PER_KM,
        ),
      )
    : 0;
  const selectedSupply = supplies.find((s) => String(s.id) === String(selectedSupplyId));

  const estimateOxygenBudget = (supply: Suministro): number => {
    const distanceKm = calculateDistanceKm(
      region.latitude,
      region.longitude,
      supply.location.lat,
      supply.location.lng,
    );
    return Math.ceil(distanceKm * OXYGEN_PER_KM);
  };

  const handleStartTripFromSupply = () => {
    if (!selectedSupply) return;

    const oxygenBudget = estimateOxygenBudget(selectedSupply);
    const availableOxygen = oxygenResource?.currentAmount ?? 0;
    const oxygenAfter = availableOxygen - oxygenBudget;
    const distanceKm = calculateDistanceKm(
      region.latitude,
      region.longitude,
      selectedSupply.location.lat,
      selectedSupply.location.lng,
    );

    Alert.alert(
      "INICIAR VIAJE",
      `Destino: ${selectedSupply.name}\nDistancia estimada: ${distanceKm.toFixed(2)} km\nOxígeno disponible: ${availableOxygen} unidades\nOxígeno requerido: ${oxygenBudget} unidades\nOxígeno restante: ${oxygenAfter} unidades\n\n¿Deseas iniciar este viaje?`,
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
            if (oxygenResource && oxygenAfter < 0) {
              Alert.alert(
                'OXÍGENO INSUFICIENTE',
                `Te faltan ${Math.abs(oxygenAfter)} unidades de oxígeno para completar el viaje.`,
              );
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

  const handleToggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      return;
    }
    if (activeTrip?.status !== 'activo') {
      Alert.alert('AVISO', 'Debes iniciar un viaje antes de simular la caminata.');
      return;
    }
    if (!oxygenResource || !foodResource) {
      Alert.alert('FALTAN RECURSOS', 'Necesitas recursos de oxígeno y comida para consumir durante la simulación.');
      return;
    }
    setIsSimulating(true);
  };

  const handleCancelTrip = () => {
    if (activeTrip?.status !== 'activo') return;
    Alert.alert(
      'CANCELAR VIAJE',
      '¿Deseas cancelar el viaje actual? Esta acción detendrá el rastreo y la simulación.',
      [
        { text: 'VOLVER', style: 'cancel' },
        {
          text: 'CANCELAR',
          style: 'destructive',
          onPress: () => {
            setIsSimulating(false);
            reset();
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
      if (page === 1) {
        await refetch();
      } else {
        setPage(1);
      }
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
            onRegionChangeComplete={(nextRegion) => setRegion(nextRegion)}
          >
            {supplies.map((supply) => {
              const isSelected = String(selectedSupplyId) === String(supply.id);
              const isCollected = supply.status === 'recogido';
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
                  onPress={() => {
                    if (!isCollected) {
                      setSelectedSupplyId(String(supply.id));
                    }
                  }}
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
        <View style={{ height: 260, marginBottom: 12, position: 'relative' }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onRegionChangeComplete={(nextRegion) => setRegion(nextRegion)}
          >
            {supplies.map((supply) => {
              const isSelected = String(selectedSupplyId) === String(supply.id);
              const isCollected = supply.status === 'recogido';
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
                  onPress={() => {
                    if (!isCollected) {
                      setSelectedSupplyId(String(supply.id));
                    }
                  }}
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
            {isSimulating && (
              <Marker
                key="ghost-marker"
                coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                title="Posición simulada"
                description="Movimiento simulado"
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(0,183,235,0.5)',
                    borderWidth: 2,
                    borderColor: '#00b7eb',
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 10,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>👻</Text>
                </View>
              </Marker>
            )}
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

          {activeTrip?.status === 'activo' && (
            <View style={{ position: 'absolute', bottom: 14, left: 14, right: 14, zIndex: 1000 }}>
              <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 10, borderRadius: 8 }}>
                <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 12, textAlign: 'center' }}>
                  O₂ TANQUE: {availableOxygen}
                </Text>
                <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                  O₂ LLEGADA: ~{oxygenToDestination}
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

        {activeTrip?.status === 'activo' && (
          <TouchableOpacity
            onPress={handleToggleSimulation}
            style={{
              backgroundColor: isSimulating ? tc.danger : tc.primary,
              borderRadius: 6,
              paddingVertical: 10,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: tc.background, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 }}>
              {isSimulating ? '⏸ DETENER SIMULACIÓN' : '▶ SIMULAR CAMINATA'}
            </Text>
          </TouchableOpacity>
        )}

        {activeTrip?.status === 'activo' && (
          <TouchableOpacity
            onPress={handleCancelTrip}
            style={{
              backgroundColor: tc.danger,
              borderRadius: 6,
              paddingVertical: 10,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: tc.background, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 }}>
              ✖ CANCELAR VIAJE
            </Text>
          </TouchableOpacity>
        )}

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
          const isCollected = item.status === 'recogido';
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
                opacity: isCollected ? 0.65 : 1,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (!isCollected) {
                    setSelectedSupplyId(String(item.id));
                  }
                }}
                disabled={isCollected}
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
