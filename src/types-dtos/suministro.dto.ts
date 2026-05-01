import { GeoPoint, ResourceItem } from './shared.types';

export interface Suministro {
  id: string;
  location: GeoPoint;
  status: 'pendiente' | 'entregado' | 'recogido' | 'expirado';
  contents: ResourceItem[];
  launchedAt: Date;
  expiresAt: Date;
  collectedAt?: Date;
}

export interface CreateSuministroDTO {
  location: GeoPoint;
  contents: ResourceItem[];
  expiresAt: Date;
}

export interface UpdateSuministroDTO {
  status?: 'pendiente' | 'entregado' | 'recogido' | 'expirado';
  collectedAt?: Date;
}

export interface SuministroConDistancia extends Suministro {
  distanceKm: number;
}

export interface PaginatedSupplies {
  items: Suministro[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
