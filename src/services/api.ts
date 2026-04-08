import axios, { AxiosError, AxiosInstance } from 'axios';

//in development we will use the local API, in production we will use the deployed API

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://api.astrobeacon.com/api/v1';

const API_TIMEOUT = 15000;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    // Token will be attached once auth store is implemented
    // const token = useAuthStore.getState().token;
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired — logout will be handled by auth store
      console.warn('[API] Token expired, redirecting to login');
    }

    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Error desconocido';

    return Promise.reject({
      message,
      status: error.response?.status,
      original: error,
    });
  }
);

export { api, API_BASE_URL };
