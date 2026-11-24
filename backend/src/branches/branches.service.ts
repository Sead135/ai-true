import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { AccessTokenPayload } from "../auth/auth.types";
import { CompaniesService } from "../companies/companies.service";
import { DRIZZLE } from "../database/database.module";
import type { createDb } from "../database/db";
import { branches, users, type Branch } from "../database/schema/index";
import type { CreateBranchDto } from "./dto/create-branch.dto";

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

    const user = await this.requireUser(actor.sub);
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
        address: dto.address,
        city: dto.city,
        phone: dto.phone,
        logoUrl: dto.logoUrl ?? null,
        website: dto.website,
        email: dto.email,
        businessCategory: dto.businessCategory,
        isActive: dto.isActive ?? true,
      })
      .returning();

    return branch;
  }

  async list(actor: AccessTokenPayload): Promise<Branch[]> {
    if (actor.role === "admin") {
      return this.db.select().from(branches);
    }

    const user = await this.requireUser(actor.sub);
    if (!user.companyId) {
      return [];
    }

    return this.db.select().from(branches).where(eq(branches.companyId, user.companyId));
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
