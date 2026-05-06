import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useResourceById } from '@/hooks/useResources';
import { HudHeader } from '@/components/ui/HudHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/constants/colors';
import type { RecursoMovimiento } from '@/types-dtos';

const CATEGORY_CONFIG: Record<string, { color: string; symbol: string; label: string }> = {
  oxigeno: { color: colors.categoryOxigeno, symbol: 'O2',  label: 'OXÍGENO' },
  agua:    { color: colors.categoryAgua,    symbol: 'H2O', label: 'AGUA' },
  comida:  { color: colors.categoryComida,  symbol: 'ALI', label: 'ALIMENTO' },
  medico:  { color: colors.categoryMedico,  symbol: 'MED', label: 'MÉDICO' },
  equipo:  { color: colors.categoryEquipo,  symbol: 'EQP', label: 'EQUIPO' },
  otro:    { color: colors.categoryOtro,    symbol: 'OTR', label: 'OTRO' },
};

function formatDate(ts: Date | string) {
  const d = new Date(ts);
  return `${d.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: '2-digit' })} ${d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function ResourceDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const theme = useTheme();
  const { colors: tc } = theme;

  const { data: resource, isLoading, isError, refetch } = useResourceById(id!);

  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 14, letterSpacing: 2 }}>RECURSO NO ENCONTRADO</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, marginTop: 8, letterSpacing: 2 }}>
          CARGANDO RECURSO...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || !resource) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 12, letterSpacing: 2, marginBottom: 8 }}>ERROR DE CARGA</Text>
        <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, textAlign: 'center', marginBottom: 16 }}>
          No se pudo obtener los datos del recurso.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{ borderWidth: 1, borderColor: tc.primary, paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>REINTENTAR</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const catConfig = CATEGORY_CONFIG[resource.category] ?? CATEGORY_CONFIG['otro'];
  const current = resource.currentAmount ?? 0;
  const max = resource.maxCapacity ?? (resource.threshold ? Math.round(resource.threshold / 0.15) : 100);
  const thresholdPct = max > 0 ? (resource.threshold / max) * 100 : 15;
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  const isCritical = pct <= thresholdPct;

  const movements: RecursoMovimiento[] = [...(resource.movements ?? [])].reverse();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Back */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            style={{ paddingVertical: 12, alignSelf: 'flex-start' }}
          >
            <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 13, letterSpacing: 2, fontWeight: 'bold' }}>
              ← VOLVER
            </Text>
          </TouchableOpacity>
        </View>

        <HudHeader
          title={resource.name.toUpperCase()}
          subtitle="DETALLE DE RECURSO"
          style={{ paddingHorizontal: 16, marginBottom: 16 }}
        />

        {/* Category badge */}
        <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 16 }}>
          <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: catConfig.color + '22', borderWidth: 1, borderColor: catConfig.color }}>
            <Text style={{ color: catConfig.color, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 }}>
              {catConfig.symbol} · {catConfig.label}
            </Text>
          </View>
          {isCritical && (
            <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: tc.dangerMuted, borderWidth: 1, borderColor: tc.danger }}>
              <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 }}>NIVEL CRÍTICO</Text>
            </View>
          )}
        </View>

        {/* Stats panel */}
        <View style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, borderLeftWidth: 3, borderLeftColor: catConfig.color, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>ACTUAL</Text>
              <Text style={{ color: isCritical ? tc.danger : tc.primary, fontFamily: 'monospace', fontSize: 22, fontWeight: 'bold' }}>
                {current}
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9 }}>{resource.unit}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>CAPACIDAD</Text>
              <Text style={{ color: tc.textSecondary, fontFamily: 'monospace', fontSize: 22, fontWeight: 'bold' }}>
                {max}
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9 }}>{resource.unit}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>UMBRAL</Text>
              <Text style={{ color: tc.warning, fontFamily: 'monospace', fontSize: 22, fontWeight: 'bold' }}>
                {resource.threshold}
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9 }}>{resource.unit}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>NIVEL</Text>
              <Text style={{ color: isCritical ? tc.danger : tc.success, fontFamily: 'monospace', fontSize: 22, fontWeight: 'bold' }}>
                {pct}%
              </Text>
            </View>
          </View>
          <ProgressBar value={current} max={max} criticalThreshold={thresholdPct} showValue={false} />
        </View>

        {/* Metadata */}
        <View style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 14 }}>
          <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, marginBottom: 10 }}>METADATA</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9 }}>ÚLTIMA MOD.</Text>
            <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 9 }}>
              {resource.lastModified ? formatDate(resource.lastModified) : '--'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9 }}>CREADO</Text>
            <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 9 }}>
              {resource.createdAt ? formatDate(resource.createdAt) : '--'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9 }}>MOVIMIENTOS</Text>
            <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 9 }}>
              {movements.length}
            </Text>
          </View>
        </View>

        {/* Movements log */}
        <View style={{ marginHorizontal: 16 }}>
          <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 3, marginBottom: 12 }}>
            HISTORIAL DE MOVIMIENTOS ({movements.length})
          </Text>

          {movements.length === 0 ? (
            <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 20, alignItems: 'center' }}>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>
                SIN MOVIMIENTOS REGISTRADOS
              </Text>
            </View>
          ) : (
            movements.map((mov, idx) => {
              const isIngreso = mov.type === 'ingreso';
              const movColor = isIngreso ? tc.success : tc.danger;
              return (
                <View
                  key={idx}
                  style={{
                    backgroundColor: tc.surface,
                    borderWidth: 1,
                    borderColor: tc.border,
                    borderLeftWidth: 3,
                    borderLeftColor: movColor,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: movColor, fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' }}>
                        {isIngreso ? '↑ INGRESO' : '↓ EGRESO'}
                      </Text>
                      <Text style={{ color: movColor, fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' }}>
                        {isIngreso ? '+' : '-'}{mov.amount} {resource.unit}
                      </Text>
                    </View>
                    <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 8 }}>
                      {formatDate(mov.timestamp)}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9 }}>
                      {mov.previousAmount} → {mov.newAmount} {resource.unit}
                    </Text>
                  </View>

                  {mov.notes ? (
                    <Text style={{ color: tc.textSecondary, fontFamily: 'monospace', fontSize: 9, marginTop: 6, fontStyle: 'italic' }}>
                      {mov.notes}
                    </Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* FAB log movement */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          backgroundColor: tc.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
        onPress={() => router.push('/log-resource')}
      >
        <Text style={{ color: tc.background, fontSize: 30, fontWeight: 'bold', marginTop: -2 }}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
