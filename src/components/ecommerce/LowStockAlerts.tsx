// src/components/ecommerce/LowStockAlerts.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card }     from '../ui/Card';
import { colors }   from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';
import type { Store } from '../../types/types';
import type { ProductPage } from '../../store/useAppStore';

// ─── Props ────────────────────────────────────────────────────────────────────

interface StoreEntry {
  store: Store;
  page1: ProductPage | null;
}

interface LowStockAlertsProps {
  storeData:           StoreEntry[];
  activeStoreUsername: string;
  onViewAll?:          () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({
  storeData,
  activeStoreUsername,
  onViewAll,
}) => {
  const { colors: themeColors } = useTheme();

  const defaultUsername =
    storeData.find(e => e.store.username === activeStoreUsername)?.store.username ??
    storeData[0]?.store.username ??
    '';

  const [selectedUsername, setSelectedUsername] = useState(defaultUsername);

  const selectedEntry = storeData.find(e => e.store.username === selectedUsername);
  const products      = selectedEntry?.page1?.products ?? [];
  const lowStock      = products.filter(p => p.stockCount <= 10);
  const multiStore    = storeData.length > 1;

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

      {/* ── Store switcher tabs (multi-store only) ── */}
      {multiStore && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          style={styles.tabs}
        >
          {storeData.map(({ store, page1 }) => {
            const active   = store.username === selectedUsername;
            const lowCount = (page1?.products ?? []).filter(p => p.stockCount <= 10).length;

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
                    <Text style={[
                      styles.tabBadgeText,
                      { color: active ? '#fff' : colors.danger },
                    ]}>
                      {lowCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── List ── */}
      {lowStock.length === 0 ? (
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
          All products are well stocked.
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
  titleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[2],
  },
  warningIcon: {
    width:           28,
    height:          28,
    borderRadius:    8,
    backgroundColor: colors.warningLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  title: {
    fontSize:   typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
  },
  viewAll: {
    fontSize:   typography.sizes.sm,
    color:      colors.primary,
    fontWeight: typography.weights.medium,
  },
  tabs: {
    marginBottom: spacing[3],
  },
  tabsContent: {
    gap:           spacing[2],
    paddingBottom: spacing[1],
  },
  tab: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical:   6,
    borderRadius:      radii.full,
    borderWidth:       1,
  },
  tabText: {
    fontSize:   typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  tabBadge: {
    minWidth:          18,
    height:            18,
    borderRadius:      9,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize:   10,
    fontWeight: typography.weights.bold,
  },
  emptyText: {
    fontSize:        typography.sizes.sm,
    textAlign:       'center',
    paddingVertical: spacing[4],
  },
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingVertical: spacing[3],
  },
  productInfo: {
    flex:        1,
    marginRight: spacing[3],
  },
  productName: {
    fontSize:     typography.sizes.base,
    fontWeight:   typography.weights.medium,
    marginBottom: 2,
  },
  sku: {
    fontSize: typography.sizes.sm,
  },
  stockBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical:   5,
    borderRadius:      radii.full,
  },
  stockText: {
    fontSize:   typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
});