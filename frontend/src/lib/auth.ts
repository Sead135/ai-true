import { api, apiFetch, parseError, type ApiError } from "./api";

export type Role = "admin" | "client";

export type Me = {
  sub: string;
  email: string;
  role: Role;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type AuthError = ApiError;

export type UpdateProfileBody = {
  name?: string;
  avatarUrl?: string | null;
};

async function parseAuthError(res: Response, fallback: string): Promise<AuthError> {
  const err = await parseError(res, fallback);
  if (res.status === 401) {
    err.message = "Неверный email или пароль";
  } else if (res.status === 409) {
    err.message = "Этот email уже зарегистрирован";
  } else if (res.status === 429) {
    err.message = "Слишком много попыток. Подождите немного";
  }
  return err;
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw await parseAuthError(res, "Не удалось войти");
  }
}

export async function register(email: string, password: string): Promise<void> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw await parseAuthError(res, "Не удалось зарегистрироваться");
  }
}

export async function fetchMe(): Promise<Me | null> {
  const res = await apiFetch("/auth/me");
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw await parseError(res, "Не удалось получить профиль");
  }
  return (await res.json()) as Me;
}

export async function updateProfile(body: UpdateProfileBody): Promise<Me> {
  return api<Me>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function deleteAccount(): Promise<void> {
  await api<void>("/auth/me", { method: "DELETE" });
}

export function profileDisplayName(me: Pick<Me, "name" | "email">): string {
  if (me.name?.trim()) {
    return me.name.trim();
  }
  const local = me.email.split("@")[0] ?? me.email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
