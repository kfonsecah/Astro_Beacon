import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { HudHeader } from '@/components/ui/HudHeader';
import { useResources, useRecordResourceMovement } from '@/hooks/useResources';
import type { Recurso } from '@/types-dtos';

export default function LogResourceScreen() {
  const theme = useTheme();
  const { colors: tc } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [movementType, setMovementType] = useState<'ingreso' | 'egreso'>('ingreso');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [tripId, setTripId] = useState<string>('');

  const { data: resourcesData, isLoading: isLoadingResources } = useResources(1, 100);
  const recordMovement = useRecordResourceMovement();

  const resources = resourcesData?.items || [];

  const handleRegister = async () => {
    if (!selectedResourceId) {
      Alert.alert('ERROR', 'DEBE SELECCIONAR UN RECURSO');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('ERROR', 'LA CANTIDAD DEBE SER MAYOR A CERO');
      return;
    }

    try {
      await recordMovement.mutateAsync({
        id: selectedResourceId,
        data: {
          recursoId: selectedResourceId,
          tipo: movementType,
          cantidad: parsedAmount,
          razon: reason || (movementType === 'ingreso' ? 'Ingreso manual' : 'Egreso manual'),
          viajeId: tripId || undefined,
        },
      });
      Alert.alert('ÉXITO', 'MOVIMIENTO REGISTRADO CORRECTAMENTE');
      router.back();
    } catch (error) {
      console.error('Error recording movement:', error);
      Alert.alert('ERROR', 'NO SE PUDO REGISTRAR EL MOVIMIENTO');
    }
  };

  const isSubmitting = recordMovement.isPending;

  return (
    <View style={[styles.container, { backgroundColor: tc.background, paddingTop: insets.top }]}>
      <HudHeader title="REGISTRAR MOVIMIENTO" subtitle="GESTIÓN DE SUMINISTROS" />

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
                  selectedResourceId === resource.id && { backgroundColor: tc.primary, borderColor: tc.primary }
                ]}
                onPress={() => setSelectedResourceId(resource.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: tc.textSecondary },
                    selectedResourceId === resource.id && { color: tc.background }
                  ]}
                >
                  {resource.name.toUpperCase()}
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
          onChangeText={setAmount}
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

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: tc.primary },
            (!selectedResourceId || !amount || isSubmitting) && { opacity: 0.5 }
          ]}
          onPress={handleRegister}
          disabled={!selectedResourceId || !amount || isSubmitting}
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
