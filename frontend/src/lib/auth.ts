import type { Role } from "@ii/shared";
import { api, apiFetch } from "./api";

export type Me = {
  sub: string;
  email: string;
  role: Role;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type AuthError = {
  status: number;
  message: string;
};

async function parseError(res: Response, fallback: string): Promise<AuthError> {
  let message = fallback;
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (typeof body.message === "string") message = body.message;
    else if (Array.isArray(body.message)) message = body.message.join(", ");
  } catch {
    /* keep fallback */
  }

  if (res.status === 401) message = "Неверный email или пароль";
  else if (res.status === 409) message = "Этот email уже зарегистрирован";
  else if (res.status === 429) message = "Слишком много попыток. Подождите немного";

  return { status: res.status, message };
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await parseError(res, "Не удалось войти");
}

export async function register(email: string, password: string): Promise<void> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await parseError(res, "Не удалось зарегистрироваться");
}

export async function fetchMe(): Promise<Me | null> {
  const res = await apiFetch("/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) {
    let message = "Не удалось получить профиль";
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (typeof body.message === "string") message = body.message;
      else if (Array.isArray(body.message)) message = body.message.join(", ");
    } catch {
      /* keep fallback */
    }
    throw { status: res.status, message } satisfies AuthError;
  }
  return (await res.json()) as Me;
}

export async function updateProfile(body: {
  name?: string;
  avatarUrl?: string | null;
}): Promise<Me> {
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

export function profileDisplayName(me: Pick<Me, "name" | "email">): string {
  if (me.name?.trim()) return me.name.trim();
  const local = me.email.split("@")[0] ?? me.email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
