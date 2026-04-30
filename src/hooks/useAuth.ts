import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginDTO, RegisterDTO } from '@/types-dtos';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginDTO) => authService.login(data),
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterDTO) => authService.register(data),
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      useAuthStore.getState().logout();
    },
  });
}
