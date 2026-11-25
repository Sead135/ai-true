import { api } from "./api";

export type Branch = {
  id: string;
  companyId: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  logoUrl: string | null;
  website: string;
  email: string;
  businessCategory: string;
  isActive: boolean;
  createdAt: string;
};

export type BranchesPage = {
  items: Branch[];
  total: number;
  page: number;
  limit: number;
};

export type BranchInput = Omit<Branch, "id" | "createdAt" | "companyId"> & {
  companyId?: string;
};

export async function listBranches(
  params: {
    q?: string;
    companyId?: string;
    city?: string;
    status?: "active" | "inactive";
    page?: number;
    limit?: number;
  } = {},
): Promise<BranchesPage> {
  const q = new URLSearchParams();
  if (params.q) q.set("q", params.q);
  if (params.companyId) q.set("companyId", params.companyId);
  if (params.city) q.set("city", params.city);
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString();
  const data = await api<BranchesPage | Branch[]>(`/branches${qs ? `?${qs}` : ""}`);
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

export function getBranch(id: string) {
  return api<Branch>(`/branches/${id}`);
}

export function createBranch(body: BranchInput & { companyId: string }) {
  return api<Branch>("/branches", {
    method: "POST",
    body: JSON.stringify({ ...body, logoUrl: body.logoUrl ?? undefined }),
  });
}

export function updateBranch(id: string, body: Partial<BranchInput>) {
  return api<Branch>(`/branches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
