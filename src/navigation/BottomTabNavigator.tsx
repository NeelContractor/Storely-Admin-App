// src/navigation/BottomTabNavigator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography, spacing, radii, shadows } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';

// Stack navigators for each tab
import { DashboardStack } from './stacks/DashboardStack';
import { OrdersStack } from './stacks/OrdersStack';
import { ProductsStack } from './stacks/ProductsStack';
import { CustomersStack } from './stacks/CustomersStack';
import { MoreStack } from './stacks/MoreStack';

const Tab = createBottomTabNavigator();

type TabIconName = 'home' | 'home-outline' | 'receipt' | 'receipt-outline' | 'cube' | 'cube-outline' | 'people' | 'people-outline' | 'grid' | 'grid-outline';

interface TabBarIconProps {
  focused: boolean;
  name: TabIconName;
  focusedName: TabIconName;
  label: string;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, name, focusedName, label }) => {
  const { colors: themeColors } = useTheme();
  return (
    <View style={styles.tabItem}>
      <View style={[styles.tabIconWrapper, focused && styles.tabIconActive]}>
        <Ionicons
          name={focused ? focusedName : name}
          size={22}
          color={focused ? colors.primary : themeColors.textSecondary}
        />
      </View>
      <Text style={[styles.tabLabel, { color: focused ? colors.primary : themeColors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
};

export const BottomTabNavigator: React.FC = () => {
  const { colors: themeColors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: themeColors.card,
            borderTopColor: themeColors.border,
          },
        ],
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="home-outline" focusedName="home" label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="receipt-outline" focusedName="receipt" label="Orders" />
          ),
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="cube-outline" focusedName="cube" label="Products" />
          ),
        }}
      />
      <Tab.Screen
        name="CustomersTab"
        component={CustomersStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="people-outline" focusedName="people" label="Customers" />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="grid-outline" focusedName="grid" label="More" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingBottom: 0,
    borderTopWidth: 1,
    ...shadows.lg,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing[2],
  },
  tabIconWrapper: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
  },
  tabIconActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});