import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from './api';

const AuthContext = createContext(null);

export function homeFor(role) {
  if (role === 'admin') return '/admin';
  if (role === 'store_owner') return '/owner';
  return '/stores';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return undefined;
    }
    let ignore = false;
    api('/api/auth/me')
      .then((data) => {
        if (!ignore) setUser(data.user);
      })
      .catch(() => {
        clearToken();
        if (!ignore) setUser(null);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(email, password) {
      const data = await api('/api/auth/login', { method: 'POST', body: { email, password } });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    async register(payload) {
      const data = await api('/api/auth/register', { method: 'POST', body: payload });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    logout() {
      clearToken();
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
