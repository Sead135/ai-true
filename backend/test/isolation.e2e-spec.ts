import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import type { App } from "supertest/types";
import { AppModule } from "../src/app.module.js";

/** Stable IDs from `src/database/seed.ts`. */
const COMPANY_A = "11111111-1111-4111-8111-111111111111";
const COMPANY_B = "22222222-2222-4222-8222-222222222222";
const BRANCH_A1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const BRANCH_B1 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1";

const CLIENT = { email: "client@severny.local", password: "password123" };

type BranchSummary = {
  id: string;
  companyId: string;
};

describe("Company data isolation (e2e)", () => {
  let app: INestApplication<App>;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    agent = request.agent(app.getHttpServer());
    await agent.post("/auth/login").send(CLIENT).expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  it("client lists only own company and its branches", async () => {
    const companies = await agent.get("/companies").expect(200);
    expect(companies.body.items).toHaveLength(1);
    expect(companies.body.items[0].id).toBe(COMPANY_A);

    const branches = await agent.get("/branches").expect(200);
    const onlyOwnCompany = (b: BranchSummary) => {
      return b.companyId === COMPANY_A;
    };
    expect(branches.body.items.every(onlyOwnCompany)).toBe(true);
    expect(branches.body.items.some((b: BranchSummary) => b.id === BRANCH_B1)).toBe(false);
  });

  it("client cannot read another company's company/branch/stats", async () => {
    await agent.get(`/companies/${COMPANY_A}`).expect(200);
    await agent.get(`/companies/${COMPANY_B}`).expect(403);

    await agent.get(`/branches/${BRANCH_A1}`).expect(200);
    await agent.get(`/branches/${BRANCH_B1}`).expect(403);

    await agent
      .get("/stats")
      .query({ from: "2020-01-01", to: "2030-01-01", branchId: BRANCH_B1 })
      .expect(403);
  });
});
