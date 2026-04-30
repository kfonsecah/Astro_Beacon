import { api } from './api';
import type { Recurso, CreateRecursoDTO, UpdateRecursoDTO, RecursoMovimiento, CreateRecursoMovimientoDTO } from '@/types-dtos';

/**
 * ResourceAlert interface represents an alert for resources that are running low
 * or have reached a critical level based on the configured thresholds.
 */
export interface ResourceAlert {
  id: string;
  type: 'low' | 'critical';
  resourceId: string;
  message: string;
}

/**
 * PaginatedResources extends the base paginated response for resource lists.
 */
export interface PaginatedResources {
  items: Recurso[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * ResourceService interface defines all available operations for managing resources.
 * This includes CRUD operations, movement tracking, and alert monitoring.
 */
export interface ResourceService {
  getAll(page?: number, limit?: number): Promise<PaginatedResources>;
  getById(resourceId: string): Promise<Recurso | null>;
  create(data: CreateRecursoDTO): Promise<Recurso>;
  update(resourceId: string, data: UpdateRecursoDTO): Promise<Recurso>;
  delete(resourceId: string): Promise<void>;
  recordMovement(resourceId: string, data: CreateRecursoMovimientoDTO): Promise<Recurso>;
  getAlerts(): Promise<ResourceAlert[]>;
}

export const resourceService: ResourceService = {
  async getAll(page = 1, limit = 20): Promise<PaginatedResources> {
    const response = await api.get<{ success: boolean; data: PaginatedResources }>(`/resources`, { params: { page, limit } });
    return response.data.data;
  },

  async getById(resourceId: string): Promise<Recurso | null> {
    const response = await api.get<{ success: boolean; data: Recurso | null }>(`/resources/${resourceId}`);
    return response.data.data;
  },

  async create(data: CreateRecursoDTO): Promise<Recurso> {
    const response = await api.post<{ success: boolean; data: Recurso }>(`/resources`, data);
    return response.data.data;
  },

  async update(resourceId: string, data: UpdateRecursoDTO): Promise<Recurso> {
    const response = await api.put<{ success: boolean; data: Recurso }>(`/resources/${resourceId}`, data);
    return response.data.data;
  },

  async delete(resourceId: string): Promise<void> {
    await api.delete(`/resources/${resourceId}`);
  },

  async recordMovement(resourceId: string, data: CreateRecursoMovimientoDTO): Promise<Recurso> {
    const response = await api.post<{ success: boolean; data: Recurso }>(`/resources/${resourceId}/movement`, data);
    return response.data.data;
  },

  async getAlerts(): Promise<ResourceAlert[]> {
    const response = await api.get<{ success: boolean; data: ResourceAlert[] }>(`/resources/alerts`);
    return response.data.data;
  },
};
