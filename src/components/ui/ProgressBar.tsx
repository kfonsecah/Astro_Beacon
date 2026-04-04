import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface ProgressBarProps {
  value: number;
  max: number;
  segments?: number;
  label?: string;
  showValue?: boolean;
  criticalThreshold?: number;
  style?: ViewStyle;
}

export function ProgressBar({ value, max, segments = 10, label, showValue = true, criticalThreshold = 15, style }: ProgressBarProps) {
  const theme = useTheme();
  const { colors } = theme;

  const percentage = (value / max) * 100;
  const filledSegments = Math.round((percentage / 100) * segments);
  const isCritical = percentage < criticalThreshold;

  const activeColor = isCritical ? colors.danger : colors.primary;

  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label && (
        <Text style={{ color: colors.textSecondary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <View style={{ flexDirection: 'row', gap: 2, marginBottom: 4 }}>
        {Array.from({ length: segments }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 8,
              backgroundColor: i < filledSegments ? activeColor : colors.border,
            }}
          />
        ))}
      </View>
      {showValue && (
        <Text style={{ color: isCritical ? colors.danger : colors.primary, fontFamily: 'monospace', fontSize: 12, textAlign: 'right' }}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
}
