import { api } from './api';
import type { Especie, CreateEspecieDTO, PaginatedResponse } from '@/types-dtos';

export interface PaginatedSpecies extends PaginatedResponse<Especie> {}

export interface SpeciesService {
  getAll(page?: number, limit?: number): Promise<PaginatedSpecies>;
  getById(speciesId: string): Promise<Especie | null>;
  create(data: CreateEspecieDTO): Promise<Especie>;
}

export const speciesService: SpeciesService = {
  async getAll(page = 1, limit = 20): Promise<PaginatedSpecies> {
    const response = await api.get<{ success: boolean; data: PaginatedSpecies }>(`/species`, { 
      params: { page, limit } 
    });
    return response.data.data;
  },

  async getById(speciesId: string): Promise<Especie | null> {
    const response = await api.get<{ success: boolean; data: Especie | null }>(`/species/${speciesId}`);
    return response.data.data;
  },

  async create(data: CreateEspecieDTO): Promise<Especie> {
    const response = await api.post<{ success: boolean; data: Especie }>(`/species`, data);
    return response.data.data;
  },
};
