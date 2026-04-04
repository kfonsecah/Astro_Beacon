import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  style?: ViewStyle;
}

export function EmptyState({ icon = '📡', title, description, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    color: '#9CA3AF',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
  },
  description: {
    color: '#6B7280',
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
});
