import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  SlideInDown,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth.context";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/constants/colors";

const SCREEN_HEIGHT = Dimensions.get("window").height;

// Static star positions
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 4 + Math.random() * 4,
  delay: Math.random() * 2,
  size: Math.random() > 0.8 ? 2 : 1,
}));

function StarField({ primaryColor }: { primaryColor: string }) {
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      {STARS.map((star) => (
        <Star key={star.id} {...star} primaryColor={primaryColor} />
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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: `${left}%`,
          top: `${top}%`,
          width: size,
          height: size,
          backgroundColor: primaryColor,
        },
        animatedStyle,
      ]}
    />
  );
}

function Scanlines({ primaryColor }: { primaryColor: string }) {
  const lineCount = Math.ceil(SCREEN_HEIGHT / 6) + 20;
  const lines = Array.from({ length: lineCount }, (_, i) => i);
  
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {lines.map((i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            top: i * 6,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: primaryColor + "0A",
          }}
        />
      ))}
    </View>
  );
}

function BlinkingCursor({ primaryColor }: { primaryColor: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, { duration: 500 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          right: 12,
          top: "50%",
          marginTop: -8,
          width: 2,
          height: 16,
          backgroundColor: primaryColor,
        },
        animatedStyle,
      ]}
    />
  );
}

function PulsingDot({ primaryColor }: { primaryColor: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: primaryColor,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function LoginScreen() {
  const [agentId, setAgentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const theme = useTheme();
  const { colors: tc } = theme;
  const router = useRouter();

  const handleLogin = useCallback(async () => {
    if (!agentId.trim() || isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      await login(agentId, password);
    } catch {
      setIsAuthenticating(false);
    }
  }, [agentId, password, isAuthenticating, login]);

  const btnScale = useSharedValue(1);
  const animatedBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      {/* Background effects - all use theme colors */}
      <StarField primaryColor={tc.primary} />
      <Scanlines primaryColor={tc.primary} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeIn.duration(800)}
            style={{ paddingHorizontal: 32 }}
          >
            {/* System header */}
            <View style={{ alignItems: "center", marginBottom: 40 }}>
              <Animated.Text
                entering={FadeIn.delay(200).duration(600)}
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  letterSpacing: 4,
                  color: tc.textMuted,
                  marginBottom: 16,
                }}
              >
                // SISTEMA DE CONTROL DE MISIÓN
              </Animated.Text>

              <Animated.Text
                entering={FadeIn.delay(400).duration(600)}
                style={{
                  fontFamily: "monospace",
                  fontSize: 28,
                  letterSpacing: 8,
                  color: tc.primary,
                  fontWeight: "bold",
                }}
              >
                ASTRO
              </Animated.Text>

              <Animated.Text
                entering={FadeIn.delay(600).duration(600)}
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  letterSpacing: 3,
                  color: tc.textMuted,
                  marginTop: 4,
                }}
              >
                v2.7.1 — PROTOCOLO DE SUPERVIVENCIA
              </Animated.Text>
            </View>

            {/* Login form */}
            <Animated.View entering={SlideInDown.delay(800).duration(600)} style={{ gap: 20 }}>
              {/* Agent ID Input */}
              <View>
                <Text
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    letterSpacing: 3,
                    color: tc.textMuted,
                    marginBottom: 8,
                  }}
                >
                  ID DE AGENTE
                </Text>
                <View style={{ position: "relative" }}>
                  <TextInput
                    value={agentId}
                    onChangeText={setAgentId}
                    onFocus={() => setFocusedField("agent")}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => {}}
                    style={{
                      backgroundColor: tc.surface,
                      borderWidth: 1,
                      borderColor: focusedField === "agent" ? tc.primary : tc.primaryBorder,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontFamily: "monospace",
                      fontSize: 14,
                      letterSpacing: 2,
                      color: tc.primary,
                    }}
                    placeholder="INGRESE ID..."
                    placeholderTextColor={tc.textDisabled}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                  {focusedField === "agent" && <BlinkingCursor primaryColor={tc.primary} />}
                </View>
              </View>

              {/* Password Input */}
              <View>
                <Text
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    letterSpacing: 3,
                    color: tc.textMuted,
                    marginBottom: 8,
                  }}
                >
                  CLAVE DE ACCESO
                </Text>
                <View style={{ position: "relative" }}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={handleLogin}
                    secureTextEntry={!showPassword}
                    style={{
                      backgroundColor: tc.surface,
                      borderWidth: 1,
                      borderColor: focusedField === "password" ? tc.primary : tc.primaryBorder,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontFamily: "monospace",
                      fontSize: 14,
                      letterSpacing: 2,
                      color: tc.primary,
                    }}
                    placeholder="INGRESE CLAVE..."
                    placeholderTextColor={tc.textDisabled}
                    autoCapitalize="none"
                    returnKeyType="done"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", marginTop: -10, padding: 4 }}
                  >
                    <Text style={{ fontSize: 14, opacity: 0.5 }}>{showPassword ? "👁" : "👁‍🗨"}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Auth Button */}
              <Animated.View style={animatedBtnStyle}>
                <Pressable
                  onPress={handleLogin}
                  disabled={!agentId.trim() || isAuthenticating}
                  style={({ pressed }) => [
                    {
                      borderWidth: 1,
                      borderColor: tc.primaryBorder,
                      paddingVertical: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 48,
                      opacity: !agentId.trim() || isAuthenticating ? 0.3 : 1,
                    },
                    pressed && { backgroundColor: tc.primaryMuted },
                  ]}
                  onPressIn={() => {
                    btnScale.value = withTiming(0.98, { duration: 100 });
                  }}
                  onPressOut={() => {
                    btnScale.value = withTiming(1, { duration: 150 });
                  }}
                >
                  {isAuthenticating ? (
                    <Text
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        letterSpacing: 3,
                        color: tc.primary,
                      }}
                    >
                      AUTENTICANDO...
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        letterSpacing: 3,
                        color: tc.primary,
                      }}
                    >
                      [ AUTENTICAR ]
                    </Text>
                  )}
                </Pressable>
              </Animated.View>
            </Animated.View>

            {/* Connection status */}
            <Animated.View
              entering={FadeIn.delay(1200).duration(600)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 32,
              }}
            >
              <PulsingDot primaryColor={tc.primary} />
              <Text
                style={{
                  fontFamily: "monospace",
                  fontSize: 8,
                  letterSpacing: 2,
                  color: tc.textMuted,
                }}
              >
                ENLACE ESTABLECIDO — SEÑAL DÉBIL
              </Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
