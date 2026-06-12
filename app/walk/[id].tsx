import { useTheme } from "@/hooks/use-theme";
import { spacing } from "@/constants/spacing";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStartWalk, useUpdateWalkGps, useCompleteWalk } from "@/hooks/useWalks";
import type { WalkChallenge } from "@/types-dtos";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { ActivityIndicator, Alert, AppState, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import { RouteErrorFallback } from '@/components/common';

const REWARD_LABELS: Record<string, string> = {
  oxigeno: "O₂",
  agua: "H₂O",
  comida: "ALI",
  equipo: "EQP",
};

function haversine(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function WalkTrackingScreen() {
  const theme = useTheme();
  const tc = theme.colors;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const startWalkMutation = useStartWalk();
  const updateGpsMutation = useUpdateWalkGps();
  const completeMutation = useCompleteWalk();

  const [distanceKm, setDistanceKm] = useState(0);
  const [targetKm, setTargetKm] = useState(0);
  const [challengeName, setChallengeName] = useState("");
  const [reward, setReward] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<"starting" | "walking" | "completed" | "error">("starting");
  const [errorMsg, setErrorMsg] = useState("");
  const lastPoint = useRef<{ lat: number; lng: number } | null>(null);
  const accumulatedRef = useRef(0);
  const gpsBatch = useRef<{ lat: number; lng: number; timestamp: string }[]>([]);
  const flushInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!id) return;
    startWalkMutation.mutate(id, {
      onSuccess: (data: WalkChallenge) => {
        setTargetKm(data.distance);
        setChallengeName(data.name);
        setReward(data.reward);
        setStatus("walking");
        startGps();
      },
      onError: () => {
        setStatus("error");
        setErrorMsg("No se pudo iniciar la caminata");
      },
    });
    return () => {
      if (flushInterval.current) clearInterval(flushInterval.current);
    };
  }, [id]);

  const startGps = useCallback(async () => {
    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== "granted") {
      setStatus("error");
      setErrorMsg("Permiso de ubicación denegado");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    lastPoint.current = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    gpsBatch.current.push({
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      timestamp: new Date().toISOString(),
    });

    Location.watchPositionAsync(
      { distanceInterval: 10, accuracy: Location.Accuracy.High },
      (newLoc) => {
        const pt = { lat: newLoc.coords.latitude, lng: newLoc.coords.longitude };
        gpsBatch.current.push({
          lat: pt.lat,
          lng: pt.lng,
          timestamp: new Date().toISOString(),
        });
        if (lastPoint.current) {
          accumulatedRef.current += haversine(lastPoint.current, pt);
          setDistanceKm(accumulatedRef.current);
        }
        lastPoint.current = pt;
      }
    );

    flushInterval.current = setInterval(() => {
      if (gpsBatch.current.length > 0) {
        const batch = [...gpsBatch.current];
        gpsBatch.current = [];
        updateGpsMutation.mutate({ id: id!, gpsPoints: batch });
      }
    }, 10000);
  }, [id]);

  const handleComplete = () => {
    if (!id) return;
    completeMutation.mutate(id, {
      onSuccess: () => {
        setStatus("completed");
      },
      onError: () => {
        Alert.alert("ERROR", "No se pudo completar la caminata");
      },
    });
  };

  const progress = targetKm > 0 ? Math.min(distanceKm / targetKm, 1) : 0;
  const reached = distanceKm >= targetKm;

  if (status === "starting") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, marginTop: 12 }}>
          INICIANDO CAMINATA...
        </Text>
      </SafeAreaView>
    );
  }

  if (status === "error") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 14, marginBottom: 8 }}>ERROR</Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>{errorMsg}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, borderWidth: 1, borderColor: tc.border, paddingVertical: 12, paddingHorizontal: 24 }}>
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>← VOLVER</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (status === "completed") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: tc.success, fontFamily: "monospace", fontSize: 16, letterSpacing: 3, marginBottom: 8 }}>
          CAMINATA COMPLETADA
        </Text>
        <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, marginBottom: 24, textAlign: "center" }}>
          {challengeName} — {distanceKm.toFixed(2)} km recorridos
        </Text>
        <Card style={{ width: "100%", marginBottom: 24 }}>
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>
            RECOMPENSAS OBTENIDAS
          </Text>
          {Object.entries(reward).map(([key, val]) => {
            const label = REWARD_LABELS[key] || key.toUpperCase();
            return val > 0 ? (
              <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9 }}>{label}</Text>
                <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10 }}>+{val}</Text>
              </View>
            ) : null;
          })}
        </Card>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/logbook")}
          style={{ borderWidth: 1, borderColor: tc.primary, paddingVertical: 14, paddingHorizontal: 32 }}
        >
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>← VOLVER A EXPEDICIONES</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: tc.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 14 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, flex: 1 }}>{challengeName}</Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 48, letterSpacing: 3 }}>
            {distanceKm.toFixed(2)}
          </Text>
          <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 4 }}>
            KM RECORRIDOS de {targetKm} km
          </Text>
        </View>

        <ProgressBar value={distanceKm} max={targetKm} showValue={false} />

        {reached && (
          <View style={{ marginTop: 32, alignItems: "center" }}>
            <Text style={{ color: tc.success, fontFamily: "monospace", fontSize: 10, letterSpacing: 2, marginBottom: 16 }}>
              ¡DISTANCIA ALCANZADA!
            </Text>
            <TouchableOpacity
              onPress={handleComplete}
              disabled={completeMutation.isPending}
              style={{ backgroundColor: tc.primary, paddingVertical: 14, paddingHorizontal: 32, alignItems: "center" }}
            >
              <Text style={{ color: tc.background, fontFamily: "monospace", fontSize: 11, letterSpacing: 2 }}>
                {completeMutation.isPending ? "COMPLETANDO..." : "FINALIZAR CAMINATA"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!reached && (
          <View style={{ marginTop: 32, alignItems: "center" }}>
            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap", justifyContent: "center" }}>
              {Object.entries(reward).map(([key, val]) => {
                const label = REWARD_LABELS[key] || key.toUpperCase();
                return val > 0 ? (
                  <View key={key} style={{ backgroundColor: tc.surfaceElevated, borderWidth: 1, borderColor: tc.border, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 7, letterSpacing: 1, marginBottom: 2 }}>{label}</Text>
                    <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 11, textAlign: "center" }}>+{val}</Text>
                  </View>
                ) : null;
              })}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
