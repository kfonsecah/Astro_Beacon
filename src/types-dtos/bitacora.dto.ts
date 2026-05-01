import { GeoPoint } from './shared.types';

export interface BitacoraEntrada {
  id: string;
  astronautId: string;
  speciesId?: string;
  title: string;
  description: string;
  photoUrl: string;
  location: GeoPoint;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBitacoraEntradaDTO {
  photoUrl?: string;
  description: string;
  location: GeoPoint;
}

export interface BitacoraEntradaResponse extends BitacoraEntrada {
  speciesName?: string;
  speciesClassification?: string;
  updatedAt?: Date;
}

export interface PaginatedLogbookEntries {
  items: BitacoraEntradaResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
