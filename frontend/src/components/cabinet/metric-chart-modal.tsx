"use client";

import { Modal, useOverlayState } from "@heroui/react";
import { useEffect, useState } from "react";
import { rangeForPreset } from "@/lib/dates";
import { toastError } from "@/lib/toast";
import { BarChart } from "./bar-chart";
import { PeriodFilter } from "./period-filter";
import { ChartSkeleton } from "./skeletons";

type SeriesPoint = { date: string; value: number };

export function MetricChartModal({
  open,
  onOpenChange,
  title,
  loadSeries,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  loadSeries: (from: string, to: string) => Promise<SeriesPoint[]>;
}) {
  const state = useOverlayState({ isOpen: open, onOpenChange });
  const [from, setFrom] = useState(() => rangeForPreset("month").from);
  const [to, setTo] = useState(() => rangeForPreset("month").to);
  const [points, setPoints] = useState<SeriesPoint[] | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setPoints(null);
      setPending(false);
      return;
    }
    const month = rangeForPreset("month");
    setFrom(month.from);
    setTo(month.to);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPending(true);
    loadSeries(from, to)
      .then((series) => {
        if (!cancelled) setPoints(series);
      })
      .catch((err: { message?: string }) => {
        if (!cancelled) toastError(err.message ?? "Не удалось загрузить график");
      })
      .finally(() => {
        if (!cancelled) setPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, from, to, loadSeries]);

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="lg" placement="center">
          <Modal.Dialog>
            <Modal.Header className="flex items-start justify-between gap-4">
              <Modal.Heading className="text-lg font-semibold tracking-tight">
                {title}
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <PeriodFilter
                className="w-full"
                from={from}
                to={to}
                onChange={({ from: nextFrom, to: nextTo }) => {
                  setFrom(nextFrom);
                  setTo(nextTo);
                }}
              />

              <div
                className={`cabinet-chart-frame cabinet-chart-frame--detail${pending && points ? " cabinet-chart-frame--pending" : ""}`}
              >
                {!points ? (
                  <ChartSkeleton />
                ) : points.length === 0 ? (
                  <p className="cabinet-empty cabinet-empty--inset">
                    Нет данных за выбранный период
                  </p>
                ) : (
                  <BarChart points={points} className="h-full w-full" showLabels interactive />
                )}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
