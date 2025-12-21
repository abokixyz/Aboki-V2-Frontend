
// ============= lib/auth-context.tsx (UPDATED - Redirects to HOME) =============
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from './api-client';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication - REDIRECT TO HOME
const PUBLIC_ROUTES = ['/'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  // Verify token with backend
  const checkAuth = async (): Promise<boolean> => {
    const storedToken = apiClient.getToken();
    
    if (!storedToken) {
      console.log('❌ No token found');
      return false;
    }

    try {
      // Verify token with backend
      const response = await apiClient.getUserProfile();
      
      if (!response.success || !response.data) {
        console.log('❌ Token invalid, clearing auth');
        logout();
        return false;
      }

      // Update user data from backend
      const userData: User = {
        id: response.data._id,
        username: response.data.username,
        name: response.data.name,
        email: response.data.email
      };

      setToken(storedToken);
      setUser(userData);
      localStorage.setItem('aboki_user', JSON.stringify(userData));
      
      console.log('✅ Auth verified:', userData.username);
      return true;
      
    } catch (error) {
      console.error('⚠️ Auth check failed:', error);
      logout();
      return false;
    }
  };

  // Load and verify auth state on mount and route changes
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Try to load from localStorage first
      const storedToken = apiClient.getToken();
      const storedUser = localStorage.getItem('aboki_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token in background
        const isValid = await checkAuth();
        
        // If invalid and not on public route, redirect to HOME
        if (!isValid && !isPublicRoute) {
          console.log('🔄 Redirecting to home');
          router.push('/');
        }
      } else {
        // No stored auth and not on public route - redirect to HOME
        if (!isPublicRoute) {
          console.log('🔄 No auth found, redirecting to home');
          router.push('/');
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [pathname]); // Re-check on route change

  const login = (newToken: string, newUser: User) => {
    apiClient.setToken(newToken);
    localStorage.setItem('aboki_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    console.log('✅ User logged in:', newUser.username);
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    apiClient.clearToken();
    localStorage.removeItem('aboki_user');
    localStorage.removeItem('aboki_user_email');
    localStorage.removeItem('aboki_auth_method');
    setToken(null);
    setUser(null);
    router.push('/'); // Redirect to HOME on logout
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        login, 
        logout,
        isAuthenticated: !!token && !!user,
        checkAuth
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