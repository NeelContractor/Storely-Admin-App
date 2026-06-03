// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';

interface UseAuthOptions {
  /** Screen to navigate to if not authenticated. Default: 'SignIn' */
  redirectTo?: string;
  /** Screen to navigate to if authenticated but has no stores. Default: 'CreateStore' */
  noStoreRedirect?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo = 'SignIn', noStoreRedirect = 'CreateStore' } = options;
  const navigation = useNavigation();
  const { authStatus, bootstrap } = useAppStore();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const result = await bootstrap();
      if (cancelled) return;

      if (result === 'no-token' || result === 'unauthorized') {
        navigation.reset({
          index: 0,
          routes: [{ name: redirectTo as never }],
        });
      } else if (result === 'no-store') {
        navigation.reset({
          index: 0,
          routes: [{ name: noStoreRedirect as never }],
        });
      }
      // 'ok' or 'error' → stay on screen
    };

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    /** True while the first auth check is in flight */
    isVerifying: authStatus === 'idle' || authStatus === 'loading',
    isAuthenticated: authStatus === 'authenticated',
    authStatus,
  };
}