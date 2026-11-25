"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { errMessage } from "@/lib/api";
import { rangeForPreset } from "@/lib/dates";
import { qk } from "@/lib/query-keys";
import {
  type AdminMetric,
  type AdminSeriesPoint,
  fetchAdminSeries,
  fetchAdminSummary,
} from "@/lib/stats";
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
  const [chartMetric, setChartMetric] = useState<AdminMetric>("views");
  const [modalMetric, setModalMetric] = useState<AdminMetric | null>(null);

  const summaryQuery = useQuery({
    queryKey: qk.stats.adminSummary,
    queryFn: fetchAdminSummary,
  });

  const seriesQueries = useQueries({
    queries: ORDER.map((metric) => ({
      queryKey: qk.stats.adminSeries({ metric, from, to }),
      queryFn: async () => (await fetchAdminSeries({ metric, from, to })).series,
    })),
  });

  const seriesError = seriesQueries.find((q) => q.isError)?.error;
  useEffect(() => {
    if (summaryQuery.error) {
      toast.danger(errMessage(summaryQuery.error, "Ошибка загрузки"));
    } else if (seriesError) {
      toast.danger(errMessage(seriesError, "Ошибка графиков"));
    }
  }, [summaryQuery.error, seriesError]);

  const seriesMap: Partial<Record<AdminMetric, AdminSeriesPoint[]>> = {};
  ORDER.forEach((metric, i) => {
    const data = seriesQueries[i]?.data;
    if (data) {
      seriesMap[metric] = data;
    }
  });

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

  const summary = summaryQuery.data ?? null;
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
