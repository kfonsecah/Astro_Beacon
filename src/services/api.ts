import { useAuthStore } from "@/stores/auth.store";
import axios, { AxiosError, AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/config/api";
import { authService } from "./auth.service";
import { offlineQueue } from "./offlineQueue";

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const API_TIMEOUT = 3000;

// Refresh token queue mechanism
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

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

    // Handle network errors
    if (!error.response) {
      const method = (error.config?.method ?? '').toUpperCase();
      if (WRITE_METHODS.has(method) && error.config?.url) {
        let data: any;
        try {
          data = error.config.data ? JSON.parse(error.config.data) : undefined;
        } catch {
          data = error.config.data;
        }
        await offlineQueue.enqueue({ method, url: error.config.url, data });
        // Return synthetic success so service layer doesn't crash
        return {
          data: { success: true, queued: true, data: { _id: `_offline_${Date.now()}` } },
          status: 202,
          statusText: 'Queued',
          headers: {},
          config: error.config,
        };
      }
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: null,
        original: error,
      });
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      if (isRefreshing) {
        // Queue the request if already refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      (originalRequest as any)._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const response = await authService.refresh(refreshToken);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

        // Update store with new tokens
        useAuthStore.getState().setAuth(newAccessToken, newRefreshToken, useAuthStore.getState().user!);

        // Process queued requests with new token
        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        // Refresh failed - clear auth and reject
        processQueue(refreshError, null);
        await useAuthStore.getState().clearAuth();
        return Promise.reject({
          message: 'Session expired. Please log in again.',
          status: 401,
          original: refreshError,
        });
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors with user-friendly messages
    let message = 'An error occurred';
    if (error.response?.status === 403) {
      message = 'Access forbidden. You do not have permission to access this resource.';
    } else if (error.response?.status === 400) {
      message = (error.response?.data as { message?: string })?.message || 'Invalid request. Please check your input.';
    } else if (error.response?.status === 500) {
      message = 'Server error. Please try again later.';
    } else {
      message =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        'Unknown error';
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      original: error,
    });
  },
);

export { api, API_BASE_URL };
