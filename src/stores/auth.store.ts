import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (agentId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (agentId: string, _password: string) => {
    // TODO: Replace with real API call: api.post('/auth/login', { agentId, password })
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockToken = `mock_token_${Date.now()}`;
    const mockUser: AuthUser = { id: '1', name: agentId, email: `${agentId}@astrobeacon.com` };

    await SecureStore.setItemAsync('auth_token', mockToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(mockUser));

    set({ token: mockToken, user: mockUser, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isAuthenticated: true });
      }
    } catch (error) {
      console.warn('[Auth] Failed to restore session:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Alias para componentes — misma API que el hook anterior
export const useAuth = useAuthStore;
