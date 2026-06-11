import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { HudHeader } from '@/components/ui/HudHeader';
import { useResources, useRecordResourceMovement } from '@/hooks/useResources';
import type { Recurso } from '@/types-dtos';
import { useToast } from '@/hooks/useToast';

export default function LogResourceScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedResource, setSelectedResource] = useState<Recurso | null>(null);
  const [movementType, setMovementType] = useState<'ingreso' | 'egreso'>('ingreso');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [tripId, setTripId] = useState<string>('');

  const { data: resourcesData, isLoading: isLoadingResources } = useResources(1, 10);
  const recordMovement = useRecordResourceMovement();
  const toast = useToast();
  const [validationError, setValidationError] = useState<string | null>(null);

  const resources = resourcesData?.items || [];

  const handleRegister = async () => {
    setValidationError(null);

    if (!selectedResource) {
      setValidationError('Debe seleccionar un recurso antes de continuar');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('La cantidad debe ser un número mayor a cero');
      return;
    }

    if (movementType === 'egreso' && parsedAmount > selectedResource.currentAmount) {
      setValidationError(
        `Solo hay ${selectedResource.currentAmount} ${selectedResource.unit} disponibles de ${selectedResource.name}`
      );
      return;
    }

    try {
      const result = await recordMovement.mutateAsync({
        id: selectedResource.id,
        data: {
          recursoId: selectedResource.id,
          tipo: movementType,
          cantidad: parsedAmount,
          razon: reason || (movementType === 'ingreso' ? 'Ingreso manual' : 'Egreso manual'),
          viajeId: tripId || undefined,
        },
      });
      if (result?.id?.startsWith('_offline_')) {
        toast.warning('EN COLA OFFLINE', 'Sin conexión. Se sincronizará al reconectar.');
      } else {
        toast.success('MOVIMIENTO REGISTRADO', 'El movimiento fue asentado en el sistema de suministros');
      }
      router.back();
    } catch (error) {
      console.error('Error recording movement:', error);
      toast.error('ERROR DE SISTEMA', 'No se pudo registrar el movimiento. Intenta de nuevo.');
    }
  };

  const isSubmitting = recordMovement.isPending;

  return (
    <View style={[styles.container, { backgroundColor: tc.background, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <HudHeader title="REGISTRAR MOVIMIENTO" subtitle="GESTIÓN DE SUMINISTROS" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Resource Selector */}
        <Text style={[styles.label, { color: tc.primary }]}>SELECCIONAR RECURSO</Text>
        {isLoadingResources ? (
          <ActivityIndicator size="small" color={tc.primary} style={{ marginVertical: 10 }} />
        ) : (
          <View style={styles.chipContainer}>
            {resources.map((resource: Recurso) => (
              <TouchableOpacity
                key={resource.id}
                style={[
                  styles.chip,
                  { borderColor: tc.border },
                  selectedResource?.id === resource.id && { backgroundColor: tc.primary, borderColor: tc.primary }
                ]}
                onPress={() => { setSelectedResource(resource); setValidationError(null); }}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: tc.textSecondary },
                    selectedResource?.id === resource.id && { color: tc.background }
                  ]}
                >
                  {resource.name.toUpperCase()}{resource.currentAmount != null ? `  ${resource.currentAmount} ${resource.unit}` : ''}
                </Text>
              </TouchableOpacity>
            ))}
            {resources.length === 0 && (
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10 }}>
                NO HAY RECURSOS DISPONIBLES
              </Text>
            )}
          </View>
        )}

        {/* Movement Type */}
        <Text style={[styles.label, { color: tc.primary, marginTop: 24 }]}>TIPO DE MOVIMIENTO</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              { borderColor: tc.border },
              movementType === 'ingreso' && { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e' }
            ]}
            onPress={() => setMovementType('ingreso')}
          >
            <Text style={[styles.typeText, { color: movementType === 'ingreso' ? '#22c55e' : tc.textMuted }]}>
              ↑ INGRESO
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              { borderColor: tc.border, marginLeft: 12 },
              movementType === 'egreso' && { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' }
            ]}
            onPress={() => setMovementType('egreso')}
          >
            <Text style={[styles.typeText, { color: movementType === 'egreso' ? '#ef4444' : tc.textMuted }]}>
              ↓ EGRESO
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <Text style={[styles.label, { color: tc.primary, marginTop: 24 }]}>CANTIDAD</Text>
        <TextInput
          style={[styles.input, { borderColor: tc.border, color: tc.text, backgroundColor: tc.surface }]}
          value={amount}
          onChangeText={(v) => { setAmount(v); setValidationError(null); }}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={tc.textMuted}
        />

        {/* Reason */}
        <Text style={[styles.label, { color: tc.primary, marginTop: 24 }]}>MOTIVO / RAZÓN</Text>
        <TextInput
          style={[styles.input, { borderColor: tc.border, color: tc.text, backgroundColor: tc.surface, height: 80, textAlignVertical: 'top' }]}
          value={reason}
          onChangeText={setReason}
          multiline
          placeholder="Descripción del movimiento..."
          placeholderTextColor={tc.textMuted}
        />

        {/* Trip ID (Optional) */}
        <Text style={[styles.label, { color: tc.primary, marginTop: 24 }]}>ID DE VIAJE (OPCIONAL)</Text>
        <TextInput
          style={[styles.input, { borderColor: tc.border, color: tc.text, backgroundColor: tc.surface }]}
          value={tripId}
          onChangeText={setTripId}
          placeholder="v-xxxxx"
          placeholderTextColor={tc.textMuted}
        />

        {/* Validation error */}
        {validationError ? (
          <View
            style={{
              marginTop: 24,
              borderWidth: 1,
              borderColor: '#EF444440',
              borderLeftWidth: 3,
              borderLeftColor: '#EF4444',
              paddingVertical: 10,
              paddingHorizontal: 14,
            }}
          >
            <Text style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 3, color: '#EF4444', marginBottom: 4 }}>
              DATO INVALIDO
            </Text>
            <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#E5E7EB' }}>
              {validationError}
            </Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: tc.primary },
            (!selectedResource || !amount || isSubmitting) && { opacity: 0.5 }
          ]}
          onPress={handleRegister}
          disabled={!selectedResource || !amount || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={tc.background} />
          ) : (
            <Text style={[styles.submitText, { color: tc.background }]}>REGISTRAR MOVIMIENTO</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { marginTop: 12 }]}
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <Text style={[styles.cancelText, { color: tc.textMuted }]}>CANCELAR</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  chipText: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
  typeContainer: {
    flexDirection: 'row',
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 4,
  },
  typeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontFamily: 'monospace',
    fontSize: 14,
    borderRadius: 4,
  },
  submitButton: {
    marginTop: 40,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 4,
  },
  submitText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 1,
  },
});
