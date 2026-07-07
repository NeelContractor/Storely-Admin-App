// src/theme/globalStyles.ts
import { StyleSheet, Platform } from 'react-native';
import type { ThemeColors } from './colors';
import { typography, spacing, radii, shadows } from './typography';

export function createGlobalStyles(colors: ThemeColors) {
  return StyleSheet.create({
    // ═══ LAYOUT ═══
    screen: { flex: 1 },
    screenPadded: { flex: 1, padding: spacing[4] },
    screenPaddedH: { flex: 1, paddingHorizontal: spacing[4] },
    centred: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: spacing[4], paddingBottom: spacing[10] },

    // ═══ TYPOGRAPHY ═══
    h1: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.bold, lineHeight: typography.sizes['3xl'] * 1.25 },
    h2: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, lineHeight: typography.sizes['2xl'] * 1.3 },
    h3: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semiBold, lineHeight: typography.sizes.xl * 1.35 },
    bodyLg: { fontSize: typography.sizes.lg, fontWeight: typography.weights.normal, lineHeight: typography.sizes.lg * 1.5 },
    body: { fontSize: typography.sizes.base, fontWeight: typography.weights.normal, lineHeight: typography.sizes.base * 1.5 },
    bodySm: { fontSize: typography.sizes.sm, fontWeight: typography.weights.normal, lineHeight: typography.sizes.sm * 1.5 },
    caption: { fontSize: typography.sizes.xs, fontWeight: typography.weights.normal, lineHeight: typography.sizes.xs * 1.4 },
    labelMd: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
    labelSm: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
    labelXs: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
    sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semiBold, marginBottom: spacing[3] },
    pageTitle: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, marginBottom: spacing[1] },
    pageSubtitle: { fontSize: typography.sizes.base, marginBottom: spacing[6] },

    // ═══ CARDS ═══
    card: { borderRadius: radii['2xl'], padding: spacing[4], borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.cardBg, ...shadows.md },
    cardSm: { borderRadius: radii.xl, padding: spacing[3], borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.cardBg, ...shadows.sm },
    cardLg: { borderRadius: radii['2xl'], padding: spacing[5], borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.cardBg, ...shadows.lg },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },

    // ═══ FORMS ═══
    formGroup: { marginBottom: spacing[4] },
    inputLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, marginBottom: spacing[1], color: colors.textPrimary },
    input: {
      borderWidth: 1, borderRadius: colors.inputRadius, borderColor: colors.inputBorder,
      backgroundColor: colors.inputBg,
      paddingVertical: Platform.OS === 'ios' ? spacing[3] : spacing[2],
      paddingHorizontal: spacing[3], fontSize: typography.sizes.base, color: colors.inputText,
    },
    inputFocused: {
      borderColor: colors.inputBorderFocus, shadowColor: colors.inputBorderFocus,
      shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 2,
    },
    inputError: { borderColor: colors.danger },
    errorText: { fontSize: typography.sizes.xs, color: colors.danger, marginTop: spacing[1] },

    // ── Buttons ──
    btn: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing[2] },
    btnSm: { paddingVertical: spacing[2], paddingHorizontal: spacing[3] },
    btnMd: { paddingVertical: spacing[3], paddingHorizontal: spacing[4] },
    btnLg: { paddingVertical: spacing[4], paddingHorizontal: spacing[5] },
    btnLabel: { fontWeight: typography.weights.semiBold, fontSize: typography.sizes.base },
    btnLabelSm: { fontWeight: typography.weights.medium, fontSize: typography.sizes.sm },

    btnPrimary: {
      backgroundColor: colors.btnPrimaryBg, shadowColor: colors.btnPrimaryBg,
      shadowOpacity: 0.30, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    btnPrimaryLabel: { color: colors.btnPrimaryText, fontWeight: typography.weights.semiBold },

    btnGhost: { backgroundColor: colors.btnGhostBg, borderWidth: 1, borderColor: colors.btnGhostBorder },
    btnGhostLabel: { color: colors.btnGhostText, fontWeight: typography.weights.semiBold },

    btnOutline: { backgroundColor: colors.btnOutlineBg, borderWidth: 1, borderColor: colors.btnOutlineBorder },
    btnOutlineLabel: { color: colors.btnOutlineText, fontWeight: typography.weights.semiBold },

    btnDanger: { backgroundColor: colors.btnDangerBg },
    btnDangerLabel: { color: colors.btnDangerText, fontWeight: typography.weights.semiBold },

    btnCta: {
      borderRadius: 9999, paddingVertical: 12, paddingHorizontal: 28,
      shadowColor: colors.ctaPink, shadowOpacity: 0.35, shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 }, elevation: 6,
    },
    btnCtaLabel: { color: colors.white, fontWeight: typography.weights.bold, fontSize: typography.sizes.base },

    textLink: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.primary },

    // ═══ LISTS & ROWS ═══
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], gap: spacing[3] },
    listItemBordered: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], gap: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
    listItemContent: { flex: 1, gap: 2 },
    listItemMeta: { alignItems: 'flex-end', gap: 4 },

    // ═══ BADGES ═══
    badge: { paddingVertical: 3, paddingHorizontal: spacing[2], borderRadius: radii.full, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6 },
    badgeText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
    badgeActive: { backgroundColor: colors.statusActiveBg }, badgeActiveText: { color: colors.statusActiveText },
    badgeWarning: { backgroundColor: colors.statusLowBg }, badgeWarningText: { color: colors.statusLowText },
    badgeDanger: { backgroundColor: colors.statusOutBg }, badgeDangerText: { color: colors.statusOutText },
    badgeBrand: { backgroundColor: colors.brand50 }, badgeBrandText: { color: colors.brand800 },
    badgeFeatured: { backgroundColor: colors.statusFeaturedBg }, badgeFeaturedText: { color: colors.statusFeaturedText },
    badgeNeutral: { backgroundColor: colors.gray100 }, badgeNeutralText: { color: colors.gray600 },

    // ═══ DIVIDERS ═══
    divider: { height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing[3] },
    dividerTight: { height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing[2] },

    // ═══ HEADERS ═══
    appHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, ...shadows.sm },
    appHeaderTitle: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semiBold, textAlign: 'center' },
    headerAction: { width: 36, height: 36, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderMedium },

    // ═══ BANNERS ═══
    banner: { borderRadius: radii['2xl'], padding: spacing[5], marginBottom: spacing[4], overflow: 'hidden', position: 'relative' },
    bannerContent: { zIndex: 1 },
    bannerTitle: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.white, marginTop: 2 },
    bannerSubtitle: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.7)', marginTop: spacing[2] },
    bannerGreeting: { fontSize: typography.sizes.base, color: 'rgba(255,255,255,0.8)', fontWeight: typography.weights.medium },
    bannerDecorLg: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)', top: -30, right: -20 },
    bannerDecorSm: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -20, right: 60 },

    // ═══ QUICK ACTIONS ═══
    quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    quickAction: { width: '25%', alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
    quickActionIcon: { width: 52, height: 52, borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand50 },
    quickActionLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, textAlign: 'center', color: colors.textSecondary },

    // ═══ TAB BAR ═══
    tabBar: { height: 72, paddingBottom: 0, borderTopWidth: 1, borderTopColor: colors.borderSubtle, ...shadows.lg },
    tabItem: { alignItems: 'center', gap: 4, paddingTop: spacing[2] },
    tabIconWrapper: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radii.lg },
    tabIconActive: { backgroundColor: colors.primaryLight },
    tabLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },

    // ═══ EMPTY STATES ═══
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[8], gap: spacing[3] },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2], backgroundColor: colors.brand50 },
    emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semiBold, textAlign: 'center', color: colors.textSecondary },
    emptySubtitle: { fontSize: typography.sizes.base, textAlign: 'center', lineHeight: typography.sizes.base * 1.5, color: colors.textMuted },

    // ═══ AUTH ═══
    authTopSectionSm: { height: 160, justifyContent: 'flex-end' },
    authBackBtn: { position: 'absolute', left: 16, padding: 4 },
    authFooterRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, paddingBottom: 8 },
    authTopSection: { paddingBottom: spacing[10] },
    authLogoArea: { alignItems: 'center', paddingBottom: spacing[8], paddingHorizontal: spacing[6] },
    authLogo: { width: 100, height: 100 },
    authBrandName: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.bold, color: colors.white, letterSpacing: -0.5 },
    authTagline: { fontSize: typography.sizes.base, color: 'rgba(255,255,255,0.50)', marginTop: 4 },
    authFormContainer: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, backgroundColor: colors.bgCard },
    authFormContent: { padding: spacing[6], paddingBottom: spacing[10] },
    authThemeToggle: { position: 'absolute', right: spacing[4], padding: spacing[1], zIndex: 10 },
    authForgotRow: { alignSelf: 'flex-end', marginBottom: spacing[5], marginTop: -spacing[2] },

    // ═══ STAT CARDS ═══
    statCard: { flex: 1, borderRadius: radii['2xl'], padding: spacing[4], gap: spacing[2], borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.cardBg, ...shadows.sm },
    statIconWrapper: { width: 40, height: 40, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand50 },
    statValue: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.textBrand },
    statLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary },
    statChange: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
    statChangePositive: { color: colors.successText },
    statChangeNegative: { color: colors.dangerText },

    // ═══ PROGRESS ═══
    progressTrack: { height: 8, borderRadius: 9999, backgroundColor: colors.progressTrack, overflow: 'hidden' },

    // ═══ FILTER PILLS ═══
    filterPill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.borderMedium, backgroundColor: colors.cardBg },
    filterPillText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semiBold, color: colors.textSecondary },
    filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterPillActiveText: { color: colors.white },

    // ═══ LAYOUT TOGGLE ═══
    layoutToggle: { flexDirection: 'row', alignItems: 'center', gap: 2, padding: 4, borderRadius: 12, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.borderMedium },
    layoutToggleBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    layoutToggleBtnActive: { backgroundColor: colors.cardBg, shadowColor: colors.primary, shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },

    // ═══ UTILITY ═══
    row: { flexDirection: 'row', alignItems: 'center' },
    rowSpaceBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
    flex1: { flex: 1 },
    spacer: {},
    mt1: { marginTop: spacing[1] }, mt2: { marginTop: spacing[2] }, mt3: { marginTop: spacing[3] },
    mt4: { marginTop: spacing[4] }, mt6: { marginTop: spacing[6] }, mt8: { marginTop: spacing[8] },
    mb1: { marginBottom: spacing[1] }, mb2: { marginBottom: spacing[2] }, mb3: { marginBottom: spacing[3] },
    mb4: { marginBottom: spacing[4] }, mb6: { marginBottom: spacing[6] }, mb8: { marginBottom: spacing[8] },
    p4: { padding: spacing[4] }, ph4: { paddingHorizontal: spacing[4] },
    pv3: { paddingVertical: spacing[3] }, pv4: { paddingVertical: spacing[4] },
  });
}

export type GlobalStyles = ReturnType<typeof createGlobalStyles>;