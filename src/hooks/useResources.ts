import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService, type ResourceAlert } from '../services/resource.service';
import type { Recurso, CreateRecursoDTO, UpdateRecursoDTO, CreateRecursoMovimientoDTO } from '@/types-dtos';

const QUERY_KEYS = {
  list: (page = 1, limit = 20) => ['resources', 'list', page, limit] as const,
  detail: (id: string) => ['resources', 'detail', id] as const,
  alerts: ['resources', 'alerts'] as const,
} as const;

export function useResources(page = 1, limit = 20) {
  return useQuery({
    queryKey: QUERY_KEYS.list(page, limit),
    queryFn: () => resourceService.getAll(page, limit),
  });
}

export function useResourceById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => resourceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecursoDTO) => 
      resourceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecursoDTO }) => 
      resourceService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['resources', 'list'] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      resourceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useRecordResourceMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRecursoMovimientoDTO }) => 
      resourceService.recordMovement(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['resources', 'list'] });
    },
  });
}

export function useResourceAlerts() {
  return useQuery({
    queryKey: QUERY_KEYS.alerts,
    queryFn: () => resourceService.getAlerts(),
  });
}
