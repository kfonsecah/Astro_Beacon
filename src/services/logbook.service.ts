import { api } from './api';
import type { BitacoraEntrada, CreateBitacoraEntradaDTO, PaginatedResponse } from '@/types-dtos';

export interface PaginatedLogbookEntries extends PaginatedResponse<BitacoraEntrada> {}

export interface LogbookService {
  getAll(userId: string, page?: number, limit?: number, speciesId?: string): Promise<PaginatedLogbookEntries>;
  getById(userId: string, entryId: string): Promise<BitacoraEntrada | null>;
  create(userId: string, data: CreateBitacoraEntradaDTO, speciesId?: string): Promise<BitacoraEntrada>;
  update(userId: string, entryId: string, data: CreateBitacoraEntradaDTO): Promise<BitacoraEntrada>;
  delete(userId: string, entryId: string): Promise<void>;
}

export const logbookService: LogbookService = {
  async getAll(userId: string, page = 1, limit = 20, speciesId?: string): Promise<PaginatedLogbookEntries> {
    const response = await api.get<{ success: boolean; data: PaginatedLogbookEntries }>(`/logbook/${userId}`, { 
      params: { page, limit, speciesId } 
    });
    return response.data.data;
  },

  async getById(userId: string, entryId: string): Promise<BitacoraEntrada | null> {
    const response = await api.get<{ success: boolean; data: BitacoraEntrada | null }>(`/logbook/${userId}/${entryId}`);
    return response.data.data;
  },

  async create(userId: string, data: CreateBitacoraEntradaDTO, speciesId?: string): Promise<BitacoraEntrada> {
    const response = await api.post<{ success: boolean; data: BitacoraEntrada }>(`/logbook/${userId}`, { ...data, speciesId });
    return response.data.data;
  },

  async update(userId: string, entryId: string, data: CreateBitacoraEntradaDTO): Promise<BitacoraEntrada> {
    const response = await api.put<{ success: boolean; data: BitacoraEntrada }>(`/logbook/${userId}/${entryId}`, data);
    return response.data.data;
  },

  async delete(userId: string, entryId: string): Promise<void> {
    await api.delete(`/logbook/${userId}/${entryId}`);
  },
};