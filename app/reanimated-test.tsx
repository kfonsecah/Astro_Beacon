//documento prueba de animaciones, no funcional ni necesaria
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

export default function ReanimatedTestScreen() {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Test 1: Translation
    translateX.value = withRepeat(withTiming(120, { duration: 1000, easing: Easing.linear }), -1, true);

    // Test 2: Rotation
    rotate.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1, false);

    // Test 3: Scale pulse
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800 }),
        withDelay(200, withTiming(1, { duration: 800 }))
      ),
      -1,
      true
    );

    setTestResults(['✅ Translation animada', '✅ Rotación continua', '✅ Pulso de escala']);
  }, []);

  const animatedBoxStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>REANIMATED UAT</Text>
      <Text style={styles.subtitle}>SDK 54 · New Architecture</Text>

      <View style={styles.testArea}>
        <Animated.View style={[styles.box, animatedBoxStyle]} />
      </View>

      <View style={styles.results}>
        {testResults.map((result, i) => (
          <Animated.View
            key={i}
            entering={FadeIn.delay(i * 200)}
            exiting={FadeOut}
          >
            <Text style={styles.resultText}>{result}</Text>
          </Animated.View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          translateX.value = 0;
          rotate.value = 0;
          scale.value = 1;
        }}
      >
        <Text style={styles.buttonText}>RESET ANIMACIONES</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
    padding: 24,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#00E5FF',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#6272a4',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
  },
  testArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 80,
    height: 80,
    backgroundColor: '#00E5FF',
    borderRadius: 8,
  },
  results: {
    marginBottom: 24,
    gap: 8,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#8BE9FD',
    letterSpacing: 1,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00E5FF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#0B1120',
    letterSpacing: 2,
  },
});
