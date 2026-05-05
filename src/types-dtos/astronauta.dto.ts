import { UserRole, AstronautStatus } from './enums';
import { GeoPoint } from './shared.types';

export interface Astronauta {
  id: string;
  name: string;
  email: string;
  rol: UserRole;
  status: AstronautStatus;
  baseCampLocation: GeoPoint;
  creadoEn: Date;
  ultimaActividad: Date;
}

export interface CreateAstronautaDTO {
  name: string;
  email: string;
  password: string;
  baseCampLocation?: GeoPoint;
}

export interface UpdateAstronautaDTO {
  name?: string;
  status?: AstronautStatus;
  baseCampLocation?: GeoPoint;
}

export interface DashboardStats {
  recursosCount: number;
  activeTrips: number;
  speciesDiscovered: number;
}
