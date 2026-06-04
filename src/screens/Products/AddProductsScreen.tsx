// src/screens/Products/AddProductScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { createProduct } from '../../services/productService';
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import type { CreateProductRequestBody } from '../../types/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name:            string;
  description:     string;
  price:           string;
  compareAtPrice:  string;
  currency:        string;
  imageUrl:        string;
  images:          string[];
  slug:            string;
  stockCount:      string;
  inStock:         boolean;
  isFeatured:      boolean;
  tags:            string;          // comma-separated input
  categoryIds:     number[];
}

interface FieldError {
  name?:       string;
  price?:      string;
  slug?:       string;
  imageUrl?:   string;
  stockCount?: string;
}

const INITIAL_FORM: FormState = {
  name:           '',
  description:    '',
  price:          '',
  compareAtPrice: '',
  currency:       'INR',
  imageUrl:       '',
  images:         [],
  slug:           '',
  stockCount:     '',
  inStock:        true,
  isFeatured:     false,
  tags:           '',
  categoryIds:    [],
};

const CURRENCIES = ['INR'];

// ─── Small reusable bits ──────────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: string; title: string; color?: string }> = ({
  icon, title, color,
}) => {
  const { colors: themeColors } = useTheme();
  return (
    <View style={sectionHeaderStyles.row}>
      <View style={[sectionHeaderStyles.iconWrap, { backgroundColor: (color ?? colors.primary) + '18' }]}>
        <Ionicons name={icon as any} size={16} color={color ?? colors.primary} />
      </View>
      <Text style={[sectionHeaderStyles.title, { color: themeColors.text }]}>{title}</Text>
    </View>
  );
};
const sectionHeaderStyles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] },
  iconWrap: { width: 30, height: 30, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  title:    { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
});

interface LabeledFieldProps {
  label:     string;
  required?: boolean;
  error?:    string;
  children:  React.ReactNode;
}
const LabeledField: React.FC<LabeledFieldProps> = ({ label, required, error, children }) => {
  const { colors: themeColors } = useTheme();
  return (
    <View style={fieldStyles.wrap}>
      <View style={fieldStyles.labelRow}>
        <Text style={[fieldStyles.label, { color: themeColors.textSecondary }]}>{label}</Text>
        {required && <Text style={fieldStyles.required}>*</Text>}
      </View>
      {children}
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
};
const fieldStyles = StyleSheet.create({
  wrap:     { marginBottom: spacing[4] },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: spacing[2] },
  label:    { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  required: { color: colors.danger, fontSize: typography.sizes.sm },
  error:    { fontSize: typography.sizes.xs, color: colors.danger, marginTop: 4 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const AddProductScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const insets  = useSafeAreaInsets();

  const { activeStore }      = useAppStore();
  const { fetchCategories }  = useCategoryStore();

  const [form, setForm]                 = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors]             = useState<FieldError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories]     = useState<{ id: number; name: string }[]>([]);
  const [catLoading, setCatLoading]     = useState(false);
  const [extraImageInput, setExtraImageInput] = useState('');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const storeUsername = activeStore?.username ?? '';

  // ── Load categories ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!storeUsername) return;
    setCatLoading(true);
    fetchCategories(storeUsername).then((cats) => {
      setCategories(cats ?? []);
      setCatLoading(false);
    });
  }, [storeUsername, fetchCategories]);

  // ── Auto-generate slug from name ─────────────────────────────────────────────
  const handleNameChange = useCallback((val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setForm(f => ({ ...f, name: val, slug }));
    if (errors.name)  setErrors(e => ({ ...e, name: undefined }));
    if (errors.slug)  setErrors(e => ({ ...e, slug: undefined }));
  }, [errors]);

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(f => ({ ...f, [key]: val }));
    if (key in errors) setErrors(e => ({ ...e, [key]: undefined }));
  }, [errors]);

  // ── Extra images ─────────────────────────────────────────────────────────────
  const addExtraImage = () => {
    const url = extraImageInput.trim();
    if (!url) return;
    setForm(f => ({ ...f, images: [...f.images, url] }));
    setExtraImageInput('');
  };

  const removeExtraImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  // ── Category toggle ──────────────────────────────────────────────────────────
  const toggleCategory = (id: number) => {
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter(c => c !== id)
        : [...f.categoryIds, id],
    }));
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FieldError = {};
    if (!form.name.trim())              e.name       = 'Product name is required';
    if (!form.price || isNaN(+form.price) || +form.price <= 0)
                                        e.price      = 'Enter a valid price';
    if (!form.slug.trim())              e.slug       = 'Slug is required';
    if (!form.imageUrl.trim())          e.imageUrl   = 'Cover image URL is required';
    if (form.stockCount && isNaN(+form.stockCount))
                                        e.stockCount = 'Stock must be a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!storeUsername) {
      Alert.alert('No store selected', 'Please select an active store first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const body: CreateProductRequestBody = {
        name:           form.name.trim(),
        description:    form.description.trim(),
        price:          parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : 0,
        currency:       form.currency,
        imageUrl:       form.imageUrl.trim(),
        images:         form.images,
        slug:           form.slug.trim(),
        stockCount:     form.stockCount ? parseInt(form.stockCount, 10) : 0,
        inStock:        form.inStock,
        isFeatured:     form.isFeatured,
        tags:           form.tags.split(',').map(t => t.trim()).filter(Boolean),
        categoryIds:    form.categoryIds,
      };

      await createProduct(storeUsername, body);
      Alert.alert('Product added!', `"${body.name}" was created successfully.`, [
        { text: 'Done', onPress: () => navigation.goBack() },
        { text: 'Add another', onPress: () => { setForm(INITIAL_FORM); setErrors({}); } },
      ]);
    } catch (err: any) {
      Alert.alert('Failed to create product', err?.message ?? 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared input style ────────────────────────────────────────────────────────
  const inputStyle = [
    styles.input,
    {
      backgroundColor: themeColors.card,
      borderColor:     themeColors.border,
      color:           themeColors.text,
    },
  ];
  const inputWithErrorStyle = (field: keyof FieldError) =>
    errors[field] ? [inputStyle, styles.inputError] : inputStyle;

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

        {/* ── BASIC INFO ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="information-circle-outline" title="Basic Info" />

          <LabeledField label="Product Name" required error={errors.name}>
            <TextInput
              style={inputWithErrorStyle('name')}
              placeholder="e.g. Wireless Earbuds Pro"
              placeholderTextColor={colors.textMuted}
              value={form.name}
              onChangeText={handleNameChange}
            />
          </LabeledField>

          <LabeledField label="Slug (URL)" required error={errors.slug}>
            <View style={styles.slugRow}>
              <Text style={[styles.slugPrefix, { color: themeColors.textSecondary, backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                /products/
              </Text>
              <TextInput
                style={[inputWithErrorStyle('slug'), styles.slugInput]}
                placeholder="wireless-earbuds-pro"
                placeholderTextColor={colors.textMuted}
                value={form.slug}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={v => set('slug', v.toLowerCase().replace(/\s+/g, '-'))}
              />
            </View>
          </LabeledField>

          <LabeledField label="Description">
            <TextInput
              style={[inputStyle, styles.textarea]}
              placeholder="Describe your product…"
              placeholderTextColor={colors.textMuted}
              value={form.description}
              onChangeText={v => set('description', v)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </LabeledField>
        </View>

        {/* ── PRICING ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="pricetag-outline" title="Pricing" color={colors.success} />

          {/* Currency picker */}
          <LabeledField label="Currency">
            <TouchableOpacity
              style={[inputStyle, styles.pickerBtn]}
              onPress={() => setShowCurrencyPicker(v => !v)}
            >
              <Text style={{ color: themeColors.text, fontSize: typography.sizes.base }}>
                {form.currency}
              </Text>
              <Ionicons
                name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={themeColors.textSecondary}
              />
            </TouchableOpacity>
            {showCurrencyPicker && (
              <View style={[styles.pickerDropdown, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                {CURRENCIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.pickerOption, form.currency === c && { backgroundColor: colors.primary + '14' }]}
                    onPress={() => { set('currency', c); setShowCurrencyPicker(false); }}
                  >
                    <Text style={{ color: themeColors.text, fontSize: typography.sizes.base }}>{c}</Text>
                    {form.currency === c && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </LabeledField>

          <View style={styles.row}>
            <View style={styles.half}>
              <LabeledField label="Price" required error={errors.price}>
                <TextInput
                  style={inputWithErrorStyle('price')}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={form.price}
                  onChangeText={v => set('price', v)}
                  keyboardType="decimal-pad"
                />
              </LabeledField>
            </View>
            <View style={styles.half}>
              <LabeledField label="Compare-at Price">
                <TextInput
                  style={inputStyle}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={form.compareAtPrice}
                  onChangeText={v => set('compareAtPrice', v)}
                  keyboardType="decimal-pad"
                />
              </LabeledField>
            </View>
          </View>

          {form.compareAtPrice && +form.compareAtPrice > +form.price && (
            <View style={styles.discountBadge}>
              <Ionicons name="trending-down-outline" size={14} color={colors.success} />
              <Text style={styles.discountText}>
                {Math.round((1 - +form.price / +form.compareAtPrice) * 100)}% off
              </Text>
            </View>
          )}
        </View>

        {/* ── MEDIA ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="images-outline" title="Media" color="#8B5CF6" />

          <LabeledField label="Cover Image URL" required error={errors.imageUrl}>
            <TextInput
              style={inputWithErrorStyle('imageUrl')}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={colors.textMuted}
              value={form.imageUrl}
              onChangeText={v => set('imageUrl', v)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </LabeledField>

          <LabeledField label="Additional Images">
            <View style={styles.extraImageRow}>
              <TextInput
                style={[inputStyle, styles.extraImageInput]}
                placeholder="Paste image URL and press +"
                placeholderTextColor={colors.textMuted}
                value={extraImageInput}
                onChangeText={setExtraImageInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                onSubmitEditing={addExtraImage}
              />
              <TouchableOpacity style={styles.addImageBtn} onPress={addExtraImage}>
                <Ionicons name="add" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
            {form.images.length > 0 && (
              <View style={styles.imageList}>
                {form.images.map((img, idx) => (
                  <View key={idx} style={[styles.imageChip, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                    <Ionicons name="image-outline" size={13} color={themeColors.textSecondary} />
                    <Text style={[styles.imageChipText, { color: themeColors.textSecondary }]} numberOfLines={1}>
                      {img.split('/').pop()}
                    </Text>
                    <TouchableOpacity onPress={() => removeExtraImage(idx)}>
                      <Ionicons name="close-circle" size={15} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </LabeledField>
        </View>

        {/* ── INVENTORY ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="cube-outline" title="Inventory" color="#B45309" />

          <LabeledField label="Stock Count" error={errors.stockCount}>
            <TextInput
              style={inputWithErrorStyle('stockCount')}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              value={form.stockCount}
              onChangeText={v => set('stockCount', v)}
              keyboardType="number-pad"
            />
          </LabeledField>

          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleLabel, { color: themeColors.text }]}>In Stock</Text>
              <Text style={[styles.toggleSub, { color: themeColors.textSecondary }]}>
                Product is available for purchase
              </Text>
            </View>
            <Switch
              value={form.inStock}
              onValueChange={v => set('inStock', v)}
              trackColor={{ false: themeColors.border, true: colors.primary + '60' }}
              thumbColor={form.inStock ? colors.primary : themeColors.textSecondary}
            />
          </View>

          <View style={[styles.toggleRow, styles.toggleRowLast]}>
            <View>
              <Text style={[styles.toggleLabel, { color: themeColors.text }]}>Featured Product</Text>
              <Text style={[styles.toggleSub, { color: themeColors.textSecondary }]}>
                Show on featured / highlights section
              </Text>
            </View>
            <Switch
              value={form.isFeatured}
              onValueChange={v => set('isFeatured', v)}
              trackColor={{ false: themeColors.border, true: colors.primary + '60' }}
              thumbColor={form.isFeatured ? colors.primary : themeColors.textSecondary}
            />
          </View>
        </View>

        {/* ── CATEGORIES ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="folder-outline" title="Categories" color={colors.success} />
          {catLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing[4] }} />
          ) : categories.length === 0 ? (
            <Text style={[styles.noCats, { color: themeColors.textSecondary }]}>
              No categories found for this store.
            </Text>
          ) : (
            <View style={styles.catGrid}>
              {categories.map(cat => {
                const selected = form.categoryIds.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: selected ? colors.primary        : themeColors.background,
                        borderColor:     selected ? colors.primary        : themeColors.border,
                      },
                    ]}
                    onPress={() => toggleCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    {selected && <Ionicons name="checkmark" size={12} color={colors.white} />}
                    <Text style={[styles.catChipText, { color: selected ? colors.white : themeColors.text }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── TAGS ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="pricetags-outline" title="Tags" color="#0891b2" />
          <LabeledField label="Tags (comma-separated)">
            <TextInput
              style={inputStyle}
              placeholder="wireless, audio, electronics"
              placeholderTextColor={colors.textMuted}
              value={form.tags}
              onChangeText={v => set('tags', v)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </LabeledField>
          {form.tags.trim().length > 0 && (
            <View style={styles.tagPreview}>
              {form.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                <View key={i} style={[styles.tagChip, { backgroundColor: '#0891b2' + '18', borderColor: '#0891b2' + '40' }]}>
                  <Text style={[styles.tagChipText, { color: '#0891b2' }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── SUBMIT ── */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
              <Text style={styles.submitText}>Create Product</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { padding: spacing[4], gap: spacing[3] },

  card: {
    borderRadius: radii.xl,
    borderWidth:  1,
    padding:      spacing[5],
    marginBottom: spacing[1],
  },

  // Input
  input: {
    borderWidth:   1.5,
    borderRadius:  radii.lg,
    paddingHorizontal: spacing[4],
    paddingVertical:   Platform.OS === 'ios' ? spacing[3] : spacing[2],
    fontSize:      typography.sizes.base,
  },
  inputError: { borderColor: colors.danger },
  textarea:   { minHeight: 96, paddingTop: spacing[3] },

  // Slug
  slugRow:   { flexDirection: 'row', alignItems: 'center', gap: 0 },
  slugPrefix: {
    paddingHorizontal: spacing[3],
    paddingVertical:   Platform.OS === 'ios' ? spacing[3] : spacing[2],
    fontSize:          typography.sizes.base,
    borderWidth:       1.5,
    borderRightWidth:  0,
    borderTopLeftRadius:    radii.lg,
    borderBottomLeftRadius: radii.lg,
  },
  slugInput: {
    flex:                    1,
    borderTopLeftRadius:     0,
    borderBottomLeftRadius:  0,
  },

  // Row layout
  row:  { flexDirection: 'row', gap: spacing[3] },
  half: { flex: 1 },

  // Discount badge
  discountBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing[1],
    backgroundColor: colors.success + '14',
    borderRadius:    radii.full,
    alignSelf:       'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical:   4,
    marginTop:       -spacing[2],
    marginBottom:    spacing[2],
  },
  discountText: { fontSize: typography.sizes.xs, color: colors.success, fontWeight: typography.weights.semiBold },

  // Currency picker
  pickerBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  pickerDropdown: {
    borderWidth:   1,
    borderRadius:  radii.lg,
    marginTop:     4,
    overflow:      'hidden',
  },
  pickerOption: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[3],
  },

  // Extra images
  extraImageRow:  { flexDirection: 'row', gap: spacing[2] },
  extraImageInput: { flex: 1 },
  addImageBtn: {
    width:           44,
    height:          44,
    backgroundColor: colors.primary,
    borderRadius:    radii.lg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  imageList:  { flexWrap: 'wrap', flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] },
  imageChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical:   5,
    borderRadius:      radii.full,
    borderWidth:       1,
    maxWidth:          180,
  },
  imageChipText: { fontSize: typography.sizes.xs, flex: 1 },

  // Toggles
  toggleRow: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingVertical: spacing[3],
    borderTopWidth:  1,
    borderTopColor:  'rgba(0,0,0,0.06)',
  },
  toggleRowLast: {},
  toggleLabel:   { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  toggleSub:     { fontSize: typography.sizes.xs, marginTop: 2 },

  // Categories
  noCats:  { fontSize: typography.sizes.sm, paddingVertical: spacing[2] },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  catChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingHorizontal: spacing[3],
    paddingVertical:   7,
    borderRadius:      radii.full,
    borderWidth:       1.5,
  },
  catChipText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },

  // Tags
  tagPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: -spacing[1] },
  tagChip: {
    paddingHorizontal: spacing[3],
    paddingVertical:   5,
    borderRadius:      radii.full,
    borderWidth:       1,
  },
  tagChipText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },

  // Submit
  submitBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing[2],
    backgroundColor: colors.primary,
    borderRadius:   radii.xl,
    paddingVertical: spacing[4],
    marginTop:      spacing[2],
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    color:      colors.white,
    fontSize:   typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
  },
});