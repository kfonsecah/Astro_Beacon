import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { astronautService, type DashboardStats } from '../services/astronaut.service';
import type { Astronauta, CreateAstronautaDTO, UpdateAstronautaDTO } from '@/types-dtos';

export function useAstronautProfile(userId: string) {
  return useQuery({
    queryKey: ['astronaut', 'profile', userId],
    queryFn: () => astronautService.getProfile(userId),
    enabled: !!userId,
  });
}

export function useAstronautDashboard(userId: string) {
  return useQuery({
    queryKey: ['astronaut', 'dashboard', userId],
    queryFn: () => astronautService.getDashboard(userId),
    enabled: !!userId,
  });
}

export function useUpdateAstronautProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateAstronautaDTO }) => 
      astronautService.createOrUpdate(userId, data as CreateAstronautaDTO),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['astronaut', 'profile', userId] });
    },
  });
}