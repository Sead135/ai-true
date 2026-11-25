/** Daily geo-card metrics for one branch/date. */
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
