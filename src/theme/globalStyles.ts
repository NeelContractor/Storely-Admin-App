// src/theme/globalStyles.ts
//
// ─── GLOBAL STYLESHEET ────────────────────────────────────────────────────────
//
// Every shared style lives here. Screens and components import what they need.
// Never duplicate a style — if you find yourself copy-pasting, add it here.
//
// Structure:
//   layout        — flex containers, screen wrappers, safe-area helpers
//   typography    — text styles (uses tokens from typography.ts)
//   cards         — card / surface containers
//   forms         — input wrappers, labels, errors, buttons
//   lists         — FlatList / section patterns
//   badges        — status chips, tags
//   dividers      — separators
//   headers       — page / section headers
//   banners       — gradient hero banners
//   tabBar        — bottom nav
//   empty         — empty-state illustrations
//   shadows       — elevation helpers (imported from typography.ts shadows)
//   utils         — row, spacer, flex helpers
// ─────────────────────────────────────────────────────────────────────────────

import { StyleSheet, Platform } from 'react-native';
import { colors } from "./../theme/colors"
import { typography, spacing, radii, shadows } from './../theme/typography';

export const globalStyles = StyleSheet.create({

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════

  /** Full-screen root wrapper. Set backgroundColor dynamically via themeColors. */
  screen: {
    flex: 1,
  },

  /** Standard horizontal + vertical page padding. */
  screenPadded: {
    flex:    1,
    padding: spacing[4],
  },

  /** Horizontal padding only (for ScrollViews with vertical margin management). */
  screenPaddedH: {
    flex:              1,
    paddingHorizontal: spacing[4],
  },

  /** Centre content vertically and horizontally (loading states, empty states). */
  centred: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
  },

  /** Scrollable page content with standard padding. */
  scrollContent: {
    padding:       spacing[4],
    paddingBottom: spacing[10],
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Display ────────────────────────────────────────────────────────────────
  h1: {
    fontSize:   typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes['3xl'] * 1.25,
  },
  h2: {
    fontSize:   typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes['2xl'] * 1.3,
  },
  h3: {
    fontSize:   typography.sizes.xl,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.sizes.xl * 1.35,
  },

  // ── Body ───────────────────────────────────────────────────────────────────
  bodyLg: {
    fontSize:   typography.sizes.lg,
    fontWeight: typography.weights.normal,
    lineHeight: typography.sizes.lg * 1.5,
  },
  body: {
    fontSize:   typography.sizes.base,
    fontWeight: typography.weights.normal,
    lineHeight: typography.sizes.base * 1.5,
  },
  bodySm: {
    fontSize:   typography.sizes.sm,
    fontWeight: typography.weights.normal,
    lineHeight: typography.sizes.sm * 1.5,
  },
  caption: {
    fontSize:   typography.sizes.xs,
    fontWeight: typography.weights.normal,
    lineHeight: typography.sizes.xs * 1.4,
  },

  // ── Emphasis ───────────────────────────────────────────────────────────────
  labelMd: {
    fontSize:   typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  labelSm: {
    fontSize:   typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  labelXs: {
    fontSize:   typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },

  // ── Section title (used in cards, lists, dashboards) ──────────────────────
  sectionTitle: {
    fontSize:     typography.sizes.lg,
    fontWeight:   typography.weights.semiBold,
    marginBottom: spacing[3],
  },

  // ── Page title (used in plain screens without AppHeader) ──────────────────
  pageTitle: {
    fontSize:     typography.sizes['2xl'],
    fontWeight:   typography.weights.bold,
    marginBottom: spacing[1],
  },

  pageSubtitle: {
    fontSize:     typography.sizes.base,
    marginBottom: spacing[6],
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // CARDS
  // ═══════════════════════════════════════════════════════════════════════════

  /** White / surface card. Apply themeColors.card as backgroundColor. */
  card: {
    borderRadius: radii['2xl'],
    padding:      spacing[4],
    ...shadows.md,
  },

  cardSm: {
    borderRadius: radii.xl,
    padding:      spacing[3],
    ...shadows.sm,
  },

  cardLg: {
    borderRadius: radii['2xl'],
    padding:      spacing[5],
    ...shadows.lg,
  },

  /** Horizontal row inside a card (icon + content). */
  cardRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // FORMS
  // ═══════════════════════════════════════════════════════════════════════════

  formGroup: {
    marginBottom: spacing[4],
  },

  inputLabel: {
    fontSize:     typography.sizes.sm,
    fontWeight:   typography.weights.medium,
    marginBottom: spacing[1],
  },

  input: {
    borderWidth:   1,
    borderRadius:  radii.lg,
    paddingVertical:   Platform.OS === 'ios' ? spacing[3] : spacing[2],
    paddingHorizontal: spacing[3],
    fontSize:      typography.sizes.base,
  },

  inputError: {
    borderColor: colors.danger,
  },

  errorText: {
    fontSize:  typography.sizes.xs,
    color:     colors.danger,
    marginTop: spacing[1],
  },

  // ── Buttons (base styles — override size / color per variant) ─────────────
  btn: {
    borderRadius:    radii.lg,
    alignItems:      'center',
    justifyContent:  'center',
    flexDirection:   'row',
    gap:             spacing[2],
  },
  btnSm: {
    paddingVertical:   spacing[2],
    paddingHorizontal: spacing[3],
  },
  btnMd: {
    paddingVertical:   spacing[3],
    paddingHorizontal: spacing[4],
  },
  btnLg: {
    paddingVertical:   spacing[4],
    paddingHorizontal: spacing[5],
  },
  btnLabel: {
    fontWeight: typography.weights.semiBold,
    fontSize:   typography.sizes.base,
  },
  btnLabelSm: {
    fontWeight: typography.weights.medium,
    fontSize:   typography.sizes.sm,
  },

  // ── Forgot / text links ───────────────────────────────────────────────────
  textLink: {
    fontSize:   typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color:      colors.primary,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // LISTS & ROWS
  // ═══════════════════════════════════════════════════════════════════════════

  listItem: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: spacing[3],
    gap:             spacing[3],
  },

  listItemBordered: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingVertical:  spacing[3],
    gap:              spacing[3],
    borderBottomWidth: 1,
  },

  listItemContent: {
    flex: 1,
    gap:  2,
  },

  /** Right-side meta block in a list item (value + chevron). */
  listItemMeta: {
    alignItems: 'flex-end',
    gap:        4,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // BADGES / STATUS CHIPS
  // ═══════════════════════════════════════════════════════════════════════════

  badge: {
    paddingVertical:   3,
    paddingHorizontal: spacing[2],
    borderRadius:      radii.full,
    alignSelf:         'flex-start',
  },
  badgeText: {
    fontSize:   typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
  },

  // Colour variants — apply backgroundColor + color manually with themeColors
  badgeSuccess: { backgroundColor: '#D1FAE5' },
  badgeDanger:  { backgroundColor: '#FEE2E2' },
  badgeWarning: { backgroundColor: '#FEF3C7' },
  badgeInfo:    { backgroundColor: '#EEF2FF' },
  badgeNeutral: { backgroundColor: '#F1F5F9' },


  // ═══════════════════════════════════════════════════════════════════════════
  // DIVIDERS
  // ═══════════════════════════════════════════════════════════════════════════

  divider: {
    height:        1,
    marginVertical: spacing[3],
  },
  dividerTight: {
    height:        1,
    marginVertical: spacing[2],
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // HEADERS (AppHeader / section headers)
  // ═══════════════════════════════════════════════════════════════════════════

  appHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[3],
    borderBottomWidth: 1,
    ...shadows.sm,
  },

  appHeaderTitle: {
    flex:       1,
    fontSize:   typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    textAlign:  'center',
  },

  headerAction: {
    width:           36,
    height:          36,
    borderRadius:    radii.full,
    alignItems:      'center',
    justifyContent:  'center',
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // BANNERS (gradient hero sections)
  // ═══════════════════════════════════════════════════════════════════════════

  banner: {
    borderRadius: radii['2xl'],
    padding:      spacing[5],
    marginBottom: spacing[4],
    overflow:     'hidden',
    position:     'relative',
  },

  bannerContent: {
    zIndex: 1,
  },

  bannerTitle: {
    fontSize:   typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color:      colors.white,
    marginTop:  2,
  },

  bannerSubtitle: {
    fontSize:  typography.sizes.sm,
    color:     'rgba(255,255,255,0.7)',
    marginTop: spacing[2],
  },

  bannerGreeting: {
    fontSize:   typography.sizes.base,
    color:      'rgba(255,255,255,0.8)',
    fontWeight: typography.weights.medium,
  },

  // Decorative blurred circles (absolutely positioned inside banner)
  bannerDecorLg: {
    position:     'absolute',
    width:        120,
    height:       120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top:  -30,
    right: -20,
  },
  bannerDecorSm: {
    position:     'absolute',
    width:        80,
    height:       80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    right:   60,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // QUICK ACTIONS GRID
  // ═══════════════════════════════════════════════════════════════════════════

  quickActionsGrid: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    marginTop:       spacing[3],
  },

  quickAction: {
    alignItems: 'center',
    gap:        spacing[2],
  },

  quickActionIcon: {
    width:           52,
    height:          52,
    borderRadius:    radii.xl,
    alignItems:      'center',
    justifyContent:  'center',
  },

  quickActionLabel: {
    fontSize:   typography.sizes.xs,
    fontWeight: typography.weights.medium,
    textAlign:  'center',
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // BOTTOM TAB BAR
  // ═══════════════════════════════════════════════════════════════════════════

  tabBar: {
    height:         72,
    paddingBottom:  0,
    borderTopWidth: 1,
    ...shadows.lg,
  },

  tabItem: {
    alignItems:  'center',
    gap:         4,
    paddingTop:  spacing[2],
  },

  tabIconWrapper: {
    width:           40,
    height:          36,
    alignItems:      'center',
    justifyContent:  'center',
    borderRadius:    radii.lg,
  },

  tabIconActive: {
    backgroundColor: colors.primaryLight,
  },

  tabLabel: {
    fontSize:   typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // EMPTY STATES
  // ═══════════════════════════════════════════════════════════════════════════

  emptyState: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    padding:         spacing[8],
    gap:             spacing[3],
  },

  emptyIcon: {
    width:           80,
    height:          80,
    borderRadius:    40,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing[2],
  },

  emptyTitle: {
    fontSize:   typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    textAlign:  'center',
  },

  emptySubtitle: {
    fontSize:  typography.sizes.base,
    textAlign: 'center',
    lineHeight: typography.sizes.base * 1.5,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH SCREENS (SignIn / CreateStore)
  // ═══════════════════════════════════════════════════════════════════════════

  authTopSection: {
    paddingBottom: spacing[10],
  },

  authLogoArea: {
    alignItems:        'center',
    paddingBottom:     spacing[8],
    paddingHorizontal: spacing[6],
  },

  authLogo: {
    width:  100,
    height: 100,
  },

  authBrandName: {
    fontSize:      typography.sizes['3xl'],
    fontWeight:    typography.weights.bold,
    color:         colors.white,
    letterSpacing: -0.5,
  },

  authTagline: {
    fontSize:  typography.sizes.base,
    color:     colors.sidebarText,
    marginTop: 4,
  },

  authFormContainer: {
    flex:                 1,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    marginTop:            -24,
  },

  authFormContent: {
    padding:       spacing[6],
    paddingBottom: spacing[10],
  },

  authThemeToggle: {
    position: 'absolute',
    right:    spacing[4],
    padding:  spacing[1],
    zIndex:   10,
  },

  authForgotRow: {
    alignSelf:    'flex-end',
    marginBottom: spacing[5],
    marginTop:    -spacing[2],
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // STAT CARDS (Dashboard overview)
  // ═══════════════════════════════════════════════════════════════════════════

  statCard: {
    flex:         1,
    borderRadius: radii['2xl'],
    padding:      spacing[4],
    gap:          spacing[2],
    ...shadows.sm,
  },

  statIconWrapper: {
    width:           40,
    height:          40,
    borderRadius:    radii.lg,
    alignItems:      'center',
    justifyContent:  'center',
  },

  statValue: {
    fontSize:   typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },

  statLabel: {
    fontSize: typography.sizes.sm,
  },

  statChange: {
    fontSize:   typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════════════════════════════

  row: {
    flexDirection: 'row',
    alignItems:    'center',
  },

  rowSpaceBetween: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },

  rowWrap: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[2],
  },

  flex1: { flex: 1 },

  /** Invisible spacer — use with height prop inline: <View style={[g.spacer, { height: 16 }]} /> */
  spacer: {},

  mt1: { marginTop: spacing[1] },
  mt2: { marginTop: spacing[2] },
  mt3: { marginTop: spacing[3] },
  mt4: { marginTop: spacing[4] },
  mt6: { marginTop: spacing[6] },
  mt8: { marginTop: spacing[8] },

  mb1: { marginBottom: spacing[1] },
  mb2: { marginBottom: spacing[2] },
  mb3: { marginBottom: spacing[3] },
  mb4: { marginBottom: spacing[4] },
  mb6: { marginBottom: spacing[6] },
  mb8: { marginBottom: spacing[8] },

  p4:  { padding: spacing[4] },
  ph4: { paddingHorizontal: spacing[4] },
  pv3: { paddingVertical: spacing[3] },
  pv4: { paddingVertical: spacing[4] },
});

// Convenience alias — import as `g` for brevity:
// import { g } from '../../theme/globalStyles';
export const g = globalStyles;