import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface TankGaugeProps {
  /** Nivel de llenado 0-100 */
  pct: number;
  color: string;
  width?: number;
  height?: number;
  /** Marca de umbral crítico 0-100 */
  thresholdPct?: number;
  /** Hace pulsar el contenido cuando el nivel es crítico */
  critical?: boolean;
}

export function TankGauge({
  pct,
  color,
  width = 24,
  height = 60,
  thresholdPct,
  critical = false,
}: TankGaugeProps) {
  const fill = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    fill.value = withTiming(Math.max(0, Math.min(100, pct)), {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [pct]);

  useEffect(() => {
    if (critical) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.35, { duration: 450, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 450, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 150 });
    }
  }, [critical]);

  // Animar en píxeles (no en porcentaje): las alturas porcentuales animadas
  // se redibujan mal dentro de listas con scroll en Android
  const innerHeight = height - 2;
  const fillStyle = useAnimatedStyle(() => ({
    height: (fill.value / 100) * innerHeight,
    opacity: pulse.value,
  }));

  return (
    <View
      style={{
        width,
        height,
        borderWidth: 1,
        borderColor: color + '66',
        backgroundColor: color + '12',
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}
    >
      <Animated.View style={[{ width: '100%', backgroundColor: color }, fillStyle]} />
      {thresholdPct != null && thresholdPct > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: (Math.max(0, Math.min(100, thresholdPct)) / 100) * innerHeight,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: '#EF4444AA',
          }}
        />
      )}
      {/* brillo de "cristal" */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 2,
          width: 2,
          backgroundColor: 'rgba(255,255,255,0.08)',
        }}
      />
    </View>
  );
}
