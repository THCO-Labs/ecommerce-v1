/**
 * The one place the browser talks to the API.
 *
 * In development Vite proxies `/api` to the Express server so the session and
 * basket cookies stay same-site; a deployed client points VITE_API_URL at the
 * API origin, and `credentials: "include"` keeps both cookies flowing either
 * way. Losing the basket cookie loses the shopper's basket, so this is not
 * optional.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

/** Every failed response, carrying the status and the API's per-field messages. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

/** Drop blank params so `?category=` never reaches the API as an empty filter. */
function withQuery(path: string, query?: Query): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  return params.size ? `${path}?${params}` : path;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload as { error?: string; fieldErrors?: Record<string, string[]> } | null;
    throw new ApiError(response.status, error?.error ?? "Something went wrong. Please try again.", error?.fieldErrors);
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>("GET", withQuery(path, query)),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body ?? {}),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
