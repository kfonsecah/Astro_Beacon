import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
import { RouteErrorFallback } from '@/components/common';
  Easing,
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

const STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 2 + Math.random() * 6,
  delay: Math.random() * 3,
  size: Math.random() > 0.7 ? (Math.random() > 0.5 ? 3 : 2) : 1,
}));

//animaciones estrellas
const SHOOTING_STARS = [
  { id: 0, startX: 60, startY: 15, endX: 20, endY: 65, delay: 2, duration: 1.5 },
  { id: 1, startX: 75, startY: 20, endX: 30, endY: 75, delay: 6, duration: 1.2 },
  { id: 2, startX: 50, startY: 10, endX: 15, endY: 60, delay: 10, duration: 1.8 },
  { id: 3, startX: 80, startY: 25, endX: 40, endY: 80, delay: 14, duration: 1.4 },
  { id: 4, startX: 40, startY: 15, endX: 10, endY: 65, delay: 18, duration: 1.6 },
  { id: 5, startX: 0, startY: 0, endX: 20, endY: 65, delay: 2, duration: 1.9 },
  { id: 6, startX: 40, startY: 34, endX: 20, endY: 65, delay: 7, duration: 4 },
  { id: 7, startX: 90, startY: 5, endX: 10, endY: 85, delay: 3, duration: 2.3 },
  { id: 8, startX: 20, startY: 45, endX: 85, endY: 20, delay: 8, duration: 1.1 },
  { id: 9, startX: 65, startY: 35, endX: 25, endY: 75, delay: 12, duration: 2.8 },
  { id: 10, startX: 10, startY: 20, endX: 70, endY: 70, delay: 4, duration: 3.2 },
  { id: 11, startX: 85, startY: 60, endX: 15, endY: 10, delay: 16, duration: 1.3 },
  { id: 12, startX: 45, startY: 5, endX: 35, endY: 95, delay: 20, duration: 3.5 },
  { id: 13, startX: 70, startY: 70, endX: 20, endY: 20, delay: 5, duration: 2.1 },
  { id: 14, startX: 30, startY: 60, endX: 75, endY: 25, delay: 11, duration: 1.7 },
  { id: 15, startX: 95, startY: 40, endX: 5, endY: 50, delay: 9, duration: 2.5 },
  // Estrellas que cruzan la pantalla de arriba a abajo
  { id: 16, startX: 100, startY: -10, endX: 0, endY: 110, delay: 1, duration: 2.8 },
  { id: 17, startX: 5, startY: -15, endX: 95, endY: 115, delay: 3.5, duration: 2.2 },
  { id: 18, startX: 50, startY: -5, endX: 50, endY: 105, delay: 8, duration: 3.1 },
  // De derecha a izquierda
  { id: 19, startX: 110, startY: 25, endX: -10, endY: 55, delay: 4, duration: 1.9 },
  { id: 20, startX: 115, startY: 75, endX: -15, endY: 35, delay: 9, duration: 2.4 },
  { id: 21, startX: 105, startY: 50, endX: -5, endY: 50, delay: 12, duration: 2.0 },
  // De izquierda a derecha
  { id: 22, startX: -10, startY: 30, endX: 110, endY: 60, delay: 5, duration: 2.6 },
  { id: 23, startX: -15, startY: 70, endX: 115, endY: 40, delay: 13, duration: 2.3 },
  { id: 24, startX: -5, startY: 15, endX: 105, endY: 80, delay: 17, duration: 2.7 },
  // Diagonales complejas
  { id: 25, startX: 100, startY: -10, endX: -10, endY: 100, delay: 2.5, duration: 3.0 },
  { id: 26, startX: -10, startY: 0, endX: 100, endY: 100, delay: 7, duration: 2.9 },
  { id: 27, startX: 100, startY: 100, endX: 0, endY: 0, delay: 11, duration: 2.7 },
  { id: 28, startX: 0, startY: 100, endX: 100, endY: 0, delay: 15, duration: 2.5 },
  // Líneas casi verticales/horizontales
  { id: 29, startX: 25, startY: -20, endX: 30, endY: 120, delay: 6, duration: 3.3 },
  { id: 30, startX: 75, startY: -20, endX: 70, endY: 120, delay: 10, duration: 3.2 },
  { id: 31, startX: -20, startY: 45, endX: 120, endY: 48, delay: 2, duration: 1.8 },
  { id: 32, startX: -20, startY: 80, endX: 120, endY: 75, delay: 18, duration: 1.9 },
];

function StarField({ primaryColor }: { primaryColor: string }) {
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      {STARS.map((star) => (
        <Star key={star.id} {...star} primaryColor={primaryColor} />
      ))}
      {SHOOTING_STARS.map((star) => (
        <ShootingStar key={`shoot-${star.id}`} {...star} primaryColor={primaryColor} />
      ))}
    </View>
  );
}

function Star({ left, top, duration, delay, size, primaryColor }: { left: number; top: number; duration: number; delay: number; size: number; primaryColor: string }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay * 1000,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: duration * 500, easing: Easing.ease }),
          withTiming(0.3, { duration: duration * 500, easing: Easing.ease })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ position: "absolute", left: `${left}%`, top: `${top}%`, width: size, height: size, backgroundColor: primaryColor }, animatedStyle]}
    />
  );
}

function ShootingStar({ startX, startY, endX, endY, delay, duration, primaryColor }: { startX: number; startY: number; endX: number; endY: number; delay: number; duration: number; primaryColor: string }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const dx = (endX - startX) / 100 * SCREEN_WIDTH;
    const dy = (endY - startY) / 100 * SCREEN_HEIGHT;

    opacity.value = withDelay(
      delay * 1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(1, { duration: duration * 1000 - 400 }),
          withTiming(0, { duration: 250 }),
          withDelay(4000 + Math.random() * 3000, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      )
    );
    translateX.value = withDelay(
      delay * 1000,
      withRepeat(
        withSequence(
          withTiming(dx, { duration: duration * 1000, easing: Easing.linear }),
          withDelay(4000 + Math.random() * 3000, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      )
    );
    translateY.value = withDelay(
      delay * 1000,
      withRepeat(
        withSequence(
          withTiming(dy, { duration: duration * 1000, easing: Easing.linear }),
          withDelay(4000 + Math.random() * 3000, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ position: "absolute", left: `${startX}%`, top: `${startY}%`, width: 3, height: 3, borderRadius: 1.5, backgroundColor: primaryColor }, animatedStyle]}
    />
  );
}

function Scanlines({ primaryColor }: { primaryColor: string }) {
  const lineCount = Math.ceil(SCREEN_HEIGHT / 6) + 20;
  const lines = Array.from({ length: lineCount }, (_, i) => i);

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none" }}>
      {lines.map((i) => (
        <View key={i} style={{ position: "absolute", top: i * 6, left: 0, right: 0, height: 1, backgroundColor: primaryColor + "0A" }} />
      ))}
    </View>
  );
}

function BlinkingCursor({ primaryColor }: { primaryColor: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ position: "absolute", right: 12, top: "50%", marginTop: -8, width: 2, height: 16, backgroundColor: primaryColor }, animatedStyle]} />
  );
}

function PulsingDot({ primaryColor }: { primaryColor: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(withSequence(withTiming(1.3, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, true);
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(0.3, { duration: 1000 })), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));

  return (
    <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: primaryColor }, animatedStyle]} />
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const loginMutation = useLogin();
  const theme = useTheme();
  const { colors: tc } = theme;
  const router = useRouter();

  const handleLogin = useCallback(async () => {
    if (!email.trim() || isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      await loginMutation.mutateAsync({ email, password });
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticating(false);
    }
  }, [email, password, isAuthenticating, loginMutation]);

  const btnScale = useSharedValue(1);
  const animatedBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <StarField primaryColor={tc.primary} />
      <Scanlines primaryColor={tc.primary} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(800)} style={{ paddingHorizontal: 32 }}>
            {/* System header */}
            <View style={{ alignItems: "center", marginBottom: 40 }}>
              <Animated.Text entering={FadeIn.delay(200).duration(600)} style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 4, color: tc.textMuted, marginBottom: 16 }}>
                // SISTEMA DE CONTROL DE MISIÓN
              </Animated.Text>
              <Animated.Text entering={FadeIn.delay(400).duration(600)} style={{ fontFamily: "monospace", fontSize: 28, letterSpacing: 8, color: tc.primary, fontWeight: "bold" }}>
                ASTRO
              </Animated.Text>
              <Animated.Text entering={FadeIn.delay(600).duration(600)} style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, color: tc.textMuted, marginTop: 4 }}>
                v2.7.1 — PROTOCOLO DE SUPERVIVENCIA
              </Animated.Text>
            </View>

            {/* Login form */}
            <Animated.View entering={SlideInDown.delay(800).duration(600)} style={{ gap: 20 }}>
              {/* Email / Agent ID */}
              <View>
                <Text style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, color: tc.textMuted, marginBottom: 8 }}>ID DE AGENTE / EMAIL</Text>
                <View style={{ position: "relative" }}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField("agent")}
                    onBlur={() => setFocusedField(null)}
                    style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: focusedField === "agent" ? tc.primary : tc.primaryBorder, paddingHorizontal: 16, paddingVertical: 14, fontFamily: "monospace", fontSize: 14, letterSpacing: 2, color: tc.primary }}
                    placeholder="INGRESE ID O EMAIL..."
                    placeholderTextColor={tc.textDisabled}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                  {focusedField === "agent" && <BlinkingCursor primaryColor={tc.primary} />}
                </View>
              </View>

              {/* Password */}
              <View>
                <Text style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, color: tc.textMuted, marginBottom: 8 }}>CLAVE DE ACCESO</Text>
                <View style={{ position: "relative" }}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={handleLogin}
                    secureTextEntry={!showPassword}
                    style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: focusedField === "password" ? tc.primary : tc.primaryBorder, paddingHorizontal: 16, paddingVertical: 14, fontFamily: "monospace", fontSize: 14, letterSpacing: 2, color: tc.primary }}
                    placeholder="INGRESE CLAVE..."
                    placeholderTextColor={tc.textDisabled}
                    autoCapitalize="none"
                    returnKeyType="done"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", marginTop: -10, padding: 4 }}>
                    <Text style={{ fontSize: 14, opacity: 0.5 }}>{showPassword ? "👁" : "👁‍🗨"}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Auth Button */}
              <Animated.View style={animatedBtnStyle}>
                <Pressable
                  onPress={handleLogin}
                  disabled={!email.trim() || isAuthenticating}
                  style={({ pressed }) => [{ borderWidth: 1, borderColor: tc.primaryBorder, paddingVertical: 14, alignItems: "center", justifyContent: "center", minHeight: 48, opacity: !email.trim() || isAuthenticating ? 0.3 : 1 }, pressed && { backgroundColor: tc.primaryMuted }]}
                  onPressIn={() => { btnScale.value = withTiming(0.98, { duration: 100 }); }}
                  onPressOut={() => { btnScale.value = withTiming(1, { duration: 150 }); }}
                >
                  {isAuthenticating ? (
                    <Text style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: 3, color: tc.primary }}>AUTENTICANDO...</Text>
                  ) : (
                    <Text style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: 3, color: tc.primary }}>[ AUTENTICAR ]</Text>
                  )}
                </Pressable>
              </Animated.View>
            </Animated.View>

            {/* Connection status */}
            <Animated.View entering={FadeIn.delay(1200).duration(600)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 32 }}>
              <PulsingDot primaryColor={tc.primary} />
              <Text style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 2, color: tc.textMuted }}>ENLACE ESTABLECIDO — SEÑAL DÉBIL</Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
