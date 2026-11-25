import { Injectable } from "@nestjs/common";
import { eachDate, type BranchDateRange } from "../common/dates.js";
import { between, hash } from "../common/mock-hash.js";
import type { ReviewRow, ReviewStatus } from "./reviews-source.js";

const AUTHORS = [
  "Анна К.",
  "Игорь П.",
  "Мария С.",
  "Дмитрий В.",
  "Елена Н.",
  "Сергей Л.",
  "Ольга М.",
  "Павел Р.",
];

const TEXTS = [
  "Отличное место, всё быстро и вежливо.",
  "Хороший сервис, но пришлось немного подождать.",
  "Не оправдало ожидания, качество среднее.",
  "Вернёмся ещё — очень понравилось.",
  "Удобная локация, чисто и комфортно.",
  "Персонал внимательный, рекомендую.",
  "Цена/качество нормальные для района.",
  "Были проблемы с записью, в остальном ок.",
];

export function mockReviewsForDay(branchId: string, date: string): ReviewRow[] {
  const dayHash = hash(`${branchId}:${date}:reviews`);
  const count = between({ h: dayHash, min: 0, max: 3 });
  const rows: ReviewRow[] = [];

  for (let i = 0; i < count; i++) {
    const h = hash(`${branchId}:${date}:${i}`);
    const rating = between({ h, min: 1, max: 5 });
    const statusRoll = between({ h: h >>> 4, min: 0, max: 1 });
    const status: ReviewStatus = statusRoll === 0 ? "new" : "processed";
    const hour = between({ h: h >>> 8, min: 8, max: 21 });
    const minute = between({ h: h >>> 12, min: 0, max: 59 });

    rows.push({
      branchId,
      rating,
      text: TEXTS[between({ h: h >>> 16, min: 0, max: TEXTS.length - 1 })]!,
      authorName: AUTHORS[between({ h: h >>> 20, min: 0, max: AUTHORS.length - 1 })]!,
      status,
      reviewedOn: new Date(
        `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`,
      ),
      mockKey: `${date}:${i}`,
    });
  }

  return rows;
}

@Injectable()
export class MockReviewsSource {
  async fetchReviews(range: BranchDateRange): Promise<ReviewRow[]> {
    const { branchIds, from, to } = range;
    const dates = eachDate(from, to);
    const rows: ReviewRow[] = [];
    for (const branchId of branchIds) {
      for (const date of dates) {
        rows.push(...mockReviewsForDay(branchId, date));
      }
    }
    return rows;
  }
}
