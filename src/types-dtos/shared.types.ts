export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ResourceItem {
  resourceId: string;
  cantidad: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}
