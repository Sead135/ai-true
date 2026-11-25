import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { and, gte, inArray, lte, sql } from "drizzle-orm";
import type { AccessTokenPayload } from "../auth/auth.types.js";
import { BranchesService } from "../branches/branches.service.js";
import { daysInclusive, utcToday, type BranchDateRange } from "../common/dates.js";
import { DRIZZLE } from "../database/database.module.js";
import type { createDb } from "../database/db.js";
import { dailyMetrics, reviews } from "../database/schema/index.js";
import { ReviewsService } from "../reviews/reviews.service.js";
import type { GetStatsQueryDto } from "./dto/get-stats.query.dto.js";
import type { StatsResponseDto, StatsSeriesPointDto, StatsTotalsDto } from "./dto/stats.dto.js";
import { MockStatsSource } from "./mock-stats-source.js";
import type { DailyStatsRow } from "./stats-source.js";

type Db = ReturnType<typeof createDb>["db"];

type ReviewDayTotals = {
  count: number;
  avg: number;
};

type ReviewTotalsMap = Map<string, ReviewDayTotals>;

@Injectable()
export class StatsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Db,
    private readonly source: MockStatsSource,
    private readonly branches: BranchesService,
    private readonly reviews: ReviewsService,
  ) {}

  async get(actor: AccessTokenPayload, query: GetStatsQueryDto): Promise<StatsResponseDto> {
    const from = query.from.slice(0, 10);
    const to = query.to.slice(0, 10);
    if (from > to) {
      throw new BadRequestException("`from` must be <= `to`");
    }

    const branchIds = await this.branches.idsForActor(actor, query.branchId);
    if (branchIds.length === 0) {
      return { totals: emptyTotals(), series: [] };
    }

    // Reviews first so reviewsCount/avgRating match rows in `reviews`
    await this.reviews.ensureForRange({ branchIds, from, to });
    await this.ensurePastMetrics({ branchIds, from, to });

    const rows = await this.db
      .select()
      .from(dailyMetrics)
      .where(
        and(
          inArray(dailyMetrics.branchId, branchIds),
          gte(dailyMetrics.date, from),
          lte(dailyMetrics.date, to),
        ),
      );

    const reviewMap = await this.reviewTotalsByBranchDate({ branchIds, from, to });
    const aligned = rows.map((row) => {
      const base = fromDb(row);
      const live = reviewMap.get(`${row.branchId}:${row.date}`);
      return {
        ...base,
        reviewsCount: live?.count ?? 0,
        avgRating: live?.avg ?? 0,
      };
    });

    return aggregate(aligned);
  }

  /** Live counts from `reviews` — source of truth for the dashboard numbers. */
  private async reviewTotalsByBranchDate(range: BranchDateRange): Promise<ReviewTotalsMap> {
    const { branchIds, from, to } = range;
    const rows = await this.db
      .select({
        branchId: reviews.branchId,
        date: sql<string>`to_char(${reviews.reviewedOn} at time zone 'UTC', 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
        avg: sql<number>`round(avg(${reviews.rating})::numeric, 1)::float8`,
      })
      .from(reviews)
      .where(
        and(
          inArray(reviews.branchId, branchIds),
          gte(reviews.reviewedOn, new Date(`${from}T00:00:00.000Z`)),
          lte(reviews.reviewedOn, new Date(`${to}T23:59:59.999Z`)),
        ),
      )
      .groupBy(
        reviews.branchId,
        sql`to_char(${reviews.reviewedOn} at time zone 'UTC', 'YYYY-MM-DD')`,
      );

    return new Map(
      rows.map((r) => [`${r.branchId}:${r.date}`, { count: r.count, avg: Number(r.avg) }]),
    );
  }

  /** Fill missing days in [from, min(to, today)] from StatsSource. Future dates skipped. */
  private async ensurePastMetrics(range: BranchDateRange): Promise<void> {
    const { branchIds, from, to } = range;
    const today = utcToday();
    const fillTo = to < today ? to : today;
    const rangePastEnd = from > fillTo;
    if (rangePastEnd) {
      return;
    }

    const existing = await this.db
      .select({ branchId: dailyMetrics.branchId, date: dailyMetrics.date })
      .from(dailyMetrics)
      .where(
        and(
          inArray(dailyMetrics.branchId, branchIds),
          gte(dailyMetrics.date, from),
          lte(dailyMetrics.date, fillTo),
        ),
      );

    const have = new Set(existing.map((r) => `${r.branchId}:${r.date}`));
    const expectedDays = daysInclusive(from, fillTo);
    const expected = branchIds.length * expectedDays;
    const allDaysPresent = have.size >= expected;
    if (allDaysPresent) {
      return;
    }

    const rows = await this.source.fetchDaily({ branchIds, from, to: fillTo });
    const missing = rows.filter((r) => !have.has(`${r.branchId}:${r.date}`));
    await this.upsert(missing);
  }

  private async upsert(rows: DailyStatsRow[]): Promise<number> {
    if (rows.length === 0) {
      return 0;
    }

    await this.db
      .insert(dailyMetrics)
      .values(
        rows.map((r) => ({
          branchId: r.branchId,
          date: r.date,
          views: r.views,
          websiteClicks: r.websiteClicks,
          calls: r.calls,
          routes: r.routes,
          avgRating: r.avgRating.toFixed(1),
          reviewsCount: r.reviewsCount,
        })),
      )
      .onConflictDoUpdate({
        target: [dailyMetrics.branchId, dailyMetrics.date],
        set: {
          views: sql`excluded.views`,
          websiteClicks: sql`excluded.website_clicks`,
          calls: sql`excluded.calls`,
          routes: sql`excluded.routes`,
          avgRating: sql`excluded.avg_rating`,
          reviewsCount: sql`excluded.reviews_count`,
        },
      });

    return rows.length;
  }
}

function fromDb(row: typeof dailyMetrics.$inferSelect): DailyStatsRow {
  return {
    branchId: row.branchId,
    date: row.date,
    views: row.views,
    websiteClicks: row.websiteClicks,
    calls: row.calls,
    routes: row.routes,
    avgRating: Number(row.avgRating),
    reviewsCount: row.reviewsCount,
  };
}

function emptyTotals(): StatsTotalsDto {
  return { views: 0, websiteClicks: 0, calls: 0, routes: 0, avgRating: 0, reviewsCount: 0 };
}

function aggregate(rows: DailyStatsRow[]): StatsResponseDto {
  const byDate = new Map<string, DailyStatsRow[]>();
  for (const row of rows) {
    const list = byDate.get(row.date) ?? [];
    list.push(row);
    byDate.set(row.date, list);
  }

  const series: StatsSeriesPointDto[] = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayRows]) => ({ date, ...sumRows(dayRows) }));

  return { totals: sumRows(rows), series };
}

function sumRows(rows: DailyStatsRow[]): StatsTotalsDto {
  if (rows.length === 0) {
    return emptyTotals();
  }

  let views = 0;
  let websiteClicks = 0;
  let calls = 0;
  let routes = 0;
  let reviewsCount = 0;
  let ratingWeight = 0;
  let ratingSum = 0;

  for (const r of rows) {
    views += r.views;
    websiteClicks += r.websiteClicks;
    calls += r.calls;
    routes += r.routes;
    reviewsCount += r.reviewsCount;
    if (r.reviewsCount > 0) {
      ratingSum += r.avgRating * r.reviewsCount;
      ratingWeight += r.reviewsCount;
    }
  }

  return {
    views,
    websiteClicks,
    calls,
    routes,
    avgRating: ratingWeight === 0 ? 0 : Math.round((ratingSum / ratingWeight) * 10) / 10,
    reviewsCount,
  };
}
