// src/navigation/stacks/OrdersStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AllOrdersScreen } from '../../screens/Orders/AllOrdersScreen';
import { AppHeader } from '../../components/header/AppHeader';
import { useTheme } from '../../theme/ThemeContext';

const Stack = createStackNavigator();

export const OrdersStack: React.FC = () => {
  const { colors: themeColors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        header: ({ route }) => (
          <AppHeader
            title={route.name === 'AllOrders' ? 'All Orders' : route.name}
            showMenuButton={false}
            showBack={navigation.canGoBack()}
            onBackPress={() => navigation.goBack()}
          />
        ),
        cardStyle: { backgroundColor: themeColors.background },
      })}
    >
      <Stack.Screen name="AllOrders" component={AllOrdersScreen} />
    </Stack.Navigator>
  );
};