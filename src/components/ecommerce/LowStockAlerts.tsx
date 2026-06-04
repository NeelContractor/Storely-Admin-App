// src/components/ecommerce/LowStockAlerts.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Product } from '../../types/types';          // ← real type, not mock index
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';

interface LowStockAlertsProps {
  products:   Product[];
  onViewAll?: () => void;
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products, onViewAll }) => {
  const { colors: themeColors } = useTheme();

  // Real Product uses stockCount (number) instead of stock
  const lowStock = products.filter(p => p.stockCount <= 10);

  return (
    <Card style={styles.card}>
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
              {/* Real Product has no SKU — show slug as the identifier */}
              <Text style={[styles.sku, { color: themeColors.textSecondary }]}>
                {product.slug}
              </Text>
            </View>

            <View style={[
              styles.stockBadge,
              {
                backgroundColor:
                  product.stockCount === 0 ? colors.dangerLight : colors.warningLight,
              },
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
  card: { marginBottom: spacing[4] },

  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   spacing[4],
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

  emptyText: {
    fontSize:  typography.sizes.sm,
    textAlign: 'center',
    paddingVertical: spacing[4],
  },

  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
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