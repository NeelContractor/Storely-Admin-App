// src/theme/ThemeContext.tsx
import { createContext, useContext, useMemo, useState, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getColors, ThemeColors } from './colors';
import { createGlobalStyles, GlobalStyles } from './globalStyles';

type ThemeContextValue = {
  isDark: boolean;
  colors: ThemeColors;
  styles: GlobalStyles;
  toggleTheme: () => void;
  setIsDark: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [override, setOverride] = useState<boolean | null>(null);

  const isDark = override ?? systemScheme === 'dark';

  const colors = useMemo(() => getColors(isDark ? 'dark' : 'light'), [isDark]);
  const styles = useMemo(() => createGlobalStyles(colors), [colors]);

  const toggleTheme = useCallback(() => setOverride((prev) => !(prev ?? isDark)), [isDark]);
  const setIsDark = useCallback((value: boolean) => setOverride(value), []);

  const value = useMemo(
    () => ({ isDark, colors, styles, toggleTheme, setIsDark }),
    [isDark, colors, styles, toggleTheme, setIsDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}