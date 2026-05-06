import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '@/stores/toast.store';
import { Toast } from './Toast';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top + 10,
        left: 16,
        right: 16,
        zIndex: 9999,
        pointerEvents: 'box-none',
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </View>
  );
}
