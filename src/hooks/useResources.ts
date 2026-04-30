import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService, type ResourceAlert } from '../services/resource.service';
import type { Recurso, CreateRecursoDTO, UpdateRecursoDTO, CreateRecursoMovimientoDTO } from '@/types-dtos';

export function useResources(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['resources', 'list', userId, page, limit],
    queryFn: () => resourceService.getAll(userId, page, limit),
    enabled: !!userId,
  });
}

export function useResourceById(userId: string, resourceId: string) {
  return useQuery({
    queryKey: ['resources', 'detail', userId, resourceId],
    queryFn: () => resourceService.getById(userId, resourceId),
    enabled: !!userId && !!resourceId,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreateRecursoDTO }) => 
      resourceService.create(userId, data),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['resources', 'list', userId] });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, resourceId, data }: { userId: string; resourceId: string; data: UpdateRecursoDTO }) => 
      resourceService.update(userId, resourceId, data),
    onSuccess: (_data, { userId, resourceId }) => {
      queryClient.invalidateQueries({ queryKey: ['resources', 'detail', userId, resourceId] });
      queryClient.invalidateQueries({ queryKey: ['resources', 'list', userId] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, resourceId }: { userId: string; resourceId: string }) => 
      resourceService.delete(userId, resourceId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['resources', 'list', userId] });
    },
  });
}

export function useConsumeResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, resourceId, data }: { userId: string; resourceId: string; data: CreateRecursoMovimientoDTO }) => 
      resourceService.recordMovement(userId, resourceId, data),
    onSuccess: (_data, { userId, resourceId }) => {
      queryClient.invalidateQueries({ queryKey: ['resources', 'detail', userId, resourceId] });
      queryClient.invalidateQueries({ queryKey: ['resources', 'list', userId] });
    },
  });
}

export function useResourceAlerts(userId: string) {
  return useQuery({
    queryKey: ['resources', 'alerts', userId],
    queryFn: () => resourceService.getAlerts(userId),
    enabled: !!userId,
  });
}