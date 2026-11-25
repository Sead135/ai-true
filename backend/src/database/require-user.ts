import { NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { createDb } from "./db.js";
import { users } from "./schema/index.js";

type Db = ReturnType<typeof createDb>["db"];

export async function requireUser(db: Db, userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
}
