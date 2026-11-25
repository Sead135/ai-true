import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { and, count, gte, lte, sql } from "drizzle-orm";
import { eachDate, type DateRange } from "../common/dates";
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

type DayValue = {
  date: string;
  value: number;
};

type CountsByDayParams = DateRange & {
  metric: AdminMetric;
};

type CountableTable = typeof companies | typeof branches | typeof users | typeof reviews;

type CreatedAtColumn =
  | typeof companies.createdAt
  | typeof branches.createdAt
  | typeof users.createdAt
  | typeof reviews.createdAt;

type CountByCreatedAtParams = DateRange & {
  table: CountableTable;
  createdAt: CreatedAtColumn;
};

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

    const rows = await this.countsByDay({ metric: query.metric, from, to });
    const map = new Map(rows.map((r) => [r.date, r.value]));
    const series = eachDate(from, to).map((date) => ({
      date,
      value: map.get(date) ?? 0,
    }));

    return { metric: query.metric, series };
  }

  private async countsByDay(params: CountsByDayParams): Promise<DayValue[]> {
    const { metric, from, to } = params;
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
      return this.countByCreatedAt({
        table: companies,
        createdAt: companies.createdAt,
        from,
        to,
      });
    }
    if (metric === "branches") {
      return this.countByCreatedAt({
        table: branches,
        createdAt: branches.createdAt,
        from,
        to,
      });
    }
    if (metric === "users") {
      return this.countByCreatedAt({
        table: users,
        createdAt: users.createdAt,
        from,
        to,
      });
    }
    return this.countByCreatedAt({
      table: reviews,
      createdAt: reviews.createdAt,
      from,
      to,
    });
  }

  private async countByCreatedAt(params: CountByCreatedAtParams): Promise<DayValue[]> {
    const { table, createdAt, from, to } = params;
    const fromTs = new Date(`${from}T00:00:00.000Z`);
    const toTs = new Date(`${to}T23:59:59.999Z`);
    const day = sql<string>`to_char(${createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;
    const rows = await this.db
      .select({ date: day, value: count() })
      .from(table)
      .where(and(gte(createdAt, fromTs), lte(createdAt, toTs)))
      .groupBy(day);
    return rows.map((r) => ({ date: r.date, value: Number(r.value) }));
  }
}
