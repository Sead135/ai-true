import { Injectable } from "@nestjs/common";
import { mockReviewsForDay } from "../reviews/mock-reviews-source";
import type { DailyStatsRow, StatsSource } from "./stats-source";

/** Stable 32-bit hash so seed/re-sync stays reproducible. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function between(h: number, min: number, max: number): number {
  return min + (h % (max - min + 1));
}

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

function eachDate(from: string, to: string): string[] {
  const out: string[] = [];
  const cur = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
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
