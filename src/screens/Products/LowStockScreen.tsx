// src/screens/Inventory/LowStockScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
  Image, Modal, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets }  from 'react-native-safe-area-context';
import { Ionicons }           from '@expo/vector-icons';
import { useTheme }           from '../../theme/ThemeContext';
import { useAppStore }        from '../../store/useAppStore';
import { useProductStore }    from '../../store/useProductStore';
import { updateProduct }      from '../../services/productService';
import { colors }             from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import type { Product, Store } from '../../types/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE       = 50;
const LOW_STOCK_LIMIT = 10;
const CRITICAL_LIMIT  = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

type StockLevel = 'critical' | 'low' | 'out';

function getLevel(p: Product): StockLevel {
  if (!p.inStock || p.stockCount === 0) return 'out';
  if (p.stockCount <= CRITICAL_LIMIT)   return 'critical';
  return 'low';
}

const LEVEL_CONFIG = {
  critical: { label: 'Critical',  color: colors.danger, bg: colors.danger + '15', icon: 'alert-circle'  as const },
  low:      { label: 'Low Stock', color: '#D97706',      bg: '#FEF3C7',            icon: 'warning'       as const },
  out:      { label: 'Out',       color: '#6B7280',      bg: 'rgba(0,0,0,0.06)',   icon: 'close-circle'  as const },
};

// ─── Store Switcher ───────────────────────────────────────────────────────────

const StoreSwitcher: React.FC<{
  stores:      Store[];
  activeStore: Store | null;
  onSelect:    (s: Store) => void;
}> = ({ stores, activeStore, onSelect }) => {
  const { colors: c } = useTheme();
  const [open, setOpen] = useState(false);

  if (stores.length <= 1) {
    return (
      <View style={[sw.pill, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name="storefront-outline" size={14} color={colors.primary} />
        <Text style={[sw.pillText, { color: c.text }]} numberOfLines={1}>
          {activeStore?.name ?? 'No store'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[sw.pill, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="storefront-outline" size={14} color={colors.primary} />
        <Text style={[sw.pillText, { color: c.text }]} numberOfLines={1}>
          {activeStore?.name ?? 'Select store'}
        </Text>
        <Ionicons name="chevron-down" size={13} color={c.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={sw.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[sw.dropdown, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[sw.dropTitle, { color: c.textSecondary }]}>Switch Store</Text>
            <ScrollView bounces={false}>
              {stores.map(store => {
                const isActive = store.id === activeStore?.id;
                return (
                  <TouchableOpacity
                    key={store.id}
                    style={[sw.dropItem, isActive && { backgroundColor: colors.primary + '10' }]}
                    onPress={() => { onSelect(store); setOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <View style={[sw.storeInitial, { backgroundColor: isActive ? colors.primary : c.border }]}>
                      {store.logoUrl
                        ? <Image source={{ uri: store.logoUrl }} style={sw.storeLogo} resizeMode="cover" />
                        : <Text style={[sw.initialText, { color: isActive ? colors.white : c.textSecondary }]}>
                            {store.name.charAt(0).toUpperCase()}
                          </Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[sw.storeName, { color: c.text }]}>{store.name}</Text>
                      <Text style={[sw.storeUser, { color: c.textSecondary }]}>@{store.username}</Text>
                    </View>
                    {isActive && <Ionicons name="checkmark-circle" size={17} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const sw = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    paddingHorizontal: spacing[3], paddingVertical: 9,
    borderRadius: radii.lg, borderWidth: 1.5, maxWidth: 200,
  },
  pillText:    { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, flexShrink: 1 },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  dropdown:    { margin: spacing[4], borderRadius: radii.xl, borderWidth: 1, overflow: 'hidden', maxHeight: 320 },
  dropTitle: {
    fontSize: typography.sizes.xs, fontWeight: typography.weights.semiBold,
    letterSpacing: 0.8, textTransform: 'uppercase',
    paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[2],
  },
  dropItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  storeInitial: { width: 34, height: 34, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  storeLogo:    { width: 34, height: 34 },
  initialText:  { fontSize: typography.sizes.base, fontWeight: typography.weights.bold },
  storeName:    { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  storeUser:    { fontSize: typography.sizes.xs, marginTop: 1 },
});

// ─── Restock Modal ────────────────────────────────────────────────────────────

const RestockModal: React.FC<{
  product:       Product | null;
  storeUsername: string;
  visible:       boolean;
  onClose:       () => void;
  onSuccess:     (updated: Product) => void;
}> = ({ product, storeUsername, visible, onClose, onSuccess }) => {
  const { colors: c } = useTheme();
  const insets        = useSafeAreaInsets();
  const [qty, setQty]       = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (visible) setQty(''); }, [visible]);

  if (!product) return null;

  const currentStock = product.stockCount ?? 0;
  const newTotal     = currentStock + (parseInt(qty, 10) || 0);

  const handleSave = async () => {
    const add = parseInt(qty, 10);
    if (!qty || isNaN(add) || add <= 0) {
      Alert.alert('Invalid qty', 'Enter a positive number of units to add.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name:           product.name,
        description:    product.description    ?? '',
        price:          product.price,
        compareAtPrice: product.compareAtPrice ?? 0,
        currency:       product.currency       ?? 'INR',
        imageUrl:       product.imageUrl       ?? '',
        images:         product.images         ?? [],
        slug:           product.slug,
        stockCount:     currentStock + add,
        inStock:        true,
        isFeatured:     product.isFeatured     ?? false,
        tags:           product.tags           ?? [],
        categoryIds:    product.categoryIds    ?? [],
      };
      const res = await updateProduct(storeUsername, product.slug, body);
      onSuccess(res.data ?? { ...product, stockCount: currentStock + add, inStock: true });
      onClose();
    } catch (err: any) {
      Alert.alert('Failed', err?.message ?? 'Could not update stock.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={rm.overlay}>
        <View style={[rm.sheet, { backgroundColor: c.background, paddingBottom: insets.bottom + spacing[4] }]}>
          <View style={[rm.handle, { backgroundColor: c.border }]} />

          <View style={rm.productRow}>
            <View style={[rm.thumb, { backgroundColor: c.card }]}>
              {product.imageUrl
                ? <Image source={{ uri: product.imageUrl }} style={rm.thumbImg} resizeMode="cover" />
                : <Ionicons name="cube-outline" size={22} color={c.textSecondary} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[rm.productName, { color: c.text }]} numberOfLines={1}>{product.name}</Text>
              <Text style={[rm.productMeta, { color: c.textSecondary }]}>Current stock: {currentStock} units</Text>
            </View>
          </View>

          <View style={[rm.divider, { backgroundColor: c.border }]} />

          <Text style={[rm.label, { color: c.textSecondary }]}>Units to Add</Text>
          <View style={rm.inputRow}>
            <TouchableOpacity
              style={[rm.stepper, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => setQty(v => String(Math.max(0, (parseInt(v, 10) || 0) - 1)))}
            >
              <Ionicons name="remove" size={18} color={c.text} />
            </TouchableOpacity>
            <TextInput
              style={[rm.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              textAlign="center"
            />
            <TouchableOpacity
              style={[rm.stepper, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => setQty(v => String((parseInt(v, 10) || 0) + 1))}
            >
              <Ionicons name="add" size={18} color={c.text} />
            </TouchableOpacity>
          </View>

          {parseInt(qty, 10) > 0 && (
            <View style={[rm.preview, { backgroundColor: colors.success + '12' }]}>
              <Text style={[rm.previewText, { color: colors.success }]}>
                {currentStock} → {newTotal} units after restock
              </Text>
            </View>
          )}

          <View style={rm.presets}>
            {[10, 25, 50, 100].map(n => (
              <TouchableOpacity
                key={n}
                style={[rm.preset, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => setQty(String(n))}
              >
                <Text style={[rm.presetText, { color: c.text }]}>+{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={rm.btns}>
            <TouchableOpacity style={[rm.cancelBtn, { borderColor: c.border }]} onPress={onClose}>
              <Text style={[rm.cancelText, { color: c.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[rm.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <><Ionicons name="add-circle-outline" size={17} color="#fff" /><Text style={rm.saveText}>Restock</Text></>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const rm = StyleSheet.create({
  overlay:     { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:       { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing[5], paddingTop: spacing[3] },
  handle:      { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing[4] },
  productRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] },
  thumb:       { width: 48, height: 48, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg:    { width: 48, height: 48 },
  productName: { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
  productMeta: { fontSize: typography.sizes.sm, marginTop: 2 },
  divider:     { height: StyleSheet.hairlineWidth, marginBottom: spacing[4] },
  label:       { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold, marginBottom: spacing[2] },
  inputRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] },
  stepper:     { width: 44, height: 44, borderRadius: radii.lg, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  input:       { flex: 1, height: 44, borderWidth: 1.5, borderRadius: radii.lg, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  preview:     { borderRadius: radii.lg, padding: spacing[3], marginBottom: spacing[3], alignItems: 'center' },
  previewText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  presets:     { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  preset:      { flex: 1, borderWidth: 1.5, borderRadius: radii.lg, paddingVertical: spacing[2], alignItems: 'center' },
  presetText:  { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  btns:        { flexDirection: 'row', gap: spacing[3] },
  cancelBtn:   { flex: 1, borderWidth: 1.5, borderRadius: radii.xl, paddingVertical: spacing[3], alignItems: 'center' },
  cancelText:  { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
  saveBtn:     { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: spacing[3] },
  saveText:    { color: '#fff', fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
});

// ─── Product Row ──────────────────────────────────────────────────────────────

const LowStockRow: React.FC<{
  product:   Product;
  onRestock: (p: Product) => void;
}> = ({ product, onRestock }) => {
  const { colors: c } = useTheme();
  const level  = getLevel(product);
  const config = LEVEL_CONFIG[level];
  const pct    = product.stockCount > 0
    ? Math.min(100, (product.stockCount / LOW_STOCK_LIMIT) * 100)
    : 0;

  return (
    <View style={[row.card, { backgroundColor: c.card, borderColor: c.border, borderLeftColor: config.color }]}>
      {/* Thumbnail */}
      <View style={[row.thumb, { backgroundColor: c.background }]}>
        {product.imageUrl
          ? <Image source={{ uri: product.imageUrl }} style={row.thumbImg} resizeMode="cover" />
          : <Ionicons name="cube-outline" size={20} color={c.textSecondary} />}
      </View>

      {/* Info — flex: 1 + alignSelf stretch so it fills the row horizontally */}
      <View style={row.info}>
        <Text style={[row.name, { color: c.text }]} numberOfLines={1}>{product.name}</Text>
        <Text style={[row.slug, { color: c.textSecondary }]}>/{product.slug}</Text>

        <View style={[row.barTrack, { backgroundColor: c.border }]}>
          <View style={[row.barFill, { width: `${pct}%` as any, backgroundColor: config.color }]} />
        </View>

        <View style={row.meta}>
          <View style={[row.badge, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon} size={11} color={config.color} />
            <Text style={[row.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={[row.count, { color: config.color }]}>{product.stockCount} left</Text>
        </View>
      </View>

      {/* Restock CTA */}
      <TouchableOpacity
        style={[row.restockBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}
        onPress={() => onRestock(product)}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
        <Text style={[row.restockText, { color: colors.primary }]}>Restock</Text>
      </TouchableOpacity>
    </View>
  );
};

const row = StyleSheet.create({
  card: {
    flexDirection:  'row',
    alignItems:     'flex-start',   // ← was 'center'; items anchor to top, not mid-screen
    gap:            spacing[3],
    padding:        spacing[3],
    marginHorizontal: spacing[4],
    marginBottom:   spacing[2],
    borderRadius:   radii.xl,
    borderWidth:    1,
    borderLeftWidth: 3,
  },
  thumb: {
    width: 48, height: 48,
    borderRadius: radii.lg,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, overflow: 'hidden',
    marginTop: 2,                   // slight optical alignment with first text line
  },
  thumbImg:  { width: 48, height: 48 },
  info: {
    flex:      1,                   // fills remaining horizontal space
    alignSelf: 'stretch',           // ← stretches to card height so bar/meta align properly
    gap:       3,
  },
  name:     { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold, lineHeight: 18 },
  slug:     { fontSize: 10, opacity: 0.6 },
  barTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginVertical: 3 },
  barFill:  { height: 4, borderRadius: 2 },
  meta:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99,
  },
  badgeText:   { fontSize: 10, fontWeight: '700' },
  count:       { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  restockBtn: {
    flexDirection:  'column',
    alignItems:     'center',
    gap:            3,
    paddingHorizontal: spacing[2],
    paddingVertical:   spacing[2],
    borderRadius:   radii.lg,
    borderWidth:    1,
    flexShrink:     0,
    marginTop:      2,              // align with thumb top
  },
  restockText: { fontSize: 10, fontWeight: '700' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'critical' | 'low' | 'out';

export const LowStockScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();

  const { stores, activeStore, setActiveStore } = useAppStore();
  const { fetchPage, invalidate }               = useProductStore();

  const [selectedStore, setSelectedStore] = useState<Store | null>(activeStore);
  const storeUsername = selectedStore?.username ?? '';

  const [allProducts,  setAllProducts]  = useState<Product[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError,   setFetchError]   = useState<string | null>(null);
  const [search,       setSearch]       = useState('');
  const [activeTab,    setActiveTab]    = useState<FilterTab>('all');
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);

  const load = useCallback(async (force = false) => {
    if (!storeUsername) return;
    setIsLoading(true);
    setFetchError(null);
    const result = await fetchPage({ username: storeUsername, page: 1, pageSize: PAGE_SIZE }, force);
    if (result) setAllProducts(result.products);
    else        setFetchError('Failed to load products.');
    setIsLoading(false);
  }, [storeUsername, fetchPage]);

  useEffect(() => {
    setAllProducts([]);
    setSearch('');
    setActiveTab('all');
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeUsername]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await load(true);
    setIsRefreshing(false);
  }, [load]);

  const handleStoreSelect = useCallback((store: Store) => {
    setSelectedStore(store);
    setActiveStore(store);
  }, [setActiveStore]);

  const lowStockProducts = useMemo(() =>
    allProducts.filter(p => !p.inStock || p.stockCount <= LOW_STOCK_LIMIT),
    [allProducts]
  );

  const criticalCount = lowStockProducts.filter(p => getLevel(p) === 'critical').length;
  const lowCount      = lowStockProducts.filter(p => getLevel(p) === 'low').length;
  const outCount      = lowStockProducts.filter(p => getLevel(p) === 'out').length;

  const filtered = useMemo(() => {
    let list = lowStockProducts;
    if (activeTab === 'critical') list = list.filter(p => getLevel(p) === 'critical');
    else if (activeTab === 'low') list = list.filter(p => getLevel(p) === 'low');
    else if (activeTab === 'out') list = list.filter(p => getLevel(p) === 'out');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const lvl = { critical: 0, out: 1, low: 2 };
      const diff = lvl[getLevel(a)] - lvl[getLevel(b)];
      return diff !== 0 ? diff : (a.stockCount ?? 0) - (b.stockCount ?? 0);
    });
  }, [lowStockProducts, activeTab, search]);

  const handleRestockSuccess = useCallback((updated: Product) => {
    setAllProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    invalidate(storeUsername);
  }, [storeUsername, invalidate]);

  if (!stores.length) {
    return (
      <View style={[styles.centered, { backgroundColor: c.background }]}>
        <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: c.textSecondary, marginTop: spacing[3] }]}>No stores found</Text>
      </View>
    );
  }

  const TABS: { key: FilterTab; label: string; count: number; color: string }[] = [
    { key: 'all',      label: 'All',      count: lowStockProducts.length, color: c.text },
    { key: 'critical', label: 'Critical', count: criticalCount,           color: colors.danger },
    { key: 'low',      label: 'Low',      count: lowCount,                color: '#D97706' },
    { key: 'out',      label: 'Out',      count: outCount,                color: '#6B7280' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* ── Store switcher + search ── */}
      <View style={styles.topBar}>
        <StoreSwitcher stores={stores} activeStore={selectedStore} onSelect={handleStoreSelect} />
        <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="search-outline" size={15} color={c.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search…"
            placeholderTextColor={colors.textMuted}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={15} color={c.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Summary stats ── */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total Low', value: lowStockProducts.length, color: colors.primary },
          { label: 'Critical',  value: criticalCount,           color: colors.danger  },
          { label: 'Low Stock', value: lowCount,                color: '#D97706'       },
          { label: 'Out',       value: outCount,                color: '#6B7280'       },
        ].map(stat => (
          <View key={stat.label} style={[styles.statCard]}>
            {isLoading
              ? <View style={[styles.statSkel, { backgroundColor: c.border }]} />
              : <Text style={[styles.statVal, { color: stat.color }]}>{stat.value}</Text>}
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Filter tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                active
                  ? { backgroundColor: tab.color + '15', borderColor: tab.color + '50' }
                  : { backgroundColor: c.card, borderColor: c.border },
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, { color: active ? tab.color : c.textSecondary }]}>
                {tab.label}
              </Text>
              <View style={[styles.tabBadge, { backgroundColor: active ? tab.color : c.border }]}>
                <Text style={[styles.tabBadgeText, { color: active ? '#fff' : c.textSecondary }]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Error ── */}
      {fetchError && !isLoading && (
        <TouchableOpacity
          style={[styles.errorBanner, { backgroundColor: colors.danger + '12', borderColor: colors.danger + '30' }]}
          onPress={() => load(true)}
        >
          <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{fetchError} — Tap to retry</Text>
        </TouchableOpacity>
      )}

      {/* ── Loading spinner ── */}
      {isLoading && !isRefreshing && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {/* ── List ── */}
      {!isLoading && (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          style={styles.flatList}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing[6] },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <LowStockRow product={item} onRestock={setRestockTarget} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="checkmark-circle-outline" size={36} color={colors.success} />
              </View>
              <Text style={[styles.emptyTitle, { color: c.text }]}>
                {search ? 'No matches' : 'All stocked up!'}
              </Text>
              <Text style={[styles.emptyDesc, { color: c.textSecondary }]}>
                {search ? 'Try a different search term' : 'No products are running low on stock'}
              </Text>
            </View>
          }
        />
      )}

      <RestockModal
        product={restockTarget}
        storeUsername={storeUsername}
        visible={!!restockTarget}
        onClose={() => setRestockTarget(null)}
        onSuccess={handleRestockSuccess}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1 },

  // Only used for the no-stores guard screen — NOT reused in list
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },

  // Separate spinner wrapper so it doesn't imply flex centering on the list
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[2],
  },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    borderWidth: 1.5, borderRadius: radii.lg,
    paddingHorizontal: spacing[3], paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: typography.sizes.sm, padding: 0 },

  statsRow: {
    flexDirection: 'row', gap: spacing[2],
    paddingHorizontal: spacing[4], paddingBottom: spacing[2],
  },
  statCard: {
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: spacing[2] + 2,
    gap: 2,
  },
  statVal:   { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  statLabel: { fontSize: 10, fontWeight: '600' },
  statSkel:  { width: 22, height: 16, borderRadius: 4 },

  tabsScroll: { flexGrow: 0, flexShrink: 0 },   // ← prevents vertical expansion
  tabs: {
    paddingHorizontal: spacing[4],
    gap:               spacing[2],
    paddingBottom:     spacing[2],
    alignItems:        'flex-start',
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: radii.lg, borderWidth: 1.5,
  },
  tabText:      { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  tabBadge:     { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeText: { fontSize: 10, fontWeight: '800' },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    borderWidth: 1, borderRadius: radii.lg, padding: spacing[3],
    marginHorizontal: spacing[4], marginBottom: spacing[2],
  },
  errorText: { fontSize: typography.sizes.sm, flex: 1 },

  flatList:    { flex: 1 },
  listContent: { paddingTop: spacing[2] },

  empty:         { alignItems: 'center', gap: spacing[3], paddingTop: spacing[16], paddingBottom: spacing[8] },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  emptyTitle:    { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  emptyDesc:     { fontSize: typography.sizes.sm, textAlign: 'center', paddingHorizontal: spacing[6] },
});