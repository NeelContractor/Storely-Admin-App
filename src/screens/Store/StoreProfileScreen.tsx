// src/screens/Store/StoreProfileScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { Ionicons }                   from '@expo/vector-icons';
import * as ImagePicker               from 'expo-image-picker';
import { useTheme }                   from '../../theme/ThemeContext';
import { useAppStore }                from '../../store/useAppStore';
import { updateStore }                from '../../services/storeService';
import { uploadImageToCloudinary }    from '../../utils/cloudinaryUpload';
import { colors }                     from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import type { Store, CreateStoreBody } from '../../types/types';
import { StoreTheme }                 from '../../types/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name:      string;
  bio:       string;
  logoUrl:   string;
  bannerUrl: string;
  theme:     string;
  instagram: string;
  whatsapp:  string;
  facebook:  string;
  twitter:   string;
}

function storeToForm(store: Store): FormState {
  return {
    name:      store.name      ?? '',
    bio:       store.bio       ?? '',
    logoUrl:   store.logoUrl   ?? '',
    bannerUrl: store.bannerUrl ?? '',
    theme:     store.theme     ?? StoreTheme.MINIMAL_LIGHT,
    instagram: store.socialLinks?.instagram ?? '',
    whatsapp:  store.socialLinks?.whatsapp  ?? '',
    facebook:  store.socialLinks?.facebook  ?? '',
    twitter:   store.socialLinks?.twitter   ?? '',
  };
}

// ─── Theme Selector ───────────────────────────────────────────────────────────

interface ThemeOption {
  value:     StoreTheme;
  label:     string;
  bg:        string;
  surface:   string;
  text:      string;
  accent:    string;
  tag:       string;
  tagColor:  string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value:    StoreTheme.MINIMAL_LIGHT,
    label:    'Minimal Light',
    bg:       '#FFFFFF',
    surface:  '#F5F5F5',
    text:     '#111111',
    accent:   '#3B82F6',
    tag:      'Light',
    tagColor: '#3B82F6',
  },
  {
    value:    StoreTheme.MINIMAL_DARK,
    label:    'Minimal Dark',
    bg:       '#0F0F0F',
    surface:  '#1C1C1C',
    text:     '#F0F0F0',
    accent:   '#3B82F6',
    tag:      'Dark',
    tagColor: '#3B82F6',
  },
  {
    value:    StoreTheme.BOLD_LIGHT,
    label:    'Bold Light',
    bg:       '#FFF7ED',
    surface:  '#FFEDD5',
    text:     '#1C0A00',
    accent:   '#F97316',
    tag:      'Light',
    tagColor: '#F97316',
  },
  {
    value:    StoreTheme.BOLD_DARK,
    label:    'Bold Dark',
    bg:       '#0D0005',
    surface:  '#1A0010',
    text:     '#FAF0FA',
    accent:   '#D946EF',
    tag:      'Dark',
    tagColor: '#D946EF',
  },
  {
    value:    StoreTheme.CLASSIC,
    label:    'Classic',
    bg:       '#FFFBF0',
    surface:  '#F5ECD7',
    text:     '#2C1A00',
    accent:   '#B45309',
    tag:      'Warm',
    tagColor: '#B45309',
  },
];

const ThemePreview: React.FC<{ option: ThemeOption; size?: number }> = ({ option, size = 56 }) => {
  const s = size;
  return (
    <View style={{ width: s, height: s, borderRadius: 8, overflow: 'hidden', backgroundColor: option.bg }}>
      {/* Fake header bar */}
      <View style={{ height: s * 0.22, backgroundColor: option.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, gap: 2 }}>
        <View style={{ width: s * 0.12, height: s * 0.12, borderRadius: s * 0.06, backgroundColor: option.accent }} />
        <View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: option.text + '30' }} />
      </View>
      {/* Fake content */}
      <View style={{ flex: 1, padding: 4, gap: 3 }}>
        <View style={{ height: 4, width: '70%', borderRadius: 2, backgroundColor: option.text + '60' }} />
        <View style={{ height: 3, width: '90%', borderRadius: 2, backgroundColor: option.text + '30' }} />
        <View style={{ height: 3, width: '55%', borderRadius: 2, backgroundColor: option.text + '30' }} />
        <View style={{
          marginTop: 2, height: s * 0.18, borderRadius: 4,
          backgroundColor: option.accent, alignItems: 'center', justifyContent: 'center',
        }}>
          <View style={{ width: '50%', height: 2, borderRadius: 1, backgroundColor: '#fff' }} />
        </View>
      </View>
    </View>
  );
};

interface ThemeSelectorProps {
  value:    string;
  onChange: (val: StoreTheme) => void;
  enabled:  boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ value, onChange, enabled }) => {
  const { colors: c } = useTheme();

  return (
    <View style={ts.wrap}>
      {THEME_OPTIONS.map(option => {
        const active = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              ts.card,
              {
                backgroundColor: active ? option.accent + '12' : c.card,
                borderColor:     active ? option.accent         : c.border,
              },
              !enabled && ts.cardDisabled,
            ]}
            onPress={() => enabled && onChange(option.value)}
            activeOpacity={enabled ? 0.75 : 1}
          >
            {/* Mini store preview */}
            <ThemePreview option={option} size={52} />

            {/* Info */}
            <View style={ts.info}>
              <Text style={[ts.label, { color: active ? option.accent : c.text }]} numberOfLines={1}>
                {option.label}
              </Text>
              <View style={[ts.tag, { backgroundColor: option.tagColor + '18' }]}>
                <Text style={[ts.tagText, { color: option.tagColor }]}>{option.tag}</Text>
              </View>
            </View>

            {/* Selected checkmark */}
            {active && (
              <View style={[ts.check, { backgroundColor: option.accent }]}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const ts = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[2],
  },
  card: {
    width:         '47%',
    borderWidth:   1.5,
    borderRadius:  radii.xl,
    padding:       spacing[3],
    gap:           spacing[2],
    position:      'relative',
  },
  cardDisabled: { opacity: 0.55 },
  info: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'space-between',
    gap:           spacing[1],
  },
  label: {
    fontSize:   typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    flex:       1,
  },
  tag: {
    paddingHorizontal: spacing[2],
    paddingVertical:   2,
    borderRadius:      radii.full ?? 999,
  },
  tagText: {
    fontSize:   typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
  },
  check: {
    position:     'absolute',
    top:          -6,
    right:        -6,
    width:        18,
    height:       18,
    borderRadius: 9,
    alignItems:   'center',
    justifyContent:'center',
  },
});

// ─── Image Upload Button ──────────────────────────────────────────────────────

interface ImageUploadProps {
  uri?:         string;
  label:        string;
  aspectRatio?: [number, number];
  onSuccess:    (url: string) => void;
  onRemove?:    () => void;
  width?:       number;
  height?:      number;
}

const ImageUploadButton: React.FC<ImageUploadProps> = ({
  uri, label, aspectRatio = [1, 1], onSuccess, onRemove, width = 100, height = 100,
}) => {
  const { colors: c } = useTheme();
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:    ImagePicker.MediaTypeOptions.Images,
      quality:       0.85,
      allowsEditing: true,
      aspect:        aspectRatio,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(result.assets[0].uri);
      onSuccess(url);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message ?? 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  if (uri) {
    return (
      <View style={{ position: 'relative', width, height }}>
        <Image source={{ uri }} style={{ width, height, borderRadius: radii.lg }} resizeMode="cover" />
        <TouchableOpacity
          style={[iu.overlay, { width, height, borderRadius: radii.lg }]}
          onPress={pick}
          activeOpacity={0.7}
        >
          <View style={iu.overlayInner}>
            <Ionicons name="camera-outline" size={16} color={colors.white} />
            <Text style={iu.overlayText}>Change</Text>
          </View>
        </TouchableOpacity>
        {onRemove && (
          <TouchableOpacity style={iu.removeBtn} onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <View style={iu.removeBtnBg}>
              <Ionicons name="close" size={11} color={colors.white} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[iu.placeholder, { width, height, borderColor: c.border, backgroundColor: c.card }]}
      onPress={pick}
      disabled={uploading}
      activeOpacity={0.75}
    >
      {uploading
        ? <ActivityIndicator color={colors.primary} />
        : <>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
            <Text style={[iu.label, { color: c.textSecondary }]}>{label}</Text>
          </>
      }
    </TouchableOpacity>
  );
};

const iu = StyleSheet.create({
  placeholder: {
    borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radii.lg,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  label:       { fontSize: 10, textAlign: 'center', fontWeight: typography.weights.medium, paddingHorizontal: 4 },
  overlay:     { position: 'absolute', top: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0)' },
  overlayInner:{ backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: radii.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[1], flexDirection: 'row', alignItems: 'center', gap: 4 },
  overlayText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: typography.weights.semiBold },
  removeBtn:   { position: 'absolute', top: -6, right: -6 },
  removeBtnBg: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
});

// ─── Store Tab Pill ───────────────────────────────────────────────────────────

const StorePill: React.FC<{
  store:    Store;
  active:   boolean;
  onPress:  () => void;
}> = ({ store, active, onPress }) => {
  const { colors: c } = useTheme();
  return (
    <TouchableOpacity
      style={[
        sp.pill,
        {
          backgroundColor: active ? colors.primary        : c.card,
          borderColor:     active ? colors.primary        : c.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[sp.logo, { backgroundColor: active ? 'rgba(255,255,255,0.2)' : c.background }]}>
        {store.logoUrl
          ? <Image source={{ uri: store.logoUrl }} style={sp.logoImg} resizeMode="cover" />
          : <Text style={[sp.logoInitial, { color: active ? colors.white : c.textSecondary }]}>
              {store.name.charAt(0).toUpperCase()}
            </Text>
        }
      </View>
      <View style={sp.info}>
        <Text style={[sp.name, { color: active ? colors.white : c.text }]} numberOfLines={1}>
          {store.name}
        </Text>
        <Text style={[sp.username, { color: active ? 'rgba(255,255,255,0.7)' : c.textSecondary }]} numberOfLines={1}>
          @{store.username}
        </Text>
      </View>
      {active && <Ionicons name="checkmark-circle" size={16} color={colors.white} style={{ marginLeft: 2 }} />}
    </TouchableOpacity>
  );
};

const sp = StyleSheet.create({
  pill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical:   spacing[2],
    borderRadius:      radii.xl,
    borderWidth:       1.5,
    minWidth:          140,
    maxWidth:          200,
  },
  logo:        { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImg:     { width: 28, height: 28 },
  logoInitial: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  info:        { flex: 1, minWidth: 0 },
  name:        { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  username:    { fontSize: typography.sizes.xs, marginTop: 1 },
});

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: string; title: string; color?: string }> = ({ icon, title, color }) => {
  const { colors: c } = useTheme();
  const col = color ?? colors.primary;
  return (
    <View style={sh.row}>
      <View style={[sh.iconWrap, { backgroundColor: col + '18' }]}>
        <Ionicons name={icon as any} size={15} color={col} />
      </View>
      <Text style={[sh.title, { color: c.text }]}>{title}</Text>
    </View>
  );
};
const sh = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] },
  iconWrap: { width: 28, height: 28, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  title:    { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
});

// ─── Labeled Field ────────────────────────────────────────────────────────────

const LabeledField: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => {
  const { colors: c } = useTheme();
  return (
    <View style={lf.wrap}>
      <Text style={[lf.label, { color: c.textSecondary }]}>{label}</Text>
      {children}
      {hint && <Text style={[lf.hint, { color: c.textSecondary }]}>{hint}</Text>}
    </View>
  );
};
const lf = StyleSheet.create({
  wrap:  { marginBottom: spacing[4] },
  label: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, marginBottom: spacing[2] },
  hint:  { fontSize: typography.sizes.xs, marginTop: 4, opacity: 0.7 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const BANNER_H  = 160;
const LOGO_SIZE = 72;

export const StoreProfileScreen: React.FC<{ navigation: any }> = () => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const { stores, activeStore, setActiveStore, updateStoreInList } = useAppStore();

  const [selectedStore, setSelectedStore] = useState<Store>(
    activeStore ?? stores[0]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [form, setForm] = useState<FormState>(() => storeToForm(selectedStore));

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val })), []);

  const handleSelectStore = (store: Store) => {
    if (isEditing) {
      Alert.alert(
        'Unsaved changes',
        'You have unsaved edits. Discard and switch store?',
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => switchStore(store) },
        ],
      );
    } else {
      switchStore(store);
    }
  };

  const switchStore = (store: Store) => {
    setSelectedStore(store);
    setActiveStore(store);
    setForm(storeToForm(store));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm(storeToForm(selectedStore));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Validation', 'Store name is required.'); return; }
    setIsSaving(true);
    try {
      const body: Partial<CreateStoreBody> = {
        name:      form.name.trim(),
        bio:       form.bio.trim(),
        logoUrl:   form.logoUrl.trim(),
        bannerUrl: form.bannerUrl.trim(),
        theme:     form.theme,
        socialLinks: {
          instagram: form.instagram.trim(),
          whatsapp:  form.whatsapp.trim(),
          facebook:  form.facebook.trim(),
          twitter:   form.twitter.trim(),
        },
      };
      await updateStore(selectedStore.username, body);

      const updated: Store = { ...selectedStore, ...body, theme: body.theme as StoreTheme, socialLinks: body.socialLinks! };
      updateStoreInList(updated);
      setSelectedStore(updated);

      setIsEditing(false);
      Alert.alert('Saved', `"${updated.name}" updated successfully.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to update store.');
    } finally {
      setIsSaving(false);
    }
  };

  // Derive the active theme option for displaying the label in the stat row
  const activeThemeOption = THEME_OPTIONS.find(o => o.value === form.theme) ?? THEME_OPTIONS[0];

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isEditing ? themeColors.card : themeColors.background,
      borderColor:     themeColors.border,
      color:           themeColors.text,
    },
  ];

  if (!stores.length) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: themeColors.textSecondary, marginTop: spacing[3] }}>No stores found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing[10] }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Store Switcher ── */}
        {stores.length > 1 && (
          <View style={styles.switcherSection}>
            <Text style={[styles.switcherLabel, { color: themeColors.textSecondary }]}>
              YOUR STORES ({stores.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.switcherScroll}
            >
              {stores.map(store => (
                <StorePill
                  key={store.id}
                  store={store}
                  active={store.id === selectedStore.id}
                  onPress={() => handleSelectStore(store)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Hero Banner ── */}
        <View style={styles.heroWrap}>
          {form.bannerUrl ? (
            <Image source={{ uri: form.bannerUrl }} style={styles.banner} resizeMode="cover" />
          ) : (
            <View style={[styles.banner, styles.bannerPlaceholder]}>
              <Ionicons name="image-outline" size={36} color="rgba(255,255,255,0.3)" />
              <Text style={styles.bannerPlaceholderText}>No banner</Text>
            </View>
          )}

          {isEditing && (
            <View style={styles.bannerUploadBtn}>
              <ImageUploadButton
                label="Change banner"
                aspectRatio={[16, 9]}
                width={124}
                height={36}
                onSuccess={url => set('bannerUrl', url)}
              />
            </View>
          )}

          <View style={[styles.logoWrap, { borderColor: themeColors.background }]}>
            {isEditing ? (
              <ImageUploadButton
                uri={form.logoUrl || undefined}
                label="Logo"
                aspectRatio={[1, 1]}
                width={LOGO_SIZE}
                height={LOGO_SIZE}
                onSuccess={url => set('logoUrl', url)}
                onRemove={() => set('logoUrl', '')}
              />
            ) : form.logoUrl ? (
              <Image source={{ uri: form.logoUrl }} style={styles.logo} resizeMode="cover" />
            ) : (
              <View style={[styles.logo, styles.logoPlaceholder]}>
                <Text style={styles.logoInitial}>{selectedStore.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>

          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, { color: themeColors.text }]}>{selectedStore.name}</Text>
            <Text style={styles.heroUsername}>@{selectedStore.username}</Text>
          </View>
        </View>

        {/* ── Action row ── */}
        <View style={[styles.actionRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.statItem}>
            {/* Show a colour dot + short theme label */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: activeThemeOption.accent,
              }} />
              <Text style={[styles.statValue, { color: themeColors.text }]} numberOfLines={1}>
                {activeThemeOption.label}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Theme</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: themeColors.text }]} numberOfLines={1}>
              {stores.length}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Total Stores</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <TouchableOpacity
            style={[styles.editBtn, isEditing && { backgroundColor: themeColors.border }]}
            onPress={isEditing ? handleCancel : () => setIsEditing(true)}
          >
            <Ionicons
              name={isEditing ? 'close' : 'pencil'}
              size={15}
              color={isEditing ? themeColors.text : colors.white}
            />
            <Text style={[styles.editBtnText, { color: isEditing ? themeColors.text : colors.white }]}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Store Info ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="storefront-outline" title="Store Info" />

          <LabeledField label="Store Name" hint="Displayed to customers on your storefront">
            <TextInput
              style={inputStyle}
              value={form.name}
              onChangeText={v => set('name', v)}
              editable={isEditing}
              placeholder="My Awesome Store"
              placeholderTextColor={colors.textMuted}
            />
          </LabeledField>

          <LabeledField label="Bio / Description">
            <TextInput
              style={[inputStyle, styles.textarea]}
              value={form.bio}
              onChangeText={v => set('bio', v)}
              editable={isEditing}
              placeholder="Tell customers about your store…"
              placeholderTextColor={colors.textMuted}
              multiline numberOfLines={3} textAlignVertical="top"
            />
          </LabeledField>

          {/* ── Theme Selector (replaces the old TextInput) ── */}
          <LabeledField
            label="Theme"
            hint={isEditing ? 'Choose a visual style for your storefront.' : undefined}
          >
            <ThemeSelector
              value={form.theme}
              onChange={val => set('theme', val)}
              enabled={isEditing}
            />
          </LabeledField>
        </View>

        {/* ── Media ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="images-outline" title="Media" color="#8B5CF6" />

          <LabeledField label="Logo">
            <View style={styles.mediaRow}>
              <ImageUploadButton
                uri={form.logoUrl || undefined}
                label="Upload logo"
                aspectRatio={[1, 1]}
                width={72} height={72}
                onSuccess={url => set('logoUrl', url)}
                onRemove={() => set('logoUrl', '')}
              />
              <View style={{ flex: 1, justifyContent: 'center' }}>
                {form.logoUrl
                  ? <Text style={[styles.urlPreview, { color: themeColors.textSecondary }]} numberOfLines={2}>{form.logoUrl}</Text>
                  : <Text style={[styles.mediaHint, { color: themeColors.textSecondary }]}>Square (1:1). Tap to upload.</Text>
                }
              </View>
            </View>
          </LabeledField>

          <LabeledField label="Banner">
            <View style={styles.mediaRow}>
              <ImageUploadButton
                uri={form.bannerUrl || undefined}
                label="Upload banner"
                aspectRatio={[16, 9]}
                width={120} height={68}
                onSuccess={url => set('bannerUrl', url)}
                onRemove={() => set('bannerUrl', '')}
              />
              <View style={{ flex: 1, justifyContent: 'center' }}>
                {form.bannerUrl
                  ? <Text style={[styles.urlPreview, { color: themeColors.textSecondary }]} numberOfLines={2}>{form.bannerUrl}</Text>
                  : <Text style={[styles.mediaHint, { color: themeColors.textSecondary }]}>Wide (16:9). Tap to upload.</Text>
                }
              </View>
            </View>
          </LabeledField>
        </View>

        {/* ── Social Links ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="share-social-outline" title="Social Links" color="#0891b2" />

          {([
            { key: 'instagram', icon: 'logo-instagram', color: '#E1306C', placeholder: 'instagram.com/yourstore' },
            { key: 'whatsapp',  icon: 'logo-whatsapp',  color: '#25D366', placeholder: '+91 98765 43210'        },
            { key: 'facebook',  icon: 'logo-facebook',  color: '#1877F2', placeholder: 'facebook.com/yourstore' },
            { key: 'twitter',   icon: 'logo-twitter',   color: '#1DA1F2', placeholder: '@yourstore'             },
          ] as const).map(social => (
            <LabeledField key={social.key} label={social.key.charAt(0).toUpperCase() + social.key.slice(1)}>
              <View style={styles.socialRow}>
                <View style={[styles.socialIcon, { backgroundColor: social.color + '15' }]}>
                  <Ionicons name={social.icon as any} size={18} color={social.color} />
                </View>
                <TextInput
                  style={[inputStyle, { flex: 1 }]}
                  value={form[social.key as keyof FormState]}
                  onChangeText={v => set(social.key as keyof FormState, v)}
                  editable={isEditing}
                  placeholder={social.placeholder}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </LabeledField>
          ))}
        </View>

        {/* ── Read-only Details ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="information-circle-outline" title="Store Details" color={colors.success} />
          {[
            { label: 'Username',   value: selectedStore.username },
            { label: 'Created At', value: selectedStore.createdAt
                ? new Date(selectedStore.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'
            },
          ].map((row, i, arr) => (
            <View
              key={row.label}
              style={[
                styles.infoRow,
                { borderBottomColor: themeColors.border },
                i === arr.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Save Button ── */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving
              ? <ActivityIndicator color={colors.white} size="small" />
              : <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
            }
          </TouchableOpacity>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:    { gap: spacing[3] },

  switcherSection: { paddingTop: spacing[4] },
  switcherLabel: {
    fontSize:          typography.sizes.xs,
    fontWeight:        typography.weights.semiBold,
    letterSpacing:     0.8,
    marginBottom:      spacing[2],
    paddingHorizontal: spacing[4],
  },
  switcherScroll: {
    paddingHorizontal: spacing[4],
    gap:               spacing[2],
    paddingBottom:     spacing[1],
  },

  heroWrap: { position: 'relative', marginBottom: LOGO_SIZE / 2 + spacing[4] },
  banner:   { width: '100%', height: BANNER_H },
  bannerPlaceholder: {
    backgroundColor: '#1C2434',
    alignItems: 'center', justifyContent: 'center', gap: spacing[2],
  },
  bannerPlaceholderText: { color: 'rgba(255,255,255,0.35)', fontSize: typography.sizes.sm },
  bannerUploadBtn:       { position: 'absolute', bottom: spacing[2], right: spacing[3] },

  logoWrap: {
    position:     'absolute',
    bottom:       -(LOGO_SIZE / 2),
    left:         spacing[4],
    width:        LOGO_SIZE,
    height:       LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth:  3,
    overflow:     'hidden',
  },
  logo:            { width: LOGO_SIZE, height: LOGO_SIZE },
  logoPlaceholder: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoInitial:     { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.white },
  heroInfo: {
    position: 'absolute',
    bottom:   -(LOGO_SIZE / 2 + spacing[1]),
    left:     LOGO_SIZE + spacing[4] + spacing[3],
  },
  heroName:     { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  heroUsername: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },

  actionRow: {
    flexDirection:     'row',
    alignItems:        'center',
    marginHorizontal:  spacing[4],
    borderRadius:      radii.xl,
    borderWidth:       1,
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[3],
    gap:               spacing[3],
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statValue:   { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  statLabel:   { fontSize: typography.sizes.xs, marginTop: 2 },
  statDivider: { width: 1, height: 28 },
  editBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[1],
    backgroundColor:   colors.primary,
    borderRadius:      radii.lg,
    paddingHorizontal: spacing[3],
    paddingVertical:   spacing[2],
  },
  editBtnText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },

  card: {
    marginHorizontal: spacing[4],
    borderRadius:     radii.xl,
    borderWidth:      1,
    padding:          spacing[5],
  },

  input: {
    borderWidth:       1.5,
    borderRadius:      radii.lg,
    paddingHorizontal: spacing[4],
    paddingVertical:   Platform.OS === 'ios' ? spacing[3] : spacing[2],
    fontSize:          typography.sizes.base,
  },
  textarea: { minHeight: 80, paddingTop: spacing[3] },

  mediaRow:   { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  mediaHint:  { fontSize: typography.sizes.xs, lineHeight: 16 },
  urlPreview: { fontSize: typography.sizes.xs },

  socialRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  socialIcon: { width: 40, height: 40, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing[3], borderBottomWidth: 1,
  },
  infoLabel: { fontSize: typography.sizes.sm },
  infoValue: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, flexShrink: 1, textAlign: 'right', marginLeft: spacing[4] },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2],
    backgroundColor: colors.primary, borderRadius: radii.xl, paddingVertical: spacing[4],
    marginHorizontal: spacing[4], marginTop: spacing[2],
  },
  saveBtnText: { color: colors.white, fontSize: typography.sizes.lg, fontWeight: typography.weights.semiBold },
});