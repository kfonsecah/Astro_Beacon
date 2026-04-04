import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: boolean;
}

export function Card({ children, style, accent = false }: CardProps) {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: accent ? colors.primaryBorder : colors.border,
          borderWidth: 1,
          padding: 14,
        },
        accent && { borderLeftWidth: 3 },
        style,
      ]}
    >
      {children}
    </View>
  );
}
