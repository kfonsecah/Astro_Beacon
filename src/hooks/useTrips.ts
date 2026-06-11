import { useTripStore } from '@/stores/trip.store';
import type { CreateViajeDTO, UpdateViajeDTO, Viaje } from '@/types-dtos';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../services/trip.service';
import { offlineQueue, checkOnline } from '@/services/offlineQueue';

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
    networkMode: 'always',
    mutationFn: async (data: CreateViajeDTO) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'POST',
          url: '/trips',
          data,
        });
        return { id: `_offline_${Date.now()}` } as Viaje;
      }
      return tripService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async ({ id, data }: { id: string; data: UpdateViajeDTO }) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'PUT',
          url: `/trips/${id}`,
          data,
        });
        return { id } as Viaje;
      }
      return tripService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
    },
  });
}

export function useStartTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async ({ id, data }: { id: string; data?: { notes?: string } }) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'POST',
          url: `/trips/${id}/start`,
          data,
        });
        return { id, status: 'activo', destination: { lat: 0, lng: 0 }, oxygenBudgeted: 0, oxygenConsumed: 0, resourcesCollected: 0, astronautId: '' } as Viaje;
      }
      return tripService.start(id, data);
    },
    onSuccess: (updatedTrip, { id }) => {
      const currentActive = useTripStore.getState().activeTrip;
      if (currentActive && currentActive.id !== id) {
        console.error('Starting trip while another trip is active:', currentActive.id);
      }
      useTripStore.getState().setActiveTrip(updatedTrip);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
    },
  });
}

export function useCompleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async ({ id, data }: { id: string; data?: { notes?: string; resourcesUsed?: string[] } }) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'POST',
          url: `/trips/${id}/complete`,
          data,
        });
        return { id } as Viaje;
      }
      return tripService.complete(id, data);
    },
    onSuccess: (_, { id }) => {
      useTripStore.getState().setActiveTrip(null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
    },
  });
}

export function useAbortTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async ({ id, data }: { id: string; data?: { notes?: string } }) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'POST',
          url: `/trips/${id}/abort`,
          data,
        });
        return { id } as Viaje;
      }
      return tripService.abort(id, data);
    },
    onSuccess: (_, { id }) => {
      useTripStore.getState().setActiveTrip(null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async (id: string) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'DELETE',
          url: `/trips/${id}`,
        });
        return;
      }
      return tripService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
