// src/screens/Auth/SignInScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, KeyboardAvoidingView, ScrollView,
  Platform, TouchableOpacity, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';
import { StatusBar }         from 'expo-status-bar';
import { Ionicons }          from '@expo/vector-icons';

import { InputField }   from '../../components/ui/InputField';
import { Button }        from '../../components/ui/Button';
import { g }             from '../../theme/globalStyles';          // ← global styles
import { colors }        from '../../theme/colors';
import { spacing }       from '../../theme/typography';
import { useTheme }      from '../../theme/ThemeContext';
import { useAuthStore }  from '../../store/useAuthStore';

export const SignInScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [username, setUsername]           = useState('');
  const [password, setPassword]           = useState('');
  const [usernameError, setUsernameError] = useState('');
  const { signIn, isLoading, error }      = useAuthStore();
  const { colors: themeColors, isDark, toggleTheme } = useTheme();

  const handleSignIn = async () => {
    if (!username.trim()) {
      setUsernameError('Username is required');
      return;
    }
    setUsernameError('');

    const result = await signIn(username.trim(), password);

    if (result === 'no-store') {
      navigation.reset({ index: 0, routes: [{ name: 'CreateStore' }] });
    } else if (result !== 'ok') {
      Alert.alert('Sign In Failed', error ?? 'Invalid username or password.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[g.screen, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <LinearGradient colors={[colors.sidebar, '#0F172A']} style={g.authTopSection}>
        {/* Theme toggle */}
        <TouchableOpacity
          style={[g.authThemeToggle, { top: insets.top + spacing[3] }]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={colors.white}
          />
        </TouchableOpacity>

        <View style={[g.authLogoArea, { paddingTop: insets.top + spacing[8] }]}>
          <Image
            source={require('./../../../assets/storely-logo-main.png')}
            style={g.authLogo}
          />
          <Text style={g.authBrandName}>Storely</Text>
          <Text style={g.authTagline}>Admin Dashboard</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={[g.authFormContainer, { backgroundColor: themeColors.background }]}
        contentContainerStyle={g.authFormContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[g.h2, { color: themeColors.text }]}>Welcome back</Text>
        <Text style={[g.body, g.mb6, { color: themeColors.textSecondary }]}>
          Sign in to your admin account
        </Text>

        <InputField
          label="Username"
          placeholder="Enter your username"
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          leftIcon="person-outline"
          error={usernameError}
        />
        <InputField
          label="Password"
          placeholder="Enter your password"
          isPassword
          value={password}
          onChangeText={setPassword}
          leftIcon="lock-closed-outline"
        />

        <TouchableOpacity style={g.authForgotRow}>
          <Text style={g.textLink}>Forgot password?</Text>
        </TouchableOpacity>

        <Button
          label="Sign In"
          onPress={handleSignIn}
          loading={isLoading}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};