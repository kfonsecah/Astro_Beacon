import React from 'react';
import { TextInput, Text, View, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  const theme = useTheme();
  const { colors: tc } = theme;

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>{label}</Text>}
      <TextInput
        style={[
          { borderWidth: 1, borderRadius: 0, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'monospace', fontSize: 14, backgroundColor: tc.surfaceElevated, borderColor: error ? tc.danger : tc.border, color: tc.text },
          style,
        ]}
        placeholderTextColor={tc.textDisabled}
        {...props}
      />
      {error && <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 9, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}
