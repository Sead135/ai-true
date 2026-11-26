import { NotFoundException } from "@nestjs/common";
import { and, eq, isNull } from "drizzle-orm";
import type { createDb } from "./db.js";
import { users } from "./schema/index.js";

type Db = ReturnType<typeof createDb>["db"];

export async function requireUser(db: Db, userId: string) {
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, userId), isNull(users.deletedAt)),
  });
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
}
