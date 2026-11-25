import type { ListBranchesParams } from "./branches";
import type { ListCompaniesParams } from "./companies";
import type { ListReviewsParams } from "./reviews";
import type { ListUsersParams } from "./users";

export const qk = {
  companies: {
    all: ["companies"] as const,
    list: (p: ListCompaniesParams) => ["companies", "list", p] as const,
    options: ["companies", "options"] as const,
    mine: ["companies", "mine"] as const,
  },
  branches: {
    all: ["branches"] as const,
    list: (p: ListBranchesParams) => ["branches", "list", p] as const,
    options: ["branches", "options"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (p: ListUsersParams) => ["users", "list", p] as const,
  },
  reviews: {
    list: (p: ListReviewsParams) => ["reviews", "list", p] as const,
  },
  stats: {
    all: ["stats"] as const,
    client: (p: { from: string; to: string; branchId?: string }) => ["stats", "client", p] as const,
    adminSummary: ["stats", "admin", "summary"] as const,
    adminSeries: (p: { metric: string; from: string; to: string }) =>
      ["stats", "admin", "series", p] as const,
  },
};
