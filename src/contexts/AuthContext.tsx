import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import type { UserRole } from '@/lib/rbac';

interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing different roles
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@patliputra.com': {
    password: 'admin123',
    user: { email: 'admin@patliputra.com', name: 'Master Admin', role: 'master_admin' },
  },
  'manager@patliputra.com': {
    password: 'manager123',
    user: { email: 'manager@patliputra.com', name: 'Admin Manager', role: 'admin' },
  },
  'sales@patliputra.com': {
    password: 'sales123',
    user: { email: 'sales@patliputra.com', name: 'Sales Executive', role: 'sales_user' },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Check demo users first
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      const token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(demoUser.user));
      setUser(demoUser.user);
      return;
    }
    
    // Fallback to API
    const result = await authApi.login(email, password);
    const userData: User = {
      email: result.user.email,
      name: result.user.name,
      role: result.user.role as UserRole,
    };
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    authApi.logout();
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
