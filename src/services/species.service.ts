import { api } from './api';
import type { Especie, CreateEspecieDTO, PaginatedResponse } from '@/types-dtos';

export interface PaginatedSpecies extends PaginatedResponse<Especie> {}

export interface SpeciesService {
  getAll(userId: string, page?: number, limit?: number): Promise<PaginatedSpecies>;
  getById(userId: string, speciesId: string): Promise<Especie | null>;
  create(userId: string, data: CreateEspecieDTO): Promise<Especie>;
}

export const speciesService: SpeciesService = {
  async getAll(userId: string, page = 1, limit = 20): Promise<PaginatedSpecies> {
    const response = await api.get<{ success: boolean; data: PaginatedSpecies }>(`/species/${userId}`, { params: { page, limit } });
    return response.data.data;
  },

  async getById(userId: string, speciesId: string): Promise<Especie | null> {
    const response = await api.get<{ success: boolean; data: Especie | null }>(`/species/${userId}/${speciesId}`);
    return response.data.data;
  },

  async create(userId: string, data: CreateEspecieDTO): Promise<Especie> {
    const response = await api.post<{ success: boolean; data: Especie }>(`/species/${userId}`, data);
    return response.data.data;
  },
};