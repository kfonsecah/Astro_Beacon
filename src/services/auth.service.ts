import type { LoginDTO, LoginResponse, RegisterDTO } from "@/types-dtos";
import axios, { AxiosInstance } from "axios";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__
    ? "http://192.168.1.19:3000/api/v1"
    : "https://api.astrobeacon.com/api/v1");
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
    const response = await unauthenticatedApi.post<{
      success: boolean;
      data: LoginResponse;
    }>("/auth/login", data);
    return response.data.data;
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
