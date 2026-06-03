import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { fetchMe, loginRequest, registerRequest } from '@/services/auth';
import { setAuthToken } from '@/services/http';
import type { RegisterPayload } from '@/services/auth';
import type { User } from '@/types/api';

const TOKEN_KEY = 'izifind.token';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (mounted && storedToken) {
          setToken(storedToken);
          setAuthToken(storedToken);
          try {
            const profile = await fetchMe();
            if (mounted) {
              setUser(profile);
            }
          } catch {
            if (mounted) {
              await SecureStore.deleteItemAsync(TOKEN_KEY);
              setToken(null);
              setAuthToken(null);
              setUser(null);
            }
          }
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persistToken = async (value: string | null) => {
    setToken(value);
    setAuthToken(value);
    if (value) {
      await SecureStore.setItemAsync(TOKEN_KEY, value);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await loginRequest(username, password);
      await persistToken(response.access_token);
      const profile = await fetchMe();
      setUser(profile);
    } catch (error) {
      await persistToken(null);
      throw error;
    }
  };

  const register = async (payload: RegisterPayload) => {
    await registerRequest(payload);
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const profile = await fetchMe();
      setUser(profile);
    } catch {
      await logout();
    }
  };

  const logout = async () => {
    setUser(null);
    await persistToken(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(token),
      isAdmin: Boolean(user?.is_superuser || user?.roles?.some((role) => role.name === 'admin')),
      login,
      register,
      refreshUser,
      logout,
    }),
    [isReady, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
