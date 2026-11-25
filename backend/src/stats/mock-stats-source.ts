import { Injectable } from "@nestjs/common";
import { eachDate, type BranchDateRange } from "../common/dates";
import { between, hash } from "../common/mock-hash";
import { mockReviewsForDay } from "../reviews/mock-reviews-source";
import type { DailyStatsRow } from "./stats-source";

export function mockDay(branchId: string, date: string): DailyStatsRow {
  const h = hash(`${branchId}:${date}`);
  const dayReviews = mockReviewsForDay(branchId, date);
  const reviewsCount = dayReviews.length;
  const avgRating =
    reviewsCount === 0
      ? 0
      : Math.round((dayReviews.reduce((s, r) => s + r.rating, 0) / reviewsCount) * 10) / 10;

  return {
    branchId,
    date,
    views: between({ h, min: 40, max: 280 }),
    websiteClicks: between({ h: h >>> 3, min: 5, max: 60 }),
    calls: between({ h: h >>> 5, min: 1, max: 25 }),
    routes: between({ h: h >>> 7, min: 2, max: 40 }),
    avgRating,
    reviewsCount,
  };
}

@Injectable()
export class MockStatsSource {
  async fetchDaily(range: BranchDateRange): Promise<DailyStatsRow[]> {
    const { branchIds, from, to } = range;
    const dates = eachDate(from, to);
    const rows: DailyStatsRow[] = [];
    for (const branchId of branchIds) {
      for (const date of dates) {
        rows.push(mockDay(branchId, date));
      }
    }
    return rows;
  }
}
