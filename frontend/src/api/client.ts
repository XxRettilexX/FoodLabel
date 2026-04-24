import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1';
const isInsecureHttp = /^http:\/\//i.test(baseURL);

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
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


export default apiClient;
