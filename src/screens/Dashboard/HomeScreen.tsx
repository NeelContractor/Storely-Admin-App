// src/screens/Dashboard/HomeScreen.tsx
import React, { useCallback } from 'react';
import {
  ScrollView, View, ActivityIndicator, Text, StyleSheet, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions } from '@react-navigation/native';

import { StatCards }        from '../../components/ecommerce/StatCards';
import { RecentOrdersCard } from '../../components/ecommerce/RecentOrdersCard';
import { LowStockAlerts }   from '../../components/ecommerce/LowStockAlerts';
import { Card }             from '../../components/ui/Card';
import { useTheme }         from '../../theme/ThemeContext';
import { g }                from '../../theme/globalStyles';       // ← global styles
import { colors }           from '../../theme/colors';
import { spacing }          from '../../theme/typography';
import { useAppStore }      from '../../store/useAppStore';        // ← single store
import { useAuth }          from '../../hooks/useAuth';
import { mockStats, mockOrders }        from '../../utils/mockData';

// ─── Quick actions ────────────────────────────────────────────────────────────

const quickActions: {
  label:   string;
  icon:    React.ComponentProps<typeof Ionicons>['name'];
  color:   string;
  onPress: (navigation: any) => void;
}[] = [
  {
    label: 'Add Product',
    icon:  'add-circle-outline',
    color: colors.primary,
    onPress: (nav) => nav.dispatch(
      CommonActions.navigate({ name: 'ProductsTab', params: { screen: 'AddProduct', initial: false } })
    ),
  },
  {
    label:   'Orders',
    icon:    'list-outline',
    color:   colors.success,
    onPress: (nav) => nav.navigate('AllOrders'),
  },
  {
    label:   'Customers',
    icon:    'person-outline',
    color:   '#B45309',
    onPress: (nav) => nav.navigate('AllCustomers'),
  },
  {
    label:   'Analytics',
    icon:    'bar-chart-outline',
    color:   '#8B5CF6',
    onPress: (nav) => nav.navigate('MoreTab', { screen: 'Analytics' }),
  },
  {
    label:   'Add Category',
    icon:    'add-circle-outline',
    color:   '#3093ec',
    onPress: (nav) => nav.navigate('MoreTab', { screen: 'Categories' }),
  },
  {
    label:   'Low Stock',
    icon:    'close-circle',
    color:   '#ed1515',
    onPress: (nav) => nav.navigate('MoreTab', { screen: 'LowStock' }),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isVerifying }          = useAuth();
  const { colors: themeColors }  = useTheme();
  const insets                   = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  // Pull everything from the single store
  const { user, activeStore, loadStoreData, getProductPage, 
    // getOrders 
  } = useAppStore();
  const storeUsername = activeStore?.username ?? '';
  const page1         = getProductPage(storeUsername, 1, 20);
  // const orders        = getOrders(storeUsername);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStoreData(storeUsername, true).finally(() => setRefreshing(false));
  }, [storeUsername]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const dashboardStats = [
    {
      title:    'Total Revenue',
      value:    `$${mockStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change:   mockStats.revenueChange,
      icon:     'cash-outline'   as const,
      iconBg:   '#EEF2FF',
      iconColor: colors.primary,
    },
    {
      title:    'Total Orders',
      value:    mockStats.totalOrders.toLocaleString(),
      change:   mockStats.ordersChange,
      icon:     'cart-outline'   as const,
      iconBg:   '#D1FAE5',
      iconColor: colors.success,
    },
    {
      title:    'Customers',
      value:    mockStats.totalCustomers.toLocaleString(),
      change:   mockStats.customersChange,
      icon:     'people-outline' as const,
      iconBg:   '#FEF3C7',
      iconColor: '#B45309',
    },
    {
      title:    'Products',
      value:    (page1?.total ?? 0).toLocaleString(),
      change:   mockStats.productsChange,
      icon:     'cube-outline'   as const,
      iconBg:   '#FEE2E2',
      iconColor: colors.danger,
    },
  ];

  if (isVerifying) {
    return <View style={g.centred}><ActivityIndicator /></View>;
  }

  console.log(user)

  return (
    <ScrollView
      style={[g.screen, { backgroundColor: themeColors.background }]}
      contentContainerStyle={[g.scrollContent, { paddingBottom: insets.bottom + spacing[6] }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Welcome Banner */}
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={g.banner}>
        <View style={g.bannerContent}>
          <Text style={g.bannerGreeting}>{getGreeting()},</Text>
          <Text style={g.bannerTitle}>{user?.name ?? 'Admin'} 👋</Text>
          <Text style={g.bannerSubtitle}>Here's what's happening with your store today.</Text>
        </View>
        <View style={g.bannerDecorLg} />
        <View style={g.bannerDecorSm} />
      </LinearGradient>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={[g.sectionTitle, { color: themeColors.text }]}>Quick Actions</Text>
        <View style={g.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={g.quickAction}
              onPress={() => action.onPress(navigation)}
              activeOpacity={0.7}
            >
              <View style={[g.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={[g.quickActionLabel, { color: themeColors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Stat Cards */}
      <View style={g.mb4}>
        <Text style={[g.sectionTitle, { color: themeColors.text }]}>Overview</Text>
        <StatCards stats={dashboardStats} />
      </View>

      {/* Recent Orders — read from store, no local fetch */}
      <View style={g.mb4}>
        <RecentOrdersCard
          // orders={orders ?? []}
          orders={mockOrders}
          onViewAll={() => navigation.navigate('AllOrders')}
        />
      </View>

      {/* Low Stock Alerts — read from store */}
      <View style={g.mb4}>
        <LowStockAlerts
          products={page1?.products ?? []}
          onViewAll={() => navigation.navigate('LowStock')}
        />
      </View>
    </ScrollView>
  );
};

// Only screen-specific overrides that can't live in globalStyles
const styles = StyleSheet.create({
  quickActionsCard: {
    marginBottom: spacing[4],
  },
});