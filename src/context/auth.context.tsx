import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; name: string; email: string } | null;
  login: (agentId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn('[Auth] Failed to restore session:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(agentId: string, password: string) {
    // TODO: Replace with real API call: api.post('/auth/login', { agentId, password })
    // Mock for Base Inicial demonstration
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockToken = `mock_token_${Date.now()}`;
    const mockUser = { id: '1', name: agentId, email: `${agentId}@astrobeacon.com` };

    await SecureStore.setItemAsync('auth_token', mockToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(mockUser));

    setUser(mockUser);
    setIsAuthenticated(true);
    router.replace('/(tabs)/dashboard');
  }

  async function logout() {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    setUser(null);
    setIsAuthenticated(false);
    router.replace('/(auth)/login');
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
