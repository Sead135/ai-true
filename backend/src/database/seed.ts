import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { hash } from "bcrypt";
import { sql } from "drizzle-orm";
import { MockReviewsSource } from "../reviews/mock-reviews-source";
import { MockStatsSource } from "../stats/mock-stats-source";
import { createDb } from "./db";
import { branches, companies, dailyMetrics, reviews, users } from "./schema/index";

for (const name of [".env", "../.env"] as const) {
  const path = resolve(process.cwd(), name);
  if (existsSync(path)) loadEnvFile(path);
}

const COMPANY_A = "11111111-1111-4111-8111-111111111111";
const COMPANY_B = "22222222-2222-4222-8222-222222222222";
const BRANCH_A1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const BRANCH_A2 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
const BRANCH_B1 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1";
const ADMIN_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CLIENT_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const PASSWORD = "password123";
const METRICS_DAYS = 30;

function isoDateUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function seed() {
  const { db, pool } = createDb();

  try {
    await db.execute(
      sql`TRUNCATE TABLE reviews, daily_metrics, users, branches, companies CASCADE`,
    );

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
        name: "Администратор ИИ",
        role: "admin",
        companyId: null,
      },
      {
        id: CLIENT_ID,
        email: "client@severny.local",
        passwordHash,
        name: "Анна Северная",
        role: "client",
        companyId: COMPANY_A,
      },
    ]);

    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - (METRICS_DAYS - 1));
    const fromStr = isoDateUTC(from);
    const toStr = isoDateUTC(to);

    const branchIds = [BRANCH_A1, BRANCH_A2, BRANCH_B1];

    const reviewRows = await new MockReviewsSource().fetchReviews(branchIds, fromStr, toStr);
    await db.insert(reviews).values(
      reviewRows.map((r) => ({
        branchId: r.branchId,
        rating: r.rating,
        text: r.text,
        authorName: r.authorName,
        status: r.status,
        reviewedOn: r.reviewedOn,
        mockKey: r.mockKey,
      })),
    );

    // metrics.reviewsCount/avgRating derived from the same mockReviewsForDay
    const rows = await new MockStatsSource().fetchDaily(branchIds, fromStr, toStr);
    await db.insert(dailyMetrics).values(
      rows.map((r) => ({
        branchId: r.branchId,
        date: r.date,
        views: r.views,
        websiteClicks: r.websiteClicks,
        calls: r.calls,
        routes: r.routes,
        avgRating: r.avgRating.toFixed(1),
        reviewsCount: r.reviewsCount,
      })),
    );

    console.log("Seed OK");
    console.log("  admin@ii.local / password123  (admin)");
    console.log("  client@severny.local / password123  (client → Северный Вкус)");
    console.log(
      `  companies: 2 · branches: 3 · daily_metrics: ${rows.length} · reviews: ${reviewRows.length} (${fromStr}…${toStr})`,
    );
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
