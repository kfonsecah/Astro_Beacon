import { Stack } from "expo-router";
import { RouteErrorFallback } from '@/components/common';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RouteErrorFallback error={error} retry={retry} />;
}
