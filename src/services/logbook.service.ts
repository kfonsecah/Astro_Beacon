import { api } from './api';
import type { BitacoraEntrada, BitacoraEntradaResponse, CreateBitacoraEntradaDTO } from '@/types-dtos';

/**
 * PaginatedLogbookEntries defines the structure for paginated logbook entries.
 */
export interface PaginatedLogbookEntries {
  items: BitacoraEntrada[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * LogbookService interface defines all available operations for managing logbook entries.
 * This includes CRUD operations with support for filtering by species.
 */
export interface LogbookService {
  getAll(page?: number, limit?: number, speciesId?: string): Promise<PaginatedLogbookEntries>;
  getById(entryId: string): Promise<BitacoraEntrada | null>;
  create(data: CreateBitacoraEntradaDTO, speciesId?: string): Promise<BitacoraEntrada>;
  update(entryId: string, data: CreateBitacoraEntradaDTO): Promise<BitacoraEntrada>;
  delete(entryId: string): Promise<void>;
}

export const logbookService: LogbookService = {
  async   getAll(page = 1, limit = 20, speciesId?: string): Promise<PaginatedLogbookEntries> {
    const response = await api.get<{
      success: boolean;
      data: Array<BitacoraEntradaResponse & { speciesId?: { name?: string; classification?: string } }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/logbook`, {
      params: { page, limit, speciesId }
    });
    // Flatten populated speciesId fields
    const items = response.data.data.map(entry => ({
      ...entry,
      speciesName: entry.speciesId?.name,
      speciesClassification: entry.speciesId?.classification,
    }));
    return {
      items,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
    };
  },

  async getById(entryId: string): Promise<BitacoraEntrada | null> {
    const response = await api.get<{ success: boolean; data: BitacoraEntrada | null }>(`/logbook/${entryId}`);
    return response.data.data;
  },

  async create(data: CreateBitacoraEntradaDTO, speciesId?: string): Promise<BitacoraEntrada> {
    const response = await api.post<{ success: boolean; data: BitacoraEntrada }>(`/logbook`, { ...data, speciesId });
    return response.data.data;
  },

  async update(entryId: string, data: CreateBitacoraEntradaDTO): Promise<BitacoraEntrada> {
    const response = await api.put<{ success: boolean; data: BitacoraEntrada }>(`/logbook/${entryId}`, data);
    return response.data.data;
  },

  async delete(entryId: string): Promise<void> {
    await api.delete(`/logbook/${entryId}`);
  },
};
