import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

function getApiBaseUrl(): string {
  // 1. Explicit env variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Dynamically extract the IP from Expo Metro bundler (useful when switching Wi-Fi/Hotspots)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:8000/api/v1`;
    }
  }

  // 3. Default fallback for Android Emulator
  return 'http://10.0.2.2:8000/api/v1';
}

const baseURL = getApiBaseUrl();
const isInsecureHttp = /^http:\/\//i.test(baseURL);

let onUnauthorized: (() => void | Promise<void>) | null = null;

export function setUnauthorizedHandler(handler: (() => void | Promise<void>) | null) {
  onUnauthorized = handler;
}

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  // In release builds we should not talk to the API over plain HTTP.
  // Keep HTTP allowed in dev to preserve current local workflow.
  // eslint-disable-next-line no-undef
  if (!__DEV__ && isInsecureHttp) {
    return Promise.reject(
      new Error('Insecure API URL (HTTP). Configure EXPO_PUBLIC_API_URL to use HTTPS in release builds.')
    );
  }

  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && onUnauthorized) {
      try {
        await onUnauthorized();
      } catch {
        // best-effort
      }
    }
    return Promise.reject(error);
  }
);


export default apiClient;
