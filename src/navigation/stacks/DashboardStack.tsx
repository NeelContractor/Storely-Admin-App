// src/navigation/stacks/DashboardStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../../screens/Dashboard/HomeScreen';
import { AppHeader } from '../../components/header/AppHeader';

const Stack = createStackNavigator();

export const DashboardStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      header: ({ navigation }) => (
        <AppHeader
          showMenuButton={false}
          onMenuPress={() => {}}
        />
      ),
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);