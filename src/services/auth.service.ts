import type { LoginDTO, LoginResponse, RegisterDTO } from "@/types-dtos";
import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "@/config/api";

const timeout = 15000;

const unauthenticatedApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout,
  headers: { "Content-Type": "application/json" },
});

export interface AuthService {
  login(data: LoginDTO): Promise<LoginResponse>;
  register(data: RegisterDTO): Promise<LoginResponse>;
  refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  logout(): Promise<void>;
}

export const authService: AuthService = {
  async login(data: LoginDTO): Promise<LoginResponse> {
    console.log('[AuthService] Login attempt with:', { email: data.email, passwordLength: data.password.length });
    try {
      const response = await unauthenticatedApi.post<{
        success: boolean;
        data: LoginResponse;
      }>("/auth/login", data);
      console.log('[AuthService] Login success:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('[AuthService] Login failed:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.baseURL + error.config?.url,
        sentData: data
      });
      throw error;
    }
  },

  async register(data: RegisterDTO): Promise<LoginResponse> {
    const response = await unauthenticatedApi.post<{
      success: boolean;
      data: LoginResponse;
    }>("/auth/register", data);
    return response.data.data;
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await unauthenticatedApi.post<{
      success: boolean;
      data: { accessToken: string; refreshToken: string };
    }>("/auth/refresh", { refreshToken });
    return response.data.data;
  },

  async logout(): Promise<void> {
    await unauthenticatedApi.post("/auth/logout");
  },
};
