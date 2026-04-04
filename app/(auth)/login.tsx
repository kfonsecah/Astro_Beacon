import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@/context/auth.context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/use-theme";

export default function LoginScreen() {
  const [agentId, setAgentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const theme = useTheme();
  const { colors: tc } = theme;

  const handleLogin = async () => {
    setError("");
    if (!agentId.trim()) {
      setError("Ingrese su ID de agente");
      return;
    }
    if (!password.trim()) {
      setError("Ingrese su clave de acceso");
      return;
    }
    try {
      await login(agentId, password);
    } catch (err) {
      setError("Credenciales inválidas");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 32 }}
      >
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🛰️</Text>
          <Text style={{ color: tc.primary, fontFamily: "monospace", fontSize: 28, letterSpacing: 6, fontWeight: "bold" }}>ASTRO_BEACON</Text>
          <Text style={{ color: tc.textSecondary, fontFamily: "monospace", fontSize: 12, letterSpacing: 2, marginTop: 8 }}>Houston, we need you</Text>
          <Text style={{ color: tc.textMuted, fontFamily: "monospace", fontSize: 10, letterSpacing: 1, marginTop: 12 }}>SYS.ID: AB-2026-EIF411</Text>
        </View>

        <View style={{ gap: 0 }}>
          <Input
            label="AGENT_ID"
            value={agentId}
            onChangeText={setAgentId}
            placeholder="Ingrese ID de agente"
            autoCapitalize="none"
          />

          <Input
            label="ACCESS_KEY"
            value={password}
            onChangeText={setPassword}
            placeholder="Ingrese clave de acceso"
            secureTextEntry
          />

          {error && <Text style={{ color: tc.danger, fontFamily: "monospace", fontSize: 10, letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>{error}</Text>}

          <Button
            title={isLoading ? "CONECTANDO..." : "INICIAR SESIÓN"}
            onPress={handleLogin}
            disabled={isLoading}
          />

          <Text style={{ color: tc.textDisabled, fontFamily: "monospace", fontSize: 9, textAlign: "center", marginTop: 32, letterSpacing: 1 }}>
            Sistema de Asistencia Astronauta v1.0
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
