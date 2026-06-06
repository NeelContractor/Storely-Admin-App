// src/navigation/RootNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SignInScreen } from '../screens/Auth/SignInScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { useAppStore } from '@/store/useAppStore';
import { RegisterScreen } from '@/screens/Auth/RegisterScreen';

const Stack = createStackNavigator();

export const RootNavigator: React.FC = () => {
  const { authStatus } = useAppStore();
  const isAuthenticated = authStatus === 'authenticated';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="SignIn"    component={SignInScreen}    />
          <Stack.Screen name="Register" component={RegisterScreen}  />
        </>
      ) : (
        <Stack.Screen 
          name="Main" 
          component={BottomTabNavigator}
          options={{ animationTypeForReplace: 'push' }} 
        />
      )}
    </Stack.Navigator>
  );
};