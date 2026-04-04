import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { colors } from '@/constants/colors';

interface OfflineBannerProps {
  message?: string;
}

export function OfflineBanner({ message = 'SIN CONEXIÓN — Operaciones en cola local' }: OfflineBannerProps) {
  const theme = useTheme();
  const { colors: tc } = theme;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warningMuted, borderWidth: 1, borderColor: colors.warningBorder, padding: 12 }}>
      <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
      <Text style={{ color: tc.warning, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 }}>{message}</Text>
    </View>
  );
}
