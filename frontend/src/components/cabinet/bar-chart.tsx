"use client";

import { useId, useState } from "react";

type Point = { date: string; value: number };

function formatLabel(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
}

function formatValue(n: number) {
  return Number.isInteger(n)
    ? n.toLocaleString("ru-RU")
    : n.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

function labelStep(count: number) {
  if (count <= 8) {
    return 1;
  }
  if (count <= 16) {
    return 2;
  }
  if (count <= 31) {
    return 3;
  }
  return Math.ceil(count / 10);
}

type BarChartProps = {
  points: Point[];
  className?: string;
  showLabels?: boolean;
  interactive?: boolean;
};

export function BarChart({
  points,
  className = "h-full w-full",
  showLabels = false,
  interactive = false,
}: BarChartProps) {
  const tipId = useId();
  const [hover, setHover] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);

  if (points.length === 0) {
    return (
      <div className={`flex items-center justify-center text-sm text-foreground/45 ${className}`}>
        Нет данных за период
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const w = 640;
  const labelPad = showLabels ? 28 : 0;
  const h = 200 + labelPad;
  const padX = showLabels ? 12 : 8;
  const padTop = 12;
  const padBottom = showLabels ? 28 : 10;
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBottom;
  let gap = 3.5;
  if (points.length > 40) {
    gap = 1;
  } else if (points.length > 20) {
    gap = 2;
  }
  const barW = Math.max((innerW - gap * (points.length - 1)) / points.length, 1.5);
  const step = labelStep(points.length);
  const active = hover ? points[hover.index] : null;

  return (
    <div className={`cabinet-bar-chart-wrap ${className}`}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="cabinet-bar-chart h-full w-full"
        role="img"
        aria-label="Столбчатый график"
        onMouseLeave={() => setHover(null)}
      >
        {points.map((p, i) => {
          const barH = Math.max((p.value / max) * innerH, p.value > 0 ? 2 : 0);
          const x = padX + i * (barW + gap);
          const y = padTop + innerH - barH;
          const isActive = hover?.index === i;
          return (
            <g key={p.date}>
              {interactive ? (
                <rect
                  x={x}
                  y={padTop}
                  width={barW}
                  height={innerH}
                  className="cabinet-bar-chart-hit"
                  onMouseEnter={() => setHover({ index: i, x: x + barW / 2, y: y })}
                  onMouseMove={() => setHover({ index: i, x: x + barW / 2, y: y })}
                />
              ) : null}
              <rect
                className={`cabinet-bar-chart-bar${isActive ? " cabinet-bar-chart-bar--active" : ""}`}
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx="1.5"
                pointerEvents="none"
              />
              {showLabels && i % step === 0 ? (
                <text
                  x={x + barW / 2}
                  y={h - 8}
                  textAnchor="middle"
                  className="cabinet-bar-chart-label"
                >
                  {formatLabel(p.date)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {interactive && active && hover ? (
        <div
          id={tipId}
          className="cabinet-bar-tooltip"
          style={{
            left: `${(hover.x / w) * 100}%`,
            top: `${(hover.y / h) * 100}%`,
          }}
        >
          <span className="cabinet-bar-tooltip-date">{formatLabel(active.date)}</span>
          <span className="cabinet-bar-tooltip-value">{formatValue(active.value)}</span>
        </div>
      ) : null}
    </div>
  );
}
