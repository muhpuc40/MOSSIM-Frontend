"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Customer } from "@/type/Auth";
import { authService } from "@/services/auth";

interface AuthContextType {
  user: Customer | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: Customer) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "mossim_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── On mount: restore session from localStorage ── */
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setLoading(false);
      return;
    }

    authService
      .me(saved)
      .then((customer) => {
        setToken(saved);
        setUser(customer);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveToken = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const login = useCallback(async (loginVal: string, password: string) => {
    const { access_token, customer } = await authService.login(
      loginVal,
      password,
    );
    saveToken(access_token);
    setUser(customer);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      phone: string,
      password: string,
      passwordConfirmation: string,
    ) => {
      const { access_token, customer } = await authService.register({
        name,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
      });
      saveToken(access_token);
      setUser(customer);
    },
    [],
  );

  const logout = useCallback(async () => {
    if (token) {
      await authService.logout(token).catch(() => {});
    }
    clearSession();
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const customer = await authService.me(token);
    setUser(customer);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
