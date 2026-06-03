// src/navigation/stacks/CustomersStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AllCustomersScreen } from '../../screens/Customers/AllCustomersScreen';
import { AppHeader } from '../../components/header/AppHeader';
import { useTheme } from '../../theme/ThemeContext';

const Stack = createStackNavigator();

export const CustomersStack: React.FC = () => {
  const { colors: themeColors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        header: () => (
          <AppHeader
            title="Customers"
            showMenuButton={false}
            showBack={navigation.canGoBack()}
            onBackPress={() => navigation.goBack()}
          />
        ),
        cardStyle: { backgroundColor: themeColors.background },
      })}
    >
      <Stack.Screen name="AllCustomers" component={AllCustomersScreen} />
    </Stack.Navigator>
  );
};