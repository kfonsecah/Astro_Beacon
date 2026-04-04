import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
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
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
    padding: 24,
  },
  title: {
    color: '#6EE7B7',
    fontFamily: 'monospace',
    fontSize: 20,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 32,
  },
  testArea: {
    height: 200,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  box: {
    width: 50,
    height: 50,
    backgroundColor: '#6EE7B7',
  },
  results: {
    gap: 8,
    marginBottom: 32,
  },
  resultText: {
    color: '#22C55E',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#6EE7B7',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 3,
  },
});
