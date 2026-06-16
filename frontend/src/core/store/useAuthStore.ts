import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import apiClient, { setUnauthorizedHandler } from '../api/client';
// BUG 3 FIX: Use typed User interface instead of `any` to prevent type-unsafe property access.
import { User } from '../../shared/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Centralize 401 handling in api client (avoid duplicate interceptors).
  setUnauthorizedHandler(async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, user: null });
  });

  return {
    token: null,
    user: null,
    isLoading: true,
    login: async (token, user) => {
      await SecureStore.setItemAsync('auth_token', token);
      set({ token, user, isLoading: false });
    },
    logout: async () => {
      // Bug fix: call /logout while the Bearer token is still in SecureStore so the
      // server can revoke the Sanctum token. Clearing storage first made logout a no-op server-side.
      try {
        await apiClient.post('/logout');
      } catch {
        // best-effort — still clear local session if the network call fails
      }
      await SecureStore.deleteItemAsync('auth_token');
      set({ token: null, user: null });
    },
    checkAuth: async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          // Verify with server using /me route
          const res = await apiClient.get('/me');
          if (res.data && res.data.data) {
            set({ token, user: res.data.data, isLoading: false });
          } else {
            // Se la risposta è anomala gestiamo come errore
            throw new Error('User fetch failed');
          }
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        await SecureStore.deleteItemAsync('auth_token');
        set({ token: null, user: null, isLoading: false });
      }
    }
  };
});
