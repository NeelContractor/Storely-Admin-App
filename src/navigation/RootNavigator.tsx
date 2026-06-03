// src/navigation/RootNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SignInScreen } from '../screens/Auth/SignInScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      {!isAuthenticated ? (
        <Stack.Screen name="SignIn" component={SignInScreen} />
      ) : (
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      )}
    </Stack.Navigator>
  );
};