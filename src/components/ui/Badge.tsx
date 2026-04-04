import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ label, variant = 'default', color, style, textStyle }: BadgeProps) {
  const theme = useTheme();
  const { colors: tc } = theme;

  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    default: { bg: tc.textMuted + '33', text: tc.textMuted },
    success: { bg: tc.success + '33', text: tc.success },
    warning: { bg: tc.warning + '33', text: tc.warning },
    danger: { bg: tc.danger + '33', text: tc.danger },
    info: { bg: tc.info + '33', text: tc.info },
  };

  const resolvedColor = color ? { bg: color + '33', text: color } : variantColors[variant];

  return (
    <View style={[{ paddingHorizontal: 8, paddingVertical: 2 }, { backgroundColor: resolvedColor.bg }, style]}>
      <Text style={[{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 1, color: resolvedColor.text }, textStyle]}>{label}</Text>
    </View>
  );
}
