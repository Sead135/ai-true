"use client";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="cabinet-rating-star" aria-hidden>
      <path
        d="m12 3.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 18.4l.9-5.4-3.9-3.8 5.4-.8L12 3.5Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function toneFor(rating: number) {
  if (rating >= 5) return "cabinet-rating--5";
  if (rating >= 4) return "cabinet-rating--4";
  if (rating >= 3) return "cabinet-rating--3";
  if (rating >= 2) return "cabinet-rating--2";
  return "cabinet-rating--1";
}

export function RatingStars({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className={`cabinet-rating ${toneFor(value)}`} aria-label={`Рейтинг ${value} из 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} filled={i < value} />
      ))}
    </span>
  );
}
