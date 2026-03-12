import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authApi } from '@/lib/api';
import type { UserRole } from '@/lib/rbac';

interface User {
  id: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    const tokenTime = localStorage.getItem('admin_token_time');
    const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

    const isExpired = !tokenTime || Date.now() - parseInt(tokenTime, 10) > TOKEN_EXPIRY_MS;

    if (token && storedUser && !isExpired) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token_time');
      }
    } else if (token) {
      // Token exists but expired — clear it
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token_time');
    }

    setIsLoading(false);
  }, []);

  // ✅ REAL LOGIN (BACKEND)
  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);

    const userData: User = {
      id: result.user.id,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}