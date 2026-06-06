// src/screens/Stores/StoresScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';
import { LinearGradient }    from 'expo-linear-gradient';
import { useTheme }          from '../../theme/ThemeContext';
import { useAppStore }       from '../../store/useAppStore';
import { deleteStore }       from '../../services/storeService';
import { colors }            from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import type { Store }        from '../../types/types';

// ─── Theme badge colours ──────────────────────────────────────────────────────

const THEME_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  MINIMAL_LIGHT: { bg: '#F8FAFC', text: '#475569', dot: '#94A3B8' },
  MINIMAL_DARK:  { bg: '#1E293B', text: '#94A3B8', dot: '#475569' },
  BOLD_LIGHT:    { bg: '#EEF2FF', text: '#4338CA', dot: '#818CF8' },
  BOLD_DARK:     { bg: '#1E1B4B', text: '#A5B4FC', dot: '#4338CA' },
  CLASSIC:       { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
};

function themeLabel(theme: string): string {
  return theme.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const SOCIAL_ICONS: Record<string, { icon: string; color: string }> = {
  instagram: { icon: 'logo-instagram', color: '#E1306C' },
  whatsapp:  { icon: 'logo-whatsapp',  color: '#25D366' },
  facebook:  { icon: 'logo-facebook',  color: '#1877F2' },
  twitter:   { icon: 'logo-twitter',   color: '#1DA1F2' },
};

// ─── Store Card ───────────────────────────────────────────────────────────────

const StoreCard: React.FC<{
  store:       Store;
  isActive:    boolean;
  onSetActive: (s: Store) => void;
  onEdit:      (s: Store) => void;
  onDelete:    (s: Store) => void;
}> = ({ store, isActive, onSetActive, onEdit, onDelete }) => {
  const { colors: c } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const themeStyle = THEME_COLORS[store.theme] ?? THEME_COLORS.CLASSIC;
  const hasSocials = Object.entries(store.socialLinks ?? {}).some(([, v]) => !!v);

  return (
    <View style={[
      card.wrap,
      { backgroundColor: c.card, borderColor: isActive ? colors.primary : c.border },
      isActive && card.wrapActive,
    ]}>

      {/* ── Banner + Logo ── */}
      <View style={card.bannerWrap}>
        {store.bannerUrl
          ? <Image source={{ uri: store.bannerUrl }} style={card.banner} resizeMode="cover" />
          : <LinearGradient
              colors={[colors.primary + 'CC', colors.primaryDark]}
              style={card.banner}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <View style={card.bannerPattern}>
                {[...Array(6)].map((_, i) => (
                  <View key={i} style={[card.bannerDot, { opacity: 0.08 + i * 0.03 }]} />
                ))}
              </View>
            </LinearGradient>}

        {isActive && (
          <View style={card.activeBadge}>
            <Ionicons name="checkmark-circle" size={13} color={colors.white} />
            <Text style={card.activeBadgeText}>Active</Text>
          </View>
        )}

        <View style={[card.logoWrap, { backgroundColor: c.card, borderColor: c.border }]}>
          {store.logoUrl
            ? <Image source={{ uri: store.logoUrl }} style={card.logo} resizeMode="cover" />
            : <View style={[card.logoFallback, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[card.logoInitial, { color: colors.primary }]}>
                  {store.name.charAt(0).toUpperCase()}
                </Text>
              </View>}
        </View>
      </View>

      {/* ── Info ── */}
      <View style={card.body}>
        <View style={card.nameRow}>
          <View style={{ flex: 1 }}>
            <Text style={[card.name, { color: c.text }]} numberOfLines={1}>{store.name}</Text>
            <Text style={[card.username, { color: c.textSecondary }]}>@{store.username}</Text>
          </View>
          <View style={[card.themeBadge, { backgroundColor: themeStyle.bg }]}>
            <View style={[card.themeDot, { backgroundColor: themeStyle.dot }]} />
            <Text style={[card.themeText, { color: themeStyle.text }]}>
              {themeLabel(store.theme)}
            </Text>
          </View>
        </View>

        {!!store.bio && (
          <Text style={[card.bio, { color: c.textSecondary }]} numberOfLines={expanded ? undefined : 2}>
            {store.bio}
          </Text>
        )}

        <View style={card.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={c.textSecondary} />
          <Text style={[card.metaText, { color: c.textSecondary }]}>
            Created {new Date(store.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </Text>
        </View>

        {expanded && hasSocials && (
          <View style={[card.socialsRow, { borderTopColor: c.border }]}>
            {Object.entries(store.socialLinks ?? {}).map(([key, val]) => {
              if (!val) return null;
              const s = SOCIAL_ICONS[key];
              if (!s) return null;
              return (
                <View key={key} style={[card.socialChip, { backgroundColor: s.color + '12' }]}>
                  <Ionicons name={s.icon as any} size={13} color={s.color} />
                  <Text style={[card.socialText, { color: s.color }]} numberOfLines={1}>{val}</Text>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={card.expandBtn}
          onPress={() => setExpanded(v => !v)}
          activeOpacity={0.6}
        >
          <Text style={[card.expandText, { color: colors.primary }]}>
            {expanded ? 'Show less' : 'Show more'}
          </Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Actions ── */}
      <View style={[card.actions, { borderTopColor: c.border }]}>
        {!isActive && (
          <TouchableOpacity
            style={[card.actionBtn, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}
            onPress={() => onSetActive(store)}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-horizontal-outline" size={15} color={colors.primary} />
            <Text style={[card.actionText, { color: colors.primary }]}>Set Active</Text>
          </TouchableOpacity>
        )}

        {/* ✔ TODO Edit now navigates to StoreProfileScreen with store + startEditing flag */}
        <TouchableOpacity
          style={[card.actionBtn, { backgroundColor: c.background, borderColor: c.border }]}
          onPress={() => onEdit(store)}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil-outline" size={15} color={c.text} />
          <Text style={[card.actionText, { color: c.text }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[card.actionBtn, { backgroundColor: colors.danger + '10', borderColor: colors.danger + '30' }]}
          onPress={() => onDelete(store)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={15} color={colors.danger} />
          <Text style={[card.actionText, { color: colors.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const card = StyleSheet.create({
  wrap: {
    borderRadius: radii['2xl'], borderWidth: 1,
    overflow: 'hidden', marginBottom: spacing[4],
  },
  wrapActive: {
    borderWidth: 1.5,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  bannerWrap: { position: 'relative' },
  banner:     { width: '100%', height: 90 },
  bannerPattern: {
    flex: 1, flexDirection: 'row', flexWrap: 'wrap',
    alignItems: 'center', justifyContent: 'flex-end',
    padding: spacing[3], gap: spacing[3],
  },
  bannerDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff' },
  activeBadge: {
    position: 'absolute', top: spacing[2], right: spacing[2],
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[2] + 2, paddingVertical: 4,
    borderRadius: radii.full,
  },
  activeBadgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  logoWrap: {
    position: 'absolute', bottom: -22, left: spacing[4],
    width: 52, height: 52, borderRadius: radii.xl,
    borderWidth: 2.5, overflow: 'hidden',
  },
  logo:        { width: 52, height: 52 },
  logoFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoInitial: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
  body: { paddingHorizontal: spacing[4], paddingTop: 30, paddingBottom: spacing[3], gap: spacing[2] },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  name:    { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, lineHeight: 22 },
  username: { fontSize: typography.sizes.sm, marginTop: 1 },
  themeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing[2] + 2, paddingVertical: 4,
    borderRadius: radii.full, flexShrink: 0,
  },
  themeDot:  { width: 7, height: 7, borderRadius: 4 },
  themeText: { fontSize: 10, fontWeight: '700' },
  bio:       { fontSize: typography.sizes.sm, lineHeight: 20 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:  { fontSize: typography.sizes.xs },
  socialsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2],
    paddingTop: spacing[3], borderTopWidth: StyleSheet.hairlineWidth,
  },
  socialChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing[2] + 2, paddingVertical: 5,
    borderRadius: radii.full, maxWidth: 150,
  },
  socialText:  { fontSize: typography.sizes.xs, fontWeight: '600', flexShrink: 1 },
  expandBtn:   { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start' },
  expandText:  { fontSize: typography.sizes.xs, fontWeight: typography.weights.semiBold },
  actions: {
    flexDirection: 'row', gap: spacing[2],
    paddingHorizontal: spacing[3], paddingVertical: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing[1], paddingVertical: spacing[2] + 1,
    borderRadius: radii.lg, borderWidth: 1,
  },
  actionText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semiBold },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const StoresScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();

  const { stores, activeStore, setActiveStore, updateStoreInList } = useAppStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSetActive = (store: Store) => setActiveStore(store);

  // ✔ Navigate to StoreProfileScreen pre-selecting this store + open in edit mode
  const handleEdit = (store: Store) => {
    navigation.navigate('StoreProfile', {
      storeId:      store.id,
      startEditing: true,
    });
  };

  const handleDelete = (store: Store) => {
    if (stores.length === 1) {
      Alert.alert('Cannot Delete', 'You must have at least one store.');
      return;
    }
    Alert.alert(
      'Delete Store',
      `Are you sure you want to delete "${store.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setDeletingId(store.id);
            try {
              await deleteStore(store.username);
              updateStoreInList({ ...store, id: '__deleted__' } as any);
              if (activeStore?.id === store.id) {
                const next = stores.find(s => s.id !== store.id);
                if (next) setActiveStore(next);
              }
            } catch (err: any) {
              Alert.alert('Failed', err?.message ?? 'Could not delete store.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing[8] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Summary bar ── */}
        <View style={[styles.summary, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.summaryLeft}>
            <Text style={[styles.summaryCount, { color: colors.primary }]}>{stores.length}</Text>
            <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>
              {stores.length === 1 ? 'Store' : 'Stores'}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
          <View style={styles.summaryMiddle}>
            <Text style={[styles.summaryActive, { color: c.text }]} numberOfLines={1}>
              {activeStore?.name ?? '—'}
            </Text>
            <Text style={[styles.summaryActiveLabel, { color: c.textSecondary }]}>Active store</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateStore')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.addBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* ── Cards ── */}
        {stores.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '12' }]}>
              <Ionicons name="storefront-outline" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text }]}>No stores yet</Text>
            <Text style={[styles.emptyDesc, { color: c.textSecondary }]}>
              Create your first store to start selling
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('CreateStore')}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.white} />
              <Text style={styles.emptyBtnText}>Create Store</Text>
            </TouchableOpacity>
          </View>
        ) : (
          stores.map(store => (
            <View key={store.id} style={{ opacity: deletingId === store.id ? 0.5 : 1 }}>
              {deletingId === store.id && (
                <View style={styles.deletingOverlay}>
                  <ActivityIndicator color={colors.danger} />
                </View>
              )}
              <StoreCard
                store={store}
                isActive={store.id === activeStore?.id}
                onSetActive={handleSetActive}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { padding: spacing[4] },
  summary: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radii.xl, borderWidth: 1,
    padding: spacing[4], marginBottom: spacing[5], gap: spacing[3],
  },
  summaryLeft:        { alignItems: 'center', minWidth: 40 },
  summaryCount:       { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.bold, lineHeight: 36 },
  summaryLabel:       { fontSize: typography.sizes.xs, fontWeight: '600', marginTop: -2 },
  summaryDivider:     { width: 1, height: 36, alignSelf: 'center' },
  summaryMiddle:      { flex: 1 },
  summaryActive:      { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
  summaryActiveLabel: { fontSize: typography.sizes.xs, marginTop: 1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radii.lg,
  },
  addBtnText:      { color: colors.white, fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  deletingOverlay: { position: 'absolute', zIndex: 10, top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  empty:           { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyIcon:       { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle:      { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  emptyDesc:       { fontSize: typography.sizes.base, textAlign: 'center', paddingHorizontal: spacing[8] },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    paddingHorizontal: spacing[5], paddingVertical: spacing[3],
    borderRadius: radii.xl, marginTop: spacing[2],
  },
  emptyBtnText: { color: colors.white, fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
});