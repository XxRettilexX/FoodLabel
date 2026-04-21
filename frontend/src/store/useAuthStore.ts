import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';

interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  login: (token: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // We attach a listener to client interceptor so it triggers a logout in zustand on 401
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await SecureStore.deleteItemAsync('auth_token');
        set({ token: null, user: null });
      }
      return Promise.reject(error);
    }
  );

  return {
    token: null,
    user: null,
    isLoading: true,
    login: async (token, user) => {
      await SecureStore.setItemAsync('auth_token', token);
      set({ token, user, isLoading: false });
    },
    logout: async () => {
      await SecureStore.deleteItemAsync('auth_token');
      try { await apiClient.post('/logout'); } catch (e) {}
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
