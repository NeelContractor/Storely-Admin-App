// src/components/ecommerce/LowStockAlerts.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card }     from '../ui/Card';
import { colors }   from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme }    from '../../theme/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useProductStore } from '../../store/useProductStore';

const LOW_STOCK_LIMIT = 10;

interface LowStockAlertsProps {
  activeStoreUsername: string;
  onViewAll?:          () => void;
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({
  activeStoreUsername,
  onViewAll,
}) => {
  const { colors: themeColors } = useTheme();

  // ✅ Read stores list from appStore
  const stores = useAppStore(s => s.stores);

  // ✅ Read product pages from useProductStore — same source as LowStockScreen
  const { fetchPage, getPage } = useProductStore();

  const [selectedUsername, setSelectedUsername] = useState('');

  // Sync selected store
  useEffect(() => {
    const stillValid = stores.some(s => s.username === selectedUsername);
    if (stillValid) return;
    const match =
      stores.find(s => s.username === activeStoreUsername)?.username ??
      stores[0]?.username ??
      '';
    setSelectedUsername(match);
  }, [stores, activeStoreUsername]);

  // ✅ Trigger fetches for all stores (no-op if already cached)
  useEffect(() => {
    stores.forEach(s => {
      fetchPage({ username: s.username, page: 1, pageSize: 50 });
    });
  }, [stores]);

  const multiStore = stores.length > 1;

  // Selected store products — from useProductStore, same as LowStockScreen
  const selectedPage  = getPage({ username: selectedUsername, page: 1, pageSize: 50 });
  const products      = selectedPage?.products ?? [];
  const isLoading     = !selectedPage;
  const lowStock      = products.filter(p => !p.inStock || p.stockCount <= LOW_STOCK_LIMIT);

  return (
    <Card>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.warningIcon}>
            <Ionicons name="warning-outline" size={16} color={colors.warning} />
          </View>
          <Text style={[styles.title, { color: themeColors.text }]}>Low Stock Alerts</Text>
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* ── Store switcher (multi-store only) ── */}
      {multiStore && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          style={styles.tabs}
        >
          {stores.map(store => {
            const active   = store.username === selectedUsername;
            const sp       = getPage({ username: store.username, page: 1, pageSize: 50 });
            const lowCount = (sp?.products ?? []).filter(
              p => !p.inStock || p.stockCount <= LOW_STOCK_LIMIT
            ).length;

            return (
              <TouchableOpacity
                key={store.username}
                onPress={() => setSelectedUsername(store.username)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active ? colors.primary : themeColors.card,
                    borderColor:     active ? colors.primary : themeColors.border,
                  },
                ]}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, { color: active ? '#fff' : themeColors.text }]}>
                  {store.name}
                </Text>
                {lowCount > 0 && (
                  <View style={[
                    styles.tabBadge,
                    { backgroundColor: active ? '#ffffff33' : colors.dangerLight },
                  ]}>
                    <Text style={[styles.tabBadgeText, { color: active ? '#fff' : colors.danger }]}>
                      {lowCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Body ── */}
      {isLoading ? (
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
          Loading products…
        </Text>
      ) : lowStock.length === 0 ? (
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
          {products.length === 0
            ? 'No products found for this store.'
            : 'All products are well stocked.'}
        </Text>
      ) : (
        lowStock.slice(0, 4).map((product, i) => (
          <View
            key={product.id}
            style={[
              styles.row,
              i < Math.min(lowStock.length, 4) - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: themeColors.border,
              },
            ]}
          >
            <View style={styles.productInfo}>
              <Text
                style={[styles.productName, { color: themeColors.text }]}
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <Text style={[styles.sku, { color: themeColors.textSecondary }]}>
                {product.slug}
              </Text>
            </View>

            <View style={[
              styles.stockBadge,
              { backgroundColor: product.stockCount === 0 ? colors.dangerLight : colors.warningLight },
            ]}>
              <Text style={[
                styles.stockText,
                { color: product.stockCount === 0 ? colors.danger : '#B45309' },
              ]}>
                {product.stockCount === 0 ? 'Out of Stock' : `${product.stockCount} left`}
              </Text>
            </View>
          </View>
        ))
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   spacing[3],
  },
  titleRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  warningIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: colors.warningLight,
    alignItems: 'center', justifyContent: 'center',
  },
  title:   { fontSize: typography.sizes.lg, fontWeight: typography.weights.semiBold },
  viewAll: { fontSize: typography.sizes.sm, color: colors.primary, fontWeight: typography.weights.medium },
  tabs:        { marginBottom: spacing[3] },
  tabsContent: { gap: spacing[2], paddingBottom: spacing[1] },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    paddingHorizontal: spacing[3], paddingVertical: 6,
    borderRadius: radii.full, borderWidth: 1,
  },
  tabText:      { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  tabBadge:     { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeText: { fontSize: 10, fontWeight: typography.weights.bold },
  emptyText:    { fontSize: typography.sizes.sm, textAlign: 'center', paddingVertical: spacing[4] },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing[3],
  },
  productInfo:  { flex: 1, marginRight: spacing[3] },
  productName:  { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginBottom: 2 },
  sku:          { fontSize: typography.sizes.sm },
  stockBadge:   { paddingHorizontal: spacing[3], paddingVertical: 5, borderRadius: radii.full },
  stockText:    { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
});