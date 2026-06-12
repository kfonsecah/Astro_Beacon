import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walkService } from '@/services/walk.service';

export function useWalks() {
  return useQuery({
    queryKey: ['walks'],
    queryFn: () => walkService.getAll(),
  });
}

export function useStartWalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => walkService.startWalk(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walks'] });
    },
  });
}

export function useUpdateWalkGps() {
  return useMutation({
    mutationFn: ({ id, gpsPoints }: { id: string; gpsPoints: { lat: number; lng: number; timestamp: string }[] }) =>
      walkService.updateGps(id, gpsPoints),
  });
}

export function useCompleteWalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => walkService.completeWalk(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walks'] });
    },
  });
}
