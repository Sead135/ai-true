"use client";

import { BarChart } from "./bar-chart";

type Point = { date: string; value: number };

function ExpandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MetricChartCard({
  label,
  value,
  points,
  active,
  onSelect,
  onExpand,
}: {
  label: string;
  value: string;
  points: Point[];
  active?: boolean;
  onSelect?: () => void;
  onExpand?: () => void;
}) {
  const className = [
    "cabinet-metric-chart",
    active ? "cabinet-metric-chart--active" : "",
    onSelect ? "cabinet-metric-chart--clickable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <div className="cabinet-metric-chart-top">
        <p className="cabinet-metric-chart-label">{label}</p>
        <p className="cabinet-metric-chart-value">{value}</p>
      </div>
      <div className="cabinet-metric-chart-frame">
        {points.length === 0 ? (
          <p className="cabinet-empty cabinet-empty--inset text-xs">Нет данных</p>
        ) : (
          <BarChart points={points} className="h-full w-full" />
        )}
      </div>
    </>
  );

  return (
    <div className={className}>
      {onExpand ? (
        <button
          type="button"
          className="cabinet-metric-expand"
          aria-label={`Подробнее: ${label}`}
          onClick={onExpand}
        >
          <ExpandIcon />
        </button>
      ) : null}
      {onSelect ? (
        <button
          type="button"
          className="cabinet-metric-chart-select"
          aria-pressed={active}
          onClick={onSelect}
        >
          {body}
        </button>
      ) : (
        body
      )}
    </div>
  );
}
