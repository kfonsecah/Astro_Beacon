import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface HudHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function HudHeader({ title, subtitle, style }: HudHeaderProps) {
  return (
    <View style={style}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#6EE7B7',
    fontFamily: 'monospace',
    fontSize: 16,
    letterSpacing: 3,
    marginBottom: 4,
  },
  subtitle: {
    color: '#4B5563',
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 2,
  },
});
