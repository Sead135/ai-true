export type ReviewStatus = "new" | "processed";

export type ReviewRow = {
  branchId: string;
  rating: number;
  text: string;
  authorName: string;
  status: ReviewStatus;
  reviewedOn: Date;
  mockKey: string;
};
