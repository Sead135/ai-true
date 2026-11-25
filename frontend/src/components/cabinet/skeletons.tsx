import type { CSSProperties } from "react";

export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span className={`cabinet-skeleton ${className}`.trim()} style={style} aria-hidden />;
}

export function ListCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="cabinet-list" aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="cabinet-list-card flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </li>
      ))}
    </ul>
  );
}

export function MetricsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`cabinet-metrics${count === 6 ? " cabinet-metrics--6" : ""}`} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="cabinet-metric">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-3 h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  const heights = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 48, 68];
  return (
    <div
      className="flex h-full min-h-[14rem] items-end gap-2 px-2 py-4"
      aria-busy="true"
      aria-label="Загрузка графика"
    >
      {heights.map((h, i) => (
        <Skeleton key={i} className="min-w-0 flex-1 rounded-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="flex max-w-md flex-col gap-4" aria-busy="true" aria-label="Загрузка">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <Skeleton className="mt-2 h-11 w-full rounded-[15px]" />
      <Skeleton className="h-11 w-full rounded-[15px]" />
      <Skeleton className="h-11 w-full rounded-[15px]" />
    </div>
  );
}
