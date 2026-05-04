import { GeoPoint } from "./shared.types";

export interface Suministro {
  id: string;
  name: string;
  description?: string;
  location: GeoPoint;
  status: "pendiente" | "entregado" | "recogido" | "expirado";
  contents: string[];
  deliveredAt?: Date;
  collectedAt?: Date;
  expiresAt?: Date;
  userId?: string;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSuministroDTO {
  name: string;
  description?: string;
  status?: "pendiente" | "entregado" | "recogido" | "expirado";
  location: GeoPoint;
  contents: string[];
  deliveredAt?: Date | string;
  expiresAt?: Date | string;
}

export interface UpdateSuministroDTO {
  name?: string;
  description?: string;
  status?: "pendiente" | "entregado" | "recogido" | "expirado";
  location?: GeoPoint;
  contents?: string[];
  deliveredAt?: Date | string;
  expiresAt?: Date | string;
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
