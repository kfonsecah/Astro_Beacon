import { api } from './api';
import type { Viaje, CreateViajeDTO, UpdateViajeDTO } from '@/types-dtos';

/**
 * PaginatedTrips defines the structure for paginated trip lists.
 */
export interface PaginatedTrips {
  items: Viaje[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * TripService interface defines all available operations for managing trips.
 * This includes CRUD operations plus trip lifecycle management (start, complete, abort).
 */
export interface TripService {
  getAll(page?: number, limit?: number, status?: string): Promise<PaginatedTrips>;
  getById(tripId: string): Promise<Viaje | null>;
  create(data: CreateViajeDTO): Promise<Viaje>;
  update(tripId: string, data: UpdateViajeDTO): Promise<Viaje>;
  start(tripId: string, data?: { notes?: string }): Promise<Viaje>;
  complete(tripId: string, data?: { notes?: string; resourcesUsed?: string[] }): Promise<Viaje>;
  abort(tripId: string, data?: { notes?: string }): Promise<Viaje>;
  delete(tripId: string): Promise<void>;
}

export const tripService: TripService = {
  async getAll(page = 1, limit = 20, status?: string): Promise<PaginatedTrips> {
    const response = await api.get<{ success: boolean; data: PaginatedTrips }>(`/trips`, { 
      params: { page, limit, status } 
    });
    return response.data.data;
  },

  async getById(tripId: string): Promise<Viaje | null> {
    const response = await api.get<{ success: boolean; data: Viaje | null }>(`/trips/${tripId}`);
    return response.data.data;
  },

  async create(data: CreateViajeDTO): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: Viaje }>(`/trips`, data);
    return response.data.data;
  },

  async update(tripId: string, data: UpdateViajeDTO): Promise<Viaje> {
    const response = await api.put<{ success: boolean; data: Viaje }>(`/trips/${tripId}`, data);
    return response.data.data;
  },

  async start(tripId: string, data?: { notes?: string }): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: Viaje }>(`/trips/${tripId}/start`, data);
    return response.data.data;
  },

  async complete(tripId: string, data?: { notes?: string; resourcesUsed?: string[] }): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: Viaje }>(`/trips/${tripId}/complete`, data);
    return response.data.data;
  },

  async abort(tripId: string, data?: { notes?: string }): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: Viaje }>(`/trips/${tripId}/abort`, data);
    return response.data.data;
  },

  async delete(tripId: string): Promise<void> {
    await api.delete(`/trips/${tripId}`);
  },
};
