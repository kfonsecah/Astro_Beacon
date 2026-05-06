import { useToastStore } from '@/stores/toast.store';

export function useToast() {
  const show = useToastStore((s) => s.show);
  return {
    error: (title: string, message?: string) => show('error', title, message),
    warning: (title: string, message?: string) => show('warning', title, message),
    success: (title: string, message?: string) => show('success', title, message),
    info: (title: string, message?: string) => show('info', title, message),
  };
}
