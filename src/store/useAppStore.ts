// src/store/useAppStore.ts
//
// ─── SINGLE SOURCE OF TRUTH ──────────────────────────────────────────────────
//
// All remote data lives here. Every screen reads from this store.
// Nothing fetches on its own unless this store tells it to.
//
// Boot sequence (called once after login or on cold start):
//   bootstrap()         → loads user + stores (from userDetails)
//   loadStoreData(u)    → loads categories + products page-1 in parallel
//                         (orders/customers added here when those services exist)
//
// Switching stores:
//   setActiveStore(store) → auto-calls loadStoreData for new store
//
// Mutations (create / update / delete):
//   Optimistic: updateProductInCache / removeProductFromCache
//   Full reset: invalidateProducts / invalidateCategories
// ─────────────────────────────────────────────────────────────────────────────

import { create }                        from 'zustand';
import { persist, createJSONStorage }    from 'zustand/middleware';
import AsyncStorage                      from '@react-native-async-storage/async-storage';

import { userDetails }                   from '../services/userService';
import { getProducts, getCategories }    from '../services/productService';
import { tokenStorage }                  from '../utils/tokenStorage';

import type {
  User, Store, Product, GetAllProducts, ApiResponse,
} from '../types/types';

// ─── Domain types ─────────────────────────────────────────────────────────────

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

/** Matches what GET /api/v1/categories/{storeUsername} returns per item */
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

/** One page of products as stored in cache */
export interface ProductPage {
  products:  Product[];
  total:     number;
  hasMore:   boolean;
  fetchedAt: number;   // ms — used for TTL check
}

// ─── Per-store cache slot ──────────────────────────────────────────────────────
//
// keyed by storeUsername in AppState.storeCache so switching stores is instant
// if data is already loaded

interface StoreCache {
  // categories
  categories:    Category[] | null;   // null = never fetched / invalidated
  categoryError: string     | null;

  // products — keyed by productPageKey(page, pageSize, category?)
  products: Record<string, ProductPage>;

  // timestamp of the last successful loadStoreData() run
  loadedAt: number | null;
}

// ─── Persisted slice (written to AsyncStorage) ────────────────────────────────

interface PersistedSlice {
  user:        User  | null;
  stores:      Store[];
  activeStore: Store | null;
}

// ─── Full store interface ──────────────────────────────────────────────────────

interface AppState extends PersistedSlice {
  // auth
  authStatus:      AuthStatus;
  authError:       string | null;

  // loading flags
  isBootstrapping: boolean;
  isLoadingStore:  boolean;

  // data cache
  storeCache: Record<string, StoreCache>;

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Call on cold-start and immediately after a successful login.
   * Hits POST /api/v1/rest/common/userDetails (requiresAuth: true).
   * On success triggers loadStoreData() for the active store.
   */
  bootstrap: () => Promise<'ok' | 'no-token' | 'no-store' | 'unauthorized' | 'error'>;

  /**
   * Fetch categories + page-1 products for a store in parallel.
   * Skips if cache is fresher than CACHE_TTL_MS.
   * Pass force=true to bypass TTL (e.g. pull-to-refresh).
   */
  loadStoreData: (storeUsername: string, force?: boolean) => Promise<void>;

  // store switching
  setActiveStore:    (store: Store)   => void;
  updateStoreInList: (updated: Store) => void;

  // product helpers
  /**
   * Fetch any page beyond page 1 (pagination).
   * Returns cached page if still fresh, otherwise calls the API.
   */
  fetchProductPage: (
    storeUsername: string,
    page:          number,
    pageSize:      number,
    category?:     string,
  ) => Promise<ProductPage | null>;

  /** Optimistically patch one product across all cached pages (after update). */
  updateProductInCache: (storeUsername: string, product: Product) => void;

  /** Optimistically remove one product from all cached pages (after delete). */
  removeProductFromCache: (storeUsername: string, productId: string) => void;

  /** Wipe product cache so next access re-fetches from API. */
  invalidateProducts: (storeUsername: string) => void;

  // category helpers
  /** Wipe category cache so next access re-fetches from API. */
  invalidateCategories: (storeUsername: string) => void;

  // selectors — call these in screens instead of reaching into storeCache directly
  getCategories:  (storeUsername: string) => Category[]   | null;
  getProductPage: (storeUsername: string, page: number, pageSize: number, category?: string) => ProductPage | null;

  // reset (sign-out)
  clear: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60_000; // 60 seconds

function productPageKey(page: number, pageSize: number, category?: string): string {
  return `${page}::${pageSize}::${category ?? ''}`;
}

function emptyStoreCache(): StoreCache {
  return {
    categories:    null,
    categoryError: null,
    products:      {},
    loadedAt:      null,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({

      // ── initial state ──────────────────────────────────────────────────────
      user:            null,
      stores:          [],
      activeStore:     null,
      authStatus:      'idle',
      authError:       null,
      isBootstrapping: false,
      isLoadingStore:  false,
      storeCache:      {},

      // ══ bootstrap ══════════════════════════════════════════════════════════
      //
      // Uses:  POST /api/v1/rest/common/userDetails  (requiresAuth: true)
      // Shape: ApiResponse<User>  →  response.data.stores[]
      //
      bootstrap: async () => {
        // Already up and running in this session
        if (get().authStatus === 'authenticated' && get().activeStore) return 'ok';
        // Guard against concurrent calls
        if (get().isBootstrapping) return 'ok';

        const token = await tokenStorage.getToken();
        if (!token) {
          set({ authStatus: 'unauthenticated', user: null, stores: [], activeStore: null });
          return 'no-token';
        }

        set({ authStatus: 'loading', authError: null, isBootstrapping: true });

        try {
          // userDetails() → ApiResponse<User>
          const response        = await userDetails();
          const user: User      = response.data;
          const stores: Store[] = user?.stores ?? [];

          if (!stores.length) {
            set({
              authStatus:      'unauthenticated',
              user,
              stores:          [],
              activeStore:     null,
              isBootstrapping: false,
            });
            return 'no-store';
          }

          // Prefer previously selected store if it still exists in the list
          const current     = get().activeStore;
          const activeStore = (current && stores.find(s => s.id === current.id)) ?? stores[0];

          set({
            authStatus:      'authenticated',
            user,
            stores,
            activeStore,
            authError:       null,
            isBootstrapping: false,
          });

          // Non-blocking — screens can render while this loads
          get().loadStoreData(activeStore.username);

          return 'ok';
        } catch (err: any) {
          const is401 =
            err?.status === 401 ||
            err?.message?.toLowerCase().includes('unauthorized');

          if (is401) {
            await tokenStorage.removeToken();
            set({
              authStatus:      'unauthenticated',
              user:            null,
              stores:          [],
              activeStore:     null,
              isBootstrapping: false,
            });
            return 'unauthorized';
          }

          set({
            authStatus:      'error',
            authError:       err?.message || 'Failed to load profile.',
            isBootstrapping: false,
          });
          return 'error';
        }
      },

      // ══ loadStoreData ═══════════════════════════════════════════════════════
      //
      // Fires two requests in parallel:
      //
      //   GET /api/v1/categories/{storeUsername}           (requiresAuth: true)
      //       → ApiResponse<Category[]>   response.data = Category[]
      //
      //   GET /api/v1/rest/stores/{username}/products
      //       ?page=1&pageSize=20                          (requiresAuth: true)
      //       → ApiResponse<GetAllProducts>
      //         response.data.products  = Product[]
      //         response.data.meta      = { total, page, pageSize, hasMore }
      //
      loadStoreData: async (storeUsername, force = false) => {
        const existing = get().storeCache[storeUsername];
        const now      = Date.now();

        // Fresh cache — nothing to do
        if (!force && existing?.loadedAt && now - existing.loadedAt < CACHE_TTL_MS) return;
        // Another call already in flight
        if (get().isLoadingStore) return;

        set({ isLoadingStore: true });

        // Initialise cache slot if this store is new
        if (!get().storeCache[storeUsername]) {
          set(s => ({
            storeCache: { ...s.storeCache, [storeUsername]: emptyStoreCache() },
          }));
        }

        // ── parallel fetch ─────────────────────────────────────────────────
        const [catResult, prodResult] = await Promise.allSettled([
          getCategories(storeUsername),                                    // ApiResponse<Category[]>
          getProducts(storeUsername, { page: 1, pageSize: 20 }),          // ApiResponse<GetAllProducts>
        ]);

        set(s => {
          const prev = s.storeCache[storeUsername] ?? emptyStoreCache();

          // ── categories ────────────────────────────────────────────────────
          //   getCategories returns ApiResponse<Category[]>
          //   so the list is at response.data
          let categories    = prev.categories;
          let categoryError = prev.categoryError;

          if (catResult.status === 'fulfilled') {
            const raw = catResult.value.data;
            categories    = Array.isArray(raw) ? raw : [];
            categoryError = null;
          } else {
            categoryError = catResult.reason?.message || 'Failed to fetch categories.';
            // Keep stale categories if available so the UI doesn't blank out
          }

          // ── products page 1 ───────────────────────────────────────────────
          //   getProducts returns ApiResponse<GetAllProducts>
          //   so the payload is at response.data  →  { products[], meta{} }
          let products = { ...prev.products };

          if (prodResult.status === 'fulfilled') {
            const payload  = prodResult.value.data;               // GetAllProducts
            const pageKey  = productPageKey(1, 20);
            products[pageKey] = {
              products:  payload?.products ?? [],
              total:     payload?.meta?.total    ?? 0,
              hasMore:   payload?.meta?.hasMore  ?? false,
              fetchedAt: Date.now(),
            };
          }
          // On failure we keep whatever was cached before — no blank-out

          return {
            isLoadingStore: false,
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
        get().loadStoreData(store.username);   // no-op if cache is fresh
      },

      updateStoreInList: (updated) =>
        set(s => ({
          stores:      s.stores.map(st => st.id === updated.id ? updated : st),
          activeStore: s.activeStore?.id === updated.id ? updated : s.activeStore,
        })),

      // ══ fetchProductPage ════════════════════════════════════════════════════
      //
      // Called by pagination (AllProductsScreen, etc.) for pages > 1.
      // Uses the same GET /products endpoint with different page params.
      //
      fetchProductPage: async (storeUsername, page, pageSize, category) => {
        const key      = productPageKey(page, pageSize, category);
        const existing = get().storeCache[storeUsername]?.products?.[key];
        const now      = Date.now();

        // Return fresh cached page immediately
        if (existing && now - existing.fetchedAt < CACHE_TTL_MS) return existing;

        try {
          const res     = await getProducts(storeUsername, {
            page,
            pageSize,
            ...(category !== undefined ? { category } : {}),
          });
          const payload = res.data;   // GetAllProducts
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
                [storeUsername]: {
                  ...prev,
                  products: { ...prev.products, [key]: data },
                },
              },
            };
          });

          return data;
        } catch {
          return null;
        }
      },

      // ══ updateProductInCache ════════════════════════════════════════════════
      //
      // Call after a successful PUT /products/{slug}.
      // Patches the product in every cached page — no refetch needed.
      //
      updateProductInCache: (storeUsername, product) =>
        set(s => {
          const prev = s.storeCache[storeUsername];
          if (!prev) return {};

          const products = Object.fromEntries(
            Object.entries(prev.products).map(([k, pg]) => [
              k,
              { ...pg, products: pg.products.map(p => p.id === product.id ? product : p) },
            ])
          );

          return { storeCache: { ...s.storeCache, [storeUsername]: { ...prev, products } } };
        }),

      // ══ removeProductFromCache ══════════════════════════════════════════════
      //
      // Call after a successful DELETE /products/{slug}.
      // Removes the product from every cached page and decrements totals.
      //
      removeProductFromCache: (storeUsername, productId) =>
        set(s => {
          const prev = s.storeCache[storeUsername];
          if (!prev) return {};

          const products = Object.fromEntries(
            Object.entries(prev.products).map(([k, pg]) => {
              const filtered = pg.products.filter(p => p.id !== productId);
              return [
                k,
                {
                  ...pg,
                  products: filtered,
                  total:    filtered.length < pg.products.length
                              ? Math.max(0, pg.total - 1)
                              : pg.total,
                },
              ];
            })
          );

          return { storeCache: { ...s.storeCache, [storeUsername]: { ...prev, products } } };
        }),

      // ══ invalidateProducts ══════════════════════════════════════════════════
      //
      // Wipes product cache. Next time fetchProductPage / loadStoreData is
      // called it will re-fetch from the API. Use after bulk operations.
      //
      invalidateProducts: (storeUsername) =>
        set(s => {
          const prev = s.storeCache[storeUsername];
          if (!prev) return {};
          return {
            storeCache: {
              ...s.storeCache,
              [storeUsername]: { ...prev, products: {}, loadedAt: null },
            },
          };
        }),

      // ══ invalidateCategories ════════════════════════════════════════════════
      invalidateCategories: (storeUsername) =>
        set(s => {
          const prev = s.storeCache[storeUsername];
          if (!prev) return {};
          return {
            storeCache: {
              ...s.storeCache,
              [storeUsername]: { ...prev, categories: null, loadedAt: null },
            },
          };
        }),

      // ══ Selectors ═══════════════════════════════════════════════════════════

      getCategories: (u) =>
        get().storeCache[u]?.categories ?? null,

      getProductPage: (u, page, pageSize, category) =>
        get().storeCache[u]?.products?.[productPageKey(page, pageSize, category)] ?? null,

      // ══ clear ════════════════════════════════════════════════════════════════
      //
      // Call on sign-out. Wipes in-memory state AND AsyncStorage persisted slice.
      //
      clear: () =>
        set({
          user:            null,
          stores:          [],
          activeStore:     null,
          authStatus:      'idle',   // 'idle' not 'unauthenticated' so bootstrap re-runs cleanly
          authError:       null,
          isBootstrapping: false,
          isLoadingStore:  false,
          storeCache:      {},
        }),
    }),

    // ── Persistence config ───────────────────────────────────────────────────
    {
      name:    'app-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist identity — never auth status or cache.
      // On cold start bootstrap() always re-validates the token.
      partialize: (state): PersistedSlice => ({
        user:        state.user,
        stores:      state.stores,
        activeStore: state.activeStore,
      }),
    }
  )
);