// src/store/useAuthStore.ts
import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: (token) => set({ token }),

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1000));
      if (email && password) {
        const mockUser: User = {
          id: 'u1',
          name: 'Admin User',
          email,
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        set({ user: mockUser, isAuthenticated: true, token: 'mock-token', isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch {
      set({ isLoading: false });
      return false;
    }
},

signOut: () =>
    set({ user: null, token: null, isAuthenticated: false }),
}));