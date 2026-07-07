// src/theme/colors.ts
//
// Single source of truth for Storly's brand palette — light + dark.
// Every value here mirrors a `--token` in site-theme.css 1:1.
// ─────────────────────────────────────────────────────────────────

const brand = {
  50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
  400: '#2dd4bf', 500: '#14b8a6', 600: '#10a697', 700: '#0d9488', // PRIMARY
  800: '#0f766e', 900: '#115e59', 950: '#042f2c',
} as const;

const gray = {
  50: '#f9fafb', 100: '#f2f4f7', 200: '#e4e7ec', 300: '#d0d5dd',
  400: '#98a2b3', 500: '#667085', 600: '#475467', 700: '#344054',
  800: '#1d2939', 900: '#101828',
} as const;

const white = '#ffffff';
const offWhite = '#fcfaf8';

// ── Values identical in both themes ──────────────────────────────────────────
const shared = {
  brand, gray, white, black: '#000000', transparent: 'transparent', offWhite,

  brand50: brand[50], brand100: brand[100], brand200: brand[200], brand300: brand[300],
  brand400: brand[400], brand500: brand[500], brand600: brand[600], brand700: brand[700],
  brand800: brand[800], brand900: brand[900], brand950: brand[950],
  primary: brand[700], primaryDark: brand[800], primaryLight: brand[50],

  gray50: gray[50], gray100: gray[100], gray200: gray[200], gray300: gray[300],
  gray400: gray[400], gray500: gray[500], gray600: gray[600], gray700: gray[700],
  gray800: gray[800], gray900: gray[900],

  ctaPink: '#ec4899', ctaOrange: '#f97316',
  ctaGradientStart: '#ec4899', ctaGradientEnd: '#f97316',
  gradientStart: brand[700], gradientEnd: '#12b76a',

  statusActiveDot: '#12b76a', statusLowDot: '#f79009', statusOutDot: '#f04438',
  featuredColor: '#ec4899',

  chart1: brand[700], chart2: brand[400], chart3: '#12b76a', chart4: '#f79009', chart5: '#f04438',

  btnSecondaryBg: gray[800],
  btnOutlineBg: 'transparent',
  inputRadius: 12,
} as const;

// ── Light theme ───────────────────────────────────────────────────────────────
export const lightColors = {
  ...shared,
  mode: 'light' as const,

  pageBg: offWhite, surfacePrimary: white, surfaceSecondary: gray[50],
  surfaceTertiary: brand[50], surfaceElevated: white, surfaceHero: brand[700],
  surfaceNavbar: offWhite, bgCard: white,

  textPrimary: gray[900], textSecondary: gray[600], textMuted: gray[400],
  textInverse: white, textBrand: brand[700], textOnBrand: white,

  border: gray[200], borderSubtle: 'rgba(13, 148, 136, 0.10)',
  borderMedium: 'rgba(13, 148, 136, 0.20)', borderStrong: 'rgba(13, 148, 136, 0.35)',
  borderDefault: gray[200],

  btnPrimaryBg: brand[700], btnPrimaryHover: brand[800], btnPrimaryText: white,
  btnSecondaryHover: gray[900], btnSecondaryText: white,
  btnGhostBg: white, btnGhostHover: gray[50], btnGhostText: gray[700], btnGhostBorder: gray[200],
  btnOutlineHover: brand[50], btnOutlineText: brand[700], btnOutlineBorder: brand[700],
  btnDangerBg: 'rgb(253, 20, 4)', btnDangerText: '#fbfafa', btnDangerHover: 'rgb(255, 17, 0)',

  inputBg: brand[50], inputBorder: 'rgba(13, 148, 136, 0.20)', inputBorderFocus: brand[700],
  inputText: gray[900], inputPlaceholder: gray[400], inputRing: 'rgba(13, 148, 136, 0.12)',

  cardBg: white, cardBorder: 'rgba(13, 148, 136, 0.10)',

  statusActiveBg: 'rgba(18, 183, 106, 0.10)', statusActiveText: '#027a48',
  statusLowBg: 'rgba(247, 144, 9, 0.10)', statusLowText: '#b54708',
  statusOutBg: 'rgba(240, 68, 56, 0.10)', statusOutText: '#b42318',
  statusFeaturedBg: 'rgba(236, 72, 153, 0.10)', statusFeaturedText: '#be185d',
  statusGrowthBg: 'rgba(18, 183, 106, 0.12)', statusGrowthText: '#027a48',

  danger: '#f04438', dangerBg: 'rgba(240, 68, 56, 0.06)', dangerBorder: 'rgba(240, 68, 56, 0.30)',
  dangerText: '#b42318', dangerLight: '#FEE2E2',
  success: '#12b76a', successBg: 'rgba(18, 183, 106, 0.08)', successBorder: 'rgba(18, 183, 106, 0.30)',
  successText: '#027a48', successLight: '#D1FAE5',
  warning: '#f79009', warningBg: 'rgba(247, 144, 9, 0.10)', warningText: '#b54708', warningLight: '#FEF3C7',
  info: '#3B82F6', infoLight: '#DBEAFE',
  featured: '#ec4899', featuredBg: 'rgba(236, 72, 153, 0.08)', featuredText: '#be185d',

  progressTrack: brand[50], overlay: 'rgba(16, 24, 40, 0.70)',

  navbarText: gray[600], navbarTextHover: gray[900], navbarTextActive: brand[700],
  navbarItemHoverBg: 'rgba(13, 148, 136, 0.07)', navbarItemActiveBg: 'rgba(13, 148, 136, 0.10)',
  navbarSectionLabel: gray[400], navbarIcon: gray[500], navbarIconHover: gray[900],
  navbarSearchBg: white, navbarSearchBorder: gray[200], navbarSearchText: gray[900],
  navbarSearchPlaceholder: gray[400], navbarSearchIcon: gray[400],
  navbarKbdBg: gray[100], navbarKbdBorder: gray[200], navbarKbdText: gray[500],
  navbarSubtext: gray[500], navbarSubitemText: gray[500], navbarSubitemHover: gray[800],
  navbarSubitemDot: gray[300],

  sidebar: offWhite, sidebarHover: 'rgba(13, 148, 136, 0.07)', sidebarActive: 'rgba(13, 148, 136, 0.10)',
  sidebarText: gray[600], sidebarTextHover: gray[900], sidebarTextActive: brand[700],
} as const;

// ── Dark theme — only what site-theme.css's `.dark` block overrides ─────────
export const darkColors = {
  ...lightColors,
  mode: 'dark' as const,

  pageBg: '#0b0f1a', surfacePrimary: '#111827', surfaceSecondary: '#1a2236',
  surfaceTertiary: '#1a2236', surfaceElevated: '#111827', surfaceHero: '#115e59',
  surfaceNavbar: '#0b0f1a', bgCard: '#111827',

  textPrimary: '#f2f4f7', textSecondary: '#98a2b3', textMuted: '#667085',
  textInverse: '#101828', textBrand: '#5eead4', textOnBrand: '#ffffff',

  borderSubtle: 'rgba(94, 234, 212, 0.10)', borderMedium: 'rgba(94, 234, 212, 0.18)',
  borderStrong: 'rgba(94, 234, 212, 0.30)', borderDefault: 'rgba(255, 255, 255, 0.10)',

  btnPrimaryBg: brand[700], btnPrimaryHover: brand[600],
  btnGhostBg: '#1a2236', btnGhostHover: '#1a2236', btnGhostText: '#f2f4f7',
  btnGhostBorder: 'rgba(94, 234, 212, 0.18)',
  btnOutlineHover: 'rgba(13, 148, 136, 0.15)', btnOutlineText: brand[300], btnOutlineBorder: brand[300],
  btnDangerBg: 'rgba(240, 68, 56, 0.12)', btnDangerText: '#fda29b', btnDangerHover: 'rgba(240, 68, 56, 0.22)',

  inputBg: '#1a2236', inputBorder: 'rgba(94, 234, 212, 0.18)',
  inputText: '#f2f4f7', inputPlaceholder: '#667085',

  cardBg: '#111827', cardBorder: 'rgba(94, 234, 212, 0.10)',

  statusActiveBg: 'rgba(18, 183, 106, 0.15)', statusActiveText: '#6ce9a6',
  statusLowBg: 'rgba(247, 144, 9, 0.15)', statusLowText: '#fec84b',
  statusOutBg: 'rgba(240, 68, 56, 0.15)', statusOutText: '#fda29b',
  statusGrowthBg: 'rgba(18, 183, 106, 0.18)', statusGrowthText: '#6ce9a6',
  statusFeaturedBg: 'rgba(236, 72, 153, 0.18)', statusFeaturedText: '#f9a8d4',

  dangerBg: 'rgba(240, 68, 56, 0.12)', dangerBorder: 'rgba(240, 68, 56, 0.28)', dangerText: '#fda29b',
  successBg: 'rgba(18, 183, 106, 0.12)', successBorder: 'rgba(18, 183, 106, 0.25)', successText: '#6ce9a6',
  featuredBg: 'rgba(236, 72, 153, 0.16)', featuredText: '#f9a8d4',

  progressTrack: 'rgba(255, 255, 255, 0.08)', overlay: 'rgba(0, 0, 0, 0.75)',

  navbarText: 'rgba(255, 255, 255, 0.55)', navbarTextHover: 'rgba(255, 255, 255, 0.90)',
  navbarTextActive: '#5eead4', navbarItemHoverBg: 'rgba(255, 255, 255, 0.07)',
  navbarItemActiveBg: 'rgba(13, 148, 136, 0.22)', navbarSectionLabel: 'rgba(255, 255, 255, 0.25)',
  navbarIcon: 'rgba(255, 255, 255, 0.55)', navbarIconHover: 'rgba(255, 255, 255, 0.90)',
  navbarSearchBg: 'rgba(255, 255, 255, 0.06)', navbarSearchBorder: 'rgba(255, 255, 255, 0.12)',
  navbarSearchText: '#ffffff', navbarSearchPlaceholder: 'rgba(255, 255, 255, 0.40)',
  navbarSearchIcon: 'rgba(255, 255, 255, 0.40)',
  navbarKbdBg: 'rgba(255, 255, 255, 0.06)', navbarKbdBorder: 'rgba(255, 255, 255, 0.12)',
  navbarKbdText: 'rgba(255, 255, 255, 0.40)', navbarSubtext: 'rgba(255, 255, 255, 0.40)',
  navbarSubitemText: 'rgba(255, 255, 255, 0.45)', navbarSubitemHover: 'rgba(255, 255, 255, 0.85)',
  navbarSubitemDot: 'rgba(255, 255, 255, 0.20)',
} as const;

// export type ThemeMode = 'light' | 'dark';
// export type ThemeColors = Omit<typeof lightColors, 'mode'> & { mode: ThemeMode };

// export function getColors(mode: ThemeMode): ThemeColors {
//   return mode === 'dark' ? darkColors : lightColors;
// }

export type ThemeMode = 'light' | 'dark';

// Recursively widens every string/number literal to its general type,
// so lightColors's specific hex literals don't lock out darkColors's.
type Widen<T> =
  T extends string ? string :
  T extends number ? number :
  T extends readonly (infer U)[] ? Widen<U>[] :
  T extends object ? { -readonly [K in keyof T]: Widen<T[K]> } :
  T;

export type ThemeColors = Omit<Widen<typeof lightColors>, 'mode'> & { mode: ThemeMode };

export function getColors(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

// Back-compat: anything still doing `import { colors } from './colors'`
// keeps working (defaults to light) — but prefer useThemeColors() below
// for anything that should react to dark mode.
export const colors = lightColors;