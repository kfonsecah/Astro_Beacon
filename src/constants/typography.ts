export const typography = {
  // Font families
  fontFamily: {
    mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    display: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Font sizes
  fontSize: {
    xs: 8,
    sm: 9,
    md: 10,
    base: 11,
    lg: 12,
    xl: 14,
    '2xl': 16,
    '3xl': 18,
    '4xl': 28,
  },

  // Letter spacing
  letterSpacing: {
    tight: 1,
    normal: 2,
    wide: 3,
    wider: 4,
    widest: 6,
  },

  // Line heights
  lineHeight: {
    tight: 16,
    normal: 18,
    relaxed: 22,
  },

  // Font weights
  fontWeight: {
    normal: '400' as const,
    bold: '700' as const,
  },
};

import { Platform } from 'react-native';
