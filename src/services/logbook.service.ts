import { api } from './api';
import type { BitacoraEntrada, CreateBitacoraEntradaDTO, PaginatedResponse } from '@/types-dtos';

export interface PaginatedLogbookEntries extends PaginatedResponse<BitacoraEntrada> {}

export interface LogbookService {
  getAll(page?: number, limit?: number, speciesId?: string): Promise<PaginatedLogbookEntries>;
  getById(entryId: string): Promise<BitacoraEntrada | null>;
  create(data: CreateBitacoraEntradaDTO, speciesId?: string): Promise<BitacoraEntrada>;
  update(entryId: string, data: CreateBitacoraEntradaDTO): Promise<BitacoraEntrada>;
  delete(entryId: string): Promise<void>;
}

export const logbookService: LogbookService = {
  async getAll(page = 1, limit = 20, speciesId?: string): Promise<PaginatedLogbookEntries> {
    const response = await api.get<{ success: boolean; data: PaginatedLogbookEntries }>(`/logbook`, { 
      params: { page, limit, speciesId } 
    });
    return response.data.data;
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
