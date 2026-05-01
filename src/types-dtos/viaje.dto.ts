import { GeoPoint } from './shared.types';

export interface Viaje {
  id: string;
  astronautId: string;
  destination: GeoPoint;
  status: 'planificado' | 'activo' | 'completado' | 'abortado';
  startedAt?: Date;
  completedAt?: Date;
  oxygenBudgeted: number;
  oxygenConsumed: number;
  resourcesCollected: number;
  notes: string;
}

export interface CreateViajeDTO {
  destination: GeoPoint;
  oxygenBudgeted: number;
  notes?: string;
}

export interface UpdateViajeDTO {
  status?: 'planificado' | 'activo' | 'completado' | 'abortado';
  oxygenConsumed?: number;
  resourcesCollected?: number;
  notes?: string;
}

export interface ViajeResumen {
  duration: number;
  oxygenConsumed: number;
  oxygenBudgeted: number;
  resourcesCollected: number;
  distanceTraveled: number;
}

export interface PaginatedTrips {
  items: Viaje[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
