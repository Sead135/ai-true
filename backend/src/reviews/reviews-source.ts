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

export interface ReviewsSource {
  /** Generate reviews for branches over inclusive YYYY-MM-DD range. */
  fetchReviews(branchIds: string[], from: string, to: string): Promise<ReviewRow[]>;
}

export const REVIEWS_SOURCE = Symbol("REVIEWS_SOURCE");
