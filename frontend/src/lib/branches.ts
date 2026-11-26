import { api, normalizePage } from "./api";

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

export type ListBranchesParams = {
  q?: string;
  companyId?: string;
  city?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
};

export type CreateBranchBody = Pick<BranchInput, "name"> &
  Partial<BranchInput> & { companyId: string };

export async function listBranches(params: ListBranchesParams = {}): Promise<BranchesPage> {
  const q = new URLSearchParams();
  if (params.q) {
    q.set("q", params.q);
  }
  if (params.companyId) {
    q.set("companyId", params.companyId);
  }
  if (params.city) {
    q.set("city", params.city);
  }
  if (params.status) {
    q.set("status", params.status);
  }
  if (params.page) {
    q.set("page", String(params.page));
  }
  if (params.limit) {
    q.set("limit", String(params.limit));
  }
  const qs = q.toString();
  const data = await api<BranchesPage | Branch[]>(`/branches${qs ? `?${qs}` : ""}`);
  return normalizePage(data, { page: params.page, limit: params.limit });
}

export function getBranch(id: string) {
  return api<Branch>(`/branches/${id}`);
}

export function createBranch(body: CreateBranchBody) {
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

export function deleteBranch(id: string) {
  return api<void>(`/branches/${id}`, { method: "DELETE" });
}
