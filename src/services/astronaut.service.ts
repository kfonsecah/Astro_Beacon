import { api } from "./api";
import type {
  Astronauta,
  CreateAstronautaDTO,
  UpdateAstronautaDTO,
  DashboardStats,
} from "@/types-dtos";

export interface AstronautService {
  getProfile(): Promise<Astronauta | null>;
  createOrUpdate(
    data: CreateAstronautaDTO,
  ): Promise<Astronauta>;
  update(
    astronautId: string,
    data: UpdateAstronautaDTO,
  ): Promise<Astronauta>;
  getDashboard(): Promise<DashboardStats>;
}

export const astronautService: AstronautService = {
  async getProfile(): Promise<Astronauta | null> {
    const response = await api.get<{ success: boolean; data: Astronauta }>(
      `/astronaut`,
    );
    return response.data.data;
  },

  async createOrUpdate(
    data: CreateAstronautaDTO,
  ): Promise<Astronauta> {
    const response = await api.put<{ success: boolean; data: Astronauta }>(
      `/astronaut`,
      data,
    );
    return response.data.data;
  },

  async update(
    astronautId: string,
    data: UpdateAstronautaDTO,
  ): Promise<Astronauta> {
    const response = await api.put<{ success: boolean; data: Astronauta }>(
      `/astronaut/${astronautId}`,
      data,
    );
    return response.data.data;
  },

  async getDashboard(): Promise<DashboardStats> {
    const response = await api.get<{ success: boolean; data: DashboardStats }>(
      `/astronaut/stats`,
    );
    return response.data.data;
  },
};
