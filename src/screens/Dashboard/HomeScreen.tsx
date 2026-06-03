// src/screens/Dashboard/HomeScreen.tsx
import React, { useCallback } from 'react';
import {
  ScrollView, View, ActivityIndicator, Text, StyleSheet, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatCards } from '../../components/ecommerce/StatCards';
import { RecentOrdersCard } from '../../components/ecommerce/RecentOrdersCard';
import { LowStockAlerts } from '../../components/ecommerce/LowStockAlerts';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/ThemeContext';
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { mockStats, mockOrders, mockProducts } from '../../utils/mockData';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';

const dashboardStats = [
  {
    title: 'Total Revenue',
    value: `$${mockStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    change: mockStats.revenueChange,
    icon: 'cash-outline' as const,
    iconBg: '#EEF2FF',
    iconColor: colors.primary,
  },
  {
    title: 'Total Orders',
    value: mockStats.totalOrders.toLocaleString(),
    change: mockStats.ordersChange,
    icon: 'cart-outline' as const,
    iconBg: '#D1FAE5',
    iconColor: colors.success,
  },
  {
    title: 'Customers',
    value: mockStats.totalCustomers.toLocaleString(),
    change: mockStats.customersChange,
    icon: 'people-outline' as const,
    iconBg: '#FEF3C7',
    iconColor: '#B45309',
  },
  {
    title: 'Products',
    value: mockStats.totalProducts.toLocaleString(),
    change: mockStats.productsChange,
    icon: 'cube-outline' as const,
    iconBg: '#FEE2E2',
    iconColor: colors.danger,
  },
];

const quickActions = [
  { label: 'Add Product', icon: 'add-circle-outline' as const, route: 'AddProduct', color: colors.primary },
  { label: 'Orders', icon: 'list-outline' as const, route: 'AllOrders', color: colors.success },
  { label: 'Customers', icon: 'person-outline' as const, route: 'AllCustomers', color: '#B45309' },
  { label: 'Analytics', icon: 'bar-chart-outline' as const, route: 'Analytics', color: '#8B5CF6' },
];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isVerifying } = useAuth();
  const { colors: themeColors } = useTheme();
  const { user } = useAppStore();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isVerifying) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing[6] }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Welcome Banner */}
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name ?? 'Admin'} 👋</Text>
          <Text style={styles.bannerSub}>Here's what's happening with your store today.</Text>
        </View>
        <View style={styles.bannerDecor} />
        <View style={styles.bannerDecor2} />
      </LinearGradient>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickAction}
              onPress={() => navigation.navigate(action.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: themeColors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Stat Cards */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Overview</Text>
        <StatCards stats={dashboardStats} />
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <RecentOrdersCard
          orders={mockOrders}
          onViewAll={() => navigation.navigate('AllOrders')}
        />
      </View>

      {/* Low Stock Alerts */}
      <View style={styles.section}>
        <LowStockAlerts
          products={mockProducts}
          onViewAll={() => navigation.navigate('LowStock')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing[4] },
  banner: {
    borderRadius: radii['2xl'],
    padding: spacing[5],
    marginBottom: spacing[4],
    overflow: 'hidden',
    position: 'relative',
  },
  bannerContent: { zIndex: 1 },
  greeting: {
    fontSize: typography.sizes.base,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: typography.weights.medium,
  },
  userName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginTop: 2,
  },
  bannerSub: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing[2],
  },
  bannerDecor: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -30,
    right: -20,
  },
  bannerDecor2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    right: 60,
  },
  quickActionsCard: { marginBottom: spacing[4] },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[3],
  },
  quickAction: { alignItems: 'center', gap: spacing[2] },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  section: { marginBottom: spacing[4] },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    marginBottom: spacing[3],
  },
});