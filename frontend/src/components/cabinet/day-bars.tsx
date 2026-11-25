"use client";

type Point = { date: string; value: number };

function formatDay(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
}

export function DayBars({
  title,
  points,
  formatValue = (n) => n.toLocaleString("ru-RU"),
}: {
  title: string;
  points: Point[];
  formatValue?: (n: number) => string;
}) {
  const recent = points.slice(-14);
  const max = Math.max(...recent.map((p) => p.value), 1);

  return (
    <section className="cabinet-panel">
      <div className="cabinet-panel-head">
        <div className="min-w-0">
          <h2 className="cabinet-panel-title">{title}</h2>
          <p className="cabinet-panel-meta">Последние {recent.length} дней периода</p>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="cabinet-empty">Нет данных за период</p>
      ) : (
        <ul className="cabinet-day-bars">
          {recent.map((p) => (
            <li key={p.date} className="cabinet-day-bar">
              <span className="cabinet-day-bar-label">{formatDay(p.date)}</span>
              <span className="cabinet-day-bar-track" aria-hidden>
                <span
                  className="cabinet-day-bar-fill"
                  style={{ width: `${Math.max((p.value / max) * 100, p.value > 0 ? 4 : 0)}%` }}
                />
              </span>
              <span className="cabinet-day-bar-value">{formatValue(p.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
