'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, setAuthToken, getAuthToken } from '@/lib/api';
import { toast } from 'sonner';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  sendOtp: async () => {},
  verifyOtp: async () => {},
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
            /* ignore */
          }
        }
      }

      // If no token exists, user must log in with OTP
      if (!savedToken) {
        setLoading(false);
        if (pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
        return;
      }

      setToken(savedToken);
      setLoading(false);

      // Validate session in background
      try {
        const res = await api.get('/auth/me');
        if (res?.success && res?.data) {
          setUser(res.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('orqiva_admin_user', JSON.stringify(res.data));
          }
        }
      } catch (err) {
        if (err.statusCode === 401 || err.statusCode === 403) {
          setAuthToken(null);
          setUser(null);
          setToken(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('orqiva_admin_user');
          }
          if (pathname.startsWith('/dashboard')) {
            router.push('/login');
          }
        }
      }
    };

    initAuth();
  }, [pathname, router]);

  useEffect(() => {
    if (!loading) {
      const savedToken = getAuthToken();
      if (!savedToken && pathname.startsWith('/dashboard')) {
        router.push('/login');
      }
    }
  }, [pathname, loading, router]);

  const sendOtp = async (email) => {
    try {
      const res = await api.post('/auth/send-otp', { email });
      if (res.success) {
        toast.success(res.message || 'Verification code sent to your email!');
        return { success: true, data: res.data };
      }
      throw new Error(res.message || 'Failed to send OTP.');
    } catch (err) {
      toast.error(err.message || 'Failed to send verification code.');
      return { success: false, error: err.message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.success && res.data) {
        const admin = res.data.admin || res.data.user || res.data;
        const jwtToken = res.data.token;
        setUser(admin);
        setToken(jwtToken);
        setAuthToken(jwtToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('orqiva_admin_user', JSON.stringify(admin));
        }
        toast.success(`Welcome back, ${admin.name || 'Admin'}!`);
        window.location.href = '/dashboard';
        return { success: true };
      }
      throw new Error(res.message || 'Invalid verification code.');
    } catch (err) {
      toast.error(err.message || 'Invalid or expired verification code.');
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        const admin = res.data.admin || res.data.user || res.data;
        const jwtToken = res.data.token;
        setUser(admin);
        setToken(jwtToken);
        setAuthToken(jwtToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('orqiva_admin_user', JSON.stringify(admin));
        }
        toast.success(`Welcome back, ${admin.name || 'Admin'}!`);
        window.location.href = '/dashboard';
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('orqiva_admin_user');
      }
      toast.success('Logged out successfully.');
      window.location.href = '/login';
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
    <AuthContext.Provider value={{ user, token, loading, sendOtp, verifyOtp, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
