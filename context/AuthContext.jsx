'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, setAuthToken, getAuthToken } from '@/lib/api';
import { toast } from 'sonner';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getAuthToken();
      if (typeof window !== 'undefined') {
        const savedUserStr = localStorage.getItem('orqiva_admin_user');
        if (savedUserStr) {
          try {
            setUser(JSON.parse(savedUserStr));
          } catch {
            /* ignore JSON parse error */
          }
        }
      }

      if (!savedToken) {
        setLoading(false);
        if (pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
        return;
      }

      setToken(savedToken);

      try {
        const res = await api.get('/auth/me');
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('orqiva_admin_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.error('Session validation failed:', err.message);
        setAuthToken(null);
        setUser(null);
        setToken(null);
        if (pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      const savedToken = getAuthToken();
      if (!savedToken && pathname.startsWith('/dashboard')) {
        router.push('/login');
      }
    }
  }, [pathname, loading, router]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        const { admin, token: jwtToken } = res.data;
        setUser(admin);
        setToken(jwtToken);
        setAuthToken(jwtToken);
        localStorage.setItem('orqiva_admin_user', JSON.stringify(admin));
        toast.success(`Welcome back, ${admin.name}!`);
        router.push('/dashboard');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Login failed.');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    } finally {
      setUser(null);
      setToken(null);
      setAuthToken(null);
      localStorage.removeItem('orqiva_admin_user');
      toast.success('Logged out successfully.');
      router.push('/login');
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('orqiva_admin_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
