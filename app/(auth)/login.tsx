import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function LoginScreen() {
  const [agentId, setAgentId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (agentId.trim() && password.trim()) {
      router.replace("/(tabs)/dashboard");
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
          <Text style={styles.label}>AGENT_ID</Text>
          <TextInput
            style={styles.input}
            value={agentId}
            onChangeText={setAgentId}
            placeholder="Ingrese ID de agente"
            placeholderTextColor="#4B5563"
            autoCapitalize="none"
          />

          <Text style={styles.label}>ACCESS_KEY</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Ingrese clave de acceso"
            placeholderTextColor="#4B5563"
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
          </TouchableOpacity>

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
    gap: 16,
  },
  label: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#E5E7EB",
    fontFamily: "monospace",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#6EE7B7",
    paddingVertical: 16,
    marginTop: 16,
  },
  loginButtonText: {
    color: "#6EE7B7",
    fontFamily: "monospace",
    fontSize: 14,
    letterSpacing: 3,
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
