"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { errMessage } from "@/lib/api";
import { listBranches } from "@/lib/branches";
import { rangeForPreset } from "@/lib/dates";
import { qk } from "@/lib/query-keys";
import { fetchStats, type StatsTotals } from "@/lib/stats";
import { DayBars } from "./day-bars";
import { FilterComboBox } from "./filter-combo-box";
import { FiltersBar } from "./filters-bar";
import { MetricChartCard } from "./metric-chart-card";
import { MetricChartModal } from "./metric-chart-modal";
import { IconBranch } from "./nav-icons";
import { PeriodFilter } from "./period-filter";
import { MetricsSkeleton } from "./skeletons";

type ClientMetric = keyof StatsTotals;

const LABELS: Record<ClientMetric, string> = {
  views: "Просмотры",
  websiteClicks: "Переходы на сайт",
  calls: "Звонки",
  routes: "Маршруты",
  avgRating: "Средний рейтинг",
  reviewsCount: "Отзывы",
};

const ORDER = Object.keys(LABELS) as ClientMetric[];

function formatValue(key: ClientMetric, value: number) {
  if (key === "avgRating") {
    return value.toFixed(1);
  }
  return value.toLocaleString("ru-RU");
}

export function ClientDashboard() {
  const month = useMemo(() => rangeForPreset("month"), []);
  const [from, setFrom] = useState(month.from);
  const [to, setTo] = useState(month.to);
  const [branchId, setBranchId] = useState("");
  const [chartMetric, setChartMetric] = useState<ClientMetric>("views");
  const [modalMetric, setModalMetric] = useState<ClientMetric | null>(null);

  const statsParams = { from, to, branchId: branchId || undefined };

  const branchesQuery = useQuery({
    queryKey: qk.branches.options,
    queryFn: async () => (await listBranches({ limit: 100 })).items,
  });

  const statsQuery = useQuery({
    queryKey: qk.stats.client(statsParams),
    queryFn: () => fetchStats(statsParams),
  });

  useEffect(() => {
    if (statsQuery.error) {
      toast.danger(errMessage(statsQuery.error, "Ошибка загрузки"));
    }
  }, [statsQuery.error]);

  const branches = branchesQuery.data ?? [];
  const data = statsQuery.data;

  const seriesFor = useCallback(
    (key: ClientMetric) => (data?.series ?? []).map((p) => ({ date: p.date, value: p[key] })),
    [data],
  );

  const loadModal = useCallback(
    async (rangeFrom: string, rangeTo: string) => {
      if (!modalMetric) {
        return [];
      }
      const res = await fetchStats({
        from: rangeFrom,
        to: rangeTo,
        branchId: branchId || undefined,
      });
      return res.series.map((p) => ({ date: p.date, value: p[modalMetric] }));
    },
    [modalMetric, branchId],
  );

  const totals = data?.totals;
  const mainSeries = seriesFor(chartMetric);

  return (
    <div className="cabinet-dashboard">
      <div className="cabinet-page-head">
        <div className="cabinet-page-head-row">
          <div className="min-w-0">
            <h1>Аналитика</h1>
            <p>Показатели присутствия на геосервисах</p>
          </div>
          <FiltersBar
            className="cabinet-page-filters filters-bar--single-row"
            collapseOnMobile={false}
            values={{ branchId, from, to }}
            defaults={{ branchId: "", from: month.from, to: month.to }}
            onChange={(next) => {
              setBranchId(next.branchId);
              setFrom(next.from);
              setTo(next.to);
            }}
          >
            {({ values, set, patch }) => (
              <>
                <FilterComboBox
                  className="min-w-0"
                  label="Филиал"
                  placeholder="Все филиалы"
                  icon={<IconBranch />}
                  value={values.branchId}
                  onChange={(v) => set("branchId", v)}
                  options={[
                    { id: "", label: "Все филиалы" },
                    ...branches.map((b) => ({ id: b.id, label: b.name })),
                  ]}
                />
                <PeriodFilter
                  className="min-w-0"
                  from={values.from}
                  to={values.to}
                  onChange={({ from: nextFrom, to: nextTo }) => {
                    patch({ from: nextFrom, to: nextTo });
                  }}
                />
              </>
            )}
          </FiltersBar>
        </div>
      </div>

      {!totals ? (
        <MetricsSkeleton count={6} />
      ) : (
        <div className="cabinet-metric-charts cabinet-metric-charts--6">
          {ORDER.map((key) => (
            <MetricChartCard
              key={key}
              label={LABELS[key]}
              value={formatValue(key, totals[key])}
              points={seriesFor(key)}
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

      {data ? (
        <DayBars
          title={`${LABELS[chartMetric]} по дням`}
          points={mainSeries}
          formatValue={(n) => formatValue(chartMetric, n)}
        />
      ) : null}

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
