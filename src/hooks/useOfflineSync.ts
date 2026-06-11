import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { offlineQueue, checkOnline } from '@/services/offlineQueue';
import { useOfflineStore } from '@/stores/offline.store';
import { api } from '@/services/api';
import { useToast } from './useToast';

export function useOfflineSync() {
  const queryClient = useQueryClient();
  const wasOffline = useRef(false);
  const isFlushing = useRef(false);
  const { setIsSyncing } = useOfflineStore();
  const toast = useToast();

  async function flushQueue() {
    if (isFlushing.current) return;
    const { queueSize } = useOfflineStore.getState();
    if (queueSize === 0) return;

    isFlushing.current = true;
    setIsSyncing(true);
    try {
      const { succeeded, dropped, retryable, invalidateKeys } = await offlineQueue.flush(api);
      if (succeeded > 0) {
        for (const key of invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: [key] });
        }
        toast.success('SINCRONIZACIÓN', `${succeeded} op. sincronizada(s) con el servidor`);
      }
      if (dropped > 0) {
        toast.warning('OPS RECHAZADAS', `${dropped} op. rechazada(s) por el servidor y eliminadas de la cola`);
      }
      if (retryable > 0) {
        toast.error('SYNC PARCIAL', `${retryable} op. pendiente(s), se reintentará al reconectar`);
      }
    } finally {
      setIsSyncing(false);
      isFlushing.current = false;
    }
  }

  useEffect(() => {
    offlineQueue.init().then(() => {
      // Flush on startup if online and there are pending items from a previous session
      checkOnline().then((isOnline) => {
        if (isOnline) {
          flushQueue();
        } else {
          wasOffline.current = true;
        }
      });
    });

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const isOnline = !!state.isConnected && state.isInternetReachable === true;

      if (isOnline && wasOffline.current) {
        wasOffline.current = false;
        flushQueue();
      }

      if (!isOnline) {
        wasOffline.current = true;
      }
    });

    return () => unsubscribe();
  }, []);
}
