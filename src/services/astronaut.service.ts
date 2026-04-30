import type {
  Astronauta,
  CreateAstronautaDTO,
  UpdateAstronautaDTO,
} from "@/types-dtos";
import { api } from "./api";

export interface DashboardStats {
  resourcesCount: number;
  activeTrips: number;
  speciesDiscovered: number;
}

export interface AstronautService {
  getProfile(userId: string): Promise<Astronauta | null>;
  createOrUpdate(
    userId: string,
    data: CreateAstronautaDTO,
  ): Promise<Astronauta>;
  update(
    userId: string,
    astronautId: string,
    data: UpdateAstronautaDTO,
  ): Promise<Astronauta>;
  getDashboard(userId: string): Promise<DashboardStats>;
}

export const astronautService: AstronautService = {
  async getProfile(userId: string): Promise<Astronauta | null> {
    const response = await api.get<{ success: boolean; data: Astronauta }>(
      `/astronaut`,
    );
    return response.data.data;
  },

  async createOrUpdate(
    userId: string,
    data: CreateAstronautaDTO,
  ): Promise<Astronauta> {
    const response = await api.put<{ success: boolean; data: Astronauta }>(
      `/astronaut`,
      data,
    );
    return response.data.data;
  },

  async update(
    userId: string,
    astronautId: string,
    data: UpdateAstronautaDTO,
  ): Promise<Astronauta> {
    const response = await api.put<{ success: boolean; data: Astronauta }>(
      `/astronaut/${astronautId}`,
      data,
    );
    return response.data.data;
  },

  async getDashboard(userId: string): Promise<DashboardStats> {
    const response = await api.get<{ success: boolean; data: DashboardStats }>(
      `/astronaut/stats`,
    );
    return response.data.data;
  },
};
