import { create } from 'zustand';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastStore {
  toasts: ToastMessage[];
  show: (type: ToastType, title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

let _counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (type, title, message) => {
    const id = `toast-${++_counter}`;
    set((state) => ({ toasts: [...state.toasts, { id, type, title, message }] }));
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
