// src/screens/Customers/AllCustomersScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Customer } from '../../types';
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';
import { mockCustomers } from '../../utils/mockData';

const CustomerRow: React.FC<{ customer: Customer }> = ({ customer }) => {
  const { colors: themeColors } = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.7}>
      <View style={[styles.row, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <Avatar name={customer.name} size={44} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: themeColors.text }]}>{customer.name}</Text>
            <Badge
              label={customer.status === 'active' ? 'Active' : 'Inactive'}
              variant={customer.status === 'active' ? 'success' : 'default'}
              size="sm"
            />
          </View>
          <Text style={[styles.email, { color: themeColors.textSecondary }]}>{customer.email}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: themeColors.text }]}>
                {customer.totalOrders}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}> orders</Text>
            </View>
            <Text style={[styles.dot, { color: themeColors.textSecondary }]}>·</Text>
            <Text style={[styles.spent, { color: colors.primary }]}>
              ${customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

export const AllCustomersScreen: React.FC = () => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    mockCustomers.filter((c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: themeColors.text }]}
          placeholder="Search customers..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.summaryRow}>
        <Text style={[styles.summaryText, { color: themeColors.textSecondary }]}>
          {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing[6] }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <CustomerRow customer={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No customers found</Text>
          </View>
        }
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
  summaryRow: { paddingHorizontal: spacing[4], marginBottom: spacing[3] },
  summaryText: { fontSize: typography.sizes.sm },
  list: { paddingHorizontal: spacing[4] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing[3],
  },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
  email: { fontSize: typography.sizes.sm, marginBottom: spacing[2] },
  stats: { flexDirection: 'row', alignItems: 'center' },
  stat: { flexDirection: 'row' },
  statValue: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  statLabel: { fontSize: typography.sizes.sm },
  dot: { fontSize: typography.sizes.sm, marginHorizontal: spacing[2] },
  spent: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  empty: { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyText: { fontSize: typography.sizes.base },
});