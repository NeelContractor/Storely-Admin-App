// src/screens/Orders/AllOrdersScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Order } from '../../types';
import { colors } from '../../theme/colors';
import { typography, spacing, radii, shadows } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';
import { ORDER_STATUS_COLORS } from '../../constants';
import { mockOrders } from '../../utils/mockData';

const STATUS_FILTERS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function getStatusVariant(status: Order['status']): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const map: Record<Order['status'], 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    delivered: 'success', pending: 'warning', cancelled: 'danger',
    processing: 'info', shipped: 'info', returned: 'default',
  };
  return map[status];
}

const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
  const { colors: themeColors } = useTheme();
  return (
    <TouchableOpacity activeOpacity={0.7}>
      <View style={[styles.orderRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <Avatar name={order.customer.name} size={40} />
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNum, { color: themeColors.text }]}>{order.orderNumber}</Text>
          <Text style={[styles.customerName, { color: themeColors.textSecondary }]}>
            {order.customer.name}
          </Text>
        </View>
        <View style={styles.orderRight}>
          <Text style={[styles.total, { color: themeColors.text }]}>${order.total.toFixed(2)}</Text>
          <Badge
            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            variant={getStatusVariant(order.status)}
            size="sm"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const AllOrdersScreen: React.FC = () => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return mockOrders.filter((o) => {
      const matchStatus =
        activeFilter === 'All' || o.status.toLowerCase() === activeFilter.toLowerCase();
      const matchSearch =
        !search ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [activeFilter, search]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: themeColors.text }]}
          placeholder="Search orders..."
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

      {/* Status Filters */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveFilter(item)}
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === item ? colors.primary : themeColors.card,
                borderColor: activeFilter === item ? colors.primary : themeColors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === item ? colors.white : themeColors.textSecondary },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Orders List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing[6] },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <OrderRow order={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No orders found</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing[4],
    padding: spacing[3],
    borderRadius: radii.lg,
    borderWidth: 1.5,
    gap: spacing[2],
  },
  searchInput: { flex: 1, fontSize: typography.sizes.base },
  filterList: { paddingHorizontal: spacing[4], paddingBottom: spacing[3], gap: spacing[2] },
  filterChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1.5,
  },
  filterText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  list: { paddingHorizontal: spacing[4] },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing[3],
  },
  orderInfo: { flex: 1 },
  orderNum: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    marginBottom: 2,
  },
  customerName: { fontSize: typography.sizes.sm },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  total: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold },
  separator: { height: spacing[3] },
  empty: { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyText: { fontSize: typography.sizes.base },
});