export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ResourceItem {
  resourceId: string;
  cantidad: number;
}

export enum UserRole {
  ASTRONAUT = 'astronaut',
  CONTROL_MISION = 'control_mision',
}

export enum AstronautStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  EMERGENCIA = 'emergencia',
}

export enum ResourceCategory {
  OXIGENO = 'oxigeno',
  AGUA = 'agua',
  COMIDA = 'comida',
  MEDICO = 'medico',
  EQUIPO = 'equipo',
  OTRO = 'otro',
}

export enum MovementType {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
}

export enum SpeciesClassification {
  ANIMAL = 'animal',
  PLANTA = 'planta',
  RECURSO = 'recurso',
  MICROORGANISMO = 'microorganismo',
  DESCONOCIDO = 'desconocido',
  OTRO = 'otro',
}

export enum DangerLevel {
  AMIGABLE = 'amigable',
  CAUTELOSO = 'cauteloso',
  PELIGROSO = 'peligroso',
  LETAL = 'letal',
}

export enum TripStatus {
  PLANIFICADO = 'planificado',
  ACTIVO = 'activo',
  COMPLETADO = 'completado',
  ABORTADO = 'abortado',
}

export enum SupplyDropStatus {
  PENDIENTE = 'pendiente',
  ENTREGADO = 'entregado',
  RECOGIDO = 'recogido',
  EXPIRADO = 'expirado',
}
