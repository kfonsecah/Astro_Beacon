import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { speciesService } from '../services/species.service';
import { offlineQueue, checkOnline } from '@/services/offlineQueue';
import type { Especie, CreateEspecieDTO } from '@/types-dtos';

const QUERY_KEYS = {
  list: (page = 1, limit = 20) => ['species', 'list', page, limit] as const,
  detail: (id: string) => ['species', 'detail', id] as const,
} as const;

export function useSpecies(page = 1, limit = 20) {
  return useQuery({
    queryKey: QUERY_KEYS.list(page, limit),
    queryFn: () => speciesService.getAll(page, limit),
  });
}

export function useSpeciesById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => speciesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSpecies() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async (data: CreateEspecieDTO) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'POST',
          url: '/species',
          data,
        });
        return { id: `_offline_${Date.now()}` } as Especie;
      }
      return speciesService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species'] });
    },
  });
}

export function useIdentifySpecies() {
  return useMutation({
    mutationFn: (imageBase64: string) => 
      speciesService.identify(imageBase64),
  });
}

export function useDeleteSpecies() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async (id: string) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'DELETE',
          url: `/species/${id}`,
        });
        return;
      }
      return speciesService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species'] });
    },
  });
}
