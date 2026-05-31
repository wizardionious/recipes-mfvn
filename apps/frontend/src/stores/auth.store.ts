import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { loginUser, registerUser } from "@/services/auth.api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth.types";

const TOKEN_STORAGE_KEY = "recipes.auth.token";
const USER_STORAGE_KEY = "recipes.auth.user";

function getStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  const user = ref<AuthUser | null>(getStoredUser());
  const isLoading = ref(false);
  const error = ref("");

  const isAuthenticated = computed(() => Boolean(token.value && user.value));

  function setSession(authResponse: AuthResponse) {
    token.value = authResponse.token;
    user.value = authResponse.user;

    localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authResponse.user));
  }

  function clearError() {
    error.value = "";
  }

  async function register(payload: RegisterPayload) {
    isLoading.value = true;
    error.value = "";

    try {
      const response = await registerUser(payload);
      setSession(response);
      return response.user;
    } catch (unknownError) {
      error.value =
        unknownError instanceof Error
          ? unknownError.message
          : "Registration failed. Please try again.";

      throw unknownError;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(payload: LoginPayload) {
    isLoading.value = true;
    error.value = "";

    try {
      const response = await loginUser(payload);
      setSession(response);
      return response.user;
    } catch (unknownError) {
      error.value =
        unknownError instanceof Error
          ? unknownError.message
          : "Login failed. Please try again.";

      throw unknownError;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    error.value = "";

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    clearError,
  };
});