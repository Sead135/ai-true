import { and, eq, isNull } from "drizzle-orm";
import type { createDb } from "./db.js";
import { branches, companies, users } from "./schema/index.js";

type Db = ReturnType<typeof createDb>["db"];
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

async function softDeleteCompanyTree(db: Db | Tx, companyId: string, at: Date) {
  await db
    .update(branches)
    .set({ deletedAt: at })
    .where(and(eq(branches.companyId, companyId), isNull(branches.deletedAt)));
  await db
    .update(companies)
    .set({ deletedAt: at })
    .where(and(eq(companies.id, companyId), isNull(companies.deletedAt)));
  await db.update(users).set({ companyId: null }).where(eq(users.companyId, companyId));
}

export async function softDeleteBranch(db: Db, branchId: string) {
  await db
    .update(branches)
    .set({ deletedAt: new Date() })
    .where(and(eq(branches.id, branchId), isNull(branches.deletedAt)));
}

export async function softDeleteCompanyCascade(db: Db, companyId: string) {
  await db.transaction(async (tx) => {
    await softDeleteCompanyTree(tx, companyId, new Date());
  });
}

export async function softDeleteUser(db: Db, userId: string): Promise<boolean> {
  const [user] = await db
    .select({ id: users.id, companyId: users.companyId })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);
  if (!user) {
    return false;
  }

  const at = new Date();
  await db.transaction(async (tx) => {
    if (user.companyId) {
      await softDeleteCompanyTree(tx, user.companyId, at);
    }
    await tx
      .update(users)
      .set({
        deletedAt: at,
        email: `deleted+${user.id}@deleted.local`,
        companyId: null,
      })
      .where(eq(users.id, user.id));
  });
  return true;
}
