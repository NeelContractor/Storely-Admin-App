// src/components/ui/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography, radii, spacing } from '../../theme/typography';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: '#B45309' },
  danger: { bg: colors.dangerLight, text: colors.danger },
  info: { bg: colors.infoLight, text: colors.info },
  default: { bg: colors.bgLight, text: colors.textSecondary },
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'md' }) => {
  const vs = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: vs.bg }, size === 'sm' && styles.sm]}>
      <Text style={[styles.text, { color: vs.text }, size === 'sm' && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  textSm: {
    fontSize: typography.sizes.xs,
  },
});