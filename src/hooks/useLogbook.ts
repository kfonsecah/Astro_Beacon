import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logbookService } from '../services/logbook.service';
import { offlineQueue, checkOnline } from '@/services/offlineQueue';
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
    networkMode: 'always',
    mutationFn: async ({ data, speciesId }: { data: CreateBitacoraEntradaDTO; speciesId?: string }) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'POST',
          url: '/logbook',
          data: { ...data, speciesId },
        });
        return { id: `_offline_${Date.now()}` } as BitacoraEntrada;
      }
      return logbookService.create(data, speciesId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] });
    },
  });
}

export function useUpdateLogbookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async ({ id, data }: { id: string; data: CreateBitacoraEntradaDTO }) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'PUT',
          url: `/logbook/${id}`,
          data,
        });
        return { id } as BitacoraEntrada;
      }
      return logbookService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['logbook', 'list'] });
    },
  });
}

export function useDeleteLogbookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async (id: string) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'DELETE',
          url: `/logbook/${id}`,
        });
        return;
      }
      return logbookService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] });
    },
  });
}
