import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';
import type { ToastMessage } from '@/stores/toast.store';
import { useToastStore } from '@/stores/toast.store';

const TOAST_DURATION = 4500;

const TOAST_CONFIG: Record<
  ToastMessage['type'],
  { label: string; color: string; bg: string; symbol: string }
> = {
  error: {
    label: 'ERROR DEL SISTEMA',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.07)',
    symbol: '⬡',
  },
  warning: {
    label: 'ADVERTENCIA',
    color: '#FB923C',
    bg: 'rgba(251,146,60,0.07)',
    symbol: '◈',
  },
  success: {
    label: 'OPERACION EXITOSA',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.07)',
    symbol: '◉',
  },
  info: {
    label: 'TRANSMISION',
    color: '#6EE7B7',
    bg: 'rgba(110,231,183,0.07)',
    symbol: '◎',
  },
};

function PulseDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 500, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.in(Easing.ease) }),
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

function ProgressBar({ color, duration }: { color: string; duration: number }) {
  const width = useSharedValue(100);

  useEffect(() => {
    width.value = withTiming(0, { duration, easing: Easing.linear });
  }, []);

  const style = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={{ height: 1, backgroundColor: color + '20', overflow: 'hidden' }}>
      <Animated.View style={[{ height: 1, backgroundColor: color + '60' }, style]} />
    </View>
  );
}

export function Toast({ id, type, title, message }: ToastMessage) {
  const dismiss = useToastStore((s) => s.dismiss);
  const { colors: tc } = useTheme();
  const config = TOAST_CONFIG[type];

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  return (
    <Animated.View
      entering={FadeInDown.duration(300).easing(Easing.out(Easing.back(1.4)))}
      exiting={FadeOutUp.duration(220).easing(Easing.in(Easing.ease))}
      style={{
        backgroundColor: tc.surface,
        borderWidth: 1,
        borderColor: config.color + '25',
        borderLeftWidth: 3,
        borderLeftColor: config.color,
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={() => dismiss(id)}
        style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 }}
        android_ripple={{ color: config.color + '15' }}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            marginBottom: 7,
          }}
        >
          <PulseDot color={config.color} />
          <Text
            style={{
              fontFamily: 'monospace',
              fontSize: 8,
              letterSpacing: 3,
              color: config.color,
              flex: 1,
            }}
          >
            {config.label}
          </Text>
          <Text
            style={{
              fontFamily: 'monospace',
              fontSize: 7,
              letterSpacing: 1,
              color: tc.textMuted,
            }}
          >
            TAP PARA CERRAR
          </Text>
        </View>

        {/* Symbol + title row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Text style={{ color: config.color, fontSize: 14, lineHeight: 20 }}>
            {config.symbol}
          </Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: tc.text,
                letterSpacing: 0.5,
                lineHeight: 19,
              }}
            >
              {title}
            </Text>
            {message ? (
              <Text
                style={{
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: tc.textMuted,
                  marginTop: 3,
                  lineHeight: 14,
                  letterSpacing: 0.3,
                }}
              >
                {message}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      {/* Auto-dismiss progress bar */}
      <ProgressBar color={config.color} duration={TOAST_DURATION} />
    </Animated.View>
  );
}
