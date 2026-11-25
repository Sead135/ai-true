import { date, integer, numeric, pgTable, unique, uuid } from "drizzle-orm/pg-core";
import { branches } from "./branches.js";

export const dailyMetrics = pgTable(
  "daily_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id),
    date: date("date").notNull(),
    views: integer("views").notNull().default(0),
    websiteClicks: integer("website_clicks").notNull().default(0),
    calls: integer("calls").notNull().default(0),
    routes: integer("routes").notNull().default(0),
    /** Snapshot rating for the day (1.0–5.0). */
    avgRating: numeric("avg_rating", { precision: 2, scale: 1 }).notNull(),
    /** New reviews that day (not cumulative). */
    reviewsCount: integer("reviews_count").notNull().default(0),
  },
  (t) => [unique("daily_metrics_branch_date_uq").on(t.branchId, t.date)],
);

export type DailyMetric = typeof dailyMetrics.$inferSelect;
