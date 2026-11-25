import { api, normalizePage } from "./api";

export type Company = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  logoUrl: string | null;
  website: string;
  email: string;
  createdAt: string;
};

export type CompanyInput = Omit<Company, "id" | "createdAt">;

export type CompaniesPage = {
  items: Company[];
  total: number;
  page: number;
  limit: number;
};

export type ListCompaniesParams = {
  q?: string;
  city?: string;
  page?: number;
  limit?: number;
};

export async function listCompanies(params: ListCompaniesParams = {}): Promise<CompaniesPage> {
  const q = new URLSearchParams();
  if (params.q) {
    q.set("q", params.q);
  }
  if (params.city) {
    q.set("city", params.city);
  }
  if (params.page) {
    q.set("page", String(params.page));
  }
  if (params.limit) {
    q.set("limit", String(params.limit));
  }
  const qs = q.toString();
  const data = await api<CompaniesPage | Company[]>(`/companies${qs ? `?${qs}` : ""}`);
  return normalizePage(data, { page: params.page, limit: params.limit });
}

export function getCompany(id: string) {
  return api<Company>(`/companies/${id}`);
}

export function createCompany(body: Pick<CompanyInput, "name"> & Partial<CompanyInput>) {
  return api<Company>("/companies", {
    method: "POST",
    body: JSON.stringify({ ...body, logoUrl: body.logoUrl ?? undefined }),
  });
}

export function updateCompany(id: string, body: Partial<CompanyInput>) {
  return api<Company>(`/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
