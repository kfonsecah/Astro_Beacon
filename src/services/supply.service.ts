import { api } from './api';
import type { Suministro, CreateSuministroDTO, UpdateSuministroDTO, SuministroConDistancia, PaginatedResponse } from '@/types-dtos';

export interface PaginatedSupplies extends PaginatedResponse<Suministro> {}

export interface SupplyService {
  getAll(page?: number, limit?: number, status?: string): Promise<PaginatedSupplies>;
  getById(supplyId: string): Promise<Suministro | null>;
  collect(supplyId: string, data?: { notes?: string }): Promise<Suministro>;
  getNearby(lat: number, lng: number, radius?: number, status?: string): Promise<SuministroConDistancia[]>;
}

export const supplyService: SupplyService = {
  async getAll(page = 1, limit = 20, status?: string): Promise<PaginatedSupplies> {
    const response = await api.get<{ success: boolean; data: PaginatedSupplies }>(`/supplies`, { 
      params: { page, limit, status } 
    });
    return response.data.data;
  },

  async getById(supplyId: string): Promise<Suministro | null> {
    const response = await api.get<{ success: boolean; data: Suministro | null }>(`/supplies/${supplyId}`);
    return response.data.data;
  },

  async collect(supplyId: string, data?: { notes?: string }): Promise<Suministro> {
    const response = await api.post<{ success: boolean; data: Suministro }>(`/supplies/${supplyId}/collect`, data);
    return response.data.data;
  },

  async getNearby(lat: number, lng: number, radius = 5000, status?: string): Promise<SuministroConDistancia[]> {
    const response = await api.get<{ success: boolean; data: SuministroConDistancia[] }>(`/supplies/nearby`, { 
      params: { lat, lng, radius, status } 
    });
    return response.data.data;
  },
};
