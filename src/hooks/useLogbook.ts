import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logbookService } from '../services/logbook.service';
import type { BitacoraEntrada, CreateBitacoraEntradaDTO } from '@/types-dtos';

export function useLogbookEntries(userId: string, page = 1, limit = 20, speciesId?: string) {
  return useQuery({
    queryKey: ['logbook', 'list', userId, page, limit, speciesId],
    queryFn: () => logbookService.getAll(userId, page, limit, speciesId),
    enabled: !!userId,
  });
}

export function useLogbookEntryById(userId: string, entryId: string) {
  return useQuery({
    queryKey: ['logbook', 'detail', userId, entryId],
    queryFn: () => logbookService.getById(userId, entryId),
    enabled: !!userId && !!entryId,
  });
}

export function useCreateLogbookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data, speciesId }: { userId: string; data: CreateBitacoraEntradaDTO; speciesId?: string }) => 
      logbookService.create(userId, data, speciesId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['logbook', 'list', userId] });
    },
  });
}

export function useUpdateLogbookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, entryId, data }: { userId: string; entryId: string; data: CreateBitacoraEntradaDTO }) => 
      logbookService.update(userId, entryId, data),
    onSuccess: (_data, { userId, entryId }) => {
      queryClient.invalidateQueries({ queryKey: ['logbook', 'detail', userId, entryId] });
      queryClient.invalidateQueries({ queryKey: ['logbook', 'list', userId] });
    },
  });
}

export function useDeleteLogbookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, entryId }: { userId: string; entryId: string }) => 
      logbookService.delete(userId, entryId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['logbook', 'list', userId] });
    },
  });
}