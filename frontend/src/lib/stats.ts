import { api } from "./api";

export type StatsTotals = {
  views: number;
  websiteClicks: number;
  calls: number;
  routes: number;
  avgRating: number;
  reviewsCount: number;
};

export type StatsSeriesPoint = StatsTotals & { date: string };

export type StatsResponse = {
  totals: StatsTotals;
  series: StatsSeriesPoint[];
};

export type AdminSummary = {
  companies: number;
  branches: number;
  views: number;
  users: number;
  reviews: number;
};

export type AdminMetric = keyof AdminSummary;

export type AdminSeriesPoint = { date: string; value: number };

export type FetchStatsParams = {
  from: string;
  to: string;
  branchId?: string;
};

export function fetchStats(params: FetchStatsParams) {
  const q = new URLSearchParams({ from: params.from, to: params.to });
  if (params.branchId) {
    q.set("branchId", params.branchId);
  }
  return api<StatsResponse>(`/stats?${q}`);
}

export function fetchAdminSummary() {
  return api<AdminSummary>("/admin/stats/summary");
}

export type FetchAdminSeriesParams = {
  metric: AdminMetric;
  from: string;
  to: string;
};

export type AdminSeriesResponse = {
  metric: AdminMetric;
  series: AdminSeriesPoint[];
};

export function fetchAdminSeries(params: FetchAdminSeriesParams) {
  const q = new URLSearchParams({
    metric: params.metric,
    from: params.from,
    to: params.to,
  });
  return api<AdminSeriesResponse>(`/admin/stats/series?${q}`);
}
