// src/store/useAppStore.ts  — full updated file
import { create }                        from 'zustand';
import { persist, createJSONStorage }    from 'zustand/middleware';
import AsyncStorage                      from '@react-native-async-storage/async-storage';

import { userDetails }                   from '../services/userService';
import { getProducts, getCategories }    from '../services/productService';
import { tokenStorage }                  from '../utils/tokenStorage';

import type {
  User, Store, Product, GetAllProducts, ApiResponse,
} from '../types/types';

export type AuthStatus =
  | 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface Category {
  id:            number;
  name:          string;
  slug:          string;
  description?:  string;
  imageUrl?:     string;
  parentId?:     number;
  displayOrder?: number;
  active?:       boolean;
}

export interface ProductPage {
  products:  Product[];
  total:     number;
  hasMore:   boolean;
  fetchedAt: number;
}

interface StoreCache {
  categories:    Category[] | null;
  categoryError: string     | null;
  products:      Record<string, ProductPage>;
  loadedAt:      number | null;
}

interface PersistedSlice {
  user:        User  | null;
  stores:      Store[];
  activeStore: Store | null;
}

interface AppState extends PersistedSlice {
  authStatus:      AuthStatus;
  authError:       string | null;
  isBootstrapping: boolean;

  // ✅ Per-store loading flag — replaces the single isLoadingStore bool
  loadingStores:   Record<string, boolean>;

  storeCache:      Record<string, StoreCache>;

  bootstrap:            () => Promise<'ok' | 'no-token' | 'no-store' | 'unauthorized' | 'error'>;
  loadStoreData:        (storeUsername: string, force?: boolean) => Promise<void>;
  setActiveStore:       (store: Store)   => void;
  updateStoreInList:    (updated: Store) => void;
  fetchProductPage:     (storeUsername: string, page: number, pageSize: number, category?: string) => Promise<ProductPage | null>;
  updateProductInCache: (storeUsername: string, product: Product) => void;
  removeProductFromCache:(storeUsername: string, productId: string) => void;
  invalidateProducts:   (storeUsername: string) => void;
  invalidateCategories: (storeUsername: string) => void;
  getCategories:        (storeUsername: string) => Category[]   | null;
  getProductPage:       (storeUsername: string, page: number, pageSize: number, category?: string) => ProductPage | null;
  clear:                () => void;
}

const CACHE_TTL_MS = 60_000;

function productPageKey(page: number, pageSize: number, category?: string): string {
  return `${page}::${pageSize}::${category ?? ''}`;
}

function emptyStoreCache(): StoreCache {
  return { categories: null, categoryError: null, products: {}, loadedAt: null };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({

      user:            null,
      stores:          [],
      activeStore:     null,
      authStatus:      'idle',
      authError:       null,
      isBootstrapping: false,
      loadingStores:   {},      // ✅ replaces isLoadingStore
      storeCache:      {},

      // ══ bootstrap ══════════════════════════════════════════════════════════
      bootstrap: async () => {
        if (get().authStatus === 'authenticated' && get().activeStore) return 'ok';
        if (get().isBootstrapping) return 'ok';

        const token = await tokenStorage.getToken();
        if (!token) {
          set({ authStatus: 'unauthenticated', user: null, stores: [], activeStore: null });
          return 'no-token';
        }

        set({ authStatus: 'loading', authError: null, isBootstrapping: true });

        try {
          const response        = await userDetails();
          const user: User      = response.data;
          const stores: Store[] = user?.stores ?? [];

          if (!stores.length) {
            set({ authStatus: 'unauthenticated', user, stores: [], activeStore: null, isBootstrapping: false });
            return 'no-store';
          }

          const current     = get().activeStore;
          const activeStore = (current && stores.find(s => s.id === current.id)) ?? stores[0];

          set({ authStatus: 'authenticated', user, stores, activeStore, authError: null, isBootstrapping: false });

          // Load ALL stores in parallel on bootstrap so HomeScreen totals are ready
          stores.forEach(s => get().loadStoreData(s.username));

          return 'ok';
        } catch (err: any) {
          const is401 = err?.status === 401 || err?.message?.toLowerCase().includes('unauthorized');
          if (is401) {
            await tokenStorage.removeToken();
            set({ authStatus: 'unauthenticated', user: null, stores: [], activeStore: null, isBootstrapping: false });
            return 'unauthorized';
          }
          set({ authStatus: 'error', authError: err?.message || 'Failed to load profile.', isBootstrapping: false });
          return 'error';
        }
      },

      // ══ loadStoreData ═══════════════════════════════════════════════════════
      loadStoreData: async (storeUsername, force = false) => {
        const existing = get().storeCache[storeUsername];
        const now      = Date.now();

        // Fresh cache — skip
        if (!force && existing?.loadedAt && now - existing.loadedAt < CACHE_TTL_MS) return;

        // ✅ Per-store in-flight guard — doesn't block other stores
        if (get().loadingStores[storeUsername]) return;

        set(s => ({ loadingStores: { ...s.loadingStores, [storeUsername]: true } }));

        if (!get().storeCache[storeUsername]) {
          set(s => ({ storeCache: { ...s.storeCache, [storeUsername]: emptyStoreCache() } }));
        }

        const [catResult, prodResult] = await Promise.allSettled([
          getCategories(storeUsername),
          getProducts(storeUsername, { page: 1, pageSize: 20 }),
        ]);

        set(s => {
          const prev = s.storeCache[storeUsername] ?? emptyStoreCache();

          let categories    = prev.categories;
          let categoryError = prev.categoryError;

          if (catResult.status === 'fulfilled') {
            const raw  = catResult.value.data;
            categories    = Array.isArray(raw) ? raw : [];
            categoryError = null;
          } else {
            categoryError = catResult.reason?.message || 'Failed to fetch categories.';
          }

          let products = { ...prev.products };

          if (prodResult.status === 'fulfilled') {
            const payload = prodResult.value.data;
            const pageKey = productPageKey(1, 20);
            products[pageKey] = {
              products:  payload?.products ?? [],
              total:     payload?.meta?.total   ?? 0,
              hasMore:   payload?.meta?.hasMore ?? false,
              fetchedAt: Date.now(),
            };
          }

          // ✅ Clear this store's loading flag, not a global one
          const loadingStores = { ...s.loadingStores };
          delete loadingStores[storeUsername];

          return {
            loadingStores,
            storeCache: {
              ...s.storeCache,
              [storeUsername]: {
                ...prev,
                categories,
                categoryError,
                products,
                loadedAt: Date.now(),
              },
            },
          };
        });
      },

      // ══ setActiveStore ══════════════════════════════════════════════════════
      setActiveStore: (store) => {
        set({ activeStore: store });
        get().loadStoreData(store.username);
      },

      updateStoreInList: (updated) =>
        set(s => ({
          stores:      s.stores.map(st => st.id === updated.id ? updated : st),
          activeStore: s.activeStore?.id === updated.id ? updated : s.activeStore,
        })),

      // ══ fetchProductPage ════════════════════════════════════════════════════
      fetchProductPage: async (storeUsername, page, pageSize, category) => {
        const key      = productPageKey(page, pageSize, category);
        const existing = get().storeCache[storeUsername]?.products?.[key];
        const now      = Date.now();

        if (existing && now - existing.fetchedAt < CACHE_TTL_MS) return existing;

        try {
          const res     = await getProducts(storeUsername, { page, pageSize, ...(category !== undefined ? { category } : {}) });
          const payload = res.data;
          const data: ProductPage = {
            products:  payload?.products ?? [],
            total:     payload?.meta?.total   ?? 0,
            hasMore:   payload?.meta?.hasMore ?? false,
            fetchedAt: Date.now(),
          };

          set(s => {
            const prev = s.storeCache[storeUsername] ?? emptyStoreCache();
            return {
              storeCache: {
                ...s.storeCache,
                [storeUsername]: { ...prev, products: { ...prev.products, [key]: data } },
              },
            };
          });

          return data;
        } catch {
          return null;
        }
      },

      // ══ Cache mutations ═════════════════════════════════════════════════════
      updateProductInCache: (storeUsername, product) =>
        set(s => {
          const prev = s.storeCache[storeUsername];
          if (!prev) return {};
          const products = Object.fromEntries(
            Object.entries(prev.products).map(([k, pg]) => [
              k, { ...pg, products: pg.products.map(p => p.id === product.id ? product : p) },
            ])
          );
          return { storeCache: { ...s.storeCache, [storeUsername]: { ...prev, products } } };
        }),

      removeProductFromCache: (storeUsername, productId) =>
        set(s => {
          const prev = s.storeCache[storeUsername];
          if (!prev) return {};
          const products = Object.fromEntries(
            Object.entries(prev.products).map(([k, pg]) => {
              const filtered = pg.products.filter(p => p.id !== productId);
              return [k, { ...pg, products: filtered, total: filtered.length < pg.products.length ? Math.max(0, pg.total - 1) : pg.total }];
            })
          );
          return { storeCache: { ...s.storeCache, [storeUsername]: { ...prev, products } } };
        }),

      invalidateProducts: (storeUsername) =>
        set(s => {
          const prev = s.storeCache[storeUsername];
          if (!prev) return {};
          return { storeCache: { ...s.storeCache, [storeUsername]: { ...prev, products: {}, loadedAt: null } } };
        }),

      invalidateCategories: (storeUsername) =>
        set(s => {
          const prev = s.storeCache[storeUsername];
          if (!prev) return {};
          return { storeCache: { ...s.storeCache, [storeUsername]: { ...prev, categories: null, loadedAt: null } } };
        }),

      // ══ Selectors ═══════════════════════════════════════════════════════════
      getCategories:  (u) => get().storeCache[u]?.categories ?? null,
      getProductPage: (u, page, pageSize, category) =>
        get().storeCache[u]?.products?.[productPageKey(page, pageSize, category)] ?? null,

      // ══ clear ════════════════════════════════════════════════════════════════
      clear: () =>
        set({
          user: null, stores: [], activeStore: null,
          authStatus: 'idle', authError: null,
          isBootstrapping: false, loadingStores: {}, storeCache: {},
        }),
    }),
    {
      name:    'app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): PersistedSlice => ({
        user:        state.user,
        stores:      state.stores,
        activeStore: state.activeStore,
      }),
    }
  )
);