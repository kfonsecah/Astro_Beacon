import { SpeciesClassification, DangerLevel } from './enums';

export interface Especie {
  id: string;
  name: string;
  classification: SpeciesClassification;
  dangerLevel: DangerLevel;
  description: string;
  imageUrl: string;
  discoveredAt: Date;
  classifiedByAI: boolean;
  iaConfidence: number;
}

export interface CreateEspecieDTO {
  name: string;
  classification: SpeciesClassification;
  dangerLevel: DangerLevel;
  description?: string;
  notes?: string;
  imageUrl?: string;
  iaConfidence?: number;
  classifiedByAI?: boolean;
  location?: { lat: number; lng: number };
}

export interface EspecieClasificada {
  classification: SpeciesClassification;
  dangerLevel: DangerLevel;
  confidence: number;
  suggestedName?: string;
}

export interface IdentifyResult {
  classification: SpeciesClassification;
  dangerLevel: DangerLevel;
  name: string;
  description: string;
  confidence: number;
}

export interface PaginatedSpecies {
  items: Especie[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
