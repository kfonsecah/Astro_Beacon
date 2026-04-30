import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logbookService } from '../services/logbook.service';
import type { BitacoraEntrada, CreateBitacoraEntradaDTO } from '@/types-dtos';

const QUERY_KEYS = {
  list: (page = 1, limit = 20, speciesId?: string) => 
    ['logbook', 'list', page, limit, speciesId] as const,
  detail: (id: string) => ['logbook', 'detail', id] as const,
} as const;

export function useLogbookEntries(page = 1, limit = 20, speciesId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.list(page, limit, speciesId),
    queryFn: () => logbookService.getAll(page, limit, speciesId),
  });
}

export function useLogbookEntryById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => logbookService.getById(id),
    enabled: !!id,
  });
}

export function useCreateLogbookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, speciesId }: { data: CreateBitacoraEntradaDTO; speciesId?: string }) => 
      logbookService.create(data, speciesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] });
    },
  });
}

export function useUpdateLogbookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBitacoraEntradaDTO }) => 
      logbookService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['logbook', 'list'] });
    },
  });
}

export function useDeleteLogbookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      logbookService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] });
    },
  });
}
