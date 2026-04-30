import { SpeciesClassification, DangerLevel } from './enums';

export interface Especie {
  id: string;
  nombre: string;
  clasificacion: SpeciesClassification;
  nivelPeligro: DangerLevel;
  descripcion: string;
  imagenUrl: string;
  descubiertoEn: Date;
  clasificadoPorIA: boolean;
  iaConfianza: number;
}

export interface CreateEspecieDTO {
  imagenUri: string;
  descripcion: string;
  ubicacion?: { lat: number; lng: number };
}

export interface EspecieClasificada {
  clasificacion: SpeciesClassification;
  nivelPeligro: DangerLevel;
  confianza: number;
  nombreSugerido?: string;
}

export interface PaginatedSpecies {
  items: Especie[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
