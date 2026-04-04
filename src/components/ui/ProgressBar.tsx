import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
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
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.barContainer}>
        {Array.from({ length: segments }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < filledSegments
                ? { backgroundColor: activeColor }
                : { backgroundColor: colors.border },
            ]}
          />
        ))}
      </View>
      {showValue && (
        <Text style={[styles.value, isCritical && styles.valueCritical]}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    color: '#9CA3AF',
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  barContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  segment: {
    flex: 1,
    height: 8,
  },
  value: {
    color: '#6EE7B7',
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'right',
  },
  valueCritical: {
    color: '#EF4444',
  },
});
