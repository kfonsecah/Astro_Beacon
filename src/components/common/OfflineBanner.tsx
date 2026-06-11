import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';
import { useOfflineStore } from '@/stores/offline.store';

export function OfflineBanner() {
  const { queueSize, isSyncing } = useOfflineStore();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isSyncing) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.15, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulse.setValue(1);
    }
  }, [isSyncing]);

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(251, 146, 60, 0.07)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(251, 146, 60, 0.2)',
      borderLeftWidth: 3,
      borderLeftColor: colors.warning,
      paddingHorizontal: 14,
      paddingVertical: 9,
    }}>
      {isSyncing ? (
        <ActivityIndicator size="small" color={colors.warning} style={{ marginRight: 10 }} />
      ) : (
        <Animated.View style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.warning,
          marginRight: 10,
          opacity: pulse,
        }} />
      )}

      <View style={{ flex: 1 }}>
        <Text style={{
          color: colors.warning,
          fontFamily: 'monospace',
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: 'bold',
        }}>
          {isSyncing ? 'SINCRONIZANDO...' : 'SEÑAL PERDIDA'}
        </Text>
        <Text style={{
          color: 'rgba(251, 146, 60, 0.55)',
          fontFamily: 'monospace',
          fontSize: 9,
          letterSpacing: 1,
          marginTop: 2,
        }}>
          {isSyncing
            ? 'subiendo operaciones pendientes al servidor'
            : 'modo offline activo  ·  datos en caché local'}
        </Text>
      </View>

      {queueSize > 0 && !isSyncing && (
        <View style={{
          backgroundColor: 'rgba(251, 146, 60, 0.12)',
          borderWidth: 1,
          borderColor: 'rgba(251, 146, 60, 0.35)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 2,
        }}>
          <Text style={{
            color: colors.warning,
            fontFamily: 'monospace',
            fontSize: 9,
            letterSpacing: 1,
            fontWeight: 'bold',
          }}>
            {queueSize} EN COLA
          </Text>
        </View>
      )}
    </View>
  );
}
