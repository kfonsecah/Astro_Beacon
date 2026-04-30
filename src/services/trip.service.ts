import { api } from './api';
import type { Viaje, CreateViajeDTO, UpdateViajeDTO, PaginatedResponse } from '@/types-dtos';

export interface PaginatedTrips extends PaginatedResponse<Viaje> {}

export interface TripService {
  getAll(userId: string, page?: number, limit?: number, status?: string): Promise<PaginatedTrips>;
  getById(userId: string, tripId: string): Promise<Viaje | null>;
  create(userId: string, data: CreateViajeDTO): Promise<Viaje>;
  update(userId: string, tripId: string, data: UpdateViajeDTO): Promise<Viaje>;
  start(userId: string, tripId: string, data?: { notes?: string }): Promise<Viaje>;
  complete(userId: string, tripId: string, data?: { notes?: string; resourcesUsed?: string[] }): Promise<Viaje>;
  abort(userId: string, tripId: string, data?: { notes?: string }): Promise<Viaje>;
  delete(userId: string, tripId: string): Promise<void>;
}

export const tripService: TripService = {
  async getAll(userId: string, page = 1, limit = 20, status?: string): Promise<PaginatedTrips> {
    const response = await api.get<{ success: boolean; data: PaginatedTrips }>(`/trips/${userId}`, { 
      params: { page, limit, status } 
    });
    return response.data.data;
  },

  async getById(userId: string, tripId: string): Promise<Viaje | null> {
    const response = await api.get<{ success: boolean; data: Viaje | null }>(`/trips/${userId}/${tripId}`);
    return response.data.data;
  },

  async create(userId: string, data: CreateViajeDTO): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: Viaje }>(`/trips/${userId}`, data);
    return response.data.data;
  },

  async update(userId: string, tripId: string, data: UpdateViajeDTO): Promise<Viaje> {
    const response = await api.put<{ success: boolean; data: Viaje }>(`/trips/${userId}/${tripId}`, data);
    return response.data.data;
  },

  async start(userId: string, tripId: string, data?: { notes?: string }): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: Viaje }>(`/trips/${userId}/${tripId}/start`, data);
    return response.data.data;
  },

  async complete(userId: string, tripId: string, data?: { notes?: string; resourcesUsed?: string[] }): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: Viaje }>(`/trips/${userId}/${tripId}/complete`, data);
    return response.data.data;
  },

  async abort(userId: string, tripId: string, data?: { notes?: string }): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: Viaje }>(`/trips/${userId}/${tripId}/abort`, data);
    return response.data.data;
  },

  async delete(userId: string, tripId: string): Promise<void> {
    await api.delete(`/trips/${userId}/${tripId}`);
  },
};