import React, { useEffect, useRef } from 'react';
import { View, Text, ViewStyle, Animated } from 'react-native';
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
  const isCritical = percentage <= criticalThreshold;

  const activeColor = isCritical ? colors.danger : colors.primary;

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCritical) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.stopAnimation();
      fadeAnim.setValue(1);
    }
  }, [isCritical, fadeAnim]);

  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label && (
        <Text style={{ color: colors.textSecondary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <Animated.View style={{ flexDirection: 'row', gap: 2, marginBottom: 4, opacity: fadeAnim }}>
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
      </Animated.View>
      {showValue && (
        <Text style={{ color: isCritical ? colors.danger : colors.primary, fontFamily: 'monospace', fontSize: 12, textAlign: 'right' }}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
}
