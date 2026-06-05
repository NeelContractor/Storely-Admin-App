// src/screens/Products/AllProductsScreen.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView,
  Image, Dimensions, PanResponder, StatusBar, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useProductStore } from '../../store/useProductStore';
import { deleteProduct } from '../../services/productService';
import type { Product, Store } from '../../types/types';

const PAGE_SIZE  = 10;
const SCREEN_W   = Dimensions.get('window').width;
const SCREEN_H   = Dimensions.get('window').height;
const H_PADDING  = spacing[4] * 2;
const GRID_IMG_W = SCREEN_W - H_PADDING;
const GRID_IMG_H = Math.round(GRID_IMG_W * 0.56);
const SWIPE_THRESHOLD = 40;

function getStatus(p: Product): 'active' | 'low' | 'out' {
  if (!p.inStock || p.stockCount === 0) return 'out';
  if (p.stockCount <= 10) return 'low';
  return 'active';
}

const STATUS_LABEL     = { active: 'Active', low: 'Low Stock', out: 'Out of Stock' } as const;
const STATUS_VARIANT   = { active: 'success', low: 'warning',  out: 'danger'       } as const;
const STATUS_DOT_COLOR = { active: colors.success, low: '#F59E0B', out: colors.danger } as const;

// ─── Store Switcher ───────────────────────────────────────────────────────────

interface StoreSwitcherProps {
  stores:      Store[];
  activeStore: Store | null;
  onSelect:    (store: Store) => void;
}

const StoreSwitcher: React.FC<StoreSwitcherProps> = ({ stores, activeStore, onSelect }) => {
  const { colors: themeColors } = useTheme();
  const [open, setOpen] = useState(false);

  if (stores.length <= 1) {
    return (
      <View style={[styles.storePill, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <Ionicons name="storefront-outline" size={15} color={colors.primary} />
        <Text style={[styles.storePillText, { color: themeColors.text }]} numberOfLines={1}>
          {activeStore?.name ?? 'No store'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.storePill, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="storefront-outline" size={15} color={colors.primary} />
        <Text style={[styles.storePillText, { color: themeColors.text }]} numberOfLines={1}>
          {activeStore?.name ?? 'Select store'}
        </Text>
        <Ionicons name="chevron-down" size={14} color={themeColors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.dropdown, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.dropdownTitle, { color: themeColors.textSecondary }]}>Switch Store</Text>
            <ScrollView bounces={false}>
              {stores.map((store) => {
                const isActive = store.id === activeStore?.id;
                return (
                  <TouchableOpacity
                    key={store.id}
                    style={[styles.dropdownItem, isActive && { backgroundColor: colors.primary + '12' }]}
                    onPress={() => { onSelect(store); setOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownItemLeft}>
                      <View style={[styles.storeInitial, { backgroundColor: isActive ? colors.primary : themeColors.border }]}>
                        {store.logoUrl ? (
                          <Image source={{ uri: store.logoUrl }} style={styles.storeLogoImage} resizeMode="cover" />
                        ) : (
                          <Text style={[styles.storeInitialText, { color: isActive ? colors.white : themeColors.textSecondary }]}>
                            {store.name.charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View>
                        <Text style={[styles.dropdownStoreName, { color: themeColors.text }]}>{store.name}</Text>
                        <Text style={[styles.dropdownStoreUsername, { color: themeColors.textSecondary }]}>@{store.username}</Text>
                      </View>
                    </View>
                    {isActive && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ─── Product Actions Menu (3-dot) ─────────────────────────────────────────────

interface ProductActionsMenuProps {
  product:       Product;
  storeUsername: string;
  onEdit:        () => void;
  onDeleted:     () => void;
}

const ProductActionsMenu: React.FC<ProductActionsMenuProps> = ({
  product, storeUsername, onEdit, onDeleted,
}) => {
  const { colors: themeColors } = useTheme();
  const [open, setOpen]       = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { invalidate }          = useProductStore();

  const handleDelete = () => {
    setOpen(false);
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteProduct(storeUsername, product.slug);
              // Invalidate cache so the list refreshes
              invalidate(storeUsername);
              onDeleted();
            } catch (err: any) {
              Alert.alert('Failed to delete', err?.message ?? 'Something went wrong.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    setOpen(false);
    onEdit();
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="ellipsis-vertical" size={18} color={themeColors.textSecondary} />
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.actionsSheet, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            {/* Product header */}
            <View style={styles.actionsHeader}>
              <View style={styles.actionsProductThumb}>
                {product.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={styles.actionsThumbImage} resizeMode="cover" />
                ) : (
                  <Ionicons name="cube-outline" size={20} color={themeColors.textSecondary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionsProductName, { color: themeColors.text }]} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={[styles.actionsProductSlug, { color: themeColors.textSecondary }]}>
                  /{product.slug}
                </Text>
              </View>
            </View>

            <View style={[styles.actionsDivider, { backgroundColor: themeColors.border }]} />

            {/* Edit */}
            <TouchableOpacity style={styles.actionItem} onPress={handleEdit} activeOpacity={0.7}>
              <View style={[styles.actionIconWrap, { backgroundColor: colors.primary + '14' }]}>
                <Ionicons name="pencil-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionLabel, { color: themeColors.text }]}>Edit Product</Text>
                <Text style={[styles.actionSub, { color: themeColors.textSecondary }]}>
                  Update details, price, images
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity style={styles.actionItem} onPress={handleDelete} activeOpacity={0.7}>
              <View style={[styles.actionIconWrap, { backgroundColor: colors.danger + '14' }]}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionLabel, { color: colors.danger }]}>Delete Product</Text>
                <Text style={[styles.actionSub, { color: themeColors.textSecondary }]}>
                  Permanently remove this product
                </Text>
              </View>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              style={[styles.actionCancel, { borderColor: themeColors.border }]}
              onPress={() => setOpen(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionCancelText, { color: themeColors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ─── Grid Three-dot (floating, used inside image area) ────────────────────────

interface GridActionsMenuProps {
  product:       Product;
  storeUsername: string;
  onEdit:        () => void;
  onDeleted:     () => void;
}

const GridActionsMenu: React.FC<GridActionsMenuProps> = (props) => {
  const { colors: themeColors } = useTheme();
  const [open, setOpen]         = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { invalidate }          = useProductStore();

  const handleDelete = () => {
    setOpen(false);
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${props.product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteProduct(props.storeUsername, props.product.slug);
              invalidate(props.storeUsername);
              props.onDeleted();
            } catch (err: any) {
              Alert.alert('Failed to delete', err?.message ?? 'Something went wrong.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.gridMoreBtn}
        onPress={() => setOpen(true)}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        disabled={deleting}
      >
        <View style={styles.gridMoreBtnBg}>
          {deleting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="ellipsis-horizontal" size={13} color={colors.white} />
          )}
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.actionsSheet, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.actionsHeader}>
              <View style={styles.actionsProductThumb}>
                {props.product.imageUrl ? (
                  <Image source={{ uri: props.product.imageUrl }} style={styles.actionsThumbImage} resizeMode="cover" />
                ) : (
                  <Ionicons name="cube-outline" size={20} color={themeColors.textSecondary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionsProductName, { color: themeColors.text }]} numberOfLines={1}>
                  {props.product.name}
                </Text>
                <Text style={[styles.actionsProductSlug, { color: themeColors.textSecondary }]}>
                  /{props.product.slug}
                </Text>
              </View>
            </View>

            <View style={[styles.actionsDivider, { backgroundColor: themeColors.border }]} />

            <TouchableOpacity style={styles.actionItem} onPress={() => { setOpen(false); props.onEdit(); }} activeOpacity={0.7}>
              <View style={[styles.actionIconWrap, { backgroundColor: colors.primary + '14' }]}>
                <Ionicons name="pencil-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionLabel, { color: themeColors.text }]}>Edit Product</Text>
                <Text style={[styles.actionSub, { color: themeColors.textSecondary }]}>Update details, price, images</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleDelete} activeOpacity={0.7}>
              <View style={[styles.actionIconWrap, { backgroundColor: colors.danger + '14' }]}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionLabel, { color: colors.danger }]}>Delete Product</Text>
                <Text style={[styles.actionSub, { color: themeColors.textSecondary }]}>Permanently remove this product</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCancel, { borderColor: themeColors.border }]}
              onPress={() => setOpen(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionCancelText, { color: themeColors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ─── Fullscreen Image Viewer ──────────────────────────────────────────────────

interface FullscreenViewerProps {
  images:       string[];
  initialIndex: number;
  visible:      boolean;
  onClose:      () => void;
}

const FullscreenImageViewer: React.FC<FullscreenViewerProps> = ({
  images, initialIndex, visible, onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: initialIndex * SCREEN_W, animated: false });
      }, 0);
    }
  }, [visible, initialIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  (_, g) => Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          setActiveIndex(prev => {
            const next = Math.min(prev + 1, images.length - 1);
            scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
            return next;
          });
        } else if (g.dx > SWIPE_THRESHOLD) {
          setActiveIndex(prev => {
            const next = Math.max(prev - 1, 0);
            scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
            return next;
          });
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar hidden />
      <View style={styles.fsContainer}>
        <TouchableOpacity style={styles.fsCloseBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <View style={styles.fsCloseBtnBg}>
            <Ionicons name="close" size={20} color={colors.white} />
          </View>
        </TouchableOpacity>
        {images.length > 1 && (
          <View style={styles.fsCounter}>
            <Text style={styles.fsCounterText}>{activeIndex + 1} / {images.length}</Text>
          </View>
        )}
        <View style={styles.fsImageArea} {...panResponder.panHandlers}>
          <ScrollView
            ref={scrollRef}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            style={{ width: SCREEN_W, height: SCREEN_H }}
          >
            {images.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width: SCREEN_W, height: SCREEN_H }} resizeMode="contain" />
            ))}
          </ScrollView>
        </View>
        {images.length > 1 && (
          <View style={styles.fsDotRow}>
            {images.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setActiveIndex(i);
                  scrollRef.current?.scrollTo({ x: i * SCREEN_W, animated: true });
                }}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <View style={[styles.dot, {
                  width:           i === activeIndex ? 16 : 5,
                  backgroundColor: i === activeIndex ? colors.white : 'rgba(255,255,255,0.45)',
                }]} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

// ─── Product Image Carousel ───────────────────────────────────────────────────

interface CarouselProps {
  imageUrl: string;
  images:   string[];
  width:    number;
  height:   number;
}

const ProductImageCarousel: React.FC<CarouselProps> = ({ imageUrl, images, width, height }) => {
  const allImages = [imageUrl, ...(images ?? [])].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fsVisible, setFsVisible]     = useState(false);
  const [fsTapIndex, setFsTapIndex]   = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [imageUrl, images?.length]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:  () => false,
      onMoveShouldSetPanResponder:   (_, g) => Math.abs(g.dx) > Math.abs(g.dy) * 1.5 && Math.abs(g.dx) > 8,
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          setActiveIndex(prev => {
            const next = Math.min(prev + 1, allImages.length - 1);
            scrollRef.current?.scrollTo({ x: next * width, animated: true });
            return next;
          });
        } else if (g.dx > SWIPE_THRESHOLD) {
          setActiveIndex(prev => {
            const next = Math.max(prev - 1, 0);
            scrollRef.current?.scrollTo({ x: next * width, animated: true });
            return next;
          });
        }
      },
    })
  ).current;

  const openFullscreen = () => { setFsTapIndex(activeIndex); setFsVisible(true); };

  if (allImages.length === 0) {
    return (
      <View style={[styles.imagePlaceholder, { width, height, backgroundColor: colors.primaryLight }]}>
        <Ionicons name="cube-outline" size={height * 0.35} color={colors.primary} />
      </View>
    );
  }

  if (allImages.length === 1) {
    return (
      <>
        <TouchableOpacity activeOpacity={0.9} onPress={openFullscreen}>
          <Image source={{ uri: allImages[0] }} style={{ width, height }} resizeMode="cover" />
        </TouchableOpacity>
        <FullscreenImageViewer images={allImages} initialIndex={0} visible={fsVisible} onClose={() => setFsVisible(false)} />
      </>
    );
  }

  return (
    <>
      <View style={{ width, height }} {...panResponder.panHandlers}>
        <TouchableOpacity activeOpacity={0.9} onPress={openFullscreen}>
          <ScrollView
            ref={scrollRef}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            style={{ width, height }}
          >
            {allImages.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width, height }} resizeMode="cover" />
            ))}
          </ScrollView>
        </TouchableOpacity>
        <View style={styles.carouselCounter} pointerEvents="none">
          <Text style={styles.carouselCounterText}>{activeIndex + 1}/{allImages.length}</Text>
        </View>
        <View style={styles.dotRow} pointerEvents="box-none">
          {allImages.map((_, i) => (
            <View key={i} style={[styles.dot, {
              width:           i === activeIndex ? 16 : 5,
              backgroundColor: i === activeIndex ? colors.white : 'rgba(255,255,255,0.5)',
            }]} />
          ))}
        </View>
      </View>
      <FullscreenImageViewer images={allImages} initialIndex={fsTapIndex} visible={fsVisible} onClose={() => setFsVisible(false)} />
    </>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product:       Product;
  layout:        'list' | 'grid';
  storeUsername: string;
  navigation:    any;
  onDeleted:     () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, layout, storeUsername, navigation, onDeleted }) => {
  const { colors: themeColors } = useTheme();
  const status = getStatus(product);

  const handleEdit = () => {
    navigation.navigate('EditProduct', { product, storeUsername });
  };

  // ── Grid card ─────────────────────────────────────────────────────────────
  if (layout === 'grid') {
    return (
      <TouchableOpacity
        activeOpacity={0.93}
        style={[styles.gridCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
      >
        <View style={[styles.gridImageWrap, { height: GRID_IMG_H }]}>
          <ProductImageCarousel imageUrl={product.imageUrl} images={product.images} width={GRID_IMG_W} height={GRID_IMG_H} />
          <View style={styles.gridScrim} pointerEvents="none" />
          <View style={styles.gridStatusBadge} pointerEvents="none">
            <Badge label={STATUS_LABEL[status]} variant={STATUS_VARIANT[status]} size="sm" />
          </View>
          {product.isFeatured && (
            <View style={styles.gridFeaturedPill} pointerEvents="none">
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={styles.gridFeaturedText}>Featured</Text>
            </View>
          )}
          {/* ⋯ now has real Edit/Delete logic */}
          <GridActionsMenu
            product={product}
            storeUsername={storeUsername}
            onEdit={handleEdit}
            onDeleted={onDeleted}
          />
        </View>

        <View style={styles.gridInfo}>
          <View style={styles.gridNameRow}>
            <Text style={[styles.gridName, { color: themeColors.text }]} numberOfLines={2}>{product.name}</Text>
            <View style={[styles.gridStockDot, { backgroundColor: STATUS_DOT_COLOR[status] }]} />
          </View>
          <Text style={[styles.gridSlug, { color: themeColors.textSecondary }]} numberOfLines={1}>/{product.slug}</Text>
          <View style={styles.gridPriceRow}>
            <Text style={[styles.gridPrice, { color: themeColors.text }]}>₹{product.price.toLocaleString()}</Text>
            {product.compareAtPrice > 0 && product.compareAtPrice > product.price && (
              <Text style={[styles.gridComparePrice, { color: themeColors.textSecondary }]}>
                ₹{product.compareAtPrice.toLocaleString()}
              </Text>
            )}
            <View style={{ flex: 1 }} />
            <View style={styles.gridStockPill}>
              <Text style={[styles.gridStockCount, { color: themeColors.textSecondary }]}>{product.stockCount} pcs</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── List card ─────────────────────────────────────────────────────────────
  return (
    <TouchableOpacity activeOpacity={0.75}>
      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <ProductImageCarousel imageUrl={product.imageUrl} images={product.images} width={64} height={64} />
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: themeColors.text }]} numberOfLines={2}>{product.name}</Text>
          <Text style={[styles.slug, { color: themeColors.textSecondary }]}>/{product.slug}</Text>
          <View style={styles.productMeta}>
            <Text style={[styles.price, { color: colors.primary }]}>₹{product.price.toLocaleString()}</Text>
            <Badge label={STATUS_LABEL[status]} variant={STATUS_VARIANT[status]} size="sm" />
          </View>
          <View style={styles.productStats}>
            <View style={styles.stat}>
              <Ionicons name="layers-outline" size={12} color={themeColors.textSecondary} />
              <Text style={[styles.statText, { color: themeColors.textSecondary }]}>{product.stockCount} in stock</Text>
            </View>
            {product.isFeatured && (
              <View style={styles.stat}>
                <Ionicons name="star-outline" size={12} color="#B45309" />
                <Text style={[styles.statText, { color: '#B45309' }]}>Featured</Text>
              </View>
            )}
          </View>
        </View>
        {/* List layout 3-dot with Edit + Delete */}
        <ProductActionsMenu
          product={product}
          storeUsername={storeUsername}
          onEdit={handleEdit}
          onDeleted={onDeleted}
        />
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const AllProductsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const { stores, activeStore, setActiveStore } = useAppStore();
  const { fetchPage, errors: cacheErrors, invalidate } = useProductStore();

  const [selectedStore, setSelectedStore] = useState<Store | null>(activeStore);
  const storeUsername = selectedStore?.username ?? '';

  const [products, setProducts]         = useState<Product[]>([]);
  const [total, setTotal]               = useState(0);
  const [hasMore, setHasMore]           = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [isLoading, setIsLoading]       = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [layout, setLayout]             = useState<'list' | 'grid'>('list');

  const loadPage = useCallback(async (page: number, force = false) => {
    if (!storeUsername) return;
    setIsLoading(true);
    setFetchError(null);
    const result = await fetchPage({ username: storeUsername, page, pageSize: PAGE_SIZE }, force);
    if (result) {
      setProducts(result.products);
      setTotal(result.total);
      setHasMore(result.hasMore);
    } else {
      const key = `${storeUsername}::${page}::${PAGE_SIZE}::`;
      setFetchError(cacheErrors[key] ?? 'Failed to load products.');
    }
    setIsLoading(false);
  }, [storeUsername, fetchPage, cacheErrors]);

  useEffect(() => {
    setProducts([]); setTotal(0); setHasMore(false);
    setSearch(''); setCurrentPage(1); setFetchError(null);
    loadPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeUsername]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    loadPage(currentPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Re-fetch current page after a delete so the list stays consistent
  const handleProductDeleted = useCallback(() => {
    loadPage(currentPage, true);
  }, [currentPage, loadPage]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPage(currentPage, true);
    setIsRefreshing(false);
  }, [currentPage, loadPage]);

  const handleStoreSelect = useCallback((store: Store) => {
    setSelectedStore(store);
    setActiveStore(store);
  }, [setActiveStore]);

  const filtered = useMemo(() =>
    products.filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    }),
    [products, search],
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (!stores.length) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No store found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>

      {/* ── Search + Add ── */}
      <View style={styles.topRow}>
        <View style={[styles.searchBar, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search products..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddProduct')}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── Store Switcher + Layout Toggle ── */}
      <View style={styles.secondRow}>
        <StoreSwitcher stores={stores} activeStore={selectedStore} onSelect={handleStoreSelect} />
        <View style={[styles.layoutToggleWrap, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          {(['list', 'grid'] as const).map((mode) => {
            const active = layout === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[styles.layoutToggleBtn, active && { backgroundColor: colors.primary }]}
                onPress={() => setLayout(mode)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={mode === 'list' ? 'list-outline' : 'grid-outline'}
                  size={16}
                  color={active ? colors.white : themeColors.textSecondary}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Stats ── */}
      <View style={[styles.statsRow, { borderBottomColor: themeColors.border }]}>
        {[
          { label: 'Total',     value: total },
          { label: 'Active',    value: products.filter(p => getStatus(p) === 'active').length },
          { label: 'Low Stock', value: products.filter(p => getStatus(p) === 'low').length },
          { label: 'Out',       value: products.filter(p => getStatus(p) === 'out').length },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{isLoading ? '—' : s.value}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {fetchError && !isLoading && (
        <TouchableOpacity style={styles.errorBanner} onPress={() => loadPage(currentPage, true)}>
          <Ionicons name="warning-outline" size={16} color={colors.danger} />
          <Text style={styles.errorText}>{fetchError} — Tap to retry</Text>
        </TouchableOpacity>
      )}

      {isLoading && !isRefreshing && (
        <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>
      )}

      {!isLoading && (
        <FlatList
          key={layout}
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={1}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing[6] }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              layout={layout}
              storeUsername={storeUsername}
              navigation={navigation}
              onDeleted={handleProductDeleted}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                {search ? 'No products match your search' : 'No products yet'}
              </Text>
            </View>
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                  onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? colors.textMuted : themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.pageInfo, { color: themeColors.textSecondary }]}>{currentPage} / {totalPages}</Text>
                <TouchableOpacity
                  style={[styles.pageBtn, !hasMore && styles.pageBtnDisabled]}
                  onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={!hasMore}
                >
                  <Ionicons name="chevron-forward" size={18} color={!hasMore ? colors.textMuted : themeColors.text} />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },

  topRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[2],
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    padding: spacing[3], borderRadius: radii.lg, borderWidth: 1.5, gap: spacing[2],
  },
  searchInput: { flex: 1, fontSize: typography.sizes.sm },
  addBtn: {
    backgroundColor: colors.primary, width: 44, height: 44,
    borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center',
  },

  secondRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingBottom: spacing[2],
  },

  storePill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    paddingHorizontal: spacing[3], paddingVertical: 9,
    borderRadius: radii.lg, borderWidth: 1.5, maxWidth: 200,
  },
  storePillText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, flexShrink: 1 },

  layoutToggleWrap: { flexDirection: 'row', borderRadius: radii.lg, borderWidth: 1.5, overflow: 'hidden' },
  layoutToggleBtn:  { width: 36, height: 34, alignItems: 'center', justifyContent: 'center' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  dropdown: {
    borderRadius: radii.xl, borderWidth: 1, overflow: 'hidden', maxHeight: 320,
    margin: spacing[4],
  },
  dropdownTitle: {
    fontSize: typography.sizes.xs, fontWeight: typography.weights.semiBold,
    letterSpacing: 0.8, textTransform: 'uppercase',
    paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[2],
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  dropdownItemLeft:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  storeInitial:          { width: 36, height: 36, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  storeInitialText:      { fontSize: typography.sizes.base, fontWeight: typography.weights.bold },
  storeLogoImage:        { width: 36, height: 36, borderRadius: radii.lg },
  dropdownStoreName:     { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  dropdownStoreUsername: { fontSize: typography.sizes.xs, marginTop: 1 },

  // ── Actions bottom sheet ──
  actionsSheet: {
    marginHorizontal: spacing[3],
    marginBottom: spacing[6],
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    padding: spacing[4],
  },
  actionsProductThumb: {
    width: 44, height: 44, borderRadius: radii.lg, overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center',
  },
  actionsThumbImage:   { width: 44, height: 44 },
  actionsProductName:  { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
  actionsProductSlug:  { fontSize: typography.sizes.xs, marginTop: 2 },
  actionsDivider:      { height: 1, marginHorizontal: spacing[4] },
  actionItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[4],
  },
  actionIconWrap: {
    width: 38, height: 38, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold },
  actionSub:   { fontSize: typography.sizes.xs, marginTop: 2 },
  actionCancel: {
    margin: spacing[3], marginTop: 0,
    borderWidth: 1.5, borderRadius: radii.lg,
    paddingVertical: spacing[3], alignItems: 'center',
  },
  actionCancelText: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },

  statsRow: {
    flexDirection: 'row', paddingHorizontal: spacing[4],
    paddingTop: spacing[2], paddingBottom: spacing[3],
    borderBottomWidth: 1, gap: spacing[2],
  },
  statCard:  { flex: 1, alignItems: 'center', paddingVertical: spacing[2] },
  statValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  statLabel: { fontSize: typography.sizes.xs, marginTop: 2 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    margin: spacing[4], padding: spacing[3], backgroundColor: '#FEE2E2', borderRadius: radii.lg,
  },
  errorText: { fontSize: typography.sizes.sm, color: colors.danger, flex: 1 },

  list: { paddingHorizontal: spacing[4], paddingTop: spacing[3] },

  // ── List card ──
  card: {
    flexDirection: 'row', padding: spacing[4],
    borderRadius: radii.xl, borderWidth: 1, gap: spacing[3], alignItems: 'flex-start',
  },
  productInfo:  { flex: 1 },
  productName:  { fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold, marginBottom: 2, lineHeight: 20 },
  slug:         { fontSize: typography.sizes.xs, marginBottom: spacing[2] },
  productMeta:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] },
  price:        { fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  productStats: { flexDirection: 'row', gap: spacing[4] },
  stat:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText:     { fontSize: typography.sizes.xs },

  // ── Grid card ──
  gridCard:      { width: '100%', borderRadius: radii.xl, borderWidth: 1, overflow: 'hidden' },
  gridImageWrap: { width: '100%', overflow: 'hidden', position: 'relative' },
  gridScrim: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 56, backgroundColor: 'rgba(0,0,0,0.22)',
  },
  gridStatusBadge:  { position: 'absolute', bottom: spacing[2], left: spacing[3] },
  gridFeaturedPill: {
    position: 'absolute', bottom: spacing[2], right: spacing[3],
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: radii.full,
    paddingHorizontal: spacing[2], paddingVertical: 3,
  },
  gridFeaturedText: { fontSize: 10, color: '#F59E0B', fontWeight: typography.weights.semiBold },
  gridMoreBtn: { position: 'absolute', top: spacing[2], right: spacing[2], zIndex: 10 },
  gridMoreBtnBg: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  gridInfo: {
    paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[4], gap: spacing[1],
  },
  gridNameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing[2] },
  gridName:    { flex: 1, fontSize: typography.sizes.base, fontWeight: typography.weights.semiBold, lineHeight: 20 },
  gridStockDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
  gridSlug:     { fontSize: typography.sizes.xs, marginTop: 1 },
  gridPriceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[2] },
  gridPrice:    { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  gridComparePrice: { fontSize: typography.sizes.sm, textDecorationLine: 'line-through' },
  gridStockPill: {
    backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: radii.full,
    paddingHorizontal: spacing[2], paddingVertical: 3,
  },
  gridStockCount: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },

  // ── Image placeholder ──
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },

  // ── Carousel chrome ──
  carouselCounter: {
    position: 'absolute', top: spacing[1], right: spacing[1],
    backgroundColor: 'rgba(0,0,0,0.50)', borderRadius: radii.full,
    paddingHorizontal: spacing[2], paddingVertical: 2, zIndex: 20,
  },
  carouselCounterText: { fontSize: 9, fontWeight: typography.weights.bold, color: colors.white },
  dotRow: {
    position: 'absolute', bottom: spacing[1], left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, zIndex: 20,
  },
  dot: { height: 5, borderRadius: 3 },

  // ── Fullscreen viewer ──
  fsContainer:  { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  fsImageArea:  { width: SCREEN_W, height: SCREEN_H, alignItems: 'center', justifyContent: 'center' },
  fsCloseBtn:   { position: 'absolute', top: 52, right: spacing[4], zIndex: 30 },
  fsCloseBtnBg: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center',
  },
  fsCounter: {
    position: 'absolute', top: 58, alignSelf: 'center', zIndex: 30,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radii.full,
    paddingHorizontal: spacing[3], paddingVertical: 4,
  },
  fsCounterText: { color: colors.white, fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  fsDotRow: {
    position: 'absolute', bottom: 48, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 4, zIndex: 30, width: '100%',
  },

  // ── Empty ──
  empty:     { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyText: { fontSize: typography.sizes.base },

  // ── Pagination ──
  pagination: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing[4], paddingVertical: spacing[4],
  },
  pageBtn: {
    width: 36, height: 36, borderRadius: radii.lg,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.05)',
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageInfo:        { fontSize: typography.sizes.sm },
});