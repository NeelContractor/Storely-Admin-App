// src/screens/Products/AllProductsScreen.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useProductStore } from '../../store/useProductStore';
import type { Product } from '../../types/types';

const PAGE_SIZE = 10;

function getStatus(p: Product): 'active' | 'low' | 'out' {
  if (!p.inStock || p.stockCount === 0) return 'out';
  if (p.stockCount <= 10) return 'low';
  return 'active';
}

const STATUS_LABEL = { active: 'Active', low: 'Low Stock', out: 'Out of Stock' } as const;
const STATUS_VARIANT = { active: 'success', low: 'warning', out: 'danger' } as const;

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { colors: themeColors } = useTheme();
  const status = getStatus(product);

  return (
    <TouchableOpacity activeOpacity={0.7}>
      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={[styles.productImagePlaceholder, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="cube-outline" size={28} color={colors.primary} />
        </View>

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
            <Badge
              label={STATUS_LABEL[status]}
              variant={STATUS_VARIANT[status]}
              size="sm"
            />
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

  const { activeStore } = useAppStore();
  const { fetchPage, loading: cacheLoading, errors: cacheErrors } = useProductStore();

  const storeUsername = activeStore?.username ?? '';

  const [products, setProducts]       = useState<Product[]>([]);
  const [total, setTotal]             = useState(0);
  const [hasMore, setHasMore]         = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading]     = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [search, setSearch]           = useState('');

  // ── Fetch page ──────────────────────────────────────────────────────────────
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

  useEffect(() => {
    setCurrentPage(1);
    loadPage(1);
  }, [storeUsername]);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPage(currentPage, true);
    setIsRefreshing(false);
  }, [currentPage, loadPage]);

  // ── Client-side search filter ────────────────────────────────────────────────
  const filtered = useMemo(() =>
    products.filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    }),
    [products, search],
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Empty / no store ────────────────────────────────────────────────────────
  if (!storeUsername) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No store selected</Text>
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

      {/* ── Stats row ── */}
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

      {/* ── List ── */}
      {!isLoading && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
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
          renderItem={({ item }) => <ProductCard product={item} />}
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
                  <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? colors.textMuted : themeColors.text} />
                </TouchableOpacity>

                <Text style={[styles.pageInfo, { color: themeColors.textSecondary }]}>
                  {currentPage} / {totalPages}
                </Text>

                <TouchableOpacity
                  style={[styles.pageBtn, !hasMore && styles.pageBtnDisabled]}
                  onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={!hasMore}
                >
                  <Ionicons name="chevron-forward" size={18} color={!hasMore ? colors.textMuted : themeColors.text} />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1 },
  centered:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  topRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
    padding:       spacing[4],
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
  searchInput:  { flex: 1, fontSize: typography.sizes.base },
  addBtn: {
    backgroundColor: colors.primary,
    width:           44,
    height:          44,
    borderRadius:    radii.lg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  statsRow: {
    flexDirection:   'row',
    paddingHorizontal: spacing[4],
    paddingBottom:   spacing[3],
    borderBottomWidth: 1,
    gap:             spacing[2],
  },
  statCard: {
    flex:        1,
    alignItems:  'center',
    paddingVertical: spacing[2],
  },
  statValue: {
    fontSize:   typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  statLabel: { fontSize: typography.sizes.xs, marginTop: 2 },
  errorBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing[2],
    margin:          spacing[4],
    padding:         spacing[3],
    backgroundColor: '#FEE2E2',
    borderRadius:    radii.lg,
  },
  errorText:    { fontSize: typography.sizes.sm, color: colors.danger, flex: 1 },
  list:         { paddingHorizontal: spacing[4] },
  card: {
    flexDirection: 'row',
    padding:       spacing[4],
    borderRadius:  radii.xl,
    borderWidth:   1,
    gap:           spacing[3],
    alignItems:    'flex-start',
  },
  productImagePlaceholder: {
    width:          60,
    height:         60,
    borderRadius:   radii.lg,
    alignItems:     'center',
    justifyContent: 'center',
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
  price: {
    fontSize:   typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  productStats: { flexDirection: 'row', gap: spacing[4] },
  stat:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText:     { fontSize: typography.sizes.xs },
  moreBtn:      { padding: spacing[1] },
  empty:        { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyText:    { fontSize: typography.sizes.base },
  pagination: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing[4],
    paddingVertical: spacing[4],
  },
  pageBtn: {
    width:          36,
    height:         36,
    borderRadius:   radii.lg,
    alignItems:     'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageInfo:         { fontSize: typography.sizes.sm },
});