/** UTC calendar day YYYY-MM-DD */
export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export type PeriodPreset = "day" | "week" | "month" | "custom";

export function rangeForPreset(preset: Exclude<PeriodPreset, "custom">, end = utcToday()) {
  if (preset === "day") {
    return { from: end, to: end };
  }
  if (preset === "week") {
    return { from: addDays(end, -6), to: end };
  }
  return { from: addDays(end, -29), to: end };
}
