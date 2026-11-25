import { api } from "./api";
import type { Role } from "./auth";

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: Role;
  companyId: string | null;
  companyName: string | null;
  createdAt: string;
};

export type UsersPage = {
  items: UserRow[];
  total: number;
  page: number;
  limit: number;
};

export type UpdateUserInput = {
  email?: string;
  name?: string | null;
  avatarUrl?: string | null;
  role?: Role;
  companyId?: string | null;
  password?: string;
};

export type ListUsersParams = {
  q?: string;
  role?: "admin" | "client";
  companyId?: string;
  page?: number;
  limit?: number;
};

export function listUsers(params: ListUsersParams) {
  const q = new URLSearchParams();
  if (params.q) {
    q.set("q", params.q);
  }
  if (params.role) {
    q.set("role", params.role);
  }
  if (params.companyId) {
    q.set("companyId", params.companyId);
  }
  if (params.page) {
    q.set("page", String(params.page));
  }
  if (params.limit) {
    q.set("limit", String(params.limit));
  }
  const qs = q.toString();
  return api<UsersPage>(`/users${qs ? `?${qs}` : ""}`);
}

export function getUser(id: string) {
  return api<UserRow>(`/users/${id}`);
}

export function updateUser(id: string, body: UpdateUserInput) {
  return api<UserRow>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteUser(id: string) {
  return api<void>(`/users/${id}`, { method: "DELETE" });
}
