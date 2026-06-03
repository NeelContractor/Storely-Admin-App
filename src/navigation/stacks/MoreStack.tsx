// src/navigation/stacks/MoreStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AnalyticsScreen } from '../../screens/Analytics/AnalyticsScreen';
import { SettingsScreen } from '../../screens/Settings/SettingsScreen';
import { AppHeader } from '../../components/header/AppHeader';
import { useTheme } from '../../theme/ThemeContext';
import { MoreScreen } from './../../screens/More/MoreScreen';

const Stack = createStackNavigator();

export const MoreStack: React.FC = () => {
  const { colors: themeColors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        header: ({ route }) => {
          const titles: Record<string, string> = {
            More: 'More',
            Analytics: 'Analytics',
            Settings: 'Settings',
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
      <Stack.Screen name="More" component={MoreScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};