import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import type { AccessTokenPayload } from "../auth/auth.types";
import { BranchesService } from "../branches/branches.service";
import { DRIZZLE } from "../database/database.module";
import type { createDb } from "../database/db";
import { reviews } from "../database/schema/index";
import type { GetReviewsQueryDto } from "./dto/get-reviews.query.dto";
import type { ReviewDto } from "./dto/review.dto";
import { REVIEWS_SOURCE, type ReviewRow, type ReviewsSource } from "./reviews-source";

type Db = ReturnType<typeof createDb>["db"];

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Db,
    @Inject(REVIEWS_SOURCE) private readonly source: ReviewsSource,
    private readonly branches: BranchesService,
  ) {}

  async ingest(branchIds: string[], from: string, to: string): Promise<number> {
    if (branchIds.length === 0) return 0;
    const rows = await this.source.fetchReviews(branchIds, from, to);
    return this.upsert(rows);
  }

  /** Ensure mock/API reviews exist for past days in range (used by stats for count consistency). */
  async ensureForRange(branchIds: string[], from: string, to: string): Promise<void> {
    await this.ensurePastReviews(branchIds, from, to);
  }

  async list(actor: AccessTokenPayload, query: GetReviewsQueryDto): Promise<ReviewDto[]> {
    const from = (query.from ?? defaultFrom()).slice(0, 10);
    const to = (query.to ?? utcToday()).slice(0, 10);
    if (from > to) {
      throw new BadRequestException("`from` must be <= `to`");
    }

    const branchIds = await this.resolveBranchIds(actor, query.branchId);
    if (branchIds.length === 0) return [];

    // ponytail: lazy mock fill on GET; swap source when real reviews API lands
    await this.ensurePastReviews(branchIds, from, to);

    const fromTs = new Date(`${from}T00:00:00.000Z`);
    const toTs = new Date(`${to}T23:59:59.999Z`);

    const conditions = [
      inArray(reviews.branchId, branchIds),
      gte(reviews.reviewedOn, fromTs),
      lte(reviews.reviewedOn, toTs),
    ];

    if (query.rating !== undefined) {
      conditions.push(eq(reviews.rating, query.rating));
    }
    if (query.status) {
      conditions.push(eq(reviews.status, query.status));
    }

    const rows = await this.db
      .select({
        id: reviews.id,
        branchId: reviews.branchId,
        rating: reviews.rating,
        text: reviews.text,
        authorName: reviews.authorName,
        status: reviews.status,
        reviewedOn: reviews.reviewedOn,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(and(...conditions))
      .orderBy(sql`${reviews.reviewedOn} desc`);

    return rows;
  }

  private async ensurePastReviews(branchIds: string[], from: string, to: string): Promise<void> {
    const today = utcToday();
    const fillTo = to < today ? to : today;
    if (from > fillTo) return;

    const existing = await this.db
      .select({ branchId: reviews.branchId, mockKey: reviews.mockKey })
      .from(reviews)
      .where(
        and(
          inArray(reviews.branchId, branchIds),
          gte(reviews.reviewedOn, new Date(`${from}T00:00:00.000Z`)),
          lte(reviews.reviewedOn, new Date(`${fillTo}T23:59:59.999Z`)),
        ),
      );

    const have = new Set(existing.map((r) => `${r.branchId}:${r.mockKey}`));
    const generated = await this.source.fetchReviews(branchIds, from, fillTo);
    const missing = generated.filter((r) => !have.has(`${r.branchId}:${r.mockKey}`));
    await this.upsert(missing);
  }

  private async upsert(rows: ReviewRow[]): Promise<number> {
    if (rows.length === 0) return 0;

    await this.db
      .insert(reviews)
      .values(
        rows.map((r) => ({
          branchId: r.branchId,
          rating: r.rating,
          text: r.text,
          authorName: r.authorName,
          status: r.status,
          reviewedOn: r.reviewedOn,
          mockKey: r.mockKey,
        })),
      )
      .onConflictDoUpdate({
        target: [reviews.branchId, reviews.mockKey],
        set: {
          rating: sql`excluded.rating`,
          text: sql`excluded.text`,
          authorName: sql`excluded.author_name`,
          status: sql`excluded.status`,
          reviewedOn: sql`excluded.reviewed_on`,
        },
      });

    return rows.length;
  }

  private async resolveBranchIds(actor: AccessTokenPayload, branchId?: string): Promise<string[]> {
    if (branchId) {
      const branch = await this.branches.getForActor(actor, branchId);
      return [branch.id];
    }
    const list = await this.branches.list(actor);
    return list.map((b) => b.id);
  }
}

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultFrom(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 29);
  return d.toISOString().slice(0, 10);
}
