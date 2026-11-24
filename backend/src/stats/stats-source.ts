/** Daily geo-card metrics for one branch/date. Swap MockStatsSource → HttpStatsSource later. */
export type DailyStatsRow = {
  branchId: string;
  date: string;
  views: number;
  websiteClicks: number;
  calls: number;
  routes: number;
  avgRating: number;
  reviewsCount: number;
};

export interface StatsSource {
  /** Fetch raw daily rows for the given branches and inclusive date range (YYYY-MM-DD). */
  fetchDaily(branchIds: string[], from: string, to: string): Promise<DailyStatsRow[]>;
}

export const STATS_SOURCE = Symbol("STATS_SOURCE");
