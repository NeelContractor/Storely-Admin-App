// src/screens/Settings/SettingsScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }          from '@expo/vector-icons';
import { Card }              from '../../components/ui/Card';
import { Avatar }            from '../../components/ui/Avatar';
import { colors }            from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme }          from '../../theme/ThemeContext';
import { useAuthStore }      from '../../store/useAuthStore';
import { useAppStore }       from '../../store/useAppStore';

// ─── SettingItem ──────────────────────────────────────────────────────────────

interface SettingItemProps {
  icon:         keyof typeof Ionicons.glyphMap;
  label:        string;
  value?:       string;
  onPress?:     () => void;
  iconColor?:   string;
  toggle?:      boolean;
  toggleValue?: boolean;
  onToggle?:    (v: boolean) => void;
  danger?:      boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon, label, value, onPress, iconColor = colors.primary,
  toggle, toggleValue, onToggle, danger,
}) => {
  const { colors: themeColors } = useTheme();

  return (
    // ✔ removed `disabled={toggle}` — it fully blocked interaction on toggle rows.
    //   activeOpacity={1} keeps the row non-pressable visually while Switch handles input.
    <TouchableOpacity
      onPress={toggle ? undefined : onPress}
      activeOpacity={toggle ? 1 : 0.7}
    >
      <View style={styles.settingItem}>
        <View style={[
          styles.settingIcon,
          { backgroundColor: (danger ? colors.danger : iconColor) + '15' },
        ]}>
          <Ionicons
            name={icon}
            size={18}
            color={danger ? colors.danger : iconColor}
          />
        </View>

        <Text style={[
          styles.settingLabel,
          { color: danger ? colors.danger : themeColors.text },
        ]}>
          {label}
        </Text>

        <View style={styles.settingRight}>
          {value && (
            <Text style={[styles.settingValue, { color: themeColors.textSecondary }]}>
              {value}
            </Text>
          )}
          {toggle ? (
            <Switch
              value={toggleValue}
              onValueChange={onToggle}
              trackColor={{ false: themeColors.border, true: colors.primary + 'A0' }}
              thumbColor={toggleValue ? colors.primary : themeColors.textSecondary}
            />
          ) : (
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── SettingGroup ─────────────────────────────────────────────────────────────

const SettingGroup: React.FC<{ title: string; children: React.ReactNode }> = ({
  title, children,
}) => {
  const { colors: themeColors } = useTheme();
  return (
    <View style={styles.group}>
      {!!title && (
        <Text style={[styles.groupTitle, { color: themeColors.textSecondary }]}>
          {title}
        </Text>
      )}
      <Card style={styles.groupCard}>
        {children}
      </Card>
    </View>
  );
};

// ─── SettingsScreen ───────────────────────────────────────────────────────────

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors, isDark, toggleTheme } = useTheme();
  const { signOut }  = useAuthStore();
  const { user }     = useAppStore();
  const insets       = useSafeAreaInsets();

  const [notifications, setNotifications] = React.useState(true);
  const [emailAlerts,   setEmailAlerts]   = React.useState(false);

  // ── Sign out: clear store then reset nav stack to SignIn ──────────────────
  const handleSignOut = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
  };

  // ── Derive first role label ────────────────────────────────────────────────
  const roleLabel = user?.roles?.[0]?.name ?? 'Admin';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing[6] }]}
      showsVerticalScrollIndicator={false}
    >

      {/* ── Profile Card ── */}
      <Card style={styles.profileCard}>
        {user?.profileImage
          ? <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          : <Avatar name={user?.name} size={46} />}

        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: themeColors.text }]}>
            {user?.name ?? 'Admin'}
          </Text>
          <Text style={[styles.profileEmail, { color: themeColors.textSecondary }]}>
            {user?.email}
          </Text>
          {/* Role badge */}
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark-outline" size={11} color={colors.primary} />
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </Card>

      {/* ── ACCOUNT ── */}
      <SettingGroup title="ACCOUNT">
        <SettingItem
          icon="person-outline"
          label="Account Settings"
          onPress={() => {/* TODO: navigate to AccountSettings */}}
        />
        <View style={styles.divider} />
        <SettingItem
          icon="lock-closed-outline"
          label="Security"
          onPress={() => {/* TODO */}}
        />
        <View style={styles.divider} />
        <SettingItem
          icon="card-outline"
          label="Billing"
          value="Pro Plan"
          onPress={() => {/* TODO */}}
        />
      </SettingGroup>

      {/* ── PREFERENCES ── */}
      <SettingGroup title="PREFERENCES">
        <SettingItem
          icon="moon-outline"
          label="Dark Mode"
          toggle
          toggleValue={isDark}
          onToggle={toggleTheme}
          iconColor="#8B5CF6"
        />
        <View style={styles.divider} />
        <SettingItem
          icon="notifications-outline"
          label="Push Notifications"
          toggle
          toggleValue={notifications}
          onToggle={setNotifications}
          iconColor={colors.warning}
        />
        <View style={styles.divider} />
        <SettingItem
          icon="mail-outline"
          label="Email Alerts"
          toggle
          toggleValue={emailAlerts}
          onToggle={setEmailAlerts}
          iconColor={colors.info}
        />
        <View style={styles.divider} />
        <SettingItem
          icon="globe-outline"
          label="Language"
          value="English"
          onPress={() => {/* TODO */}}
        />
      </SettingGroup>

      {/* ── STORE ── */}
      <SettingGroup title="STORE">
        <SettingItem
          icon="storefront-outline"
          label="Store Profile"
          onPress={() => navigation.navigate('Stores')}
        />
        <View style={styles.divider} />
        <SettingItem
          icon="card-outline"
          label="Payment Settings"
          onPress={() => {/* TODO */}}
        />
        <View style={styles.divider} />
        <SettingItem
          icon="cube-outline"
          label="Shipping & Delivery"
          onPress={() => {/* TODO */}}
        />
        <View style={styles.divider} />
        <SettingItem
          icon="people-outline"
          label="Roles & Permissions"
          onPress={() => {/* TODO */}}
        />
      </SettingGroup>

      {/* ── SUPPORT ── */}
      <SettingGroup title="SUPPORT">
        <SettingItem
          icon="help-circle-outline"
          label="Help Center"
          onPress={() => {/* TODO */}}
          iconColor={colors.success}
        />
        <View style={styles.divider} />
        <SettingItem
          icon="chatbubble-outline"
          label="Contact Support"
          onPress={() => {/* TODO */}}
          iconColor={colors.info}
        />
        <View style={styles.divider} />
        <SettingItem
          icon="document-text-outline"
          label="Privacy Policy"
          onPress={() => {/* TODO */}}
          iconColor={colors.textMuted}
        />
      </SettingGroup>

      {/* ── DANGER ── */}
      <SettingGroup title="">
        <SettingItem
          icon="log-out-outline"
          label="Sign Out"
          onPress={handleSignOut}   // ✔ resets nav stack after clearing auth
          danger
        />
      </SettingGroup>

    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: spacing[4], gap: spacing[2] },

  avatar: { width: 46, height: 46, borderRadius: 17 },

  profileCard: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[4],
    marginBottom:  spacing[2],
  },
  profileInfo:  { flex: 1 },
  profileName:  {
    fontSize:     typography.sizes.lg,
    fontWeight:   typography.weights.bold,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize:     typography.sizes.sm,
    marginBottom: spacing[1],
  },
  roleBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    alignSelf:         'flex-start',
    backgroundColor:   colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      radii.full,
    marginTop:         spacing[1],
  },
  roleText: {
    fontSize:   typography.sizes.xs,
    color:      colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  editBtn: { padding: spacing[2] },

  group:      { marginBottom: spacing[2] },
  groupTitle: {
    fontSize:          typography.sizes.xs,
    fontWeight:        typography.weights.semiBold,
    letterSpacing:     0.8,
    marginBottom:      spacing[2],
    paddingHorizontal: spacing[1],
  },
  groupCard: { padding: 0, overflow: 'hidden' },

  settingItem: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[4],
    gap:               spacing[3],
  },
  settingIcon: {
    width:           36,
    height:          36,
    borderRadius:    radii.lg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  settingLabel: {
    flex:       1,
    fontSize:   typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  settingValue: { fontSize: typography.sizes.sm },

  divider: {
    height:     1,
    backgroundColor: '#E2E8F015',
    marginLeft: spacing[4] + 36 + spacing[3],
  },
});