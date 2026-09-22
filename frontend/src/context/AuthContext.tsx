import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../services/api';

export interface User {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  role: 'LANDLORD' | 'LENDER' | 'TENANT' | 'ADMIN';
  organization_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (roleEndpoint: string, credentials: Record<string, any>) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (roleEndpoint: string, firebaseIdToken: string) => Promise<{ success: boolean; message?: string }>;
  register: (roleEndpoint: string, data: Record<string, any>) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

function extractErrorMessage(json: any, defaultMsg: string): string {
  if (!json) return defaultMsg;
  if (typeof json.message === 'string' && json.message.trim()) return json.message.trim();
  if (typeof json.detail === 'string' && json.detail.trim()) return json.detail.trim();
  if (json.detail && typeof json.detail === 'object') {
    if (typeof json.detail.message === 'string' && json.detail.message.trim()) {
      return json.detail.message.trim();
    }
    if (Array.isArray(json.detail) && json.detail.length > 0) {
      const first = json.detail[0];
      if (first && typeof first.msg === 'string') {
        const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : '';
        return field ? `${field}: ${first.msg}` : first.msg;
      }
    }
  }
  if (json.error && typeof json.error.message === 'string' && json.error.message.trim()) {
    return json.error.message.trim();
  }
  return defaultMsg;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('rv_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('rv_token') || localStorage.getItem('access_token');
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('rv_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rv_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('rv_token', token);
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('rv_token');
      localStorage.removeItem('access_token');
    }
  }, [token]);

  // Validate session on mount if token exists
  useEffect(() => {
    if (!token) return;

    fetch(getApiUrl('/api/v1/auth/me'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('rv_user');
          localStorage.removeItem('rv_token');
          localStorage.removeItem('access_token');
        } else if (res.ok) {
          const json = await res.json();
          if (json && json.id) {
            setUser({
              id: json.id,
              name: json.full_name || json.email,
              full_name: json.full_name,
              email: json.email,
              role: json.role,
              organization_id: json.organization_id || undefined,
            });
          }
        }
      })
      .catch(() => {
        // Network timeout / offline fallback retains cached state until backend returns 401
      });
  }, []);

  const login = async (roleEndpoint: string, credentials: Record<string, any>) => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/auth/${roleEndpoint}/login`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      let json: any = {};
      try {
        const text = await res.text();
        json = text ? JSON.parse(text) : {};
      } catch (e) {
        json = { success: false, message: `Server error (${res.status}). Please check API connectivity.` };
      }

      if (!res.ok || !json.success) {
        const errorMsg = extractErrorMessage(json, 'Invalid email or password');
        return {
          success: false,
          message: errorMsg,
        };
      }

      const authData = json.data;
      const loggedUser: User = {
        id: authData.user.id,
        name: authData.user.name,
        full_name: authData.user.full_name || authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
        organization_id: authData.user.organization_id,
      };

      setToken(authData.access_token);
      setUser(loggedUser);

      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, message: 'Unable to connect to authentication server. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (roleEndpoint: string, firebaseIdToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/auth/${roleEndpoint}/google`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: firebaseIdToken }),
      });

      let json: any = {};
      try {
        const text = await res.text();
        json = text ? JSON.parse(text) : {};
      } catch (e) {
        json = { success: false, message: `Server error (${res.status}). Please check API connectivity.` };
      }

      if (!res.ok || !json.success) {
        const errorMsg = extractErrorMessage(json, 'Google Sign-In failed. Please ensure an account exists for this email.');
        return {
          success: false,
          message: errorMsg,
        };
      }

      const authData = json.data;
      const loggedUser: User = {
        id: authData.user.id,
        name: authData.user.name,
        full_name: authData.user.full_name || authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
        organization_id: authData.user.organization_id,
      };

      setToken(authData.access_token);
      setUser(loggedUser);

      return { success: true };
    } catch (err: any) {
      console.error('Google login error:', err);
      return { success: false, message: 'Unable to complete Google authentication. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (roleEndpoint: string, data: Record<string, any>) => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/auth/${roleEndpoint}/register`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      let json: any = {};
      try {
        const text = await res.text();
        json = text ? JSON.parse(text) : {};
      } catch (e) {
        json = { success: false, message: `Server error (${res.status}). Please check API connectivity.` };
      }

      if (!res.ok || !json.success) {
        const errorMsg = extractErrorMessage(json, 'Registration failed. Please check your inputs.');
        return {
          success: false,
          message: errorMsg,
        };
      }

      const authData = json.data;
      const loggedUser: User = {
        id: authData.user.id,
        name: authData.user.name,
        full_name: authData.user.full_name || authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
        organization_id: authData.user.organization_id,
      };

      setToken(authData.access_token);
      setUser(loggedUser);

      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, message: 'Unable to connect to registration server. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      import('../config/firebase').then(({ auth }) => {
        auth.signOut().catch(() => {});
      }).catch(() => {});
    } catch (e) {}

    if (token) {
      fetch(getApiUrl('/api/v1/auth/logout'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('rv_user');
    localStorage.removeItem('rv_token');
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithGoogle, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
