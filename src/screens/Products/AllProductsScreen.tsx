// src/screens/Products/AllProductsScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import { Product } from '../../types';
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';
import { mockProducts } from '../../utils/mockData';

function getStatusVariant(status: Product['status']): 'success' | 'warning' | 'danger' {
  return status === 'active' ? 'success' : status === 'low_stock' ? 'warning' : 'danger';
}

function getStatusLabel(status: Product['status']) {
  return status === 'low_stock' ? 'Low Stock' : status.charAt(0).toUpperCase() + status.slice(1);
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { colors: themeColors } = useTheme();

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
          <Text style={[styles.sku, { color: themeColors.textSecondary }]}>SKU: {product.sku}</Text>
          <View style={styles.productMeta}>
            <Text style={[styles.price, { color: colors.primary }]}>${product.price.toFixed(2)}</Text>
            <Badge label={getStatusLabel(product.status)} variant={getStatusVariant(product.status)} size="sm" />
          </View>
          <View style={styles.productStats}>
            <View style={styles.stat}>
              <Ionicons name="layers-outline" size={12} color={themeColors.textSecondary} />
              <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
                {product.stock} in stock
              </Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="trending-up-outline" size={12} color={themeColors.textSecondary} />
              <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
                {product.sales} sold
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={18} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const AllProductsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    mockProducts.filter((p) =>
      !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header Row */}
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
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing[6] }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ProductCard product={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No products found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radii.lg,
    borderWidth: 1.5,
    gap: spacing[2],
  },
  searchInput: { flex: 1, fontSize: typography.sizes.base },
  addBtn: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: spacing[4] },
  card: {
    flexDirection: 'row',
    padding: spacing[4],
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing[3],
    alignItems: 'flex-start',
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { flex: 1 },
  productName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    marginBottom: 2,
    lineHeight: 20,
  },
  sku: { fontSize: typography.sizes.sm, marginBottom: spacing[2] },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  price: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  productStats: { flexDirection: 'row', gap: spacing[4] },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: typography.sizes.xs },
  moreBtn: { padding: spacing[1] },
  empty: { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyText: { fontSize: typography.sizes.base },
});