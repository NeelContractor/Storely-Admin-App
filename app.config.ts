// app.config.ts
import { ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext) => ({
  ...config,
  
  name: 'Storely',
  slug: 'storely-admin-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',

  plugins: [
    'expo-font',
    'expo-secure-store',
  ],

  splash: {
    image: './assets/storely-logo-main.png',
    resizeMode: 'contain',
    backgroundColor: '#1C2434',
  },

  assetBundlePatterns: ['**/*'],

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.storely.admin',
  },

  android: {
    adaptiveIcon: {
      foregroundImage: './assets/storely-logo-main.png',
      backgroundColor: '#1C2434',
    },
    package: 'com.storely.admin',
  },

  web: {
    favicon: './assets/favicon.png',
  },

  extra: {
    apiUrl: process.env.EXPO_PUBLIC_BE_API_URL,
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '',
    },
  },
});