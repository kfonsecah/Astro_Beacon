import { api } from './api';
import type { Especie, CreateEspecieDTO } from '@/types-dtos';

/**
 * PaginatedSpecies defines the structure for paginated species lists.
 */
export interface PaginatedSpecies {
  items: Especie[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * SpeciesService interface defines all available operations for managing species.
 * This includes listing, viewing details, and creating new species entries.
 */
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
