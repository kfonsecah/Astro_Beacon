import { create } from 'zustand';
import type { Viaje } from '@/types-dtos';

interface TripState {
  activeTrip: Viaje | null;
  isTracking: boolean;
  oxygenRemaining: number;
  startTime: number | null;
  intervalId: number | null;

  setActiveTrip: (trip: Viaje | null) => void;
  startTracking: () => void;
  stopTracking: () => void;
  setOxygenRemaining: (value: number) => void;
  decrementOxygen: (amount: number) => void;
  startOxygenCountdown: (ratePerMinute: number) => void;
  stopOxygenCountdown: () => void;
  reset: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  activeTrip: null,
  isTracking: false,
  oxygenRemaining: 0,
  startTime: null,
  intervalId: null,

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

  startOxygenCountdown: (ratePerMinute: number) => set((state) => {
    if (state.intervalId !== null) {
      clearInterval(state.intervalId); // Clean up any stale interval first
    }

    const intervalId = setInterval(() => {
      set((s) => ({
        oxygenRemaining: Math.max(0, s.oxygenRemaining - ratePerMinute / 60),
      }));
    }, 1000);

    return { intervalId: intervalId as unknown as number, isTracking: true };
  }),

  stopOxygenCountdown: () => set((state) => {
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }
    return { intervalId: null, isTracking: false };
  }),

  reset: () => set({
    activeTrip: null,
    isTracking: false,
    oxygenRemaining: 0,
    startTime: null,
    intervalId: null,
  }),
}));
