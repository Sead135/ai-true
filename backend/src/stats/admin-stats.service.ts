import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { and, count, gte, lte, sql } from "drizzle-orm";
import { eachDate } from "../common/dates";
import { DRIZZLE } from "../database/database.module";
import type { createDb } from "../database/db";
import { branches, companies, dailyMetrics, reviews, users } from "../database/schema/index";
import type {
  AdminMetric,
  AdminStatsSeriesDto,
  AdminStatsSeriesQueryDto,
  AdminStatsSummaryDto,
} from "./dto/admin-stats.dto";

type Db = ReturnType<typeof createDb>["db"];

@Injectable()
export class AdminStatsService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async summary(): Promise<AdminStatsSummaryDto> {
    const [[c], [b], [u], [r], [v]] = await Promise.all([
      this.db.select({ n: count() }).from(companies),
      this.db.select({ n: count() }).from(branches),
      this.db.select({ n: count() }).from(users),
      this.db.select({ n: count() }).from(reviews),
      this.db
        .select({ n: sql<number>`coalesce(sum(${dailyMetrics.views}), 0)::int` })
        .from(dailyMetrics),
    ]);
    return {
      companies: Number(c.n),
      branches: Number(b.n),
      views: Number(v.n),
      users: Number(u.n),
      reviews: Number(r.n),
    };
  }

  async series(query: AdminStatsSeriesQueryDto): Promise<AdminStatsSeriesDto> {
    const from = query.from.slice(0, 10);
    const to = query.to.slice(0, 10);
    if (from > to) {
      throw new BadRequestException("`from` must be <= `to`");
    }

    const rows = await this.countsByDay(query.metric, from, to);
    const map = new Map(rows.map((r) => [r.date, r.value]));
    const series = eachDate(from, to).map((date) => ({
      date,
      value: map.get(date) ?? 0,
    }));

    return { metric: query.metric, series };
  }

  private async countsByDay(
    metric: AdminMetric,
    from: string,
    to: string,
  ): Promise<{ date: string; value: number }[]> {
    const fromTs = new Date(`${from}T00:00:00.000Z`);
    const toTs = new Date(`${to}T23:59:59.999Z`);

    if (metric === "views") {
      const rows = await this.db
        .select({
          date: dailyMetrics.date,
          value: sql<number>`coalesce(sum(${dailyMetrics.views}), 0)::int`,
        })
        .from(dailyMetrics)
        .where(and(gte(dailyMetrics.date, from), lte(dailyMetrics.date, to)))
        .groupBy(dailyMetrics.date);
      return rows.map((r) => ({ date: r.date, value: Number(r.value) }));
    }

    if (metric === "companies") {
      const day = sql<string>`to_char(${companies.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;
      const rows = await this.db
        .select({ date: day, value: count() })
        .from(companies)
        .where(and(gte(companies.createdAt, fromTs), lte(companies.createdAt, toTs)))
        .groupBy(day);
      return rows.map((r) => ({ date: r.date, value: Number(r.value) }));
    }

    if (metric === "branches") {
      const day = sql<string>`to_char(${branches.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;
      const rows = await this.db
        .select({ date: day, value: count() })
        .from(branches)
        .where(and(gte(branches.createdAt, fromTs), lte(branches.createdAt, toTs)))
        .groupBy(day);
      return rows.map((r) => ({ date: r.date, value: Number(r.value) }));
    }

    if (metric === "users") {
      const day = sql<string>`to_char(${users.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;
      const rows = await this.db
        .select({ date: day, value: count() })
        .from(users)
        .where(and(gte(users.createdAt, fromTs), lte(users.createdAt, toTs)))
        .groupBy(day);
      return rows.map((r) => ({ date: r.date, value: Number(r.value) }));
    }

    const day = sql<string>`to_char(${reviews.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;
    const rows = await this.db
      .select({ date: day, value: count() })
      .from(reviews)
      .where(and(gte(reviews.createdAt, fromTs), lte(reviews.createdAt, toTs)))
      .groupBy(day);
    return rows.map((r) => ({ date: r.date, value: Number(r.value) }));
  }
}
