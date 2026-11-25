"use client";

import { useRef, useState } from "react";
import { type PeriodPreset, rangeForPreset } from "@/lib/dates";
import { DateRangeFilter } from "./date-range-filter";

const PRESETS = [
  ["day", "День"],
  ["week", "Неделя"],
  ["month", "Месяц"],
] as const;

type Props = {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
  className?: string;
  defaultPreset?: Exclude<PeriodPreset, "custom">;
};

export function PeriodFilter({ from, to, onChange, className, defaultPreset = "month" }: Props) {
  const [preset, setPreset] = useState<PeriodPreset>(defaultPreset);
  const lastPreset = useRef<Exclude<PeriodPreset, "custom">>(defaultPreset);
  const custom = preset === "custom";

  function applyPreset(next: Exclude<PeriodPreset, "custom">) {
    lastPreset.current = next;
    setPreset(next);
    onChange(rangeForPreset(next));
  }

  function openCustom() {
    setPreset("custom");
  }

  function leaveCustom() {
    applyPreset(lastPreset.current);
  }

  return (
    <div
      className={`period-filter${custom ? " period-filter--custom" : ""}${className ? ` ${className}` : ""}`}
    >
      <div className="period-filter-presets" aria-hidden={custom}>
        {PRESETS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            tabIndex={custom ? -1 : 0}
            className={`period-filter-chip${preset === key ? " period-filter-chip--active" : ""}`}
            onClick={() => applyPreset(key)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          tabIndex={custom ? -1 : 0}
          className="period-filter-chip"
          onClick={openCustom}
        >
          Произвольный
        </button>
      </div>

      <div className="period-filter-custom-row" aria-hidden={!custom}>
        <button
          type="button"
          tabIndex={custom ? 0 : -1}
          className="period-filter-chip period-filter-more"
          aria-label="Показать пресеты периода"
          onClick={leaveCustom}
        >
          …
        </button>
        <div className="period-filter-custom">
          <DateRangeFilter className="w-full min-w-0" from={from} to={to} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
