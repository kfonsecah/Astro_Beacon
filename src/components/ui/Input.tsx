import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.surfaceElevated, borderColor: error ? colors.danger : colors.border, color: colors.text },
          style,
        ]}
        placeholderTextColor={colors.textDisabled}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#6EE7B7',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  error: {
    color: '#EF4444',
    fontFamily: 'monospace',
    fontSize: 9,
    marginTop: 4,
  },
});
