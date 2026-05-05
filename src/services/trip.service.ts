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

function mapTrip(t: any): Viaje {
  // Backend may store destination as a { lat, lng } GeoJSON object or a label string.
  // Normalise defensively to always return a valid GeoPoint.
  const destination =
    t.destination && typeof t.destination === 'object' && 'lat' in t.destination
      ? t.destination
      : { lat: 0, lng: 0 };

  return {
    id: t._id?.toString() ?? t.id ?? '',
    astronautId: t.userId?.toString() ?? '',
    destination,
    status: t.status,
    startedAt: t.startDate,
    completedAt: t.endDate,
    oxygenBudgeted: t.plannedDuration != null && t.O2Config?.baseRate != null
      ? t.O2Config.baseRate * t.plannedDuration
      : (t.O2Config?.baseRate ?? 0),
    oxygenConsumed: t.O2Consumed ?? 0,
    resourcesCollected: t.resourcesCollected ?? 0,
    notes: t.name ?? '',
  };
}

export const tripService: TripService = {
  async getAll(page = 1, limit = 20, status?: string): Promise<PaginatedTrips> {
    const response = await api.get<{
      success: boolean;
      data: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/trips`, { params: { page, limit, status } });
    return {
      items: response.data.data.map(mapTrip),
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
    };
  },

  async getById(tripId: string): Promise<Viaje | null> {
    const response = await api.get<{ success: boolean; data: any }>(`/trips/${tripId}`);
    return response.data.data ? mapTrip(response.data.data) : null;
  },

  async create(data: CreateViajeDTO): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: any }>(`/trips`, data);
    return mapTrip(response.data.data);
  },

  async update(tripId: string, data: UpdateViajeDTO): Promise<Viaje> {
    const response = await api.put<{ success: boolean; data: any }>(`/trips/${tripId}`, data);
    return mapTrip(response.data.data);
  },

  async start(tripId: string, data?: { notes?: string }): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: any }>(`/trips/${tripId}/start`, data);
    return mapTrip(response.data.data);
  },

  async complete(tripId: string, data?: { notes?: string; resourcesUsed?: string[] }): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: any }>(`/trips/${tripId}/complete`, data);
    return mapTrip(response.data.data);
  },

  async abort(tripId: string, data?: { notes?: string }): Promise<Viaje> {
    const response = await api.post<{ success: boolean; data: any }>(`/trips/${tripId}/abort`, data);
    return mapTrip(response.data.data);
  },

  async delete(tripId: string): Promise<void> {
    await api.delete(`/trips/${tripId}`);
  },
};
