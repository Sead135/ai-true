import { api, normalizePage } from "./api";

export type Review = {
  id: string;
  branchId: string;
  rating: number;
  text: string;
  authorName: string;
  status: "new" | "processed";
  reviewedOn: string;
  createdAt: string;
};

export type ReviewsPage = {
  items: Review[];
  total: number;
  page: number;
  limit: number;
};

export type ListReviewsParams = {
  from?: string;
  to?: string;
  branchId?: string;
  rating?: number;
  status?: "new" | "processed";
  page?: number;
  limit?: number;
};

export async function listReviews(params: ListReviewsParams): Promise<ReviewsPage> {
  const q = new URLSearchParams();
  if (params.from) {
    q.set("from", params.from);
  }
  if (params.to) {
    q.set("to", params.to);
  }
  if (params.branchId) {
    q.set("branchId", params.branchId);
  }
  if (params.rating) {
    q.set("rating", String(params.rating));
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
  const data = await api<ReviewsPage | Review[]>(`/reviews${qs ? `?${qs}` : ""}`);
  return normalizePage(data, { page: params.page, limit: params.limit });
}
