import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
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
  const { colors } = theme;

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: {
        backgroundColor: 'transparent',
        borderColor: colors.primary,
        borderWidth: 1,
      },
      text: { color: colors.primary },
    },
    secondary: {
      container: {
        backgroundColor: colors.surfaceElevated,
        borderColor: colors.border,
        borderWidth: 1,
      },
      text: { color: colors.text },
    },
    danger: {
      container: {
        backgroundColor: 'transparent',
        borderColor: colors.danger,
        borderWidth: 1,
      },
      text: { color: colors.danger },
    },
  };

  return (
    <TouchableOpacity
      style={[styles.container, variantStyles[variant].container, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, variantStyles[variant].text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  text: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 3,
  },
  disabled: {
    opacity: 0.4,
  },
});
