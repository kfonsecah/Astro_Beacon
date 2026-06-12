import { api } from './api';
import type { WalkChallenge } from '@/types-dtos';

export const walkService = {
  async getAll(): Promise<WalkChallenge[]> {
    const response = await api.get<{ success: boolean; data: WalkChallenge[] }>('/walks');
    return response.data.data;
  },

  async startWalk(id: string): Promise<WalkChallenge> {
    const response = await api.post<{ success: boolean; data: WalkChallenge }>(`/walks/${id}/start`);
    return response.data.data;
  },

  async updateGps(id: string, gpsPoints: { lat: number; lng: number; timestamp: string }[]): Promise<WalkChallenge> {
    const response = await api.patch<{ success: boolean; data: WalkChallenge }>(`/walks/${id}/gps`, { gpsPoints });
    return response.data.data;
  },

  async completeWalk(id: string): Promise<WalkChallenge> {
    const response = await api.post<{ success: boolean; data: WalkChallenge }>(`/walks/${id}/complete`);
    return response.data.data;
  },
};
