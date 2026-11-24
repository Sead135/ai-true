import { Injectable } from "@nestjs/common";
import type { ReviewRow, ReviewsSource, ReviewStatus } from "./reviews-source";

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

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function between(h: number, min: number, max: number): number {
  return min + (h % (max - min + 1));
}

function eachDate(from: string, to: string): string[] {
  const out: string[] = [];
  const cur = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export function mockReviewsForDay(branchId: string, date: string): ReviewRow[] {
  const dayHash = hash(`${branchId}:${date}:reviews`);
  const count = between(dayHash, 0, 3);
  const rows: ReviewRow[] = [];

  for (let i = 0; i < count; i++) {
    const h = hash(`${branchId}:${date}:${i}`);
    const rating = between(h, 1, 5);
    const status: ReviewStatus = between(h >>> 4, 0, 1) === 0 ? "new" : "processed";
    const hour = between(h >>> 8, 8, 21);
    const minute = between(h >>> 12, 0, 59);

    rows.push({
      branchId,
      rating,
      text: TEXTS[between(h >>> 16, 0, TEXTS.length - 1)]!,
      authorName: AUTHORS[between(h >>> 20, 0, AUTHORS.length - 1)]!,
      status,
      reviewedOn: new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`),
      mockKey: `${date}:${i}`,
    });
  }

  return rows;
}

@Injectable()
export class MockReviewsSource implements ReviewsSource {
  async fetchReviews(branchIds: string[], from: string, to: string): Promise<ReviewRow[]> {
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
