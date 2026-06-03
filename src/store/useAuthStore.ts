// src/store/useAuthStore.ts
import { create } from 'zustand';
import { login } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';
import { useAppStore } from './useAppStore';
import * as Device from 'expo-device';
import { getDeviceToken } from '../utils/getDeviceToken';
import { Platform } from 'react-native';

interface AuthState {
  isLoading: boolean;
  error:     string | null;
  signIn:    (username: string, password: string) => Promise<'ok' | 'no-store' | 'error'>;
  signOut:   () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: false,
  error:     null,

  signIn: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const deviceToken = await getDeviceToken();

      const response = await login({
        username,
        password,
        deviceId:    Device.modelId    ?? 'unknown',
        deviceType:  Platform.OS === 'ios' ? 'ios' : 'android',
        deviceToken,
        deviceName:  Device.deviceName ?? 'unknown',
        deviceModel: Device.modelName  ?? 'unknown',
        timestamp:   Date.now(),
      });

      const token = response?.data?.token;
      if (!token) {
        set({ isLoading: false, error: 'Login succeeded but no token received.' });
        return 'error';
      }

      await tokenStorage.saveToken(token);

      // Force re-bootstrap even if authStatus was previously 'authenticated'
      useAppStore.getState().clear();
      const result = await useAppStore.getState().bootstrap();

      if (result === 'ok') {
        set({ isLoading: false, error: null });
        return 'ok';
      }

      if (result === 'no-store') {
        set({ isLoading: false, error: null });
        return 'no-store';
      }

      set({ isLoading: false, error: 'Failed to load account data.' });
      return 'error';
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Login failed.' });
      return 'error';
    }
  },

  signOut: async () => {
    await tokenStorage.removeToken();
    useAppStore.getState().clear();
    set({ error: null });
  },
}));