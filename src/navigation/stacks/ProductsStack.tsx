// src/navigation/stacks/ProductsStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AllProductsScreen } from '../../screens/Products/AllProductsScreen';
import { AppHeader } from '../../components/header/AppHeader';
import { useTheme } from '../../theme/ThemeContext';

const Stack = createStackNavigator();

export const ProductsStack: React.FC = () => {
  const { colors: themeColors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        header: ({ route }) => (
          <AppHeader
            title="Products"
            showMenuButton={false}
            showBack={navigation.canGoBack()}
            onBackPress={() => navigation.goBack()}
          />
        ),
        cardStyle: { backgroundColor: themeColors.background },
      })}
    >
      <Stack.Screen name="AllProducts" component={AllProductsScreen} />
    </Stack.Navigator>
  );
};