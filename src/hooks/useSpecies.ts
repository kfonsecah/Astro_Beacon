import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { speciesService } from '../services/species.service';
import type { Especie, CreateEspecieDTO } from '@/types-dtos';

export function useSpecies(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['species', 'list', userId, page, limit],
    queryFn: () => speciesService.getAll(userId, page, limit),
    enabled: !!userId,
  });
}

export function useSpeciesById(userId: string, speciesId: string) {
  return useQuery({
    queryKey: ['species', 'detail', userId, speciesId],
    queryFn: () => speciesService.getById(userId, speciesId),
    enabled: !!userId && !!speciesId,
  });
}

export function useCreateSpecies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreateEspecieDTO }) => 
      speciesService.create(userId, data),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['species', 'list', userId] });
    },
  });
}