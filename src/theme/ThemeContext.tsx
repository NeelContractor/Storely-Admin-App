// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from './colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    colors: {
        background: string;
        card: string;
        text: string;
        textSecondary: string;
        border: string;
        sidebar: string;
        primary: string;
    };
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

    const isDark = theme === 'dark';

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    const themeColors = {
        background: isDark ? colors.bgDark : colors.bgLight,
        card: isDark ? colors.bgCardDark : colors.bgCard,
        text: isDark ? colors.textDark : colors.textPrimary,
        textSecondary: isDark ? colors.textDarkSecondary : colors.textSecondary,
        border: isDark ? colors.borderDark : colors.border,
        sidebar: colors.sidebar,
        primary: colors.primary,
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors: themeColors }}>
        {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};