'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { UserDto } from '@vente/shared';
import { apiFetch, refreshAccessToken, setAccessToken } from './api-client';

interface AuthContextValue {
  user: UserDto | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const loadUser = React.useCallback(async () => {
    const token = await refreshAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await apiFetch<UserDto>('/users/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = React.useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: UserDto; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuthRetry: true,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    router.push('/');
  }, [router]);

  const register = React.useCallback(
    async (email: string, password: string, name: string) => {
      const data = await apiFetch<{ user: UserDto; accessToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
        skipAuthRetry: true,
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      router.push('/');
    },
    [router],
  );

  const logout = React.useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => undefined);
    setAccessToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const refreshUser = React.useCallback(async () => {
    const me = await apiFetch<UserDto>('/users/me');
    setUser(me);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
