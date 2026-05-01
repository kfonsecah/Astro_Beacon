import { ResourceCategory } from './enums';

export interface Recurso {
  id: string;
  name: string;
  category: ResourceCategory;
  currentAmount: number;
  unit: string;
  threshold: number;
  movements: RecursoMovimiento[];
  userId: string;
  lastModified: Date;
  createdAt: Date;
}

export interface CreateRecursoDTO {
  name: string;
  category: ResourceCategory;
  currentAmount: number;
  unit: string;
  threshold?: number;
}

export interface UpdateRecursoDTO {
  name?: string;
  category?: ResourceCategory;
  currentAmount?: number;
  unit?: string;
  threshold?: number;
}

export interface RecursoMovimiento {
  type: 'ingreso' | 'egreso';
  amount: number;
  notes?: string;
  timestamp: Date;
  previousAmount: number;
  newAmount: number;
}

export interface CreateRecursoMovimientoDTO {
  recursoId: string;
  tipo: 'ingreso' | 'egreso';
  cantidad: number;
  razon: string;
  viajeId?: string;
}

export interface PaginatedResources {
  items: Recurso[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ResourceAlert {
  id: string;
  type: 'low' | 'critical';
  resourceId: string;
  message: string;
}
