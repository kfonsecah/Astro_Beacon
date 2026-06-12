import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VitalsMonitor } from "@/components/ui/VitalsMonitor";
import { GyroOrbit, SpinDiamond, WarnTriangle } from "@/components/ui/Holo3D";
import { useTheme } from "@/hooks/use-theme";
import { useAstronautDashboard, useAstronautProfile } from "@/hooks/useAstronaut";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useResourceAlerts, useResources } from "@/hooks/useResources";
import { useSupplies } from "@/hooks/useSupplies";
import { colors } from "@/constants/colors";
import { astronautService } from "@/services/astronaut.service";
import { useRouter } from "expo-router";
import { type ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { RouteErrorFallback } from '@/components/common';

const CATEGORY_CONFIG: Record<string, { color: string; symbol: string }> = {
  oxigeno: { color: colors.categoryOxigeno, symbol: 'O2'  },
  agua:    { color: colors.categoryAgua,    symbol: 'H2O' },
  comida:  { color: colors.categoryComida,  symbol: 'ALI' },
  medico:  { color: colors.categoryMedico,  symbol: 'MED' },
  equipo:  { color: colors.categoryEquipo,  symbol: 'EQP' },
  otro:    { color: colors.categoryOtro,    symbol: 'OTR' },
};

function BlinkWhen({ active, children }: { active: boolean; children: ReactNode }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.25, { duration: 450, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 450, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(opacity);
      opacity.value = withTiming(1, { duration: 150 });
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

function formatETA(expiresAt: Date | string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'EXPIRADO';
  const totalMins = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMins / 1440);
  const hours = Math.floor((totalMins % 1440) / 60);
  const mins = totalMins % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function DashboardScreen() {
  const theme = useTheme();
  const tc = theme.colors;
  const router = useRouter();

  const { data: astronaut, isLoading: loadingProfile, error: errorProfile } = useAstronautProfile();
  const { data: stats, isLoading: loadingStats, error: errorStats } = useAstronautDashboard();
  const { data: alerts } = useResourceAlerts();
  const { data: resourcesData, isLoading: loadingResources, error: errorResources } = useResources(1, 10);
  const { data: suppliesData } = useSupplies(1, 50, 'pendiente');
  const networkStatus = useNetworkStatus();
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    const ping = async () => {
      try {
        const start = Date.now();
        await astronautService.getDashboard();
        setLatencyMs(Date.now() - start);
      } catch {}
    };
    ping();
  }, []);

  const isLoading = loadingProfile || loadingStats;
  const error = errorProfile || errorStats || errorResources;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, marginTop: 12 }}>
          CARGANDO DATOS...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 10, textAlign: "center" }}>
          ERROR AL CARGAR DATOS
        </Text>
        <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, marginTop: 8, textAlign: "center" }}>
          {error.message || 'Intente de nuevo más tarde'}
        </Text>
      </SafeAreaView>
    );
  }

  const resourcesCount = stats?.recursosCount ?? 0;
  const activeTrips = stats?.activeTrips ?? 0;
  const speciesDiscovered = stats?.speciesDiscovered ?? 0;

  const resources = resourcesData?.items ?? [];

  const missionDay = astronaut?.creadoEn
    ? Math.max(1, Math.floor((Date.now() - new Date(astronaut.creadoEn).getTime()) / 86400000) + 1)
    : null;

  const nextSupply = (suppliesData?.items ?? [])
    .filter(s => s.status === 'pendiente' && s.expiresAt)
    .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime())[0];

  const supplyETA = nextSupply?.expiresAt ? formatETA(nextSupply.expiresAt) : '--';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

        <VitalsMonitor name={astronaut?.name} status={astronaut?.status} />

        {/* Alerts - only show when there are alerts */}
        {alerts && alerts.filter((a: any) => a.message).length > 0 && (
          <View style={{ marginBottom: 16 }}>
            {alerts.filter((a: any) => a.message).map((alert: any) => (
              <View key={alert.resourceId} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(251,146,60,0.1)", borderWidth: 1, borderColor: "rgba(251,146,60,0.3)", padding: 12, marginBottom: 8 }}>
                <View style={{ marginRight: 10 }}>
                  <WarnTriangle size={14} color={tc.warning} />
                </View>
                <Text style={{ color: tc.warning, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>
                  {alert.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Signal Status */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 9, letterSpacing: 3 }}>
            {missionDay != null ? `DÍA ${missionDay} · MISIÓN ACTIVA` : 'MISIÓN ACTIVA'}
          </Text>
          <Text style={{ color: networkStatus.isConnected ? tc.success : tc.danger, fontFamily: "monospace", fontSize: 9, letterSpacing: 1 }}>
            {networkStatus.isConnected ? `EN LÍNEA${latencyMs != null ? ` · ${latencyMs}ms` : ''}` : 'SIN CONEXIÓN'}
          </Text>
        </View>

        <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>RECURSOS ACTIVOS</Text>

        {resources.length > 0 ? resources.map((resource: any) => {
            const resId = resource.id || resource._id;
            const current = resource.currentAmount ?? 0;
            const max = resource.maxCapacity ?? (resource.threshold ? Math.round(resource.threshold / 0.15) : 100);
            const thresholdPct = max > 0 ? ((resource.threshold ?? 0) / max) * 100 : 0;
            const isCritical = (current / max) * 100 < thresholdPct;
            const catConfig = CATEGORY_CONFIG[resource.category] ?? CATEGORY_CONFIG['otro'];

            return (
              <TouchableOpacity
                key={resId}
                onPress={() => router.push(`/resource/${resId}`)}
                style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, borderLeftWidth: 3, borderLeftColor: catConfig.color, padding: 14, marginBottom: 10 }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: catConfig.color, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1, marginRight: 6 }}>
                      {catConfig.symbol}
                    </Text>
                    <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
                      {(resource.name || 'UNKNOWN').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ color: isCritical ? tc.danger : tc.primary, fontFamily: "monospace", fontSize: 12 }}>
                    {current}/{max} {resource.unit || ''}
                  </Text>
                </View>
                <ProgressBar value={current} max={max} criticalThreshold={thresholdPct} showValue={false} />
                {isCritical && (
                  <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginTop: 6 }}>
                    NIVEL CRÍTICO — {Math.round((current / max) * 100)}%
                  </Text>
                )}
              </TouchableOpacity>
            );
          }) : (
            <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>SIN RECURSOS ACTIVOS</Text>
          )}

        <View style={{ marginTop: 8 }}>
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>PROGRESO DE MISIÓN</Text>
          <Card accent>
            {/* Estado y señal como chips */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: tc.surfaceElevated, borderWidth: 1, borderColor: tc.border, paddingHorizontal: 10, paddingVertical: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tc.success }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 7, letterSpacing: 2 }}>ESTADO</Text>
                  <Text style={{ color: tc.text, fontFamily: "monospace", fontSize: 11, letterSpacing: 1, marginTop: 2 }} numberOfLines={1}>
                    {(astronaut?.status ?? 'N/A').toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: tc.surfaceElevated, borderWidth: 1, borderColor: tc.border, paddingHorizontal: 10, paddingVertical: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: networkStatus.isConnected ? tc.success : tc.danger }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 7, letterSpacing: 2 }}>SEÑAL</Text>
                  <Text style={{ color: networkStatus.isConnected ? tc.text : tc.danger, fontFamily: "monospace", fontSize: 11, letterSpacing: 1, marginTop: 2 }} numberOfLines={1}>
                    {networkStatus.isConnected ? `ESTABLE · ${latencyMs != null ? `${latencyMs}ms` : '...'}` : 'OFFLINE'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Estadísticas grandes */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              {[
                { value: resourcesCount, label: 'RECURSOS', color: tc.primary },
                { value: activeTrips, label: 'VIAJES', color: tc.warning },
                { value: speciesDiscovered, label: 'ESPECIES', color: tc.success },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    backgroundColor: tc.surfaceElevated,
                    borderWidth: 1,
                    borderColor: tc.border,
                    borderTopWidth: 2,
                    borderTopColor: stat.color,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: stat.color, fontFamily: "monospace", fontSize: 22, lineHeight: 26 }}>
                    {stat.value}
                  </Text>
                  <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 8, letterSpacing: 1.5, marginTop: 4 }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Próximo suministro (parpadea si está expirado) */}
            <BlinkWhen active={supplyETA === 'EXPIRADO'}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: supplyETA === 'EXPIRADO' ? tc.danger + '15' : tc.surfaceElevated, borderWidth: 1, borderColor: supplyETA === 'EXPIRADO' ? tc.danger + '55' : tc.border, borderLeftWidth: 2, borderLeftColor: supplyETA === 'EXPIRADO' ? tc.danger : supplyETA === '--' ? tc.border : tc.warning, paddingHorizontal: 10, paddingVertical: 10 }}>
                <Text style={{ color: supplyETA === 'EXPIRADO' ? tc.danger : tc.textMuted, fontFamily: "monospace", fontSize: 8, letterSpacing: 2 }}>
                  PRÓXIMO SUMINISTRO
                </Text>
                <Text style={{ color: supplyETA === 'EXPIRADO' ? tc.danger : supplyETA === '--' ? tc.textMuted : tc.warning, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>
                  {supplyETA === 'EXPIRADO' ? 'EXPIRADO' : `ETA ${supplyETA}`}
                </Text>
              </View>
            </BlinkWhen>
          </Card>
        </View>

        <View style={{ flexDirection: "row", marginTop: 24, marginBottom: 12 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "transparent", borderWidth: 1, borderColor: tc.border, paddingVertical: 20, alignItems: "center" }}
            onPress={() => router.push("/logbook")}
          >
            <View style={{ marginBottom: 10 }}>
              <GyroOrbit size={38} color={tc.primary} />
            </View>
            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>EXPEDICIÓN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "transparent", borderWidth: 1, borderColor: tc.border, paddingVertical: 20, alignItems: "center" }}
            onPress={() => router.push("/species/identify")}
          >
            <View style={{ marginBottom: 10 }}>
              <SpinDiamond size={38} color={tc.primary} />
            </View>
            <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>IDENTIFICAR ESPECIE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
