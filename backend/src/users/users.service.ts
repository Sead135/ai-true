import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { hash } from "bcrypt";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { AccessTokenPayload } from "../auth/auth.types";
import { DRIZZLE } from "../database/database.module";
import type { createDb } from "../database/db";
import { companies, users } from "../database/schema/index";
import type { ListUsersQueryDto } from "./dto/list-users.query.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import type { UserDto, UsersPageDto } from "./dto/user.dto";

type Db = ReturnType<typeof createDb>["db"];

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async list(query: ListUsersQueryDto): Promise<UsersPageDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const where = this.listWhere(query);

    const [[{ total }], rows] = await Promise.all([
      this.db.select({ total: count() }).from(users).where(where),
      this.db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          avatarUrl: users.avatarUrl,
          role: users.role,
          companyId: users.companyId,
          companyName: companies.name,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(companies, eq(users.companyId, companies.id))
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    return {
      items: rows.map(toDto),
      total: Number(total),
      page,
      limit,
    };
  }

  async getOne(id: string): Promise<UserDto> {
    const [row] = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
        companyId: users.companyId,
        companyName: companies.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(companies, eq(users.companyId, companies.id))
      .where(eq(users.id, id))
      .limit(1);

    if (!row) throw new NotFoundException("User not found");
    return toDto(row);
  }

  async update(actor: AccessTokenPayload, id: string, dto: UpdateUserDto): Promise<UserDto> {
    const existing = await this.db.query.users.findFirst({ where: eq(users.id, id) });
    if (!existing) throw new NotFoundException("User not found");

    if (dto.email && dto.email !== existing.email) {
      const clash = await this.db.query.users.findFirst({ where: eq(users.email, dto.email) });
      if (clash) throw new ConflictException("Email already registered");
    }

    if (dto.companyId) {
      const [company] = await this.db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.id, dto.companyId))
        .limit(1);
      if (!company) throw new NotFoundException("Company not found");
    }

    const role = dto.role ?? existing.role;
    const companyId = dto.companyId !== undefined ? dto.companyId : existing.companyId;
    // admin has no company
    const nextCompanyId = role === "admin" ? null : companyId;

    await this.db
      .update(users)
      .set({
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.name !== undefined ? { name: dto.name?.trim() || null } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl || null } : {}),
        role,
        companyId: nextCompanyId,
        ...(dto.password ? { passwordHash: await hash(dto.password, BCRYPT_ROUNDS) } : {}),
      })
      .where(eq(users.id, id));

    return this.getOne(id);
  }

  async remove(actor: AccessTokenPayload, id: string): Promise<void> {
    if (actor.sub === id) {
      throw new ForbiddenException("Cannot delete yourself");
    }
    const deleted = await this.db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    if (deleted.length === 0) throw new NotFoundException("User not found");
  }

  private listWhere(query: ListUsersQueryDto): SQL | undefined {
    const conditions: SQL[] = [];

    const term = query.q?.trim();
    if (term) {
      const pattern = `%${term}%`;
      conditions.push(or(ilike(users.email, pattern), ilike(users.name, pattern))!);
    }

    if (query.role) {
      conditions.push(eq(users.role, query.role));
    }

    if (query.companyId) {
      conditions.push(eq(users.companyId, query.companyId));
    }

    return conditions.length ? and(...conditions) : undefined;
  }
}

function toDto(row: {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: "admin" | "client";
  companyId: string | null;
  companyName: string | null;
  createdAt: Date;
}): UserDto {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    role: row.role,
    companyId: row.companyId,
    companyName: row.companyName,
    createdAt: row.createdAt,
  };
}
