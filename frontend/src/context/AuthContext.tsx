import React, { createContext, useContext, useState, useEffect } from 'react';

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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const getApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanEndpoint.replace('/api/v1', '')}` : cleanEndpoint;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('rv_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('rv_token');
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
    } else {
      localStorage.removeItem('rv_token');
    }
  }, [token]);

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
        json = { success: false, message: `Server error (${res.status}). Please ensure backend server is running.` };
      }

      if (!res.ok || !json.success) {
        return {
          success: false,
          message: json.message || json.detail?.message || (typeof json.detail === 'string' ? json.detail : null) || 'Invalid email or password'
        };
      }

      const authData = json.data;
      const loggedUser: User = {
        id: authData.user.id,
        name: authData.user.name,
        full_name: authData.user.full_name || authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
        organization_id: authData.user.organization_id
      };

      setToken(authData.access_token);
      setUser(loggedUser);

      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, message: 'Connection error. Please ensure backend server is running.' };
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
        json = { success: false, message: `Server error (${res.status}). Please ensure backend server is running.` };
      }

      if (!res.ok || !json.success) {
        const msg = json.message || (typeof json.detail === 'string' ? json.detail : json.detail?.message) || 'Unable to sign in with Google. Please try again.';
        return {
          success: false,
          message: msg
        };
      }

      const authData = json.data;
      const loggedUser: User = {
        id: authData.user.id,
        name: authData.user.name,
        full_name: authData.user.full_name || authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
        organization_id: authData.user.organization_id
      };

      setToken(authData.access_token);
      setUser(loggedUser);

      return { success: true };
    } catch (err: any) {
      console.error('Google login error:', err);
      return { success: false, message: 'Unable to sign in with Google. Please try again.' };
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
        json = { success: false, message: `Server error (${res.status}). Please ensure backend server is running.` };
      }

      if (!res.ok || !json.success) {
        return {
          success: false,
          message: json.message || (typeof json.detail === 'string' ? json.detail : json.detail?.message) || 'Registration failed'
        };
      }

      const authData = json.data;
      const loggedUser: User = {
        id: authData.user.id,
        name: authData.user.name,
        full_name: authData.user.full_name || authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
        organization_id: authData.user.organization_id
      };

      setToken(authData.access_token);
      setUser(loggedUser);

      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, message: 'Connection error. Please try again.' };
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
