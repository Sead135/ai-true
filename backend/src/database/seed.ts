import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { hash } from "bcrypt";
import { sql } from "drizzle-orm";
import { createDb } from "./db";
import { branches, companies, users } from "./schema/index";

for (const name of [".env", "../.env"] as const) {
  const path = resolve(process.cwd(), name);
  if (existsSync(path)) loadEnvFile(path);
}

const COMPANY_A = "11111111-1111-1111-1111-111111111111";
const COMPANY_B = "22222222-2222-2222-2222-222222222222";
const BRANCH_A1 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";
const BRANCH_A2 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2";
const BRANCH_B1 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1";
const ADMIN_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const CLIENT_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc";

const PASSWORD = "password123";

async function seed() {
  const { db, pool } = createDb();

  try {
    await db.execute(sql`TRUNCATE TABLE users, branches, companies CASCADE`);

    await db.insert(companies).values([
      {
        id: COMPANY_A,
        name: "Северный Вкус",
        address: "ул. Тверская, 12",
        city: "Москва",
        phone: "+7 (495) 111-22-33",
        description: "Сеть кафе русской кухни",
        website: "https://severny-vkus.example",
        email: "hello@severny-vkus.example",
      },
      {
        id: COMPANY_B,
        name: "ЛайтКлиник",
        address: "Невский пр., 48",
        city: "Санкт-Петербург",
        phone: "+7 (812) 444-55-66",
        description: "Медицинские клиники семейной практики",
        website: "https://lightclinic.example",
        email: "info@lightclinic.example",
      },
    ]);

    await db.insert(branches).values([
      {
        id: BRANCH_A1,
        companyId: COMPANY_A,
        name: "Северный Вкус — Тверская",
        address: "ул. Тверская, 12",
        city: "Москва",
        phone: "+7 (495) 111-22-34",
        website: "https://severny-vkus.example/tverskaya",
        email: "tverskaya@severny-vkus.example",
        businessCategory: "Кафе",
      },
      {
        id: BRANCH_A2,
        companyId: COMPANY_A,
        name: "Северный Вкус — Арбат",
        address: "ул. Арбат, 25",
        city: "Москва",
        phone: "+7 (495) 111-22-35",
        website: "https://severny-vkus.example/arbat",
        email: "arbat@severny-vkus.example",
        businessCategory: "Кафе",
      },
      {
        id: BRANCH_B1,
        companyId: COMPANY_B,
        name: "ЛайтКлиник — Невский",
        address: "Невский пр., 48",
        city: "Санкт-Петербург",
        phone: "+7 (812) 444-55-67",
        website: "https://lightclinic.example/nevsky",
        email: "nevsky@lightclinic.example",
        businessCategory: "Медицина",
      },
    ]);

    const passwordHash = await hash(PASSWORD, 10);

    await db.insert(users).values([
      {
        id: ADMIN_ID,
        email: "admin@ii.local",
        passwordHash,
        role: "admin",
        companyId: null,
      },
      {
        id: CLIENT_ID,
        email: "client@severny.local",
        passwordHash,
        role: "client",
        companyId: COMPANY_A,
      },
    ]);

    console.log("Seed OK");
    console.log("  admin@ii.local / password123  (admin)");
    console.log("  client@severny.local / password123  (client → Северный Вкус)");
    console.log("  companies: 2 · branches: 3");
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
