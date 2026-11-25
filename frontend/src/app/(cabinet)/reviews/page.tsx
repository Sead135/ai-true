"use client";

import { useEffect, useMemo, useState } from "react";
import { DateRangeFilter } from "@/components/cabinet/date-range-filter";
import { FilterComboBox } from "@/components/cabinet/filter-combo-box";
import { IconStar, IconStatus } from "@/components/cabinet/filter-icons";
import { FiltersBar } from "@/components/cabinet/filters-bar";
import { ListPagination } from "@/components/cabinet/list-pagination";
import { IconBranch } from "@/components/cabinet/nav-icons";
import { RatingStars } from "@/components/cabinet/rating-stars";
import { ListCardSkeleton } from "@/components/cabinet/skeletons";
import { listBranches, type Branch } from "@/lib/branches";
import { rangeForPreset } from "@/lib/dates";
import { listReviews, type Review } from "@/lib/reviews";
import { parseLimit, parsePage, useUrlQuery } from "@/lib/use-url-query";

const STATUS_LABEL: Record<Review["status"], string> = {
  new: "Новый",
  processed: "Обработан",
};

export default function ReviewsPage() {
  const month = useMemo(() => rangeForPreset("month"), []);
  const [query, setQuery] = useUrlQuery({
    from: month.from,
    to: month.to,
    branchId: "",
    rating: "",
    status: "",
    page: "1",
    limit: "10",
  });
  const from = query.from;
  const to = query.to;
  const branchId = query.branchId;
  const rating = query.rating;
  const status = query.status;
  const page = parsePage(query.page);
  const limit = parseLimit(query.limit);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [items, setItems] = useState<Review[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listBranches({ limit: 100 })
      .then((res) => setBranches(res.items))
      .catch(() => setBranches([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    listReviews({
      from,
      to,
      branchId: branchId || undefined,
      rating: rating ? Number(rating) : undefined,
      status: (status as "new" | "processed") || undefined,
      page,
      limit,
    })
      .then((res) => {
        if (cancelled) {
          return;
        }
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err: { message?: string }) => {
        if (!cancelled) {
          setError(err.message ?? "Ошибка");
          setItems((prev) => prev ?? []);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, branchId, rating, status, page, limit]);

  return (
    <div>
      <div className="cabinet-page-head">
        <div className="reviews-page-head">
          <div className="min-w-0">
            <h1>Отзывы</h1>
            <p>Фильтры по рейтингу и статусу обработки</p>
          </div>
          <FiltersBar
            className="reviews-page-filters"
            values={{ branchId, rating, status, from, to }}
            defaults={{
              branchId: "",
              rating: "",
              status: "",
              from: month.from,
              to: month.to,
            }}
            onChange={(next) => {
              setQuery({
                branchId: next.branchId,
                rating: next.rating,
                status: next.status,
                from: next.from,
                to: next.to,
                page: "1",
              });
            }}
          >
            {({ values, set, patch }) => (
              <>
                <FilterComboBox
                  className="reviews-filter reviews-filter--branch"
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
                <FilterComboBox
                  className="reviews-filter reviews-filter--rating"
                  label="Рейтинг"
                  placeholder="Любой рейтинг"
                  icon={<IconStar />}
                  value={values.rating}
                  onChange={(v) => set("rating", v)}
                  options={[
                    { id: "", label: "Любой рейтинг" },
                    ...[5, 4, 3, 2, 1].map((n) => ({
                      id: String(n),
                      label: `${n} из 5`,
                      content: <RatingStars rating={n} />,
                    })),
                  ]}
                />
                <FilterComboBox
                  className="reviews-filter reviews-filter--status"
                  label="Статус"
                  placeholder="Любой статус"
                  icon={<IconStatus />}
                  value={values.status}
                  onChange={(v) => set("status", v)}
                  options={[
                    { id: "", label: "Любой статус" },
                    { id: "new", label: "Новый" },
                    { id: "processed", label: "Обработан" },
                  ]}
                />
                <DateRangeFilter
                  className="reviews-filter reviews-filter--date"
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

      {error ? <p className="cabinet-error">{error}</p> : null}
      {(() => {
        if (!items) {
          return <ListCardSkeleton />;
        }
        if (items.length === 0) {
          return <p className="cabinet-empty">Отзывов за период нет</p>;
        }
        return (
          <ul className="cabinet-list">
            {items.map((r) => (
              <li key={r.id} className="cabinet-list-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="cabinet-list-title">{r.authorName}</p>
                    <div className="cabinet-review-meta">
                      <RatingStars rating={r.rating} />
                      <span className="cabinet-review-date">
                        {new Date(r.reviewedOn).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`cabinet-status ${r.status === "new" ? "cabinet-status--new" : "cabinet-status--ok"}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">{r.text}</p>
              </li>
            ))}
          </ul>
        );
      })()}

      <ListPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={(next) => setQuery({ page: String(next) })}
        onLimitChange={(next) => setQuery({ limit: String(next), page: "1" })}
      />
    </div>
  );
}
