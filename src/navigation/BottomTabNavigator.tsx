// src/navigation/BottomTabNavigator.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons }  from '@expo/vector-icons';
import { g }         from '../theme/globalStyles';   
import { colors }    from '../theme/colors';
import { useTheme }  from '../theme/ThemeContext';

import { DashboardStack } from './stacks/DashboardStack';
import { OrdersStack }    from './stacks/OrdersStack';
import { ProductsStack }  from './stacks/ProductsStack';
import { CustomersStack } from './stacks/CustomersStack';
import { MoreStack }      from './stacks/MoreStack';

const Tab = createBottomTabNavigator();

type TabIconName =
  | 'home' | 'home-outline'
  | 'receipt' | 'receipt-outline'
  | 'cube' | 'cube-outline'
  | 'people' | 'people-outline'
  | 'grid' | 'grid-outline';

interface TabBarIconProps {
  focused:     boolean;
  name:        TabIconName;
  focusedName: TabIconName;
  label:       string;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, name, focusedName, label }) => {
  const { colors: themeColors } = useTheme();
  return (
    <View style={g.tabItem}>
      <View style={[g.tabIconWrapper, focused && g.tabIconActive]}>
        <Ionicons
          name={focused ? focusedName : name}
          size={22}
          color={focused ? colors.primary : themeColors.textSecondary}
        />
      </View>
      <Text style={[g.tabLabel, { color: focused ? colors.primary : themeColors.textSecondary }]}>
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
          g.tabBar,
          {
            backgroundColor: themeColors.card,
            borderTopColor:  themeColors.border,
          },
        ],
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="home-outline"    focusedName="home"    label="Home"     /> }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="receipt-outline" focusedName="receipt" label="Orders"   /> }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStack}
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="cube-outline"    focusedName="cube"    label="Products" /> }}
      />
      <Tab.Screen
        name="CustomersTab"
        component={CustomersStack}
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="people-outline"  focusedName="people"  label="Customers"/> }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="grid-outline"    focusedName="grid"    label="More"     /> }}
      />
    </Tab.Navigator>
  );
};