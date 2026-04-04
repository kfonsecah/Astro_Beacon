import { GeoPoint, ResourceItem } from './shared.types';

export interface Suministro {
  id: string;
  ubicacion: GeoPoint;
  estado: 'pendiente' | 'entregado' | 'recogido' | 'expirado';
  contenido: ResourceItem[];
  lanzadoEn: Date;
  expiraEn: Date;
  recogidoEn?: Date;
}

export interface CreateSuministroDTO {
  ubicacion: GeoPoint;
  contenido: ResourceItem[];
  expiraEn: Date;
}

export interface UpdateSuministroDTO {
  estado?: 'pendiente' | 'entregado' | 'recogido' | 'expirado';
  recogidoEn?: Date;
}

export interface SuministroConDistancia extends Suministro {
  distanciaKm: number;
}
