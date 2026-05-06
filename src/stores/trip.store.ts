import type { Viaje } from '@/types-dtos';
import { create } from 'zustand';

// Region type for simulation (matches react-native-maps Region)
interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface TripState {
  activeTrip: Viaje | null;
  isTracking: boolean;
  oxygenRemaining: number;
  startTime: number | null;
  intervalId: number | null;

  // Simulation state (persists across tab switches)
  simulationRegion: Region | null;
  isSimulating: boolean;
  simulationIntervalId: number | null;
  simulationDestination: { lat: number; lng: number } | null;
  consumptionBuffer: { oxygen: number; food: number };
  consumptionCallback: ((oxygen: number, food: number) => Promise<void>) | null;

  setActiveTrip: (trip: Viaje | null) => void;
  startTracking: () => void;
  stopTracking: () => void;
  setOxygenRemaining: (value: number) => void;
  decrementOxygen: (amount: number) => void;
  startOxygenCountdown: (ratePerMinute: number) => void;
  stopOxygenCountdown: () => void;
  reset: () => void;

  // Simulation actions
  setSimulationRegion: (region: Region) => void;
  startSimulation: (
    destination: { lat: number; lng: number },
    currentRegion: Region,
    onConsume: (oxygen: number, food: number) => Promise<void>
  ) => void;
  stopSimulation: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  activeTrip: null,
  isTracking: false,
  oxygenRemaining: 0,
  startTime: null,
  intervalId: null,

  // Simulation state
  simulationRegion: null,
  isSimulating: false,
  simulationIntervalId: null,
  simulationDestination: null,
  consumptionBuffer: { oxygen: 0, food: 0 },
  consumptionCallback: null,

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
    // Also reset simulation state
    simulationRegion: null,
    isSimulating: false,
    simulationIntervalId: null,
    simulationDestination: null,
    consumptionBuffer: { oxygen: 0, food: 0 },
  }),

  // Simulation actions
  setSimulationRegion: (region) => set({ simulationRegion: region }),

  startSimulation: (destination, currentRegion, onConsume) => {
    const state = get();
    // Clear any existing interval
    if (state.simulationIntervalId) {
      clearInterval(state.simulationIntervalId);
    }

    set({
      isSimulating: true,
      simulationRegion: currentRegion,
      simulationDestination: destination,
      consumptionBuffer: { oxygen: 0, food: 0 },
      consumptionCallback: onConsume,
    });

    // Start interval - 5000ms (5 seconds)
    const intervalId = setInterval(() => {
      const currentState = get();
      if (!currentState.isSimulating || !currentState.simulationDestination) return;

      const SIMULATION_SPEED_MPS = 1.39;
      const OXYGEN_PER_KM = 36;
      const FOOD_PER_KM = 4;
      const SIMULATION_STOP_RADIUS_METERS = 35;

      // Calculate distance to destination
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const earthRadiusKm = 6371;
      const dLat = toRad(currentState.simulationDestination.lat - currentState.simulationRegion!.latitude);
      const dLng = toRad(currentState.simulationDestination.lng - currentState.simulationRegion!.longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(currentState.simulationRegion!.latitude)) *
        Math.cos(toRad(currentState.simulationDestination.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = earthRadiusKm * c;
      const distanceMeters = distanceKm * 1000;

      // Stop if close enough
      if (distanceMeters <= SIMULATION_STOP_RADIUS_METERS) {
        if (state.simulationIntervalId) {
          clearInterval(state.simulationIntervalId);
        }
        set({ isSimulating: false, simulationIntervalId: null });
        return;
      }

      // Move towards destination
      const stepMeters = SIMULATION_SPEED_MPS * 5; // 5 m/s * 5s = 25m per tick
      let nextLat, nextLng;
      if (distanceMeters <= stepMeters) {
        nextLat = currentState.simulationDestination.lat;
        nextLng = currentState.simulationDestination.lng;
      } else {
        const ratio = stepMeters / distanceMeters;
        nextLat = currentState.simulationRegion!.latitude + (currentState.simulationDestination.lat - currentState.simulationRegion!.latitude) * ratio;
        nextLng = currentState.simulationRegion!.longitude + (currentState.simulationDestination.lng - currentState.simulationRegion!.longitude) * ratio;
      }

      const newRegion = {
        ...currentState.simulationRegion!,
        latitude: nextLat,
        longitude: nextLng,
      };

      // Accumulate consumption
      const movedKm = stepMeters / 1000;
      const newBuffer = {
        oxygen: currentState.consumptionBuffer.oxygen + movedKm * OXYGEN_PER_KM,
        food: currentState.consumptionBuffer.food + movedKm * FOOD_PER_KM,
      };

      set({
        simulationRegion: newRegion,
        consumptionBuffer: newBuffer,
      });

      // Flush consumption every 5 seconds (the interval itself is 5s)
      const oxygenAmount = Math.floor(newBuffer.oxygen);
      const foodAmount = Math.floor(newBuffer.food);
      if (oxygenAmount > 0 || foodAmount > 0) {
        const callback = currentState.consumptionCallback;
        if (callback) {
          callback(oxygenAmount, foodAmount).then(() => {
            const s = get();
            set({
              consumptionBuffer: {
                oxygen: s.consumptionBuffer.oxygen - oxygenAmount,
                food: s.consumptionBuffer.food - foodAmount,
              },
            });
          }).catch(() => {
            set({ isSimulating: false, simulationIntervalId: null });
          });
        }
      }
    }, 5000);

    set({ simulationIntervalId: intervalId as unknown as number });
  },

  stopSimulation: () => {
    const state = get();
    if (state.simulationIntervalId) {
      clearInterval(state.simulationIntervalId);
    }
    set({
      isSimulating: false,
      simulationIntervalId: null,
      simulationDestination: null,
      consumptionBuffer: { oxygen: 0, food: 0 },
    });
  },
}));
