import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export interface RouteErrorFallbackProps {
  error: Error;
  retry: () => void;
}

export function RouteErrorFallback({ error, retry }: RouteErrorFallbackProps) {
  const { colors: tc } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <Text style={[styles.title, { color: tc.danger }]}>[ ERROR DEL SISTEMA ]</Text>
      <Text style={[styles.message, { color: tc.textMuted }]}>{error.message}</Text>
      
      <TouchableOpacity 
        style={[styles.button, { borderColor: tc.primary }]} 
        onPress={retry}
      >
        <Text style={[styles.buttonText, { color: tc.primary }]}>[ REINTENTAR ]</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  message: {
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 1,
  },
});
