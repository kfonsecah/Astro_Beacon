import { darkTheme } from './dark';
import { lightTheme } from './light';

export { darkTheme, lightTheme };

export type Theme = typeof darkTheme | typeof lightTheme;

export const themes = {
  dark: darkTheme,
  light: lightTheme,
};
