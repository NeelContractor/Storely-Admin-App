// src/theme/colors.ts
export const colors = {
    // Primary brand colors
    primary: '#3C50E0',
    primaryDark: '#1C3FB7',
    primaryLight: '#EEF2FF',
  
    // Dark sidebar background (matches admin)
    sidebar: '#1C2434',
    sidebarHover: '#334155',
    sidebarText: '#8A99AF',
    sidebarTextActive: '#FFFFFF',
  
    // Background
    bgLight: '#F1F5F9',
    bgDark: '#1A222C',
    bgCard: '#FFFFFF',
    bgCardDark: '#24303F',
  
    // Text
    textPrimary: '#1C2434',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textDark: '#DEE4EE',
    textDarkSecondary: '#8A99AF',
  
    // Borders
    border: '#E2E8F0',
    borderDark: '#2E3A47',
  
    // Status colors
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  
    // Chart colors
    chart1: '#3C50E0',
    chart2: '#80CAEE',
    chart3: '#10B981',
    chart4: '#F59E0B',
    chart5: '#EF4444',
  
    // Misc
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  
    // Meta card gradient
    gradientStart: '#3C50E0',
    gradientEnd: '#80CAEE',
};
  
export type Colors = typeof colors;