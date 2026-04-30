import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplyService } from '../services/supply.service';
import type { Suministro, CreateSuministroDTO, UpdateSuministroDTO, SuministroConDistancia } from '@/types-dtos';

export function useSupplies(userId: string, page = 1, limit = 20, status?: string) {
  return useQuery({
    queryKey: ['supplies', 'list', userId, page, limit, status],
    queryFn: () => supplyService.getAll(userId, page, limit, status),
    enabled: !!userId,
  });
}

export function useSupplyById(userId: string, supplyId: string) {
  return useQuery({
    queryKey: ['supplies', 'detail', userId, supplyId],
    queryFn: () => supplyService.getById(userId, supplyId),
    enabled: !!userId && !!supplyId,
  });
}

export function useCollectSupply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, supplyId, data }: { userId: string; supplyId: string; data?: { notes?: string } }) => 
      supplyService.collect(userId, supplyId, data),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['supplies', 'list', userId] });
    },
  });
}

export function useNearbySupplies(userId: string, lat: number, lng: number, radius = 5000, status?: string) {
  return useQuery({
    queryKey: ['supplies', 'nearby', userId, lat, lng, radius, status],
    queryFn: () => supplyService.getNearby(userId, lat, lng, radius, status),
    enabled: !!userId && lat != null && lng != null,
  });
}