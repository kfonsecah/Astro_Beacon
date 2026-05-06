export const lightTheme = {
  isDark: false,
  colors: {
    background: '#F3F4F6',
    backgroundElevated: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceElevated: '#F9FAFB',
    border: '#E5E7EB',
    borderFocus: '#059669',
    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    textDisabled: '#D1D5DB',
    primary: '#059669',
    primaryMuted: 'rgba(5, 150, 105, 0.1)',
    primaryBorder: 'rgba(5, 150, 105, 0.3)',
    success: '#16A34A',
    warning: '#EA580C',
    warningMuted: 'rgba(251, 146, 60, 0.1)',
    warningBorder: 'rgba(251, 146, 60, 0.3)',
    danger: '#DC2626',
    info: '#2563EB',
    card: '#FFFFFF',
    notification: '#059669',
  },
};

export type LightTheme = typeof lightTheme;
