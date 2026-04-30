import { useAuthStore } from "@/stores/auth.store";
import axios, { AxiosError, AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "./auth.service";
import { refreshTokens } from "./token-refresh";

const API_TIMEOUT = 15000;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`,
    );
    return response;
  },
  async (error: AxiosError) => {
    console.log(
      `❌ ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url} → ${error.response?.status}`,
    );
    console.log(`   Body:`, JSON.stringify(error.response?.data));

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        const newToken = await refreshTokens(
          refreshToken,
          API_BASE_URL,
          (token: string) => {
            if (token) {
              SecureStore.setItemAsync("access_token", token);
              useAuthStore.setState({ accessToken: token });
            } else {
              useAuthStore.getState().clearAuth();
            }
          },
        );

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } else {
        await useAuthStore.getState().clearAuth();
      }
    }

    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      "Error desconocido";

    return Promise.reject({
      message,
      status: error.response?.status,
      original: error,
    });
  },
);

export { api, API_BASE_URL };
