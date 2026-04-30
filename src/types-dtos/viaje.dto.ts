import { GeoPoint } from './shared.types';

export interface Viaje {
  id: string;
  astronautaId: string;
  destino: GeoPoint;
  estado: 'planificado' | 'activo' | 'completado' | 'abortado';
  iniciadoEn?: Date;
  completadoEn?: Date;
  oxigenoPresupuestado: number;
  oxigenoConsumido: number;
  recursosRecolectados: number;
  notas: string;
}

export interface CreateViajeDTO {
  destino: GeoPoint;
  oxigenoPresupuestado: number;
  notas?: string;
}

export interface UpdateViajeDTO {
  estado?: 'planificado' | 'activo' | 'completado' | 'abortado';
  oxigenoConsumido?: number;
  recursosRecolectados?: number;
  notas?: string;
}

export interface ViajeResumen {
  duracion: number;
  oxigenoConsumido: number;
  oxigenoPresupuestado: number;
  recursosRecolectados: number;
  distanciaRecorrida: number;
}

export interface PaginatedTrips {
  items: Viaje[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
