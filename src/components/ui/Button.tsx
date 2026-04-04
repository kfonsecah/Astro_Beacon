import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled = false, style, textStyle }: ButtonProps) {
  const theme = useTheme();
  const { colors: tc } = theme;

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: 'transparent', borderColor: tc.primary, borderWidth: 1 },
      text: { color: tc.primary },
    },
    secondary: {
      container: { backgroundColor: tc.surfaceElevated, borderColor: tc.border, borderWidth: 1 },
      text: { color: tc.text },
    },
    danger: {
      container: { backgroundColor: 'transparent', borderColor: tc.danger, borderWidth: 1 },
      text: { color: tc.danger },
    },
  };

  return (
    <TouchableOpacity
      style={[{ paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' }, variantStyles[variant].container, disabled && { opacity: 0.4 }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[{ fontFamily: 'monospace', fontSize: 12, letterSpacing: 3 }, variantStyles[variant].text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}
