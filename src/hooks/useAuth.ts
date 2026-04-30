import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import type { LoginDTO, RegisterDTO, LoginResponse } from '@/types-dtos';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginDTO) => authService.login(data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterDTO) => authService.register(data),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authService.logout(),
  });
}