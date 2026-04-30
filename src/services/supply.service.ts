import { api } from './api';
import type { Suministro, CreateSuministroDTO, UpdateSuministroDTO, SuministroConDistancia, PaginatedResponse } from '@/types-dtos';

export interface PaginatedSupplies extends PaginatedResponse<Suministro> {}

export interface SupplyService {
  getAll(userId: string, page?: number, limit?: number, status?: string): Promise<PaginatedSupplies>;
  getById(userId: string, supplyId: string): Promise<Suministro | null>;
  collect(userId: string, supplyId: string, data?: { notes?: string }): Promise<Suministro>;
  getNearby(userId: string, lat: number, lng: number, radius?: number, status?: string): Promise<SuministroConDistancia[]>;
}

export const supplyService: SupplyService = {
  async getAll(userId: string, page = 1, limit = 20, status?: string): Promise<PaginatedSupplies> {
    const response = await api.get<{ success: boolean; data: PaginatedSupplies }>(`/supplies/${userId}`, { 
      params: { page, limit, status } 
    });
    return response.data.data;
  },

  async getById(userId: string, supplyId: string): Promise<Suministro | null> {
    const response = await api.get<{ success: boolean; data: Suministro | null }>(`/supplies/${userId}/${supplyId}`);
    return response.data.data;
  },

  async collect(userId: string, supplyId: string, data?: { notes?: string }): Promise<Suministro> {
    const response = await api.post<{ success: boolean; data: Suministro }>(`/supplies/${userId}/${supplyId}/collect`, data);
    return response.data.data;
  },

  async getNearby(userId: string, lat: number, lng: number, radius = 5000, status?: string): Promise<SuministroConDistancia[]> {
    const response = await api.get<{ success: boolean; data: SuministroConDistancia[] }>(`/supplies/${userId}/nearby`, { 
      params: { lat, lng, radius, status } 
    });
    return response.data.data;
  },
};