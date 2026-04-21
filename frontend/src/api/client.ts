import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor per gestire token scaduti/401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token scaduto o invalido, rimuoviamolo dal SecureStore
      await SecureStore.deleteItemAsync('auth_token');
      // Per reindirizzare, usiamo un EventEmmiter laterale o resettiamo lo store
      // Lo store rileverà l'assenza e forzerà il redirect se richiamato.
      // In alternativa, potremmo esportare un metodo 'setupInterceptors(store)' dall'api
    }
    return Promise.reject(error);
  }
);

export default apiClient;
