import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/auth.context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginScreen() {
  const [agentId, setAgentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <View style={styles.logoSection}>
          <Text style={styles.logoIcon}>🛰️</Text>
          <Text style={styles.title}>ASTRO_BEACON</Text>
          <Text style={styles.subtitle}>Houston, we need you</Text>
          <Text style={styles.systemId}>SYS.ID: AB-2026-EIF411</Text>
        </View>

        <View style={styles.form}>
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

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            title={isLoading ? "CONECTANDO..." : "INICIAR SESIÓN"}
            onPress={handleLogin}
            disabled={isLoading}
          />

          <Text style={styles.footer}>
            Sistema de Asistencia Astronauta v1.0
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 28,
    letterSpacing: 6,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#9CA3AF",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 8,
  },
  systemId: {
    color: "#4B5563",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 12,
  },
  form: {
    gap: 0,
  },
  error: {
    color: "#EF4444",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: "center",
  },
  footer: {
    color: "#374151",
    fontFamily: "monospace",
    fontSize: 9,
    textAlign: "center",
    marginTop: 32,
    letterSpacing: 1,
  },
});
