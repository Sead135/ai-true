import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { AccessTokenPayload } from "../auth/auth.types";
import { CompaniesService } from "../companies/companies.service";
import { DRIZZLE } from "../database/database.module";
import type { createDb } from "../database/db";
import { requireUser } from "../database/require-user";
import { branches, type Branch } from "../database/schema/index";
import type { BranchesPageDto } from "./dto/branch.dto";
import type { CreateBranchDto } from "./dto/create-branch.dto";
import type { ListBranchesQueryDto } from "./dto/list-branches.query.dto";
import type { UpdateBranchDto } from "./dto/update-branch.dto";

type Db = ReturnType<typeof createDb>["db"];

@Injectable()
export class BranchesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Db,
    private readonly companies: CompaniesService,
  ) {}

  async create(actor: AccessTokenPayload, dto: CreateBranchDto): Promise<Branch> {
    if (actor.role !== "client") {
      throw new ForbiddenException("Only clients can create branches");
    }

    const user = await requireUser(this.db, actor.sub);
    if (!user.companyId) {
      throw new BadRequestException("Create a company before adding branches");
    }
    if (user.companyId !== dto.companyId) {
      throw new ForbiddenException("Branch company is outside your scope");
    }

    await this.companies.getForActor(actor, dto.companyId);

    const [branch] = await this.db
      .insert(branches)
      .values({
        companyId: dto.companyId,
        name: dto.name,
        address: dto.address ?? "",
        city: dto.city ?? "",
        phone: dto.phone ?? "",
        logoUrl: dto.logoUrl ?? null,
        website: dto.website ?? "",
        email: dto.email ?? "",
        businessCategory: dto.businessCategory ?? "",
        isActive: dto.isActive ?? true,
      })
      .returning();

    return branch;
  }

  async list(
    actor: AccessTokenPayload,
    query: ListBranchesQueryDto = {},
  ): Promise<BranchesPageDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (actor.role !== "admin") {
      const user = await requireUser(this.db, actor.sub);
      if (!user.companyId) {
        return { items: [], total: 0, page, limit };
      }
      conditions.push(eq(branches.companyId, user.companyId));
    } else if (query.companyId) {
      conditions.push(eq(branches.companyId, query.companyId));
    }

    const term = query.q?.trim();
    if (term) {
      const pattern = `%${term}%`;
      conditions.push(
        or(
          ilike(branches.name, pattern),
          ilike(branches.city, pattern),
          ilike(branches.address, pattern),
        )!,
      );
    }

    const city = query.city?.trim();
    if (city) {
      conditions.push(ilike(branches.city, city));
    }

    if (query.status === "active") {
      conditions.push(eq(branches.isActive, true));
    } else if (query.status === "inactive") {
      conditions.push(eq(branches.isActive, false));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const [[{ total }], items] = await Promise.all([
      this.db.select({ total: count() }).from(branches).where(where),
      this.db
        .select()
        .from(branches)
        .where(where)
        .orderBy(desc(branches.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    return { items, total: Number(total), page, limit };
  }

  async update(actor: AccessTokenPayload, branchId: string, dto: UpdateBranchDto): Promise<Branch> {
    await this.getForActor(actor, branchId);

    const [branch] = await this.db
      .update(branches)
      .set({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl ?? null } : {}),
        ...(dto.website !== undefined ? { website: dto.website } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.businessCategory !== undefined ? { businessCategory: dto.businessCategory } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      })
      .where(eq(branches.id, branchId))
      .returning();

    if (!branch) {
      throw new NotFoundException("Branch not found");
    }
    return branch;
  }

  async getForActor(actor: AccessTokenPayload, branchId: string): Promise<Branch> {
    const [branch] = await this.db
      .select()
      .from(branches)
      .where(eq(branches.id, branchId))
      .limit(1);

    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    if (actor.role === "admin") {
      return branch;
    }

    const user = await requireUser(this.db, actor.sub);
    if (!user.companyId || user.companyId !== branch.companyId) {
      throw new ForbiddenException("Branch is outside your scope");
    }

    return branch;
  }

  /** Resolve one branch (scoped) or all branches visible to actor. */
  async idsForActor(actor: AccessTokenPayload, branchId?: string): Promise<string[]> {
    if (branchId) {
      const branch = await this.getForActor(actor, branchId);
      return [branch.id];
    }

    if (actor.role === "admin") {
      const rows = await this.db.select({ id: branches.id }).from(branches);
      return rows.map((r) => r.id);
    }

    const user = await requireUser(this.db, actor.sub);
    if (!user.companyId) {
      return [];
    }
    const rows = await this.db
      .select({ id: branches.id })
      .from(branches)
      .where(eq(branches.companyId, user.companyId));
    return rows.map((r) => r.id);
  }
}
