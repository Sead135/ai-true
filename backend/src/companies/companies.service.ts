import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { AccessTokenPayload } from "../auth/auth.types";
import { DRIZZLE } from "../database/database.module";
import type { createDb } from "../database/db";
import { companies, users, type Company } from "../database/schema/index";
import type { CreateCompanyDto } from "./dto/create-company.dto";

type Db = ReturnType<typeof createDb>["db"];

@Injectable()
export class CompaniesService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async create(actor: AccessTokenPayload, dto: CreateCompanyDto): Promise<Company> {
    const user = await this.requireUser(actor.sub);
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
          address: dto.address,
          city: dto.city,
          phone: dto.phone,
          description: dto.description,
          logoUrl: dto.logoUrl ?? null,
          website: dto.website,
          email: dto.email,
        })
        .returning();

      await tx.update(users).set({ companyId: company.id }).where(eq(users.id, user.id));
      return company;
    });
  }

  async list(actor: AccessTokenPayload): Promise<Company[]> {
    if (actor.role === "admin") {
      return this.db.select().from(companies);
    }

    const user = await this.requireUser(actor.sub);
    if (!user.companyId) {
      return [];
    }

    return this.db.select().from(companies).where(eq(companies.id, user.companyId));
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

    const user = await this.requireUser(actor.sub);
    if (user.companyId !== company.id) {
      throw new ForbiddenException("Company is outside your scope");
    }
    return company;
  }

  private async requireUser(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
