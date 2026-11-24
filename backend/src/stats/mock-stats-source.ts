import { Injectable } from "@nestjs/common";
import { eachDate } from "../common/dates";
import { between, hash } from "../common/mock-hash";
import { mockReviewsForDay } from "../reviews/mock-reviews-source";
import type { DailyStatsRow, StatsSource } from "./stats-source";

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
    views: between(h, 40, 280),
    websiteClicks: between(h >>> 3, 5, 60),
    calls: between(h >>> 5, 1, 25),
    routes: between(h >>> 7, 2, 40),
    avgRating,
    reviewsCount,
  };
}

@Injectable()
export class MockStatsSource implements StatsSource {
  async fetchDaily(branchIds: string[], from: string, to: string): Promise<DailyStatsRow[]> {
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
