import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplyService } from '../services/supply.service';
import type { Suministro, CreateSuministroDTO, SuministroConDistancia } from '@/types-dtos';

const QUERY_KEYS = {
  list: (page = 1, limit = 20, status?: string) => 
    ['supplies', 'list', page, limit, status] as const,
  detail: (id: string) => ['supplies', 'detail', id] as const,
  nearby: (lat: number, lng: number, radius?: number) => 
    ['supplies', 'nearby', lat, lng, radius] as const,
} as const;

export function useSupplies(page = 1, limit = 20, status?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.list(page, limit, status),
    queryFn: () => supplyService.getAll(page, limit, status),
  });
}

export function useSupplyById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => supplyService.getById(id),
    enabled: !!id,
  });
}

export function useCollectSupply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { notes?: string } }) => 
      supplyService.collect(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
    },
  });
}

export function useNearbySupplies(lat: number, lng: number, radius = 1000, status?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.nearby(lat, lng, radius),
    queryFn: () => supplyService.getNearby(lat, lng, radius, status),
  });
}
