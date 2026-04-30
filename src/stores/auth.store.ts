import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/auth.service';

interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  clearAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

const secureStoreStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

const migrateAuthStorage = async (persistedState: any, version: number): Promise<Partial<AuthState>> => {
  // Migration from legacy 'auth_token' key (D-17)
  if (version === 0) {
    try {
      const legacyToken = await SecureStore.getItemAsync('auth_token');
      if (legacyToken) {
        await SecureStore.setItemAsync('access_token', legacyToken);
        await SecureStore.deleteItemAsync('auth_token');
        persistedState.accessToken = legacyToken;
      }
    } catch (error) {
      console.warn('[Auth] Migration from auth_token failed:', error);
    }
  }
  return persistedState;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (accessToken, refreshToken, user) => {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearAuth: async () => {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        await SecureStore.deleteItemAsync('user_data');
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });
          const { accessToken, refreshToken, user } = response;

          await SecureStore.setItemAsync('access_token', accessToken);
          await SecureStore.setItemAsync('refresh_token', refreshToken);
          await SecureStore.setItemAsync('user_data', JSON.stringify(user));

          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.warn('[Auth] Logout API failed, clearing anyway');
        }
        await get().clearAuth();
      },

      checkAuth: async () => {
        try {
          const accessToken = await SecureStore.getItemAsync('access_token');
          const refreshToken = await SecureStore.getItemAsync('refresh_token');
          const userData = await SecureStore.getItemAsync('user_data');

          if (accessToken && userData) {
            set({
              accessToken,
              refreshToken,
              user: JSON.parse(userData),
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.warn('[Auth] Failed to restore session:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStoreStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        // isAuthenticated and isLoading are UI state, not persisted
      }),
      version: 1,
      migrate: migrateAuthStorage,
    }
  )
);

export const useAuth = useAuthStore;