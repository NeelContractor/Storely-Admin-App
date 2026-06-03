// src/screens/Auth/SignInScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useAuthStore } from '../../store/useAuthStore';

export const SignInScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [usernameError, setUsernameError] = useState('');
  const { signIn, isLoading, error }    = useAuthStore();

  const handleSignIn = async () => {
    if (!username.trim()) {
      setUsernameError('Username is required');
      return;
    }
    setUsernameError('');
  
    const result = await signIn(username.trim(), password);
  
    if (result === 'ok') {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] }); // ← your tab navigator name
    } else if (result === 'no-store') {
      navigation.reset({ index: 0, routes: [{ name: 'CreateStore' }] });
    } else {
      Alert.alert('Sign In Failed', error ?? 'Invalid username or password.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <LinearGradient colors={[colors.sidebar, '#0F172A']} style={styles.topSection}>
        <View style={[styles.logoArea, { paddingTop: insets.top + spacing[8] }]}>
          <Image
            source={require('./../../../assets/storely-logo-main.png')}
            style={styles.image}
          />
          <Text style={styles.brandName}>Storely</Text>
          <Text style={styles.tagline}>Admin Dashboard</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.welcomeTitle}>Welcome back</Text>
        <Text style={styles.welcomeSub}>Sign in to your admin account</Text>

        <View style={styles.form}>
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

          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            label="Sign In"
            onPress={handleSignIn}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.bgLight },
  image:         { width: 100, height: 100 },
  topSection:    { paddingBottom: spacing[10] },
  logoArea: {
    alignItems:        'center',
    paddingBottom:     spacing[8],
    paddingHorizontal: spacing[6],
  },
  brandName: {
    fontSize:      typography.sizes['3xl'],
    fontWeight:    typography.weights.bold,
    color:         colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize:   typography.sizes.base,
    color:      colors.sidebarText,
    marginTop:  4,
  },
  formContainer: {
    flex:                1,
    backgroundColor:     colors.bgLight,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    marginTop:           -24,
  },
  formContent:   { padding: spacing[6], paddingBottom: spacing[10] },
  welcomeTitle: {
    fontSize:    typography.sizes['2xl'],
    fontWeight:  typography.weights.bold,
    color:       colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize:     typography.sizes.base,
    color:        colors.textSecondary,
    marginBottom: spacing[6],
  },
  form:   { gap: 0 },
  forgot: { alignSelf: 'flex-end', marginBottom: spacing[5], marginTop: -spacing[2] },
  forgotText: {
    fontSize:   typography.sizes.sm,
    color:      colors.primary,
    fontWeight: typography.weights.medium,
  },
});