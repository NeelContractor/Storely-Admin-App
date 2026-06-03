// src/components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography, radii, spacing } from '../../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: colors.white },
  secondary: { bg: colors.bgLight, text: colors.textPrimary },
  outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
  ghost: { bg: 'transparent', text: colors.textSecondary },
  danger: { bg: colors.danger, text: colors.white },
};

const sizeStyles: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number; borderRadius: number }> = {
  sm: { paddingV: 6, paddingH: spacing[3], fontSize: typography.sizes.sm, borderRadius: radii.md },
  md: { paddingV: 10, paddingH: spacing[5], fontSize: typography.sizes.base, borderRadius: radii.lg },
  lg: { paddingV: 14, paddingH: spacing[6], fontSize: typography.sizes.md, borderRadius: radii.lg },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}) => {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: vs.bg,
          paddingVertical: ss.paddingV,
          paddingHorizontal: ss.paddingH,
          borderRadius: ss.borderRadius,
          borderWidth: vs.border ? 1.5 : 0,
          borderColor: vs.border,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <Text style={[styles.text, { color: vs.text, fontSize: ss.fontSize }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weights.semiBold,
  },
});