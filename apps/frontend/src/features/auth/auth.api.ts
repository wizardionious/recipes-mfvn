import type {
  AuthResponse,
  LoginBody,
  RegisterBody,
  User,
} from "@recipes/shared";
import { apiClient } from "@/common/api/client";

export function register(body: RegisterBody): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/api/auth/register", {
    method: "POST",
    body,
  });
}

export function login(body: LoginBody): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/api/auth/login", {
    method: "POST",
    body,
  });
}

export function getCurrentUser(): Promise<User> {
  return apiClient<User>("/api/users/me");
}
