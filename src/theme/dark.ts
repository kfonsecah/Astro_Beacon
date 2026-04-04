import { colors } from '@/constants/colors';

export const darkTheme = {
  isDark: true,
  colors: {
    background: colors.background,
    backgroundElevated: colors.backgroundElevated,
    surface: colors.surface,
    surfaceElevated: colors.surfaceElevated,
    border: colors.border,
    borderFocus: colors.borderFocus,
    text: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    textDisabled: colors.textDisabled,
    primary: colors.primary,
    primaryMuted: colors.primaryMuted,
    primaryBorder: colors.primaryBorder,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    info: colors.info,
    card: colors.surface,
    notification: colors.primary,
  },
};

export type DarkTheme = typeof darkTheme;
