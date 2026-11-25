import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { AccessTokenPayload } from "../auth/auth.types";
import { DRIZZLE } from "../database/database.module";
import type { createDb } from "../database/db";
import { requireUser } from "../database/require-user";
import { companies, users, type Company } from "../database/schema/index";
import type { CompaniesPageDto } from "./dto/company.dto";
import type { CreateCompanyDto } from "./dto/create-company.dto";
import type { ListCompaniesQueryDto } from "./dto/list-companies.query.dto";
import type { UpdateCompanyDto } from "./dto/update-company.dto";

type Db = ReturnType<typeof createDb>["db"];

@Injectable()
export class CompaniesService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async create(actor: AccessTokenPayload, dto: CreateCompanyDto): Promise<Company> {
    const user = await requireUser(this.db, actor.sub);
    if (user.role !== "client") {
      throw new ForbiddenException("Only clients can create companies");
    }
    if (user.companyId) {
      throw new ConflictException("Client already has a company");
    }

    return this.db.transaction(async (tx) => {
      const [company] = await tx
        .insert(companies)
        .values({
          name: dto.name,
          address: dto.address ?? "",
          city: dto.city ?? "",
          phone: dto.phone ?? "",
          description: dto.description ?? "",
          logoUrl: dto.logoUrl ?? null,
          website: dto.website ?? "",
          email: dto.email ?? "",
        })
        .returning();

      await tx.update(users).set({ companyId: company.id }).where(eq(users.id, user.id));
      return company;
    });
  }

  async list(
    actor: AccessTokenPayload,
    query: ListCompaniesQueryDto = {},
  ): Promise<CompaniesPageDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (actor.role !== "admin") {
      const user = await requireUser(this.db, actor.sub);
      if (!user.companyId) {
        return { items: [], total: 0, page, limit };
      }
      conditions.push(eq(companies.id, user.companyId));
    }

    const term = query.q?.trim();
    if (term) {
      const pattern = `%${term}%`;
      conditions.push(
        or(
          ilike(companies.name, pattern),
          ilike(companies.city, pattern),
          ilike(companies.email, pattern),
        )!,
      );
    }

    const city = query.city?.trim();
    if (city) {
      conditions.push(ilike(companies.city, city));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const [[{ total }], items] = await Promise.all([
      this.db.select({ total: count() }).from(companies).where(where),
      this.db
        .select()
        .from(companies)
        .where(where)
        .orderBy(desc(companies.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    return { items, total: Number(total), page, limit };
  }

  async getForActor(actor: AccessTokenPayload, companyId: string): Promise<Company> {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    if (actor.role === "admin") {
      return company;
    }

    const user = await requireUser(this.db, actor.sub);
    if (user.companyId !== company.id) {
      throw new ForbiddenException("Company is outside your scope");
    }
    return company;
  }

  async update(
    actor: AccessTokenPayload,
    companyId: string,
    dto: UpdateCompanyDto,
  ): Promise<Company> {
    await this.getForActor(actor, companyId);

    const patch = Object.fromEntries(
      Object.entries({
        ...dto,
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl || null } : {}),
      }).filter(([, v]) => v !== undefined),
    );

    const [updated] = await this.db
      .update(companies)
      .set(patch)
      .where(eq(companies.id, companyId))
      .returning();

    if (!updated) {
      throw new NotFoundException("Company not found");
    }
    return updated;
  }
}
