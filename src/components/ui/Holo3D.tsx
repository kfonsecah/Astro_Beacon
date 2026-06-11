import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

function useSpinValue(duration: number) {
  const deg = useSharedValue(0);

  useEffect(() => {
    deg.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  return deg;
}

interface HoloProps {
  size?: number;
  color: string;
}

// Three orbiting rings spinning on different axes, like a hologram gyroscope
export function GyroOrbit({ size = 40, color }: HoloProps) {
  const a = useSpinValue(2600);
  const b = useSpinValue(3400);

  const ringBase = {
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1.5,
    borderColor: color,
  };

  const styleA = useAnimatedStyle(() => ({
    transform: [{ perspective: 300 }, { rotateY: `${a.value}deg` }],
  }));
  const styleB = useAnimatedStyle(() => ({
    transform: [{ perspective: 300 }, { rotateX: `${b.value}deg` }],
  }));
  const styleC = useAnimatedStyle(() => ({
    transform: [{ perspective: 300 }, { rotateZ: '60deg' }, { rotateX: `${a.value}deg` }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[ringBase, { opacity: 0.9 }, styleA]} />
      <Animated.View style={[ringBase, { opacity: 0.55 }, styleB]} />
      <Animated.View style={[ringBase, { opacity: 0.3 }, styleC]} />
      <View style={{ width: size * 0.16, height: size * 0.16, borderRadius: size * 0.08, backgroundColor: color }} />
    </View>
  );
}

// Wireframe diamond spinning on its vertical axis
export function SpinDiamond({ size = 40, color }: HoloProps) {
  const spin = useSpinValue(3000);
  const inner = size * 0.6;

  const style = useAnimatedStyle(() => ({
    transform: [{ perspective: 300 }, { rotateY: `${spin.value}deg` }, { rotateZ: '45deg' }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            width: inner,
            height: inner,
            borderWidth: 1.5,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <View style={{ width: inner * 0.3, height: inner * 0.3, backgroundColor: color, opacity: 0.6 }} />
      </Animated.View>
    </View>
  );
}

// Radar sweep: only Z-axis rotation, safe inside scrolling lists
// (perspective transforms can glitch with FlatList redraws on Android)
export function RadarSweep({ size = 40, color }: HoloProps) {
  const spin = useSpinValue(2400);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: color + '66',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: size * 0.55,
          height: size * 0.55,
          borderRadius: size * 0.275,
          borderWidth: 1,
          borderColor: color + '33',
        }}
      />
      <Animated.View
        style={[
          { position: 'absolute', width: size, height: size, alignItems: 'center' },
          style,
        ]}
      >
        <View style={{ width: 1.5, height: size / 2, backgroundColor: color }} />
      </Animated.View>
      <View style={{ width: size * 0.12, height: size * 0.12, borderRadius: size * 0.06, backgroundColor: color }} />
    </View>
  );
}

// Pulsing warning triangle with exclamation mark
export function WarnTriangle({ size = 16, color }: HoloProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 500, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width: size * 1.2, height: size, alignItems: 'center', justifyContent: 'flex-end' }, style]}
    >
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.6,
          borderRightWidth: size * 0.6,
          borderBottomWidth: size,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <Text
        style={{
          position: 'absolute',
          bottom: 0,
          color: '#0B1120',
          fontFamily: 'monospace',
          fontSize: size * 0.6,
          fontWeight: 'bold',
          lineHeight: size * 0.85,
        }}
      >
        !
      </Text>
    </Animated.View>
  );
}
