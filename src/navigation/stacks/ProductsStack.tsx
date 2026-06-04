// src/navigation/stacks/ProductsStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AllProductsScreen } from '../../screens/Products/AllProductsScreen';
import { AddProductScreen } from '@/screens/Products/AddProductsScreen';
import { AppHeader } from '../../components/header/AppHeader';
import { useTheme } from '../../theme/ThemeContext';

const Stack = createStackNavigator();

export const ProductsStack: React.FC = () => {
  const { colors: themeColors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="AllProducts"  
      screenOptions={({ navigation }) => ({
        header: ({ route }) => {
          const titles: Record<string, string> = {
            AllProducts: 'Products',
            AddProduct:  'Add Product',
          };
          return (
            <AppHeader
              title={titles[route.name] ?? route.name}
              showMenuButton={false}
              showBack={navigation.canGoBack()}
              onBackPress={() => navigation.goBack()}
            />
          );
        },
        cardStyle: { backgroundColor: themeColors.background },
      })}
    >
      <Stack.Screen name="AllProducts" component={AllProductsScreen} />
      <Stack.Screen name="AddProduct"  component={AddProductScreen} />
    </Stack.Navigator>
  );
};