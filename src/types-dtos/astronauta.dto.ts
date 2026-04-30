import { UserRole, AstronautStatus } from './enums';
import { GeoPoint } from './shared.types';

export interface Astronauta {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: UserRole;
  estado: AstronautStatus;
  baseCampLocation: GeoPoint;
  creadoEn: Date;
  ultimaActividad: Date;
}

export interface CreateAstronautaDTO {
  nombre: string;
  email: string;
  password: string;
  baseCampLocation?: GeoPoint;
}

export interface UpdateAstronautaDTO {
  nombre?: string;
  estado?: AstronautStatus;
  baseCampLocation?: GeoPoint;
}

export interface DashboardStats {
  recursosCount: number;
  activeTrips: number;
  speciesDiscovered: number;
}
