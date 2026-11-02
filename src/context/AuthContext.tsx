"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

/** Refresh up to this many seconds before the access token expires. */
const REFRESH_EARLY_SEC = 120;

/** `iat` / `exp` claims (unix seconds) of a JWT, or null if they can't be read. */
function tokenClaims(token: string): { iat?: number; exp?: number } | null {
  try {
    const part = token.split(".")[1];
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

const secondsLeft = (token: string) => {
  const exp = tokenClaims(token)?.exp;
  return typeof exp === "number" ? exp - Date.now() / 1000 : Infinity;
};

/** How early to refresh: 2 minutes, but never more than a quarter of the token's
 *  lifetime (so a short JWT_TTL can't cause a refresh loop). */
const refreshMargin = (token: string) => {
  const c = tokenClaims(token);
  if (typeof c?.exp !== "number" || typeof c?.iat !== "number") return REFRESH_EARLY_SEC;
  return Math.min(REFRESH_EARLY_SEC, (c.exp - c.iat) / 4);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshing = useRef<Promise<string | null> | null>(null);

  const saveToken = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  /** Swap the token for a fresh one (one request at a time). Returns null if the session is over. */
  const refreshToken = useCallback(async (current: string): Promise<string | null> => {
    if (!refreshing.current) {
      refreshing.current = authService
        .refresh(current)
        .then(({ access_token }) => {
          saveToken(access_token);
          return access_token;
        })
        .catch(() => null)
        .finally(() => {
          refreshing.current = null;
        });
    }
    return refreshing.current;
  }, []);

  /* ── On mount: restore session from localStorage ──
     An expired token is refreshed first (allowed for JWT_REFRESH_TTL, 2 weeks by default),
     so customers are not logged out just because the 60-minute access token ran out. */
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setLoading(false);
      return;
    }

    (async () => {
      let t: string | null = saved;
      if (secondsLeft(saved) < refreshMargin(saved)) t = await refreshToken(saved);

      try {
        if (!t) throw Object.assign(new Error("expired"), { status: 401 });
        const customer = await authService.me(t);
        setToken(t);
        setUser(customer);
      } catch (err: any) {
        // 401 → one refresh attempt, then give up. Network/server errors keep the token
        // so a temporary outage doesn't log the customer out.
        if (err?.status === 401 && t) {
          const fresh = await refreshToken(t);
          if (fresh) {
            try {
              setUser(await authService.me(fresh));
              setToken(fresh);
              return;
            } catch {}
          }
          localStorage.removeItem(TOKEN_KEY);
        } else if (err?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshToken]);

  /* ── Keep the session alive: refresh shortly before expiry, and when the tab
     becomes visible again (timers are paused while a laptop sleeps). ── */
  useEffect(() => {
    if (!token) return;

    const check = () => {
      if (secondsLeft(token) < refreshMargin(token)) {
        refreshToken(token).then((fresh) => {
          if (!fresh) {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
        });
      }
    };

    const wait = Math.max(5, secondsLeft(token) - refreshMargin(token));
    const timer = window.setTimeout(check, Math.min(wait, 2_000_000) * 1000);
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, [token, refreshToken]);

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
