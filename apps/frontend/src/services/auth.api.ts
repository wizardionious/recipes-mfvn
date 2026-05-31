import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function createApiUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
    const response = await fetch(createApiUrl(path), {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });


  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ?? data?.error ?? "Request failed. Please try again.";

    throw new Error(message);
  }

  return data as T;
}

export function registerUser(payload: RegisterPayload) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}