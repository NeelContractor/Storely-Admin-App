// src/components/ecommerce/StatCards.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, spacing, radii, shadows } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';

interface StatCardData {
  title: string;
  value: string;
  change: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}

interface StatCardsProps {
  stats: StatCardData[];
}

const StatCardItem: React.FC<StatCardData> = ({
  title, value, change, icon, iconBg, iconColor,
}) => {
  const { colors: themeColors } = useTheme();
  const isPositive = change >= 0;

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={[styles.changePill, { backgroundColor: isPositive ? colors.successLight : colors.dangerLight }]}>
          <Ionicons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={12}
            color={isPositive ? colors.success : colors.danger}
          />
          <Text style={[styles.changeText, { color: isPositive ? colors.success : colors.danger }]}>
            {Math.abs(change)}%
          </Text>
        </View>
      </View>
      <Text style={[styles.value, { color: themeColors.text }]}>{value}</Text>
      <Text style={[styles.title, { color: themeColors.textSecondary }]}>{title}</Text>
    </View>
  );
};

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => (
  <View style={styles.grid}>
    {stats.map((stat, i) => (
      <StatCardItem key={i} {...stat} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  card: {
    flex: 1,
    minWidth: '45%',
    borderRadius: radii.xl,
    padding: spacing[4],
    ...shadows.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  changeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
  },
  value: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});