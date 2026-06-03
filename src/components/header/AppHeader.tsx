// src/components/header/AppHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, spacing, shadows } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/useAuthStore';

interface AppHeaderProps {
  title?: string;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showMenuButton = true,
  onMenuPress,
  showBack = false,
  onBackPress,
  rightAction,
}) => {
  const { colors: themeColors, isDark, toggleTheme } = useTheme();
  const { unreadCount } = useAppStore();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: themeColors.card,
          paddingTop: insets.top + spacing[2],
          borderBottomColor: themeColors.border,
        },
        shadows.sm,
      ]}
    >
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={themeColors.text} />
          </TouchableOpacity>
        ) : showMenuButton ? (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
            <Ionicons name="menu-outline" size={26} color={themeColors.text} />
          </TouchableOpacity>
        ) : null}
        {title && (
          <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
        )}
        {!title && (
          <View style={styles.brand}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>Storely</Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        {rightAction}
        <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={themeColors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={20} color={themeColors.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Avatar name={user?.name} size={34} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  iconBtn: { padding: spacing[1] },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  brandText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  notifBtn: { padding: spacing[1], position: 'relative' },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '700' },
});