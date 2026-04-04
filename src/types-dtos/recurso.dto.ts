import { ResourceCategory } from './enums';

export interface Recurso {
  id: string;
  nombre: string;
  categoria: ResourceCategory;
  cantidadActual: number;
  capacidadMaxima: number;
  unidad: string;
  umbralAlerta: number;
  siempreVisible: boolean;
  actualizadoEn: Date;
}

export interface CreateRecursoDTO {
  nombre: string;
  categoria: ResourceCategory;
  capacidadMaxima: number;
  unidad: string;
  umbralAlerta?: number;
  siempreVisible?: boolean;
}

export interface UpdateRecursoDTO {
  cantidadActual?: number;
  capacidadMaxima?: number;
  umbralAlerta?: number;
}

export interface RecursoMovimiento {
  id: string;
  astronautaId: string;
  recursoId: string;
  tipo: 'ingreso' | 'egreso';
  cantidad: number;
  razon: string;
  viajeId?: string;
  registradoEn: Date;
}

export interface CreateRecursoMovimientoDTO {
  recursoId: string;
  tipo: 'ingreso' | 'egreso';
  cantidad: number;
  razon: string;
  viajeId?: string;
}
