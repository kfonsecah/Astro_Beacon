import { create } from 'zustand';

interface OfflineState {
  queueSize: number;
  isSyncing: boolean;
  setQueueSize: (n: number) => void;
  setIsSyncing: (b: boolean) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  queueSize: 0,
  isSyncing: false,
  setQueueSize: (queueSize) => set({ queueSize }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
}));
