"use client";

type Point = { date: string; value: number };

export function LineChart({
  points,
  className = "h-48 w-full",
}: {
  points: Point[];
  className?: string;
}) {
  if (points.length === 0) {
    return (
      <div className={`flex items-center justify-center text-sm text-foreground/45 ${className}`}>
        Нет данных за период
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const w = 640;
  const h = 200;
  const pad = 12;

  const coords = points.map((p, i) => {
    const x = pad + (i / Math.max(points.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((p.value - min) / span) * (h - pad * 2);
    return { x, y, ...p };
  });

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const area = `${path} L${coords[coords.length - 1].x},${h - pad} L${coords[0].x},${h - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`cabinet-line-chart ${className}`}
      role="img"
      aria-label="График"
    >
      <path d={area} className="cabinet-line-chart-area" />
      <path
        d={path}
        className="cabinet-line-chart-line"
        fill="none"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {coords.length <= 45
        ? coords.map((c) => (
            <circle key={c.date} className="cabinet-line-chart-dot" cx={c.x} cy={c.y} r="2.5" />
          ))
        : null}
    </svg>
  );
}
