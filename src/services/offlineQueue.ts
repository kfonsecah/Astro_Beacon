import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '@/stores/offline.store';
import type { AxiosInstance } from 'axios';

export async function checkOnline(): Promise<boolean> {
  try {
    const state = await Promise.race([
      NetInfo.fetch(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);
    if (!state) return false; // timed out → assume offline
    return !!state.isConnected && state.isInternetReachable === true;
  } catch {
    return false;
  }
}

const QUEUE_KEY = '@astrobeacon_offline_queue';

export interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  timestamp: number;
}

async function readQueue(): Promise<QueuedRequest[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedRequest[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    useOfflineStore.getState().setQueueSize(queue.length);
  } catch {
    // AsyncStorage full or unavailable — best effort
  }
}

export const offlineQueue = {
  async init(): Promise<void> {
    const queue = await readQueue();
    useOfflineStore.getState().setQueueSize(queue.length);
  },

  async enqueue(req: Omit<QueuedRequest, 'id' | 'timestamp'>): Promise<void> {
    const queue = await readQueue();
    queue.push({
      ...req,
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    });
    await writeQueue(queue);
  },

  async flush(apiInstance: AxiosInstance): Promise<{ succeeded: number; dropped: number; retryable: number; invalidateKeys: string[] }> {
    const queue = await readQueue();
    if (queue.length === 0) return { succeeded: 0, dropped: 0, retryable: 0, invalidateKeys: [] };

    let succeeded = 0;
    let dropped = 0;
    let retryable = 0;
    const remaining: QueuedRequest[] = [];
    const invalidateKeys = new Set<string>();

    for (const req of queue) {
      try {
        await apiInstance.request({
          method: req.method,
          url: req.url,
          data: req.data,
        });
        succeeded++;
        const entity = req.url.replace(/^\//, '').split('/')[0];
        if (entity) invalidateKeys.add(entity);
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status ?? null;
        // 4xx = permanent (server rejected) — drop, don't retry
        // null / 5xx = transient — keep for next sync
        // 429 = rate limited → retryable; other 4xx = server rejected permanently → drop
        const isPermanent = status !== null && status >= 400 && status < 500 && status !== 429;
        if (isPermanent) {
          dropped++;
        } else {
          retryable++;
          remaining.push(req);
        }
      }
    }

    await writeQueue(remaining);
    return { succeeded, dropped, retryable, invalidateKeys: [...invalidateKeys] };
  },
};
