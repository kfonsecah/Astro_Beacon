import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../services/trip.service';
import type { Viaje, CreateViajeDTO, UpdateViajeDTO } from '@/types-dtos';

const QUERY_KEYS = {
  list: (page = 1, limit = 20, status?: string) => 
    ['trips', 'list', page, limit, status] as const,
  detail: (id: string) => ['trips', 'detail', id] as const,
} as const;

export function useTrips(page = 1, limit = 20, status?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.list(page, limit, status),
    queryFn: () => tripService.getAll(page, limit, status),
  });
}

export function useTripById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => tripService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateViajeDTO) => 
      tripService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateViajeDTO }) => 
      tripService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
    },
  });
}

export function useStartTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { notes?: string } }) => 
      tripService.start(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
    },
  });
}

export function useCompleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { notes?: string; resourcesUsed?: string[] } }) => 
      tripService.complete(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
    },
  });
}

export function useAbortTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { notes?: string } }) => 
      tripService.abort(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      tripService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
