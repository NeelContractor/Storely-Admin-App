// src/screens/Products/AddProductScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useSafeAreaInsets }     from 'react-native-safe-area-context';
import { Ionicons }              from '@expo/vector-icons';
import * as ImagePicker          from 'expo-image-picker';
import { useTheme }              from '../../theme/ThemeContext';
import { useAppStore }           from '../../store/useAppStore';
import { useCategoryStore }      from '../../store/useCategoryStore';
import { useProductStore }       from '../../store/useProductStore';
import { createProduct }         from '../../services/productService';
import { cloudinarySignature }   from '../../services/imageService';
import { colors }                from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import type { CreateProductRequestBody } from '../../types/types';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';
import { ImageUploadButton } from '@/components/ImageUploadButton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name:           string;
  description:    string;
  price:          string;
  compareAtPrice: string;
  currency:       string;
  imageUrl:       string;
  images:         string[];          // up to 2 additional
  slug:           string;
  stockCount:     string;
  inStock:        boolean;
  isFeatured:     boolean;
  tags:           string;            // comma-separated
  categoryIds:    number[];
}

interface FieldError {
  name?:        string;
  price?:       string;
  slug?:        string;
  imageUrl?:    string;
  stockCount?:  string;
  categoryIds?: string;
}

const MAX_EXTRA_IMAGES = 2;
const CURRENCIES       = ['INR'] as const;

const INITIAL_FORM: FormState = {
  name: '', description: '', price: '', compareAtPrice: '',
  currency: 'INR', imageUrl: '', images: [], slug: '',
  stockCount: '', inStock: true, isFeatured: false,
  tags: '', categoryIds: [],
};

// ─── Slug helper ──────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─── Cloudinary upload (React Native) ────────────────────────────────────────
// Uses the same backend signature endpoint as the web version, but constructs
// FormData using the RN image picker asset (uri / base64 blob).

// async function uploadImageToCloudinary(uri: string): Promise<string> {
//   // 1. Get signed credentials from our backend
//   const sigRes  = await cloudinarySignature();
//   const { apiKey, cloudName, folder, signature, timestamp } = sigRes.data;

//   // 2. Build multipart FormData (RN-compatible)
//   const formData = new FormData();
//   const filename = uri.split('/').pop() ?? 'photo.jpg';
//   const match    = /\.(\w+)$/.exec(filename);
//   const type     = match ? `image/${match[1]}` : 'image/jpeg';

//   // React Native FormData accepts { uri, name, type } objects
//   formData.append('file', { uri, name: filename, type } as any);
//   formData.append('api_key',   apiKey);
//   formData.append('timestamp', String(timestamp));
//   formData.append('signature', signature);
//   if (folder) formData.append('folder', folder);

//   // 3. POST directly to Cloudinary
//   const response = await fetch(
//     `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
//     { method: 'POST', body: formData },
//   );

//   if (!response.ok) {
//     const err = await response.json().catch(() => ({}));
//     throw new Error((err as any)?.error?.message ?? `Upload failed (${response.status})`);
//   }

//   const data = await response.json();
//   return data.secure_url as string;
// }

// ─── Small reusable UI pieces ─────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: string; title: string; accent?: string }> = ({
  icon, title, accent,
}) => {
  const { colors: c } = useTheme();
  const col = accent ?? colors.primary;
  return (
    <View style={sh.row}>
      <View style={[sh.wrap, { backgroundColor: col + '18' }]}>
        <Ionicons name={icon as any} size={16} color={col} />
      </View>
      <Text style={[sh.title, { color: c.text }]}>{title}</Text>
    </View>
  );
};
const sh = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] },
  wrap:  { width: 30, height: 30, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
});

interface FieldProps { label: string; required?: boolean; error?: string; children: React.ReactNode }
const Field: React.FC<FieldProps> = ({ label, required, error, children }) => {
  const { colors: c } = useTheme();
  return (
    <View style={ff.wrap}>
      <View style={ff.row}>
        <Text style={[ff.label, { color: c.textSecondary }]}>{label}</Text>
        {required && <Text style={ff.req}>*</Text>}
      </View>
      {children}
      {error ? <Text style={ff.err}>{error}</Text> : null}
    </View>
  );
};
const ff = StyleSheet.create({
  wrap:  { marginBottom: spacing[4] },
  row:   { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: spacing[2] },
  label: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  req:   { color: colors.danger, fontSize: typography.sizes.sm },
  err:   { fontSize: typography.sizes.xs, color: colors.danger, marginTop: 4 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const AddProductScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const { activeStore }           = useAppStore();
  const { fetchCategories }       = useCategoryStore();
  const { invalidate }            = useProductStore();

  const [form, setForm]                 = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors]             = useState<FieldError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories]     = useState<{ id: number; name: string }[]>([]);
  const [catLoading, setCatLoading]     = useState(false);
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

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const setField = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(f => ({ ...f, [key]: val }));
    if (key in errors) setErrors(e => ({ ...e, [key]: undefined }));
  }, [errors]);

  const handleNameChange = useCallback((val: string) => {
    const slug = toSlug(val);
    setForm(f => ({ ...f, name: val, slug }));
    setErrors(e => ({ ...e, name: undefined, slug: undefined }));
  }, []);

  const toggleCategory = (id: number) => {
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter(c => c !== id)
        : [...f.categoryIds, id],
    }));
    setErrors(e => ({ ...e, categoryIds: undefined }));
  };

  const removeExtraImage = (idx: number) =>
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  // ── Discount preview ──────────────────────────────────────────────────────────
  const discount =
    form.compareAtPrice && form.price && +form.compareAtPrice > +form.price
      ? Math.round((1 - +form.price / +form.compareAtPrice) * 100)
      : 0;

  // ── Completion checklist (mirrors web version) ────────────────────────────────
  const checklist = [
    { label: 'Product name',      done: !!form.name.trim() },
    { label: 'Category selected', done: form.categoryIds.length > 0 },
    { label: 'Slug added',        done: !!form.slug.trim() },
    { label: 'Selling price',     done: !!form.price && +form.price > 0 },
    { label: 'Stock quantity',    done: !!form.stockCount },
    { label: 'Description',       done: !!form.description.trim() },
    { label: 'Main image',        done: !!form.imageUrl },
  ];
  const progress = Math.round(
    (checklist.filter(c => c.done).length / checklist.length) * 100
  );

  // ── Validation ────────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FieldError = {};
    if (!form.name.trim())                           e.name       = 'Product name is required';
    if (!form.price || isNaN(+form.price) || +form.price <= 0)
                                                     e.price      = 'Enter a valid price greater than 0';
    if (!form.slug.trim())                           e.slug       = 'Slug is required';
    if (form.categoryIds.length === 0)               e.categoryIds = 'Select at least one category';
    if (form.inStock && !form.stockCount)            e.stockCount = 'Stock count is required when In Stock';
    if (form.stockCount && isNaN(+form.stockCount))  e.stockCount = 'Stock must be a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
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
        stockCount:     form.inStock ? parseInt(form.stockCount || '0', 10) : 0,
        inStock:        form.inStock,
        isFeatured:     form.isFeatured,
        tags:           form.tags.split(',').map(t => t.trim()).filter(Boolean),
        categoryIds:    form.categoryIds,
      };

      await createProduct(storeUsername, body);
      // Invalidate cache so AllProductsScreen refreshes on back
      invalidate(storeUsername);

      Alert.alert('Product created!', `"${body.name}" was added successfully.`, [
        { text: 'Done', onPress: () => navigation.goBack() },
        { text: 'Add another', onPress: () => { setForm(INITIAL_FORM); setErrors({}); } },
      ]);
    } catch (err: any) {
      Alert.alert('Failed to create product', err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared input style ────────────────────────────────────────────────────────
  const inputBase = [styles.input, { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text }];
  const inp = (field?: keyof FieldError) =>
    field && errors[field] ? [...inputBase, styles.inputError] : inputBase;

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

        {/* ── Progress bar ── */}
        <View style={[styles.progressCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>
              Listing completeness
            </Text>
            <Text style={[styles.progressPct, { color: progress === 100 ? colors.success : themeColors.text }]}>
              {progress}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: themeColors.border }]}>
            <View style={[styles.progressFill, {
              width: `${progress}%` as any,
              backgroundColor: progress === 100 ? colors.success : colors.primary,
            }]} />
          </View>
          <View style={styles.checklistRow}>
            {checklist.map(({ label, done }) => (
              <View key={label} style={styles.checkItem}>
                <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={13}
                  color={done ? colors.success : themeColors.textSecondary} />
                <Text style={[styles.checkText, { color: done ? colors.success : themeColors.textSecondary }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── BASIC INFO ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="information-circle-outline" title="Basic Info" />

          <Field label="Product Name" required error={errors.name}>
            <TextInput
              style={inp('name')}
              placeholder="e.g. Wireless Earbuds Pro"
              placeholderTextColor={colors.textMuted}
              value={form.name}
              onChangeText={handleNameChange}
            />
          </Field>

          <Field label="Slug (URL)" required error={errors.slug}>
            <View style={styles.slugRow}>
              <View style={[styles.slugPrefix, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                <Text style={[styles.slugPrefixText, { color: themeColors.textSecondary }]}>/products/</Text>
              </View>
              <TextInput
                style={[inp('slug'), styles.slugInput]}
                placeholder="wireless-earbuds-pro"
                placeholderTextColor={colors.textMuted}
                value={form.slug}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={v => setField('slug', v.toLowerCase().replace(/\s+/g, '-'))}
              />
            </View>
            <Text style={[styles.slugHint, { color: themeColors.textSecondary }]}>
              Auto-generated from name · editable
            </Text>
          </Field>

          <Field label="Description">
            <TextInput
              style={[inp(), styles.textarea]}
              placeholder="Describe your product…"
              placeholderTextColor={colors.textMuted}
              value={form.description}
              onChangeText={v => setField('description', v)}
              multiline numberOfLines={4} textAlignVertical="top"
            />
          </Field>

          <Field label="Tags" >
            <TextInput
              style={inp()}
              placeholder="wireless, audio, electronics (comma-separated)"
              placeholderTextColor={colors.textMuted}
              value={form.tags}
              onChangeText={v => setField('tags', v)}
              autoCapitalize="none" autoCorrect={false}
            />
          </Field>
          {form.tags.trim().length > 0 && (
            <View style={styles.tagRow}>
              {form.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                <View key={i} style={[styles.tagChip, { backgroundColor: '#0891b2' + '18', borderColor: '#0891b2' + '40' }]}>
                  <Text style={[styles.tagText, { color: '#0891b2' }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── MEDIA ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="images-outline" title="Media" accent="#8B5CF6" />

          <Field label="Main Image (Cover)" error={errors.imageUrl}>
            <View style={styles.imageRow}>
              <ImageUploadButton
                uri={form.imageUrl}
                label="Upload cover"
                onSuccess={url => setField('imageUrl', url)}
                onRemove={() => setField('imageUrl', '')}
              />
              {form.imageUrl ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={[styles.imageUrlHint, { color: themeColors.textSecondary }]} numberOfLines={2}>
                    {form.imageUrl}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.imageHelpText, { color: themeColors.textSecondary }]}>
                  Tap to pick a photo from your library. It will be uploaded to Cloudinary automatically.
                </Text>
              )}
            </View>
          </Field>

          <Field label={`Additional Images (${form.images.length}/${MAX_EXTRA_IMAGES})`}>
            <View style={styles.extraImageRow}>
              {form.images.map((uri, idx) => (
                <ImageUploadButton
                  key={idx}
                  uri={uri}
                  label=""
                  onSuccess={() => {}}
                  onRemove={() => removeExtraImage(idx)}
                  small
                />
              ))}
              {form.images.length < MAX_EXTRA_IMAGES && (
                <ImageUploadButton
                  label="Add photo"
                  onSuccess={url => setForm(f => ({ ...f, images: [...f.images, url] }))}
                  small
                />
              )}
            </View>
          </Field>
        </View>

        {/* ── PRICING ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="pricetag-outline" title="Pricing" accent={colors.success} />

          {/* Currency */}
          <Field label="Currency">
            <TouchableOpacity
              style={[inp(), styles.pickerBtn]}
              onPress={() => setShowCurrencyPicker(v => !v)}
            >
              <Text style={{ color: themeColors.text, fontSize: typography.sizes.base }}>{form.currency}</Text>
              <Ionicons name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'} size={16} color={themeColors.textSecondary} />
            </TouchableOpacity>
            {showCurrencyPicker && (
              <View style={[styles.pickerDropdown, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                {CURRENCIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.pickerOption, form.currency === c && { backgroundColor: colors.primary + '14' }]}
                    onPress={() => { setField('currency', c); setShowCurrencyPicker(false); }}
                  >
                    <Text style={{ color: themeColors.text, fontSize: typography.sizes.base }}>
                      {c === 'INR' ? 'INR (₹) — Indian Rupee' : 'USD ($) — US Dollar'}
                    </Text>
                    {form.currency === c && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Field>

          {/* Price + Compare-at */}
          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="Selling Price" required error={errors.price}>
                <TextInput
                  style={inp('price')}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={form.price}
                  onChangeText={v => setField('price', v)}
                  keyboardType="decimal-pad"
                />
              </Field>
            </View>
            <View style={styles.half}>
              <Field label="MRP / Original">
                <TextInput
                  style={inp()}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={form.compareAtPrice}
                  onChangeText={v => setField('compareAtPrice', v)}
                  keyboardType="decimal-pad"
                />
              </Field>
            </View>
          </View>

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Ionicons name="trending-down-outline" size={14} color={colors.success} />
              <Text style={styles.discountText}>
                {discount}% OFF — customers save ₹
                {(+form.compareAtPrice - +form.price).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* ── INVENTORY ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="cube-outline" title="Inventory" accent="#B45309" />

          {/* Availability + Stock side-by-side */}
          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="Availability">
                <TouchableOpacity
                  style={[inp(), styles.pickerBtn]}
                  onPress={() => {
                    const next = !form.inStock;
                    setForm(f => ({ ...f, inStock: next, stockCount: next ? f.stockCount : '0' }));
                    setErrors(e => ({ ...e, stockCount: undefined }));
                  }}
                >
                  <View style={[styles.availDot, { backgroundColor: form.inStock ? colors.success : colors.danger }]} />
                  <Text style={{ color: themeColors.text, fontSize: typography.sizes.sm, flex: 1 }}>
                    {form.inStock ? 'In Stock' : 'Out of Stock'}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </Field>
            </View>
            <View style={styles.half}>
              <Field label="Stock Count" required={form.inStock} error={errors.stockCount}>
                <TextInput
                  style={[inp('stockCount'), !form.inStock && styles.inputDisabled]}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={form.inStock ? form.stockCount : '0'}
                  onChangeText={v => { if (form.inStock) setField('stockCount', v); }}
                  keyboardType="number-pad"
                  editable={form.inStock}
                />
              </Field>
            </View>
          </View>

          {/* Featured toggle */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: themeColors.text }]}>Featured Product</Text>
              <Text style={[styles.toggleSub, { color: themeColors.textSecondary }]}>
                Show on featured / highlights section
              </Text>
            </View>
            <Switch
              value={form.isFeatured}
              onValueChange={v => setField('isFeatured', v)}
              trackColor={{ false: themeColors.border, true: colors.primary + '60' }}
              thumbColor={form.isFeatured ? colors.primary : themeColors.textSecondary}
            />
          </View>
        </View>

        {/* ── CATEGORIES ── */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <SectionHeader icon="folder-outline" title="Categories" accent={colors.success} />
          {errors.categoryIds && (
            <Text style={[styles.catError, { color: colors.danger }]}>{errors.categoryIds}</Text>
          )}
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
                    <Text style={[styles.catText, { color: selected ? colors.white : themeColors.text }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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

  // ── Progress card ──
  progressCard: {
    borderRadius: radii.xl, borderWidth: 1, padding: spacing[4], marginBottom: spacing[1],
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] },
  progressLabel:  { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  progressPct:    { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  progressTrack:  { height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: spacing[3] },
  progressFill:   { height: 5, borderRadius: 3 },
  checklistRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  checkItem:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkText:      { fontSize: typography.sizes.xs },

  // ── Card ──
  card: {
    borderRadius: radii.xl, borderWidth: 1, padding: spacing[5], marginBottom: spacing[1],
  },

  // ── Input ──
  input: {
    borderWidth: 1.5, borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
    paddingVertical:   Platform.OS === 'ios' ? spacing[3] : spacing[2],
    fontSize: typography.sizes.base,
  },
  inputError:    { borderColor: colors.danger },
  inputDisabled: { opacity: 0.5 },
  textarea:      { minHeight: 96, paddingTop: spacing[3] },

  // ── Slug ──
  slugRow:       { flexDirection: 'row', alignItems: 'stretch' },
  slugPrefix:    {
    borderWidth: 1.5, borderRightWidth: 0,
    borderTopLeftRadius: radii.lg, borderBottomLeftRadius: radii.lg,
    paddingHorizontal: spacing[3],
    justifyContent: 'center',
  },
  slugPrefixText: { fontSize: typography.sizes.sm },
  slugInput:      { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  slugHint:       { fontSize: typography.sizes.xs, marginTop: 4 },

  // ── Tags ──
  tagRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: -spacing[1], marginBottom: spacing[3] },
  tagChip: { paddingHorizontal: spacing[3], paddingVertical: 5, borderRadius: radii.full, borderWidth: 1 },
  tagText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },

  // ── Media / images ──
  imageRow:      { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  imageHelpText: { flex: 1, fontSize: typography.sizes.xs, lineHeight: 16 },
  imageUrlHint:  { fontSize: typography.sizes.xs },
  extraImageRow: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },

  // ── Pricing ──
  row:  { flexDirection: 'row', gap: spacing[3] },
  half: { flex: 1 },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerDropdown: {
    borderWidth: 1, borderRadius: radii.lg, marginTop: 4, overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  discountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    backgroundColor: colors.success + '14', borderRadius: radii.full,
    alignSelf: 'flex-start', paddingHorizontal: spacing[3], paddingVertical: 4,
    marginTop: -spacing[1], marginBottom: spacing[2],
  },
  discountText: { fontSize: typography.sizes.xs, color: colors.success, fontWeight: typography.weights.semiBold },

  // ── Inventory ──
  availDot:   { width: 8, height: 8, borderRadius: 4, marginRight: spacing[1] },
  toggleRow:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
  },
  toggleLabel: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  toggleSub:   { fontSize: typography.sizes.xs, marginTop: 2 },

  // ── Categories ──
  catError: { fontSize: typography.sizes.xs, marginBottom: spacing[2] },
  noCats:   { fontSize: typography.sizes.sm, paddingVertical: spacing[2] },
  catGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  catChip:  {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing[3], paddingVertical: 7,
    borderRadius: radii.full, borderWidth: 1.5,
  },
  catText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },

  // ── Submit ──
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2],
    backgroundColor: colors.primary, borderRadius: radii.xl, paddingVertical: spacing[4],
    marginTop: spacing[2],
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: colors.white, fontSize: typography.sizes.lg, fontWeight: typography.weights.semiBold },
});