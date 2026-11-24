import { integer, pgEnum, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { branches } from "./branches";

export const reviewStatusEnum = pgEnum("review_status", ["new", "processed"]);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id),
    rating: integer("rating").notNull(),
    text: text("text").notNull(),
    authorName: varchar("author_name", { length: 120 }).notNull(),
    status: reviewStatusEnum("status").notNull().default("new"),
    /** Day the review belongs to (geo-card timeline). */
    reviewedOn: timestamp("reviewed_on", { withTimezone: true }).notNull(),
    /** Idempotent mock slot: `${YYYY-MM-DD}:${index}`. */
    mockKey: varchar("mock_key", { length: 32 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("reviews_branch_mock_key_uq").on(t.branchId, t.mockKey)],
);

export type Review = typeof reviews.$inferSelect;
