export type ApiError = {
  status: number;
  message: string;
};

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

type NormalizePageParams = {
  page?: number;
  limit?: number;
};

export async function parseError(res: Response, fallback: string): Promise<ApiError> {
  let message = fallback;
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (typeof body.message === "string") {
      message = body.message;
    } else if (Array.isArray(body.message)) {
      message = body.message.join(", ");
    }
  } catch {
    /* keep fallback */
  }
  return { status: res.status, message };
}

export function normalizePage<T>(
  data: PageResult<T> | T[],
  params: NormalizePageParams = {},
): PageResult<T> {
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: params.page ?? 1,
      limit: params.limit ?? data.length,
    };
  }

  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: typeof data.total === "number" ? data.total : 0,
    page: data.page ?? params.page ?? 1,
    limit: data.limit ?? params.limit ?? 10,
  };
}

/** One in-flight refresh shared across parallel 401s. */
let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function shouldSkipRefresh(path: string): boolean {
  const isAuthPath =
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/logout");
  return isAuthPath;
}

/** Fetch with credentials; on 401 tries refresh once, then retries the request. */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("/api") ? path : `/api${path}`;
  const requestInit: RequestInit = { ...init, credentials: "include", headers };

  const res = await fetch(url, requestInit);
  const pathWithoutApi = path.replace(/^\/api/, "");
  const shouldRefresh = res.status === 401 && !shouldSkipRefresh(pathWithoutApi);
  if (!shouldRefresh) {
    return res;
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    return res;
  }

  return fetch(url, requestInit);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    throw await parseError(res, "Запрос не выполнен");
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}
