import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../services/trip.service';
import type { Viaje, CreateViajeDTO, UpdateViajeDTO } from '@/types-dtos';

export function useTrips(userId: string, page = 1, limit = 20, status?: string) {
  return useQuery({
    queryKey: ['trips', 'list', userId, page, limit, status],
    queryFn: () => tripService.getAll(userId, page, limit, status),
    enabled: !!userId,
  });
}

export function useTripById(userId: string, tripId: string) {
  return useQuery({
    queryKey: ['trips', 'detail', userId, tripId],
    queryFn: () => tripService.getById(userId, tripId),
    enabled: !!userId && !!tripId,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreateViajeDTO }) => 
      tripService.create(userId, data),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'list', userId] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, tripId, data }: { userId: string; tripId: string; data: UpdateViajeDTO }) => 
      tripService.update(userId, tripId, data),
    onSuccess: (_data, { userId, tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'detail', userId, tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list', userId] });
    },
  });
}

export function useStartTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, tripId, data }: { userId: string; tripId: string; data?: { notes?: string } }) => 
      tripService.start(userId, tripId, data),
    onSuccess: (_data, { userId, tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'detail', userId, tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list', userId] });
    },
  });
}

export function useCompleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, tripId, data }: { userId: string; tripId: string; data?: { notes?: string; resourcesUsed?: string[] } }) => 
      tripService.complete(userId, tripId, data),
    onSuccess: (_data, { userId, tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'detail', userId, tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list', userId] });
    },
  });
}

export function useAbortTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, tripId, data }: { userId: string; tripId: string; data?: { notes?: string } }) => 
      tripService.abort(userId, tripId, data),
    onSuccess: (_data, { userId, tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'detail', userId, tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips', 'list', userId] });
    },
  });
}