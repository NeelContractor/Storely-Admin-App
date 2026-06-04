// src/components/ecommerce/RecentOrdersCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card }   from '../ui/Card';
import { Badge }  from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { MockOrder } from '../../utils/mockData';   // ← mock-only type, not the real Order
import { colors }    from '../../theme/colors';
import { typography, spacing } from '../../theme/typography';
import { useTheme }  from '../../theme/ThemeContext';

interface RecentOrdersCardProps {
  orders:      MockOrder[];
  onViewAll?:  () => void;
}

function getStatusVariant(
  status: MockOrder['status']
): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const map: Record<MockOrder['status'], 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    delivered:  'success',
    pending:    'warning',
    cancelled:  'danger',
    processing: 'info',
    shipped:    'info',
    returned:   'default',
  };
  return map[status];
}

export const RecentOrdersCard: React.FC<RecentOrdersCardProps> = ({ orders, onViewAll }) => {
  const { colors: themeColors } = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Recent Orders</Text>
        <TouchableOpacity onPress={onViewAll} style={styles.viewAll}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {orders.slice(0, 5).map((order, i) => (
        <View
          key={order.id}
          style={[
            styles.row,
            i < Math.min(orders.length, 5) - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: themeColors.border,
            },
          ]}
        >
          <Avatar name={order.customer.name} size={38} />
          <View style={styles.rowInfo}>
            <Text
              style={[styles.customerName, { color: themeColors.text }]}
              numberOfLines={1}
            >
              {order.customer.name}
            </Text>
            <Text style={[styles.orderNum, { color: themeColors.textSecondary }]}>
              {order.orderNumber}
            </Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={[styles.amount, { color: themeColors.text }]}>
              ${order.total.toFixed(2)}
            </Text>
            <Badge
              label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              variant={getStatusVariant(order.status)}
              size="sm"
            />
          </View>
        </View>
      ))}
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
  title: {
    fontSize:   typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  viewAllText: {
    fontSize:   typography.sizes.sm,
    color:      colors.primary,
    fontWeight: typography.weights.medium,
  },
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: spacing[3],
    gap:             spacing[3],
  },
  rowInfo:      { flex: 1 },
  customerName: {
    fontSize:     typography.sizes.base,
    fontWeight:   typography.weights.medium,
    marginBottom: 2,
  },
  orderNum: { fontSize: typography.sizes.sm },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  amount: {
    fontSize:   typography.sizes.base,
    fontWeight: typography.weights.semiBold,
  },
});