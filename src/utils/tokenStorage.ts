// src/utils/tokenStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const BEARER_PREFIX = 'Bearer ';

let _cached: string | null = null;

export const tokenStorage = {
  async saveToken(token: string): Promise<void> {
    _cached = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    if (_cached) return _cached;
    _cached = await AsyncStorage.getItem(TOKEN_KEY);
    return _cached;
  },

  getTokenSync(): string | null {
    return _cached;
  },

  async getBearer(): Promise<string | null> {
    const token = await this.getToken();
    return token ? `${BEARER_PREFIX}${token}` : null;
  },

  async removeToken(): Promise<void> {
    _cached = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },

  async hydrate(): Promise<void> {
    _cached = await AsyncStorage.getItem(TOKEN_KEY);
  },
};