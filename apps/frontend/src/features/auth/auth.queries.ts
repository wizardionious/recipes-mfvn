import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed } from "vue";
import { getToken, removeToken, setToken } from "@/common/api/client";
import {
  getCurrentUser,
  login as loginApi,
  register as registerApi,
} from "./auth.api";

const authQueryKeys = {
  all: ["auth"] as const,
  me: () => [...authQueryKeys.all, "me"] as const,
};

/**
 * Get current user.
 *
 * @returns Current user.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: getCurrentUser,
    enabled: () => !!getToken(),
    retry: false,
  });
}

/**
 * Login user.
 *
 * @param body - login body.
 * @returns Login response.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: ({ token, user }) => {
      setToken(token);
      queryClient.setQueryData(authQueryKeys.me(), user);
    },
  });
}

/**
 * Register user.
 *
 * @param body - register body.
 * @returns Register response.
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: ({ token, user }) => {
      setToken(token);
      queryClient.setQueryData(authQueryKeys.me(), user);
    },
  });
}

/**
 * Logout user.
 *
 * Removes the token from the local storage and clears the query client cache.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    removeToken();
    queryClient.setQueryData(authQueryKeys.me(), null);
    queryClient.clear();
  };
}

/**
 * Check if the user is authenticated.
 *
 * @returns true if the user is authenticated, false otherwise.
 */
export function useIsAuthenticated() {
  return computed(() => !!getToken());
}
