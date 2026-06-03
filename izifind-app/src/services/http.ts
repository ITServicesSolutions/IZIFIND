import axios from 'axios';
import { DEFAULT_API_BASE_URL } from '@/constants/theme';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const http = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

