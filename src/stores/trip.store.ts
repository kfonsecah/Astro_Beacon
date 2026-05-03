import { create } from 'zustand';
import type { Viaje } from '@/types-dtos';

interface TripState {
  activeTrip: Viaje | null;
  isTracking: boolean;
  oxygenRemaining: number;
  startTime: number | null;

  setActiveTrip: (trip: Viaje | null) => void;
  startTracking: () => void;
  stopTracking: () => void;
  setOxygenRemaining: (value: number) => void;
  decrementOxygen: (amount: number) => void;
  reset: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  activeTrip: null,
  isTracking: false,
  oxygenRemaining: 0,
  startTime: null,

  setActiveTrip: (trip) => set({
    activeTrip: trip,
    oxygenRemaining: trip?.oxygenBudgeted || 0,
    startTime: trip ? Date.now() : null,
  }),

  startTracking: () => set({ isTracking: true }),
  stopTracking: () => set({ isTracking: false }),

  setOxygenRemaining: (value) => set({ oxygenRemaining: value }),
  decrementOxygen: (amount) => set((state) => ({
    oxygenRemaining: Math.max(0, state.oxygenRemaining - amount)
  })),

  reset: () => set({
    activeTrip: null,
    isTracking: false,
    oxygenRemaining: 0,
    startTime: null,
  }),
}));
