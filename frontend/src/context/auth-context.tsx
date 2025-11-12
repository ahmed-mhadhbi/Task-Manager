"use client";

import { PropsWithChildren, createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import type { AuthResponse, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "kanban_auth";

interface StoredAuth {
  token: string;
  user: User;
}

function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (parsed?.token && parsed?.user) {
      return parsed;
    }
  } catch {
    // ignore parsing errors
  }
  return null;
}

function writeStoredAuth(value: StoredAuth | null) {
  if (typeof window === "undefined") return;
  if (!value) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) {
      startTransition(() => setIsLoading(false));
      return;
    }

    startTransition(() => setToken(stored.token));
    authApi
      .me(stored.token)
      .then((fetchedUser) => {
        startTransition(() => {
          setUser(fetchedUser);
          writeStoredAuth({ token: stored.token, user: fetchedUser });
        });
      })
      .catch(() => {
        startTransition(() => {
          writeStoredAuth(null);
          setUser(null);
          setToken(null);
        });
      })
      .finally(() => {
        startTransition(() => setIsLoading(false));
      });
  }, []);

  const persistAuth = useCallback((auth: AuthResponse) => {
    setUser(auth.user);
    setToken(auth.accessToken);
    writeStoredAuth({ token: auth.accessToken, user: auth.user });
  }, []);

  const handleLogin = useCallback(
    async (credentials: { email: string; password: string }) => {
      const auth = await authApi.login(credentials);
      persistAuth(auth);
    },
    [persistAuth],
  );

  const handleRegister = useCallback(
    async (payload: { email: string; password: string; name?: string }) => {
      const auth = await authApi.register(payload);
      persistAuth(auth);
    },
    [persistAuth],
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    writeStoredAuth(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
    }),
    [user, token, isLoading, handleLogin, handleRegister, handleLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

