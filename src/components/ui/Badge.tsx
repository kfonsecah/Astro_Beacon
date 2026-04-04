import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: 'rgba(107, 114, 128, 0.2)', text: '#9CA3AF' },
  success: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22C55E' },
  warning: { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' },
  danger: { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444' },
  info: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3B82F6' },
};

export function Badge({ label, variant = 'default', color, style, textStyle }: BadgeProps) {
  const resolvedColor = color ? { bg: color + '33', text: color } : variantColors[variant];

  return (
    <View style={[styles.container, { backgroundColor: resolvedColor.bg }, style]}>
      <Text style={[styles.text, { color: resolvedColor.text }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 1,
  },
});
