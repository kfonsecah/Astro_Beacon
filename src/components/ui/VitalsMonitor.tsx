import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

const PATTERN_WIDTH = 110;
const TRACE_HEIGHT = 56;

// One heartbeat cycle (P wave, QRS spike, T wave) as a polyline
const ECG_POINTS = [
  { x: 0, y: 34 },
  { x: 16, y: 34 },
  { x: 22, y: 28 },
  { x: 28, y: 34 },
  { x: 36, y: 34 },
  { x: 40, y: 38 },
  { x: 45, y: 6 },
  { x: 50, y: 48 },
  { x: 55, y: 34 },
  { x: 68, y: 34 },
  { x: 76, y: 26 },
  { x: 84, y: 34 },
  { x: PATTERN_WIDTH, y: 34 },
];

function EcgWave({ color }: { color: string }) {
  return (
    <View style={{ width: PATTERN_WIDTH, height: TRACE_HEIGHT }}>
      {ECG_POINTS.slice(0, -1).map((p, i) => {
        const q = ECG_POINTS[i + 1];
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: (p.x + q.x) / 2 - length / 2,
              top: (p.y + q.y) / 2 - 1,
              width: length,
              height: 2,
              borderRadius: 1,
              backgroundColor: color,
              transform: [{ rotate: `${angle}rad` }],
            }}
          />
        );
      })}
    </View>
  );
}

function EcgTrace({ color }: { color: string }) {
  const shift = useSharedValue(0);

  useEffect(() => {
    shift.value = withRepeat(
      withTiming(-PATTERN_WIDTH, { duration: 1400, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: shift.value }],
  }));

  return (
    <View style={{ height: TRACE_HEIGHT, overflow: 'hidden' }}>
      <Animated.View style={[{ flexDirection: 'row' }, style]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <EcgWave key={i} color={color} />
        ))}
      </Animated.View>
    </View>
  );
}

function PulsingHeart({ color }: { color: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 180, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 520, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.Text style={[{ color, fontSize: 13, lineHeight: 16 }, style]}>♥</Animated.Text>
  );
}

function BlinkDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }, style]}
    />
  );
}

interface VitalsMonitorProps {
  name?: string;
  status?: string;
}

export function VitalsMonitor({ name, status }: VitalsMonitorProps) {
  const { colors: tc } = useTheme();
  const [bpm, setBpm] = useState(72);
  const [spo2, setSpo2] = useState(98);

  useEffect(() => {
    const id = setInterval(() => {
      setBpm(66 + Math.floor(Math.random() * 14));
      setSpo2(96 + Math.floor(Math.random() * 4));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const subject = name
    ? `${String(name).toUpperCase()}${status ? ` · ${String(status).toUpperCase()}` : ''}`
    : 'CARGANDO...';

  return (
    <View
      style={{
        backgroundColor: tc.surface,
        borderWidth: 1,
        borderColor: tc.border,
        borderLeftWidth: 3,
        borderLeftColor: tc.success,
        padding: 14,
        marginBottom: 16,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <BlinkDot color={tc.success} />
        <Text
          style={{
            color: tc.success,
            fontFamily: 'monospace',
            fontSize: 9,
            letterSpacing: 2,
            flex: 1,
          }}
        >
          SIGNOS VITALES
        </Text>
        <Text
          style={{
            color: tc.textMuted,
            fontFamily: 'monospace',
            fontSize: 9,
            letterSpacing: 1,
          }}
        >
          {subject}
        </Text>
      </View>

      {/* ECG trace */}
      <EcgTrace color={tc.success} />

      {/* Vitals row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <PulsingHeart color={tc.success} />
        <Text
          style={{
            color: tc.text,
            fontFamily: 'monospace',
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          {bpm} BPM
        </Text>
        <View style={{ flex: 1 }} />
        <Text
          style={{
            color: tc.textMuted,
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: 1,
          }}
        >
          SpO₂ {spo2}%
        </Text>
        <Text
          style={{
            color: tc.success,
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: 1,
            marginLeft: 10,
          }}
        >
          ESTABLE
        </Text>
      </View>
    </View>
  );
}
