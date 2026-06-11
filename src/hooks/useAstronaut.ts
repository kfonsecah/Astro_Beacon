import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { astronautService } from '../services/astronaut.service';
import { offlineQueue, checkOnline } from '@/services/offlineQueue';
import type { Astronauta, CreateAstronautaDTO } from '@/types-dtos';

const QUERY_KEYS = {
  profile: ['astronaut', 'profile'],
  dashboard: ['astronaut', 'dashboard'],
} as const;

export function useAstronautProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => astronautService.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAstronautDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: () => astronautService.getDashboard(),
  });
}

export function useUpdateAstronautProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async (data: CreateAstronautaDTO) => {
      const isOnline = await checkOnline();
      if (!isOnline) {
        await offlineQueue.enqueue({
          method: 'PUT',
          url: '/astronaut',
          data,
        });
        return { id: `_offline_${Date.now()}` } as Astronauta;
      }
      return astronautService.createOrUpdate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
}
