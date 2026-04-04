import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  style?: ViewStyle;
}

export function EmptyState({ icon = '📡', title, description, style }: EmptyStateProps) {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={[{ alignItems: 'center', paddingVertical: 48 }, style]}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>{icon}</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: 'monospace', fontSize: 12, letterSpacing: 2, textAlign: 'center' }}>{title}</Text>
      {description && <Text style={{ color: colors.textMuted, fontFamily: 'monospace', fontSize: 10, marginTop: 8, textAlign: 'center' }}>{description}</Text>}
    </View>
  );
}
