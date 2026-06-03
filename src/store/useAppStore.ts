// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userDetails } from '../services/userService';
import { tokenStorage } from '../utils/tokenStorage';
import type { User, Store } from '../types/types';

// 'error' added to the type — was cast with `as any` before
type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AppState {
    user:             User | null;
    stores:           Store[];
    activeStore:      Store | null;
    authStatus:       AuthStatus;
    authError:        string | null;
    bootstrap:        () => Promise<'ok' | 'no-token' | 'no-store' | 'unauthorized' | 'error'>;
    setActiveStore:   (store: Store) => void;
    updateStoreInList:(updated: Store) => void;
    clear:            () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            user:        null,
            stores:      [],
            activeStore: null,
            authStatus:  'idle',
            authError:   null,

            bootstrap: async () => {
                // Only skip if already authenticated in this session
                if (get().authStatus === 'authenticated') return 'ok';

                const token = await tokenStorage.getToken();
                if (!token) {
                    set({ authStatus: 'unauthenticated', user: null, stores: [], activeStore: null });
                    return 'no-token';
                }

                set({ authStatus: 'loading', authError: null });

                try {
                    const response    = await userDetails();
                    const user: User  = response?.data;
                    const stores: Store[] = user?.stores ?? [];

                    if (!stores.length) {
                        set({ authStatus: 'unauthenticated', user, stores: [], activeStore: null });
                        return 'no-store';
                    }

                    const current     = get().activeStore;
                    const activeStore =
                        (current && stores.find(s => s.id === current.id)) ?? stores[0];

                    set({ authStatus: 'authenticated', user, stores, activeStore, authError: null });
                    return 'ok';
                } catch (err: any) {
                    const is401 =
                        err?.status === 401 ||
                        err?.message?.toLowerCase().includes('unauthorized');

                    if (is401) {
                        await tokenStorage.removeToken();
                        set({ authStatus: 'unauthenticated', user: null, stores: [], activeStore: null });
                        return 'unauthorized';
                    }

                    set({ authStatus: 'error', authError: err?.message || 'Failed to load profile.' });
                    return 'error';
                }
            },

            setActiveStore: (store) => set({ activeStore: store }),

            updateStoreInList: (updated) =>
                set(state => ({
                    stores:      state.stores.map(s => s.id === updated.id ? updated : s),
                    activeStore: state.activeStore?.id === updated.id ? updated : state.activeStore,
                })),

            clear: () =>
                set({
                    user:        null,
                    stores:      [],
                    activeStore: null,
                    authStatus:  'idle',      // ← 'idle' not 'unauthenticated' so bootstrap re-runs
                    authError:   null,
                }),
        }),
        {
            name:    'app-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user:        state.user,
                stores:      state.stores,
                activeStore: state.activeStore,
                // authStatus NOT persisted — always re-verify from token on launch
            }),
        }
    )
);