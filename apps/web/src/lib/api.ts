const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

interface ApiOptions extends RequestInit {
  token?: string;
}

export class ApiResponseError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiResponseError";
  }
}

export async function apiRequestResponse(
  endpoint: string,
  options: ApiOptions = {}
): Promise<Response> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    let message = `Request failed with status ${response.status}.`;

    if (body) {
      try {
        const result = JSON.parse(body) as {
          error?: { message?: unknown };
        };
        if (typeof result.error?.message === "string") {
          message = result.error.message;
        }
      } catch {
        // Keep the explicit HTTP status message for non-JSON responses.
      }
    }

    throw new ApiResponseError(message, response.status);
  }

  return response;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const { token, headers, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message || "Something went wrong"
    );
  }

  return result as T;
}
