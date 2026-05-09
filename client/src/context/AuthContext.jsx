import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'ludo_token';
const USER_KEY = 'ludo_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persist = useCallback((t, u) => {
    setToken(t);
    setUser(u);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: fresh } = await api.me(token);
        if (!cancelled) persist(token, fresh);
      } catch {
        if (!cancelled) persist('', null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, persist]);

  const login = useCallback(
    async (payload) => {
      const res = await api.login(payload);
      persist(res.token, res.user);
      return res;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const res = await api.register({
        email: payload.email,
        mobile: payload.mobile,
        password: payload.password,
        avatar: payload.avatar,
      });
      persist(res.token, res.user);
      return res;
    },
    [persist]
  );

  const logout = useCallback(async () => {
    try {
      if (token) await api.logout(token);
    } finally {
      persist('', null);
    }
  }, [persist, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      setUser,
    }),
    [token, user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
