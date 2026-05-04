const TOKEN_KEY = "auth_token";

export class ApiError extends Error {
  code: string;

  constructor(
    public status: number,
    public statusText: string,
    public body: {
      error: string;
      code: string;
      status: number;
      details?: unknown;
    },
  ) {
    super(body.error || `API Error ${status}: ${statusText}`);
    this.code = body.code || "UNKNOWN_ERROR";
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let raw: unknown;
    try {
      raw = await response.json();
    } catch {
      raw = null;
    }
    const body =
      typeof raw === "object" &&
      raw !== null &&
      "error" in raw &&
      "code" in raw &&
      "status" in raw
        ? (raw as {
            error: string;
            code: string;
            status: number;
            details?: unknown;
          })
        : {
            error: "Unknown error",
            code: "UNKNOWN_ERROR",
            status: response.status,
          };
    throw new ApiError(response.status, response.statusText, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ApiRequestOptions
  extends Omit<RequestInit, "body" | "method"> {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { query, body, headers, ...rest } = options;

  let url = `${import.meta.env.VITE_API_URL}${path}`;

  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    if (qs) {
      url += `?${qs}`;
    }
  }

  const response = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}
