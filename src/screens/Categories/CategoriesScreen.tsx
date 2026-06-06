// src/screens/Categories/CategoriesScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { Ionicons }                   from '@expo/vector-icons';
import * as ImagePicker               from 'expo-image-picker';
import { useTheme }                   from '../../theme/ThemeContext';
import { useAppStore }                from '../../store/useAppStore';
import { useCategoryStore }           from '../../store/useCategoryStore';
import type { Category }              from '../../store/useCategoryStore';
import { uploadImageToCloudinary }    from '../../utils/cloudinaryUpload';
import { colors }                     from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import {
  createCategories,
  updateCategories,
  activateCategories,
  deactivateCategories,
} from '../../services/productService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  const base = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  return base ? `${base}-${Date.now().toString(36)}` : '';
}

function sortByOrder<T extends { displayOrder?: number | null }>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

type CategoryWithChildren = Category & { _children: CategoryWithChildren[] };

function buildTree(all: Category[], parentId = 0): CategoryWithChildren[] {
  return sortByOrder(all.filter(c => (c.parentId ?? 0) === parentId))
    .map(c => ({ ...c, _children: buildTree(all, c.id) }));
}

function flattenTree(tree: CategoryWithChildren[], depth = 0): { cat: CategoryWithChildren; depth: number }[] {
  const result: { cat: CategoryWithChildren; depth: number }[] = [];
  for (const node of tree) {
    result.push({ cat: node, depth });
    if (node._children.length > 0) result.push(...flattenTree(node._children, depth + 1));
  }
  return result;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryForm {
  name: string; slug: string; description: string;
  imageUrl: string; parentId: number; displayOrder: number;
}
const EMPTY_FORM: CategoryForm = {
  name: '', slug: '', description: '', imageUrl: '', parentId: 0, displayOrder: 0,
};

// ─── Image Upload ─────────────────────────────────────────────────────────────

const ImageUploadButton: React.FC<{
  uri?: string; onSuccess: (url: string) => void; onRemove: () => void;
}> = ({ uri, onSuccess, onRemove }) => {
  const { colors: c } = useTheme();
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Allow photo library access.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      quality: 0.85, allowsEditing: true, aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(result.assets[0].uri);
      onSuccess(url);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message ?? 'Could not upload image.');
    } finally { setUploading(false); }
  };

  if (uri) {
    return (
      <View style={{ position: 'relative', width: 68, height: 68 }}>
        <Image source={{ uri }} style={{ width: 68, height: 68, borderRadius: radii.lg }} resizeMode="cover" />
        <TouchableOpacity style={img.change} onPress={pick} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={11} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={img.remove} onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Ionicons name="close" size={9} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={[img.placeholder, { borderColor: c.border, backgroundColor: c.card }]}
      onPress={pick} disabled={uploading} activeOpacity={0.75}
    >
      {uploading
        ? <ActivityIndicator color={colors.primary} size="small" />
        : <>
            <Ionicons name="image-outline" size={20} color={colors.primary} />
            <Text style={[img.label, { color: c.textSecondary }]}>Photo</Text>
          </>}
    </TouchableOpacity>
  );
};
const img = StyleSheet.create({
  placeholder: {
    width: 68, height: 68, borderWidth: 1.5, borderStyle: 'dashed',
    borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  label:  { fontSize: 10, fontWeight: '600' },
  change: { position: 'absolute', bottom: 3, right: 3, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: 3 },
  remove: {
    position: 'absolute', top: -5, right: -5, width: 16, height: 16,
    borderRadius: 8, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
  },
});

// ─── Category Form Modal ──────────────────────────────────────────────────────

interface CategoryModalProps {
  visible: boolean; mode: 'create' | 'edit'; initial?: Category;
  defaultParent: number; allCategories: Category[];
  storeUsername: string; onSuccess: () => void; onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  visible, mode, initial, defaultParent, allCategories, storeUsername, onSuccess, onClose,
}) => {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const [form, setForm]   = useState<CategoryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (mode === 'edit' && initial) {
      setForm({
        name: initial.name, slug: initial.slug,
        description: initial.description ?? '', imageUrl: initial.imageUrl ?? '',
        parentId: initial.parentId ?? 0, displayOrder: initial.displayOrder ?? 0,
      });
    } else {
      setForm({ ...EMPTY_FORM, parentId: defaultParent });
    }
    setError(null);
  }, [visible, mode, initial, defaultParent]);

  const set = <K extends keyof CategoryForm>(key: K, val: CategoryForm[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleNameChange = (name: string) =>
    setForm(f => ({ ...f, name, slug: generateSlug(name) }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.slug.trim()) { setError('Slug is required.'); return; }
    setSaving(true); setError(null);
    try {
      const body = {
        name: form.name.trim(), slug: form.slug.trim(),
        description: form.description.trim(), imageUrl: form.imageUrl.trim(),
        parentId: form.parentId, displayOrder: Number(form.displayOrder),
      };
      if (mode === 'create') await createCategories(storeUsername, body);
      else if (initial)      await updateCategories(initial.id, body);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || `Failed to ${mode} category.`);
      setSaving(false);
    }
  };

  const buildOptions = (parentId: number, excludeId: number | undefined, depth: number): { id: number; label: string }[] => {
    const opts: { id: number; label: string }[] = [];
    const children = allCategories
      .filter(cat => (cat.parentId ?? 0) === parentId && cat.id !== excludeId)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    for (const cat of children) {
      opts.push({ id: cat.id, label: `${'  '.repeat(depth)}${depth > 0 ? '↳ ' : ''}${cat.name}` });
      opts.push(...buildOptions(cat.id, excludeId, depth + 1));
    }
    return opts;
  };
  const parentOptions = buildOptions(0, initial?.id, 0);

  const inputStyle = [mst.input, { backgroundColor: c.background, borderColor: c.border, color: c.text }];
  const parentName = form.parentId === 0
    ? 'Root (top-level)'
    : allCategories.find(cat => cat.id === form.parentId)?.name ?? 'Select…';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={[mst.container, { backgroundColor: c.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ── */}
        <View style={[mst.header, { borderBottomColor: c.border }]}>
          <View style={mst.headerLeft}>
            <View style={[mst.headerDot, { backgroundColor: mode === 'create' ? colors.primary : '#8B5CF6' }]} />
            <View>
              <Text style={[mst.headerTitle, { color: c.text }]}>
                {mode === 'create' ? (form.parentId ? 'New Sub-category' : 'New Category') : 'Edit Category'}
              </Text>
              <Text style={[mst.headerSub, { color: c.textSecondary }]}>
                {mode === 'create'
                  ? form.parentId
                    ? `Under "${allCategories.find(x => x.id === form.parentId)?.name ?? ''}"`
                    : `@${storeUsername}`
                  : `Editing "${initial?.name}"`}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={[mst.closeBtn, { backgroundColor: c.card }]} onPress={onClose}>
            <Ionicons name="close" size={16} color={c.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[mst.body, { paddingBottom: insets.bottom + 120 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={[mst.errorBanner, { backgroundColor: colors.danger + '12', borderColor: colors.danger + '35' }]}>
              <Ionicons name="alert-circle-outline" size={15} color={colors.danger} />
              <Text style={[mst.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}

          {/* Parent */}
          <View style={mst.field}>
            <Text style={[mst.label, { color: c.textSecondary }]}>Parent Category</Text>
            <TouchableOpacity
              style={[mst.selector, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => Alert.alert('Select Parent', undefined, [
                { text: 'Root (top-level)', onPress: () => set('parentId', 0) },
                ...parentOptions.map(opt => ({ text: opt.label, onPress: () => set('parentId', opt.id) })),
                { text: 'Cancel', style: 'cancel' as const },
              ])}
            >
              <View style={[mst.selectorDot, { backgroundColor: form.parentId === 0 ? colors.primary + '60' : '#8B5CF6' + '60' }]} />
              <Text style={[mst.selectorText, { color: c.text }]}>{parentName}</Text>
              <Ionicons name="chevron-expand" size={14} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <View style={mst.field}>
            <View style={mst.labelRow}>
              <Text style={[mst.label, { color: c.textSecondary }]}>Name</Text>
              <Text style={{ color: colors.danger, fontSize: 12 }}>required</Text>
            </View>
            <TextInput
              style={inputStyle} value={form.name} onChangeText={handleNameChange}
              placeholder="e.g. Clothing" placeholderTextColor={colors.textMuted} autoFocus
            />
          </View>

          {/* Slug */}
          <View style={mst.field}>
            <View style={mst.labelRow}>
              <Text style={[mst.label, { color: c.textSecondary }]}>Slug</Text>
              <Text style={[mst.chip, { backgroundColor: c.card, color: c.textSecondary }]}>auto-generated</Text>
            </View>
            <TextInput
              style={[inputStyle, mst.mono]} value={form.slug}
              onChangeText={v => set('slug', v)}
              placeholder="auto-generated" placeholderTextColor={colors.textMuted}
              autoCapitalize="none" autoCorrect={false} readOnly
            />
          </View>

          {/* Description */}
          <View style={mst.field}>
            <View style={mst.labelRow}>
              <Text style={[mst.label, { color: c.textSecondary }]}>Description</Text>
              <Text style={[mst.chip, { backgroundColor: c.card, color: c.textSecondary }]}>optional</Text>
            </View>
            <TextInput
              style={[inputStyle, mst.textarea]} value={form.description}
              onChangeText={v => set('description', v)}
              placeholder="Describe this category…" placeholderTextColor={colors.textMuted}
              multiline numberOfLines={3} textAlignVertical="top"
            />
          </View>

          {/* Image */}
          <View style={mst.field}>
            <View style={mst.labelRow}>
              <Text style={[mst.label, { color: c.textSecondary }]}>Image</Text>
              <Text style={[mst.chip, { backgroundColor: c.card, color: c.textSecondary }]}>optional</Text>
            </View>
            <View style={mst.imageRow}>
              <ImageUploadButton
                uri={form.imageUrl || undefined}
                onSuccess={url => set('imageUrl', url)}
                onRemove={() => set('imageUrl', '')}
              />
              <View style={{ flex: 1 }}>
                {form.imageUrl
                  ? <Text style={[mst.urlText, { color: c.textSecondary }]} numberOfLines={3}>{form.imageUrl}</Text>
                  : <Text style={[mst.hintText, { color: c.textSecondary }]}>Square image recommended. Tap to upload from your library.</Text>}
              </View>
            </View>
          </View>

          {/* Display Order */}
          <View style={mst.field}>
            <Text style={[mst.label, { color: c.textSecondary }]}>Priority</Text>
            <View style={mst.orderRow}>
              {[
                { label: 'High',   value: 0, color: '#D97706', bg: '#FEF3C7' },
                { label: 'Medium', value: 1, color: colors.primary, bg: colors.primary + '15' },
                { label: 'Low',    value: 2, color: c.textSecondary, bg: c.card },
              ].map(opt => {
                const active = form.displayOrder === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[mst.orderBtn, {
                      backgroundColor: active ? opt.bg : c.background,
                      borderColor: active ? opt.color + '50' : c.border,
                    }]}
                    onPress={() => set('displayOrder', opt.value)}
                  >
                    <View style={[mst.orderDot, { backgroundColor: active ? opt.color : c.border }]} />
                    <Text style={[mst.orderText, { color: active ? opt.color : c.textSecondary }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* ── Footer ── */}
        <View style={[mst.footer, { borderTopColor: c.border, paddingBottom: insets.bottom + spacing[3] }]}>
          <TouchableOpacity style={[mst.cancelBtn, { borderColor: c.border }]} onPress={onClose}>
            <Text style={[mst.cancelText, { color: c.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[mst.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <Ionicons name={mode === 'create' ? 'add-circle-outline' : 'checkmark-circle-outline'} size={17} color="#fff" />
                  <Text style={mst.saveText}>{mode === 'create' ? 'Create' : 'Save Changes'}</Text>
                </>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const mst = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingVertical: spacing[4], borderBottomWidth: 1,
  },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  headerDot:    { width: 4, height: 36, borderRadius: 2 },
  headerTitle:  { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  headerSub:    { fontSize: typography.sizes.xs, marginTop: 2 },
  closeBtn:     { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  body:         { padding: spacing[5], gap: spacing[2] },
  field:        { marginBottom: spacing[4] },
  labelRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] },
  label:        { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  chip:         { fontSize: 10, fontWeight: '600', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  hintText:     { fontSize: 11, lineHeight: 16, opacity: 0.7 },
  input: {
    borderWidth: 1.5, borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: Platform.OS === 'ios' ? spacing[3] : spacing[2],
    fontSize: typography.sizes.base,
  },
  mono:         { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
  textarea:     { minHeight: 72, paddingTop: spacing[3] },
  imageRow:     { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  urlText:      { fontSize: 11, lineHeight: 16 },
  selector: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    borderWidth: 1.5, borderRadius: radii.lg,
    paddingHorizontal: spacing[4], paddingVertical: Platform.OS === 'ios' ? spacing[3] : spacing[2],
  },
  selectorDot:  { width: 8, height: 8, borderRadius: 4 },
  selectorText: { flex: 1, fontSize: typography.sizes.base },
  orderRow:     { flexDirection: 'row', gap: spacing[2] },
  orderBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderWidth: 1.5, borderRadius: radii.lg,
    paddingVertical: spacing[2] + 2,
  },
  orderDot:   { width: 7, height: 7, borderRadius: 4 },
  orderText:  { fontSize: 12, fontWeight: '700' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    borderWidth: 1, borderRadius: radii.lg, padding: spacing[3], marginBottom: spacing[4],
  },
  errorText:  { fontSize: typography.sizes.sm, flex: 1 },
  footer: {
    flexDirection: 'row', gap: spacing[3],
    paddingHorizontal: spacing[5], paddingTop: spacing[3], borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: radii.xl,
    paddingVertical: spacing[3], alignItems: 'center',
  },
  cancelText: { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
  saveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing[2], backgroundColor: colors.primary, borderRadius: radii.xl, paddingVertical: spacing[3],
  },
  saveText: { color: '#fff', fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
});

// ─── Toggle Confirm Sheet ─────────────────────────────────────────────────────

const ToggleConfirmModal: React.FC<{
  visible: boolean; type: 'activate' | 'deactivate';
  category: Category | null; loading: boolean;
  onConfirm: () => void; onClose: () => void;
}> = ({ visible, type, category, loading, onConfirm, onClose }) => {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const isActivate = type === 'activate';
  const accent = isActivate ? '#10B981' : '#F59E0B';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={tc.overlay}>
        <View style={[tc.sheet, { backgroundColor: c.background, paddingBottom: insets.bottom + spacing[4] }]}>
          <View style={[tc.handle, { backgroundColor: c.border }]} />
          <View style={[tc.iconWrap, { backgroundColor: accent + '15' }]}>
            <Ionicons name={isActivate ? 'checkmark-circle' : 'pause-circle'} size={32} color={accent} />
          </View>
          <Text style={[tc.title, { color: c.text }]}>{isActivate ? 'Activate' : 'Deactivate'}?</Text>
          <Text style={[tc.name, { color: c.text }]}>"{category?.name}"</Text>
          {!isActivate && (
            <View style={[tc.info, { backgroundColor: c.card }]}>
              <Text style={[tc.infoText, { color: c.textSecondary }]}>
                Products remain visible but won't appear in category filters.
              </Text>
            </View>
          )}
          <View style={tc.btns}>
            <TouchableOpacity style={[tc.cancelBtn, { borderColor: c.border }]} onPress={onClose}>
              <Text style={[tc.cancelText, { color: c.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[tc.confirmBtn, { backgroundColor: accent, opacity: loading ? 0.6 : 1 }]}
              onPress={onConfirm} disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={tc.confirmText}>{isActivate ? 'Activate' : 'Deactivate'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const tc = StyleSheet.create({
  overlay:    { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:      { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing[6], paddingTop: spacing[4], alignItems: 'center' },
  handle:     { width: 36, height: 4, borderRadius: 2, marginBottom: spacing[5] },
  iconWrap:   { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3] },
  title:      { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, marginBottom: spacing[2] },
  name:       { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold, marginBottom: spacing[4], textAlign: 'center' },
  info:       { borderRadius: radii.lg, padding: spacing[3], marginBottom: spacing[4], width: '100%' },
  infoText:   { fontSize: typography.sizes.sm, textAlign: 'center', lineHeight: 18 },
  btns:       { flexDirection: 'row', gap: spacing[3], width: '100%' },
  cancelBtn:  { flex: 1, borderWidth: 1.5, borderRadius: radii.xl, paddingVertical: spacing[3], alignItems: 'center' },
  cancelText: { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
  confirmBtn: { flex: 1, borderRadius: radii.xl, paddingVertical: spacing[3], alignItems: 'center' },
  confirmText:{ color: '#fff', fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
});

// ─── Category Card ────────────────────────────────────────────────────────────

const DEPTH_COLORS = ['#6366F1', '#0891B2', '#059669', '#D97706', '#DC2626'];

const CategoryCard: React.FC<{
  cat: CategoryWithChildren; depth: number;
  onEdit: (c: Category) => void;
  onToggle: (c: Category, type: 'activate' | 'deactivate') => void;
  onAddChild: (parentId: number) => void;
  isExpanded: boolean; hasChildren: boolean;
  onToggleExpand: () => void;
}> = ({ cat, depth, onEdit, onToggle, onAddChild, isExpanded, hasChildren, onToggleExpand }) => {
  const { colors: c } = useTheme();
  const isActive    = cat.active !== false;
  const accentColor = DEPTH_COLORS[depth % DEPTH_COLORS.length];
  const initials    = cat.name.slice(0, 2).toUpperCase();

  return (
    <View style={[
      cr.card,
      {
        backgroundColor: c.card,
        borderColor: c.border,
        marginLeft: depth * 14,
        borderLeftColor: accentColor,
        borderLeftWidth: 3,
        opacity: isActive ? 1 : 0.55,
      },
    ]}>
      {/* ── Top row ── */}
      <View style={cr.top}>
        {/* Avatar */}
        <View style={[cr.avatar, { backgroundColor: accentColor + '18' }]}>
          {cat.imageUrl
            ? <Image source={{ uri: cat.imageUrl }} style={cr.avatarImg} resizeMode="cover" />
            : <Text style={[cr.avatarText, { color: accentColor }]}>{initials}</Text>}
        </View>

        {/* Info */}
        <View style={cr.info}>
          <Text style={[cr.name, { color: c.text }]} numberOfLines={1}>{cat.name}</Text>
          <Text style={[cr.slug, { color: c.textSecondary }]} numberOfLines={1}>/{cat.slug}</Text>
          {cat.description ? (
            <Text style={[cr.desc, { color: c.textSecondary }]} numberOfLines={1}>{cat.description}</Text>
          ) : null}
        </View>

        {/* Right controls */}
        <View style={cr.right}>
          {/* Status pill */}
          <View style={[cr.statusPill, {
            backgroundColor: isActive ? '#10B981' + '18' : c.background,
          }]}>
            <View style={[cr.statusDot, { backgroundColor: isActive ? '#10B981' : c.textSecondary }]} />
            <Text style={[cr.statusText, { color: isActive ? '#065F46' : c.textSecondary }]}>
              {isActive ? 'Live' : 'Off'}
            </Text>
          </View>
          {/* Expand */}
          {hasChildren && (
            <TouchableOpacity style={[cr.expandBtn, { backgroundColor: c.background }]} onPress={onToggleExpand}>
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={13} color={c.textSecondary}
              />
              <Text style={[cr.childCount, { color: c.textSecondary }]}>{cat._children.length}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Action strip ── */}
      <View style={[cr.actions, { borderTopColor: c.border }]}>
        <TouchableOpacity style={cr.actionBtn} onPress={() => onEdit(cat)}>
          <Ionicons name="pencil-outline" size={13} color={colors.primary} />
          <Text style={[cr.actionText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>

        <View style={[cr.divider, { backgroundColor: c.border }]} />

        <TouchableOpacity style={cr.actionBtn} onPress={() => onAddChild(cat.id)}>
          <Ionicons name="git-branch-outline" size={13} color="#8B5CF6" />
          <Text style={[cr.actionText, { color: '#8B5CF6' }]}>Add Sub</Text>
        </TouchableOpacity>

        <View style={[cr.divider, { backgroundColor: c.border }]} />

        {isActive ? (
          <TouchableOpacity style={cr.actionBtn} onPress={() => onToggle(cat, 'deactivate')}>
            <Ionicons name="pause-circle-outline" size={13} color="#D97706" />
            <Text style={[cr.actionText, { color: '#D97706' }]}>Disable</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={cr.actionBtn} onPress={() => onToggle(cat, 'activate')}>
            <Ionicons name="play-circle-outline" size={13} color="#10B981" />
            <Text style={[cr.actionText, { color: '#10B981' }]}>Enable</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const cr = StyleSheet.create({
  card: {
    borderWidth: 1, borderRadius: radii.xl,
    marginHorizontal: spacing[4], marginBottom: spacing[2],
    overflow: 'hidden',
  },
  top:        { flexDirection: 'row', gap: spacing[3], padding: spacing[3], alignItems: 'center' },
  avatar: {
    width: 44, height: 44, borderRadius: radii.lg,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
  },
  avatarImg:  { width: 44, height: 44 },
  avatarText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  info:       { flex: 1, gap: 2 },
  name:       { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold, lineHeight: 20 },
  slug:       { fontSize: 11, opacity: 0.7 },
  desc:       { fontSize: 11, opacity: 0.6, lineHeight: 15 },
  right:      { alignItems: 'flex-end', gap: spacing[2] },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  statusDot:  { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  expandBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
  },
  childCount: { fontSize: 10, fontWeight: '700' },
  actions: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
  },
  actionBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 4 },
  actionText: { fontSize: 12, fontWeight: '700' },
  divider:    { width: StyleSheet.hairlineWidth, height: 16 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const CategoriesScreen: React.FC<{ navigation: any }> = () => {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const { activeStore } = useAppStore();
  const { fetchCategories, invalidate } = useCategoryStore();
  const storeUsername = activeStore?.username ?? '';

  const [categories,  setCategories]  = useState<Category[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [toggling,    setToggling]    = useState(false);
  const [expanded,    setExpanded]    = useState<Record<number, boolean>>({});

  const [dialog, setDialog] = useState<
    null | { mode: 'create'; defaultParent: number } | { mode: 'edit'; category: Category }
  >(null);

  const [toggleTarget, setToggleTarget] = useState<{
    category: Category; type: 'activate' | 'deactivate';
  } | null>(null);

  const load = useCallback(async (force = false) => {
    if (!storeUsername) return;
    setLoading(true); setError(null);
    const list = await fetchCategories(storeUsername, force);
    if (list !== null) {
      setCategories(list);
      setExpanded(prev => {
        const next = { ...prev };
        list.filter(c => !c.parentId || c.parentId === 0).forEach(c => {
          if (next[c.id] === undefined) next[c.id] = true;
        });
        return next;
      });
    } else {
      setError('Failed to load categories.');
    }
    setLoading(false);
  }, [storeUsername, fetchCategories]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async () => {
    if (!toggleTarget) return;
    setToggling(true); setActionError(null);
    try {
      if (toggleTarget.type === 'activate') await activateCategories(toggleTarget.category.id);
      else                                  await deactivateCategories(toggleTarget.category.id);
      invalidate(storeUsername);
      setToggleTarget(null);
      await load(true);
    } catch (err: any) {
      setActionError(err?.message || `Failed to ${toggleTarget.type}.`);
    } finally { setToggling(false); }
  };

  const handleSuccess = () => {
    setDialog(null);
    invalidate(storeUsername);
    load(true);
  };

  const tree     = buildTree(categories);
  const flatTree = flattenTree(tree);
  const q        = search.toLowerCase();

  const displayItems = q
    ? sortByOrder(categories)
        .filter(cat => cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q))
        .map(cat => ({ cat: { ...cat, _children: [] } as CategoryWithChildren, depth: 0 }))
    : flatTree.filter(({ cat, depth }) => {
        if (depth === 0) return true;
        const checkExpanded = (cat: Category): boolean => {
          if (!cat.parentId || cat.parentId === 0) return true;
          if (!expanded[cat.parentId]) return false;
          const parent = categories.find(p => p.id === cat.parentId);
          return parent ? checkExpanded(parent) : true;
        };
        return checkExpanded(cat);
      });

  const rootCount   = categories.filter(c => !c.parentId || c.parentId === 0).length;
  const activeCount = categories.filter(c => c.active !== false).length;
  const subCount    = categories.length - rootCount;

  return (
    <View style={[s.container, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + spacing[10] }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          {[
            { label: 'Total',    value: categories.length, icon: 'layers-outline',     accent: colors.primary },
            { label: 'Parents',  value: rootCount,         icon: 'folder-outline',      accent: '#8B5CF6' },
            { label: 'Children', value: subCount,          icon: 'git-branch-outline',  accent: '#0891B2' },
            { label: 'Active',   value: activeCount,       icon: 'checkmark-circle-outline', accent: '#10B981' },
          ].map(stat => (
            <View key={stat.label} style={[s.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <Ionicons name={stat.icon as any} size={16} color={stat.accent} />
              {loading
                ? <View style={[s.statSkel, { backgroundColor: c.border }]} />
                : <Text style={[s.statVal, { color: c.text }]}>{stat.value}</Text>}
              <Text style={[s.statLabel, { color: c.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Search + Add ── */}
        <View style={s.searchRow}>
          <View style={[s.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="search-outline" size={15} color={c.textSecondary} />
            <TextInput
              style={[s.searchInput, { color: c.text }]}
              value={search} onChangeText={setSearch}
              placeholder="Search categories…" placeholderTextColor={colors.textMuted}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={15} color={c.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[s.addBtn, { opacity: storeUsername ? 1 : 0.4 }]}
            disabled={!storeUsername}
            onPress={() => setDialog({ mode: 'create', defaultParent: 0 })}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Error banners ── */}
        {(error || actionError) && (
          <View style={[s.errorBanner, { backgroundColor: colors.danger + '12', borderColor: colors.danger + '30' }]}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={[s.errorText, { color: colors.danger }]}>{error || actionError}</Text>
            <TouchableOpacity onPress={error ? () => load(true) : () => setActionError(null)}>
              <Ionicons name={error ? 'refresh' : 'close'} size={14} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Skeleton ── */}
        {loading && categories.length === 0 && (
          <View style={{ gap: spacing[2], paddingHorizontal: spacing[4] }}>
            {[...Array(4)].map((_, i) => (
              <View key={i} style={[s.skelCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={[s.skelAvatar, { backgroundColor: c.border }]} />
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={[s.skelLine, { width: '55%', backgroundColor: c.border }]} />
                  <View style={[s.skelLine, { width: '30%', backgroundColor: c.border, height: 8 }]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Empty ── */}
        {!loading && categories.length === 0 && (
          <View style={s.empty}>
            <View style={[s.emptyIconWrap, { backgroundColor: colors.primary + '12' }]}>
              <Ionicons name="folder-open-outline" size={36} color={colors.primary} />
            </View>
            <Text style={[s.emptyTitle, { color: c.text }]}>No categories yet</Text>
            <Text style={[s.emptyDesc, { color: c.textSecondary }]}>
              Create your first category to organise your products
            </Text>
            <TouchableOpacity
              style={[s.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => setDialog({ mode: 'create', defaultParent: 0 })}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={s.emptyBtnText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && q && displayItems.length === 0 && (
          <View style={s.empty}>
            <View style={[s.emptyIconWrap, { backgroundColor: c.card }]}>
              <Ionicons name="search-outline" size={32} color={c.textSecondary} />
            </View>
            <Text style={[s.emptyTitle, { color: c.text }]}>No matches</Text>
            <Text style={[s.emptyDesc, { color: c.textSecondary }]}>Try a different search term</Text>
          </View>
        )}

        {/* ── Category list ── */}
        {displayItems.map(({ cat, depth }) => (
          <CategoryCard
            key={`${cat.id}-${depth}`}
            cat={cat}
            depth={q ? 0 : depth}
            hasChildren={cat._children.length > 0}
            isExpanded={!!expanded[cat.id]}
            onToggleExpand={() => setExpanded(p => ({ ...p, [cat.id]: !p[cat.id] }))}
            onEdit={category => setDialog({ mode: 'edit', category })}
            onToggle={(category, type) => setToggleTarget({ category, type })}
            onAddChild={parentId => setDialog({ mode: 'create', defaultParent: parentId })}
          />
        ))}

        {/* ── Footer ── */}
        {categories.length > 0 && (
          <View style={s.footer}>
            <Text style={[s.footerText, { color: c.textSecondary }]}>
              {q
                ? `${displayItems.length} of ${categories.length} shown`
                : `${rootCount} parent${rootCount !== 1 ? 's' : ''} · ${subCount} sub-categor${subCount !== 1 ? 'ies' : 'y'}`}
            </Text>
            <TouchableOpacity style={s.refreshBtn} onPress={() => load(true)}>
              <Ionicons name="refresh-outline" size={13} color={c.textSecondary} />
              <Text style={[s.footerText, { color: c.textSecondary }]}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* ── Modals ── */}
      {dialog && (
        <CategoryModal
          visible
          mode={dialog.mode}
          initial={dialog.mode === 'edit' ? dialog.category : undefined}
          defaultParent={dialog.mode === 'create' ? dialog.defaultParent : 0}
          allCategories={categories}
          storeUsername={storeUsername}
          onSuccess={handleSuccess}
          onClose={() => setDialog(null)}
        />
      )}

      <ToggleConfirmModal
        visible={!!toggleTarget}
        type={toggleTarget?.type ?? 'activate'}
        category={toggleTarget?.category ?? null}
        loading={toggling}
        onConfirm={handleToggle}
        onClose={() => setToggleTarget(null)}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { gap: spacing[3], paddingTop: spacing[3] },

  statsRow: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: spacing[4] },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: spacing[3],
    borderRadius: radii.xl, borderWidth: 1, gap: 3,
  },
  statVal:   { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  statLabel: { fontSize: 10, fontWeight: '600' },
  statSkel:  { width: 24, height: 18, borderRadius: 5 },

  searchRow: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: spacing[4] },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    borderWidth: 1.5, borderRadius: radii.xl,
    paddingHorizontal: spacing[3], paddingVertical: Platform.OS === 'ios' ? spacing[2] + 1 : spacing[2],
  },
  searchInput: { flex: 1, fontSize: typography.sizes.sm, padding: 0 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    borderWidth: 1, borderRadius: radii.lg, padding: spacing[3],
    marginHorizontal: spacing[4],
  },
  errorText: { flex: 1, fontSize: typography.sizes.sm },

  skelCard: {
    flexDirection: 'row', gap: spacing[3], padding: spacing[3],
    borderRadius: radii.xl, borderWidth: 1, alignItems: 'center',
  },
  skelAvatar: { width: 44, height: 44, borderRadius: radii.lg },
  skelLine:   { height: 11, borderRadius: 6 },

  empty:        { alignItems: 'center', paddingVertical: spacing[12], paddingHorizontal: spacing[6], gap: spacing[3] },
  emptyIconWrap:{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  emptyTitle:   { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  emptyDesc:    { fontSize: typography.sizes.sm, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    borderRadius: radii.xl, paddingHorizontal: spacing[5], paddingVertical: spacing[3],
  },
  emptyBtnText: { color: '#fff', fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },

  footer:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5] },
  footerText: { fontSize: 11 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});