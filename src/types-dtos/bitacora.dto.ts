import { GeoPoint } from './shared.types';

export interface BitacoraEntrada {
  id: string;
  astronautaId: string;
  especieId?: string;
  descripcion: string;
  imagenUrl: string;
  ubicacion: GeoPoint;
  creadoEn: Date;
  esOffline: boolean;
  sincronizadoEn?: Date;
}

export interface CreateBitacoraEntradaDTO {
  imagenUri: string;
  descripcion: string;
  ubicacion: GeoPoint;
}

export interface BitacoraEntradaResponse extends BitacoraEntrada {
  especieNombre?: string;
  especieClasificacion?: string;
}

export interface PaginatedLogbookEntries {
  items: BitacoraEntrada[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
