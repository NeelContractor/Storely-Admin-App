// src/screens/Auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, ScrollView,
  Platform, TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }    from 'expo-linear-gradient';
import { StatusBar }         from 'expo-status-bar';
import { Ionicons }          from '@expo/vector-icons';

import { InputField }        from '../../components/ui/InputField';
import { Button }            from '../../components/ui/Button';
import { ImageUploadButton } from '../../components/ImageUploadButton';
import { g }                 from '../../theme/globalStyles';
import { colors }            from '../../theme/colors';
import { spacing, typography, radii } from '../../theme/typography';
import { useTheme }          from '../../theme/ThemeContext';
import { useAuthStore }      from '../../store/useAuthStore';
import type { AuthRegisterParams } from '../../types/types';

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState extends AuthRegisterParams {
  confirm: string;   // UI-only, dropped before API call
}

interface FormErrors {
  name?:     string;
  email?:    string;
  mobile?:   string;
  username?: string;
  password?: string;
  confirm?:  string;
}

const INITIAL_FORM: FormState = {
  name: '', email: '', mobile: '', username: '',
  password: '', image: '', confirm: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors: themeColors, isDark, toggleTheme } = useTheme();
  const { register, isLoading } = useAuthStore();

  const [form,   setForm]   = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Field helpers ──────────────────────────────────────────────────────────

  const update = (key: keyof FormState) => (val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    if (key in errors) setErrors(e => ({ ...e, [key]: undefined }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim())
      e.name = 'Full name is required.';
    if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email address.';
    if (!/^\+?[\d\s\-]{7,15}$/.test(form.mobile))
      e.mobile = 'Enter a valid mobile number.';
    if (form.username.trim().length < 3)
      e.username = 'Username must be at least 3 characters.';
    if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    if (!validate()) return;

    const payload: AuthRegisterParams = {
      name:     form.name.trim(),
      email:    form.email.trim().toLowerCase(),
      mobile:   form.mobile.trim(),
      username: form.username.trim().toLowerCase(),
      password: form.password,
      image:    form.image,   // Cloudinary URL or '' if skipped
    };

    const result = await register(payload);

    if (result === 'ok') {
      Alert.alert(
        'Account created!',
        'You can now sign in with your credentials.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('SignIn') }],
      );
    } else {
      Alert.alert(
        'Registration failed',
        result === 'conflict'
          ? 'Username or email is already taken.'
          : 'Something went wrong. Please try again.',
      );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[g.screen, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Hero ── */}
      <LinearGradient colors={[colors.sidebar, '#0F172A']} style={g.authTopSectionSm}>
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

        <TouchableOpacity
          style={[g.authBackBtn, { top: insets.top + spacing[3] }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>

        <View style={[g.authLogoArea, { paddingTop: insets.top + spacing[6] }]}>
          {/* Profile image avatar — centered in hero */}
          <View style={styles.avatarWrap}>
            <ImageUploadButton
              uri={form.image || undefined}
              label="Add photo"
              aspectRatio={[1, 1]}
              width={80}
              height={80}
              onSuccess={url => setForm(f => ({ ...f, image: url }))}
              onRemove={() => setForm(f => ({ ...f, image: '' }))}
            />
            {/* Camera badge overlay when no image */}
            {!form.image && (
              <View style={styles.cameraBadge} pointerEvents="none">
                <Ionicons name="camera" size={14} color={colors.white} />
              </View>
            )}
          </View>
          <Text style={[g.authBrandName, { marginTop: spacing[2] }]}>Storely</Text>
          <Text style={g.authTagline}>Create your account</Text>
        </View>
      </LinearGradient>

      {/* ── Form ── */}
      <ScrollView
        style={[g.authFormContainer, { backgroundColor: themeColors.background }]}
        contentContainerStyle={g.authFormContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[g.h2, { color: themeColors.text }]}>Get started</Text>
        <Text style={[g.body, g.mb6, { color: themeColors.textSecondary }]}>
          Fill in the details below to create your account.
        </Text>

        {/* Profile image — also available inline for accessibility */}
        <View style={styles.inlineAvatarRow}>
          <ImageUploadButton
            uri={form.image || undefined}
            label="Profile photo"
            aspectRatio={[1, 1]}
            width={64}
            height={64}
            onSuccess={url => setForm(f => ({ ...f, image: url }))}
            onRemove={() => setForm(f => ({ ...f, image: '' }))}
          />
          <View style={styles.inlineAvatarInfo}>
            <Text style={[styles.inlineAvatarTitle, { color: themeColors.text }]}>
              Profile Photo
            </Text>
            <Text style={[styles.inlineAvatarSub, { color: themeColors.textSecondary }]}>
              {form.image ? 'Tap photo to change or × to remove' : 'Optional — tap to upload from library'}
            </Text>
          </View>
        </View>

        <InputField
          label="Full Name"
          placeholder="John Doe"
          keyboardType="default"
          autoCapitalize="words"
          autoCorrect={false}
          value={form.name}
          onChangeText={update('name')}
          leftIcon="person-outline"
          error={errors.name}
        />
        <InputField
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={form.email}
          onChangeText={update('email')}
          leftIcon="mail-outline"
          error={errors.email}
        />
        <InputField
          label="Mobile"
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
          value={form.mobile}
          onChangeText={update('mobile')}
          leftIcon="call-outline"
          error={errors.mobile}
        />
        <InputField
          label="Username"
          placeholder="your_store_handle"
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
          value={form.username}
          onChangeText={update('username')}
          leftIcon="at-outline"
          error={errors.username}
        />
        <InputField
          label="Password"
          placeholder="Min. 6 characters"
          isPassword
          value={form.password}
          onChangeText={update('password')}
          leftIcon="lock-closed-outline"
          error={errors.password}
        />
        <InputField
          label="Confirm Password"
          placeholder="Re-enter your password"
          isPassword
          value={form.confirm}
          onChangeText={update('confirm')}
          leftIcon="lock-closed-outline"
          error={errors.confirm}
        />

        <Button
          label="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          fullWidth
          size="lg"
        />

        <View style={g.authFooterRow}>
          <Text style={[g.body, { color: themeColors.textSecondary }]}>
            Already have an account?{'  '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={g.textLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Avatar in hero
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing[1],
  },
  cameraBadge: {
    position:        'absolute',
    bottom:          0,
    right:           0,
    width:           24,
    height:          24,
    borderRadius:    12,
    backgroundColor: colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     '#0F172A',
  },

  // Avatar inline in form
  inlineAvatarRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing[3],
    marginBottom:   spacing[4],
    padding:        spacing[3],
  },
  inlineAvatarInfo:  { flex: 1 },
  inlineAvatarTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  inlineAvatarSub:   { fontSize: typography.sizes.xs, marginTop: 3, lineHeight: 16 },
});