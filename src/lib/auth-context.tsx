// ============= lib/auth-context.tsx (FIXED - Proper Token Management) =============
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

// Routes that redirect to home if not authenticated
const PROTECTED_ROUTES = [
  '/dashboard',
  '/rewards',
  '/transfer',
  '/onramp',
  '/offramp',
  '/wallet',
  '/settings',
  '/profile',
  '/history',
  '/send',
  'scan',
  'receive'
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));

  // Verify token with backend
  const checkAuth = async (): Promise<boolean> => {
    try {
      // Get token from apiClient (which checks localStorage)
      const storedToken = apiClient.getToken();
      
      console.log('🔍 Checking auth...');
      console.log('   Token exists:', !!storedToken);
      console.log('   Token (first 20 chars):', storedToken?.substring(0, 20) + '...');

      if (!storedToken) {
        console.log('❌ No token found in localStorage');
        return false;
      }

      // Verify token with backend
      console.log('📡 Verifying token with backend...');
      const response = await apiClient.getUserProfile();
      
      if (!response.success || !response.data) {
        console.log('❌ Token verification failed:', response.error);
        // Clear invalid token
        apiClient.clearToken();
        setToken(null);
        setUser(null);
        return false;
      }

      // Update user data from backend
      const userData: User = {
        id: response.data._id,
        username: response.data.username,
        name: response.data.name,
        email: response.data.email
      };

      console.log('✅ Auth verified for user:', userData.username);
      setToken(storedToken);
      setUser(userData);
      localStorage.setItem('aboki_user', JSON.stringify(userData));
      
      return true;
      
    } catch (error) {
      console.error('⚠️ Auth check error:', error);
      apiClient.clearToken();
      setToken(null);
      setUser(null);
      return false;
    }
  };

  // Load and verify auth state on mount and route changes
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        console.log('🔄 Initializing auth...');
        console.log('   Current route:', pathname);
        console.log('   Is protected route:', isProtectedRoute);
        
        // Try to load from localStorage first (fast path)
        const storedToken = apiClient.getToken();
        const storedUser = localStorage.getItem('aboki_user');

        console.log('📦 Stored data:');
        console.log('   Token in localStorage:', !!storedToken);
        console.log('   User in localStorage:', !!storedUser);

        if (storedToken && storedUser) {
          // Set state immediately from localStorage
          try {
            const userData = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(userData);
            console.log('✅ Loaded from localStorage:', userData.username);
          } catch (e) {
            console.error('❌ Failed to parse stored user:', e);
            localStorage.removeItem('aboki_user');
          }
          
          // Verify token in background
          const isValid = await checkAuth();
          
          // If invalid and on protected route, redirect to HOME
          if (!isValid && isProtectedRoute) {
            console.log('🔄 Token invalid and on protected route, redirecting to home');
            router.push('/');
          }
        } else {
          // No stored auth
          console.log('❌ No stored auth data');
          
          // If on protected route and no auth, redirect to HOME
          if (isProtectedRoute) {
            console.log('🔄 No auth on protected route, redirecting to home');
            router.push('/');
          }
        }

      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (isProtectedRoute) {
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [pathname]); // Re-check on route change

  const login = (newToken: string, newUser: User) => {
    console.log('🔐 Logging in user:', newUser.username);
    
    // Store token with correct key
    apiClient.setToken(newToken);
    
    // Store user data
    localStorage.setItem('aboki_user', JSON.stringify(newUser));
    
    // Update state
    setToken(newToken);
    setUser(newUser);
    
    console.log('✅ Login successful');
    console.log('   Token key: aboki_auth_token');
    console.log('   Token (first 20 chars):', newToken.substring(0, 20) + '...');
  };

  const logout = () => {
    console.log('🚪 Logging out user...');
    
    // Clear everything
    apiClient.clearToken();
    apiClient.clearPasskeyVerificationToken();
    
    localStorage.removeItem('aboki_user');
    localStorage.removeItem('aboki_user_email');
    localStorage.removeItem('aboki_auth_method');
    
    setToken(null);
    setUser(null);
    
    console.log('✅ Logout complete');
    
    // Redirect to HOME
    router.push('/');
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        login, 
        logout,
        isAuthenticated,
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