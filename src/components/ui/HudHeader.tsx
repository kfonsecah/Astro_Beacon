import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface HudHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function HudHeader({ title, subtitle, style }: HudHeaderProps) {
  const theme = useTheme();
  const { colors: tc } = theme;

  return (
    <View style={style}>
      <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 16, letterSpacing: 3, marginBottom: 4 }}>{title}</Text>
      {subtitle && <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 }}>{subtitle}</Text>}
    </View>
  );
}
