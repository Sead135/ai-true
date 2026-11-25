"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { rangeForPreset } from "@/lib/dates";
import {
  type AdminMetric,
  type AdminSeriesPoint,
  fetchAdminSeries,
  fetchAdminSummary,
  type AdminSummary,
} from "@/lib/stats";
import { toast } from "@heroui/react";
import { DayBars } from "./day-bars";
import { MetricChartCard } from "./metric-chart-card";
import { MetricChartModal } from "./metric-chart-modal";
import { PeriodFilter } from "./period-filter";
import { MetricsSkeleton } from "./skeletons";

const LABELS: Record<AdminMetric, string> = {
  companies: "Компании",
  branches: "Филиалы",
  views: "Просмотры",
  users: "Пользователи",
  reviews: "Отзывы",
};

const ORDER = Object.keys(LABELS) as AdminMetric[];

export function AdminDashboard() {
  const month = useMemo(() => rangeForPreset("month"), []);
  const [from, setFrom] = useState(month.from);
  const [to, setTo] = useState(month.to);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [seriesMap, setSeriesMap] = useState<Partial<Record<AdminMetric, AdminSeriesPoint[]>>>({});
  const [chartMetric, setChartMetric] = useState<AdminMetric>("views");
  const [modalMetric, setModalMetric] = useState<AdminMetric | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminSummary()
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
        }
      })
      .catch((err: { message?: string }) => {
        if (!cancelled) {
          toast.danger(err.message ?? "Ошибка загрузки");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSeriesMap({});
    Promise.all(
      ORDER.map(async (metric) => {
        const res = await fetchAdminSeries({ metric, from, to });
        return [metric, res.series] as const;
      }),
    )
      .then((entries) => {
        if (cancelled) {
          return;
        }
        setSeriesMap(Object.fromEntries(entries));
      })
      .catch((err: { message?: string }) => {
        if (!cancelled) {
          toast.danger(err.message ?? "Ошибка графиков");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const loadModal = useCallback(
    async (rangeFrom: string, rangeTo: string) => {
      if (!modalMetric) {
        return [];
      }
      const res = await fetchAdminSeries({
        metric: modalMetric,
        from: rangeFrom,
        to: rangeTo,
      });
      return res.series;
    },
    [modalMetric],
  );

  const mainSeries = seriesMap[chartMetric] ?? null;
  const ready = summary !== null && ORDER.every((key) => seriesMap[key] !== undefined);

  return (
    <div className="cabinet-dashboard">
      <div className="cabinet-page-head">
        <div className="cabinet-page-head-row">
          <div className="min-w-0">
            <h1>Платформа</h1>
            <p>Сводка по системе: компании, филиалы, просмотры, пользователи и отзывы</p>
          </div>
          <div className="cabinet-page-filters">
            <PeriodFilter
              from={from}
              to={to}
              onChange={({ from: nextFrom, to: nextTo }) => {
                setFrom(nextFrom);
                setTo(nextTo);
              }}
            />
          </div>
        </div>
      </div>

      {!ready ? (
        <MetricsSkeleton count={5} />
      ) : (
        <div className="cabinet-metric-charts">
          {ORDER.map((key) => (
            <MetricChartCard
              key={key}
              label={LABELS[key]}
              value={summary![key].toLocaleString("ru-RU")}
              points={seriesMap[key] ?? []}
              active={chartMetric === key}
              onSelect={() => setChartMetric(key)}
              onExpand={() => {
                setChartMetric(key);
                setModalMetric(key);
              }}
            />
          ))}
        </div>
      )}

      {mainSeries ? <DayBars title={`${LABELS[chartMetric]} по дням`} points={mainSeries} /> : null}

      <MetricChartModal
        open={modalMetric !== null}
        onOpenChange={(open) => {
          if (!open) {
            setModalMetric(null);
          }
        }}
        title={modalMetric ? LABELS[modalMetric] : ""}
        loadSeries={loadModal}
      />
    </div>
  );
}
