// src/screens/Products/AllProductsScreen.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView,
  Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useProductStore } from '../../store/useProductStore';
import type { Product, Store } from '../../types/types';

const PAGE_SIZE   = 10;
const SCREEN_W    = Dimensions.get('window').width;
const H_PADDING   = spacing[4] * 2;
const GRID_GAP    = spacing[3];
const GRID_IMG_W  = (SCREEN_W - H_PADDING - GRID_GAP) / 2 - spacing[3] * 2;

function getStatus(p: Product): 'active' | 'low' | 'out' {
  if (!p.inStock || p.stockCount === 0) return 'out';
  if (p.stockCount <= 10) return 'low';
  return 'active';
}

const STATUS_LABEL   = { active: 'Active', low: 'Low Stock', out: 'Out of Stock' } as const;
const STATUS_VARIANT = { active: 'success', low: 'warning',  out: 'danger'       } as const;

// ─── Store Switcher ───────────────────────────────────────────────────────────

interface StoreSwitcherProps {
  stores:      Store[];
  activeStore: Store | null;
  onSelect:    (store: Store) => void;
}

const StoreSwitcher: React.FC<StoreSwitcherProps> = ({ stores, activeStore, onSelect }) => {
  const { colors: themeColors } = useTheme();
  const [open, setOpen] = useState(false);

  if (stores.length <= 1) {
    return (
      <View style={[styles.storePill, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <Ionicons name="storefront-outline" size={15} color={colors.primary} />
        <Text style={[styles.storePillText, { color: themeColors.text }]} numberOfLines={1}>
          {activeStore?.name ?? 'No store'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.storePill, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="storefront-outline" size={15} color={colors.primary} />
        <Text style={[styles.storePillText, { color: themeColors.text }]} numberOfLines={1}>
          {activeStore?.name ?? 'Select store'}
        </Text>
        <Ionicons name="chevron-down" size={14} color={themeColors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.dropdown, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.dropdownTitle, { color: themeColors.textSecondary }]}>
              Switch Store
            </Text>
            <ScrollView bounces={false}>
              {stores.map((store) => {
                const isActive = store.id === activeStore?.id;
                return (
                  <TouchableOpacity
                    key={store.id}
                    style={[
                      styles.dropdownItem,
                      isActive && { backgroundColor: colors.primary + '12' },
                    ]}
                    onPress={() => { onSelect(store); setOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownItemLeft}>
                      <View style={[
                        styles.storeInitial,
                        { backgroundColor: isActive ? colors.primary : themeColors.border },
                      ]}>
                        {store.logoUrl ? (
                          <Image
                            source={{ uri: store.logoUrl }}
                            style={styles.storeLogoImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={[styles.storeInitialText, { color: isActive ? colors.white : themeColors.textSecondary }]}>
                            {store.name.charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View>
                        <Text style={[styles.dropdownStoreName, { color: themeColors.text }]}>
                          {store.name}
                        </Text>
                        <Text style={[styles.dropdownStoreUsername, { color: themeColors.textSecondary }]}>
                          @{store.username}
                        </Text>
                      </View>
                    </View>
                    {isActive && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    )}
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

// ─── Product Image Carousel ───────────────────────────────────────────────────

interface CarouselProps {
  imageUrl: string;
  images:   string[];
  size:     number;
}

const ProductImageCarousel: React.FC<CarouselProps> = ({ imageUrl, images, size }) => {
  const allImages = [imageUrl, ...(images ?? [])].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <View style={[styles.imagePlaceholder, { width: size, height: size, backgroundColor: colors.primaryLight }]}>
        <Ionicons name="cube-outline" size={size * 0.4} color={colors.primary} />
      </View>
    );
  }

  if (allImages.length === 1) {
    return (
      <Image
        source={{ uri: allImages[0] }}
        style={[styles.imagePlaceholder, { width: size, height: size }]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={{ width: size, height: size }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / size))
        }
        style={{ width: size, height: size, borderRadius: radii.lg }}
      >
        {allImages.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={{ width: size, height: size, borderRadius: radii.lg }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <View style={styles.dotRow}>
        {allImages.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === activeIndex ? colors.white : 'rgba(255,255,255,0.5)' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard: React.FC<{ product: Product; layout: 'list' | 'grid' }> = ({ product, layout }) => {
  const { colors: themeColors } = useTheme();
  const status = getStatus(product);

  if (layout === 'grid') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.gridCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
      >
        <ProductImageCarousel
          imageUrl={product.imageUrl}
          images={product.images}
          size={GRID_IMG_W}
        />
        <View style={styles.gridInfo}>
          <Text style={[styles.gridName, { color: themeColors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={[styles.gridPrice, { color: colors.primary }]}>
            ₹{product.price.toLocaleString()}
          </Text>
          <View style={styles.gridFooter}>
            <Badge label={STATUS_LABEL[status]} variant={STATUS_VARIANT[status]} size="sm" />
            {product.isFeatured && (
              <Ionicons name="star" size={12} color="#B45309" />
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.gridMoreBtn}>
          <Ionicons name="ellipsis-vertical" size={16} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // ── List layout ──
  return (
    <TouchableOpacity activeOpacity={0.7}>
      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <ProductImageCarousel
          imageUrl={product.imageUrl}
          images={product.images}
          size={60}
        />
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: themeColors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={[styles.slug, { color: themeColors.textSecondary }]}>
            /{product.slug}
          </Text>
          <View style={styles.productMeta}>
            <Text style={[styles.price, { color: colors.primary }]}>
              ₹{product.price.toLocaleString()}
            </Text>
            <Badge label={STATUS_LABEL[status]} variant={STATUS_VARIANT[status]} size="sm" />
          </View>
          <View style={styles.productStats}>
            <View style={styles.stat}>
              <Ionicons name="layers-outline" size={12} color={themeColors.textSecondary} />
              <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
                {product.stockCount} in stock
              </Text>
            </View>
            {product.isFeatured && (
              <View style={styles.stat}>
                <Ionicons name="star-outline" size={12} color="#B45309" />
                <Text style={[styles.statText, { color: '#B45309' }]}>Featured</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={18} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const AllProductsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const { stores, activeStore, setActiveStore } = useAppStore();
  const { fetchPage, errors: cacheErrors }      = useProductStore();

  const [selectedStore, setSelectedStore] = useState<Store | null>(activeStore);
  const storeUsername = selectedStore?.username ?? '';

  const [products, setProducts]         = useState<Product[]>([]);
  const [total, setTotal]               = useState(0);
  const [hasMore, setHasMore]           = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [isLoading, setIsLoading]       = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [layout, setLayout]             = useState<'list' | 'grid'>('list');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadPage = useCallback(async (page: number, force = false) => {
    if (!storeUsername) return;
    setIsLoading(true);
    setFetchError(null);

    const result = await fetchPage(
      { username: storeUsername, page, pageSize: PAGE_SIZE },
      force,
    );

    if (result) {
      setProducts(result.products);
      setTotal(result.total);
      setHasMore(result.hasMore);
    } else {
      const key = `${storeUsername}::${page}::${PAGE_SIZE}::`;
      setFetchError(cacheErrors[key] ?? 'Failed to load products.');
    }
    setIsLoading(false);
  }, [storeUsername, fetchPage, cacheErrors]);

  // Reset + fetch page 1 on store change
  useEffect(() => {
    setProducts([]);
    setTotal(0);
    setHasMore(false);
    setSearch('');
    setCurrentPage(1);
    setFetchError(null);
    loadPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeUsername]);

  // Fetch on page change (skip first render — handled above)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    loadPage(currentPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPage(currentPage, true);
    setIsRefreshing(false);
  }, [currentPage, loadPage]);

  const handleStoreSelect = useCallback((store: Store) => {
    setSelectedStore(store);
    setActiveStore(store);
  }, [setActiveStore]);

  // ── Client-side search ─────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    products.filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    }),
    [products, search],
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── No stores ──────────────────────────────────────────────────────────────
  if (!stores.length) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No store found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>

      {/* ── Search + Add ── */}
      <View style={styles.topRow}>
        <View style={[styles.searchBar, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search products..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── Store Switcher + Layout Toggle ── */}
      <View style={styles.storeSwitcherRow}>
        <StoreSwitcher
          stores={stores}
          activeStore={selectedStore}
          onSelect={handleStoreSelect}
        />
        <TouchableOpacity
          style={[styles.layoutToggleBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          onPress={() => setLayout(l => l === 'list' ? 'grid' : 'list')}
        >
          <Ionicons
            name={layout === 'list' ? 'grid-outline' : 'list-outline'}
            size={18}
            color={themeColors.text}
          />
        </TouchableOpacity>
      </View>

      {/* ── Stats ── */}
      <View style={[styles.statsRow, { borderBottomColor: themeColors.border }]}>
        {[
          { label: 'Total',     value: total },
          { label: 'Active',    value: products.filter(p => getStatus(p) === 'active').length },
          { label: 'Low Stock', value: products.filter(p => getStatus(p) === 'low').length },
          { label: 'Out',       value: products.filter(p => getStatus(p) === 'out').length },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>
              {isLoading ? '—' : s.value}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Error banner ── */}
      {fetchError && !isLoading && (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => loadPage(currentPage, true)}
        >
          <Ionicons name="warning-outline" size={16} color={colors.danger} />
          <Text style={styles.errorText}>{fetchError} — Tap to retry</Text>
        </TouchableOpacity>
      )}

      {/* ── Loading ── */}
      {isLoading && !isRefreshing && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {/* ── List / Grid ── */}
      {!isLoading && (
        <FlatList
          key={layout}   // forces remount when numColumns changes
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={layout === 'grid' ? 2 : 1}
          columnWrapperStyle={layout === 'grid' ? { gap: GRID_GAP } : undefined}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing[6] },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => <ProductCard product={item} layout={layout} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                {search ? 'No products match your search' : 'No products yet'}
              </Text>
            </View>
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                  onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={currentPage === 1 ? colors.textMuted : themeColors.text}
                  />
                </TouchableOpacity>
                <Text style={[styles.pageInfo, { color: themeColors.textSecondary }]}>
                  {currentPage} / {totalPages}
                </Text>
                <TouchableOpacity
                  style={[styles.pageBtn, !hasMore && styles.pageBtnDisabled]}
                  onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={!hasMore}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={!hasMore ? colors.textMuted : themeColors.text}
                  />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },

  // ── Top row (search + add) ──
  topRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[2],
    paddingHorizontal: spacing[4],
    paddingTop:        spacing[3],
    paddingBottom:     spacing[2],
  },
  searchBar: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    padding:       spacing[3],
    borderRadius:  radii.lg,
    borderWidth:   1.5,
    gap:           spacing[2],
  },
  searchInput: { flex: 1, fontSize: typography.sizes.sm },
  addBtn: {
    backgroundColor: colors.primary,
    width:           44,
    height:          44,
    borderRadius:    radii.lg,
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── Store switcher row ──
  storeSwitcherRow: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom:     spacing[2],
  },
  storePill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical:   9,
    borderRadius:      radii.lg,
    borderWidth:       1.5,
    maxWidth:          200,
  },
  storePillText: {
    fontSize:   typography.sizes.sm,
    fontWeight: typography.weights.medium,
    flexShrink: 1,
  },
  layoutToggleBtn: {
    width:          36,
    height:         36,
    borderRadius:   radii.lg,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
  },

  // ── Store logo ──
  storeLogoImage: {
    width:        36,
    height:       36,
    borderRadius: radii.lg,
  },

  // ── Dropdown modal ──
  modalOverlay: {
    flex:              1,
    backgroundColor:   'rgba(0,0,0,0.35)',
    justifyContent:    'flex-start',
    paddingTop:        120,
    paddingHorizontal: spacing[4],
  },
  dropdown: {
    borderRadius: radii.xl,
    borderWidth:  1,
    overflow:     'hidden',
    maxHeight:    320,
  },
  dropdownTitle: {
    fontSize:          typography.sizes.xs,
    fontWeight:        typography.weights.semiBold,
    letterSpacing:     0.8,
    textTransform:     'uppercase',
    paddingHorizontal: spacing[4],
    paddingTop:        spacing[4],
    paddingBottom:     spacing[2],
  },
  dropdownItem: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[3],
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
  },
  storeInitial: {
    width:          36,
    height:         36,
    borderRadius:   radii.lg,
    alignItems:     'center',
    justifyContent: 'center',
  },
  storeInitialText: {
    fontSize:   typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  dropdownStoreName: {
    fontSize:   typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  dropdownStoreUsername: {
    fontSize:  typography.sizes.xs,
    marginTop: 1,
  },

  // ── Stats row ──
  statsRow: {
    flexDirection:     'row',
    paddingHorizontal: spacing[4],
    paddingTop:        spacing[2],
    paddingBottom:     spacing[3],
    borderBottomWidth: 1,
    gap:               spacing[2],
  },
  statCard: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: spacing[2],
  },
  statValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  statLabel: { fontSize: typography.sizes.xs, marginTop: 2 },

  // ── Error ──
  errorBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing[2],
    margin:          spacing[4],
    padding:         spacing[3],
    backgroundColor: '#FEE2E2',
    borderRadius:    radii.lg,
  },
  errorText: { fontSize: typography.sizes.sm, color: colors.danger, flex: 1 },

  // ── List ──
  list: { paddingHorizontal: spacing[4], paddingTop: spacing[3] },

  // ── List card ──
  card: {
    flexDirection: 'row',
    padding:       spacing[4],
    borderRadius:  radii.xl,
    borderWidth:   1,
    gap:           spacing[3],
    alignItems:    'flex-start',
  },
  productInfo:  { flex: 1 },
  productName: {
    fontSize:     typography.sizes.base,
    fontWeight:   typography.weights.semiBold,
    marginBottom: 2,
    lineHeight:   20,
  },
  slug:         { fontSize: typography.sizes.xs, marginBottom: spacing[2] },
  productMeta: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   spacing[2],
  },
  price:        { fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  productStats: { flexDirection: 'row', gap: spacing[4] },
  stat:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText:     { fontSize: typography.sizes.xs },
  moreBtn:      { padding: spacing[1] },

  // ── Grid card ──
  gridCard: {
    flex:         1,
    borderRadius: radii.xl,
    borderWidth:  1,
    overflow:     'hidden',
    padding:      spacing[3],
  },
  gridInfo: {
    marginTop: spacing[2],
    gap:       spacing[1],
  },
  gridName: {
    fontSize:   typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    lineHeight: 18,
  },
  gridPrice: {
    fontSize:   typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[2],
    marginTop:     spacing[1],
  },
  gridMoreBtn: {
    position: 'absolute',
    top:      spacing[2],
    right:    spacing[2],
  },

  // ── Image placeholder (shared) ──
  imagePlaceholder: {
    borderRadius:   radii.lg,
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'hidden',
  },

  // ── Carousel dots ──
  dotRow: {
    position:       'absolute',
    bottom:         spacing[1],
    left:           0,
    right:          0,
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            4,
  },
  dot: {
    width:        5,
    height:       5,
    borderRadius: 3,
  },

  // ── Empty state ──
  empty: { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyText: { fontSize: typography.sizes.base },

  // ── Pagination ──
  pagination: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing[4],
    paddingVertical: spacing[4],
  },
  pageBtn: {
    width:           36,
    height:          36,
    borderRadius:    radii.lg,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageInfo:        { fontSize: typography.sizes.sm },
});