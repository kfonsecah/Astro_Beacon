import { api } from './api';
import type { Recurso, CreateRecursoDTO, UpdateRecursoDTO, RecursoMovimiento, CreateRecursoMovimientoDTO, PaginatedResponse } from '@/types-dtos';

export interface ResourceAlert {
  id: string;
  type: 'low' | 'critical';
  resourceId: string;
  message: string;
}

export interface PaginatedResources extends PaginatedResponse<Recurso> {}

export interface ResourceService {
  getAll(userId: string, page?: number, limit?: number): Promise<PaginatedResources>;
  getById(userId: string, resourceId: string): Promise<Recurso | null>;
  create(userId: string, data: CreateRecursoDTO): Promise<Recurso>;
  update(userId: string, resourceId: string, data: UpdateRecursoDTO): Promise<Recurso>;
  delete(userId: string, resourceId: string): Promise<void>;
  recordMovement(userId: string, resourceId: string, data: CreateRecursoMovimientoDTO): Promise<Recurso>;
  getAlerts(userId: string): Promise<ResourceAlert[]>;
}

export const resourceService: ResourceService = {
  async getAll(userId: string, page = 1, limit = 20): Promise<PaginatedResources> {
    const response = await api.get<{ success: boolean; data: PaginatedResources }>(`/resources/${userId}`, { params: { page, limit } });
    return response.data.data;
  },

  async getById(userId: string, resourceId: string): Promise<Recurso | null> {
    const response = await api.get<{ success: boolean; data: Recurso | null }>(`/resources/${userId}/${resourceId}`);
    return response.data.data;
  },

  async create(userId: string, data: CreateRecursoDTO): Promise<Recurso> {
    const response = await api.post<{ success: boolean; data: Recurso }>(`/resources/${userId}`, data);
    return response.data.data;
  },

  async update(userId: string, resourceId: string, data: UpdateRecursoDTO): Promise<Recurso> {
    const response = await api.put<{ success: boolean; data: Recurso }>(`/resources/${userId}/${resourceId}`, data);
    return response.data.data;
  },

  async delete(userId: string, resourceId: string): Promise<void> {
    await api.delete(`/resources/${userId}/${resourceId}`);
  },

  async recordMovement(userId: string, resourceId: string, data: CreateRecursoMovimientoDTO): Promise<Recurso> {
    const response = await api.post<{ success: boolean; data: Recurso }>(`/resources/${userId}/${resourceId}/movement`, data);
    return response.data.data;
  },

  async getAlerts(userId: string): Promise<ResourceAlert[]> {
    const response = await api.get<{ success: boolean; data: ResourceAlert[] }>(`/resources/${userId}/alerts`);
    return response.data.data;
  },
};