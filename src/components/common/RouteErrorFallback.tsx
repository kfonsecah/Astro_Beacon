import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

export interface RouteErrorFallbackProps {
  error: Error;
  retry: () => void;
}

function PulseBorder({ color }: { color: string }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.ease) }),
        withTiming(0.3, { duration: 900, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderWidth: 1,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

export function RouteErrorFallback({ error, retry }: RouteErrorFallbackProps) {
  const { colors: tc } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: tc.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      }}
    >
      {/* Glitchy symbol */}
      <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 40, marginBottom: 24 }}>
        ⬡
      </Text>

      {/* Error panel */}
      <View
        style={{
          width: '100%',
          borderLeftWidth: 3,
          borderLeftColor: tc.danger,
          borderWidth: 1,
          borderColor: tc.danger + '30',
          padding: 20,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <PulseBorder color={tc.danger + '30'} />

        <Text
          style={{
            fontFamily: 'monospace',
            fontSize: 8,
            letterSpacing: 3,
            color: tc.danger,
            marginBottom: 12,
          }}
        >
          ERROR CRITICO DEL SISTEMA
        </Text>

        <Text
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            color: tc.text,
            marginBottom: 8,
            letterSpacing: 0.5,
          }}
        >
          FALLO EN EL MODULO
        </Text>

        <Text
          style={{
            fontFamily: 'monospace',
            fontSize: 10,
            color: tc.textMuted,
            lineHeight: 16,
          }}
        >
          {error.message || 'Error desconocido en el sistema'}
        </Text>
      </View>

      <TouchableOpacity
        style={{
          marginTop: 28,
          borderWidth: 1,
          borderColor: tc.primaryBorder,
          paddingVertical: 14,
          paddingHorizontal: 32,
        }}
        onPress={retry}
      >
        <Text
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            letterSpacing: 3,
            color: tc.primary,
          }}
        >
          [ REINICIAR MODULO ]
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          fontFamily: 'monospace',
          fontSize: 8,
          color: tc.textMuted,
          marginTop: 16,
          letterSpacing: 1,
        }}
      >
        PROTOCOLO DE RECUPERACION ACTIVO
      </Text>
    </View>
  );
}
