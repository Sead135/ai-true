"use client";

import { useEffect, useState } from "react";
import { useEditModals } from "@/components/cabinet/edit-modals-context";
import { ListPagination } from "@/components/cabinet/list-pagination";
import { ListSearch } from "@/components/cabinet/list-search";
import { useSession } from "@/components/cabinet/session-context";
import { ListCardSkeleton } from "@/components/cabinet/skeletons";
import { usePageTransition } from "@/components/page-transition";
import { listCompanies, type Company } from "@/lib/companies";
import { parseLimit, parsePage, useUrlQuery } from "@/lib/use-url-query";

export default function CompaniesPage() {
  const { me } = useSession();
  const { navigate } = usePageTransition();
  const { openCompany, revision } = useEditModals();
  const [query, setQuery] = useUrlQuery({ q: "", page: "1", limit: "10" });
  const search = query.q;
  const page = parsePage(query.page);
  const limit = parseLimit(query.limit);
  const [items, setItems] = useState<Company[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (me.role !== "admin") {
      navigate("/");
      return;
    }
    let cancelled = false;
    setError(null);
    listCompanies({ q: search || undefined, page, limit })
      .then((res) => {
        if (cancelled) return;
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
  }, [me.role, navigate, search, page, limit, revision]);

  if (me.role !== "admin") return null;

  return (
    <div>
      <div className="cabinet-page-head">
        <h1>Компании</h1>
        <p>Поиск по названию, городу и email</p>
      </div>

      <div className="filters-bar mt-5">
        <ListSearch
          value={search}
          placeholder="Название, город или email"
          onChange={(v) => setQuery({ q: v, page: "1" })}
        />
      </div>

      {error ? <p className="cabinet-error">{error}</p> : null}
      {!items ? (
        <ListCardSkeleton />
      ) : items.length === 0 ? (
        <p className="cabinet-empty">Компаний пока нет</p>
      ) : (
        <ul className="cabinet-list">
          {items.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => openCompany(c.id)}
                className="cabinet-list-card flex w-full items-center gap-3 text-left"
              >
                {c.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.logoUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--field-background)] text-sm font-bold text-[var(--color-signal)]">
                    {c.name.charAt(0)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="cabinet-list-title">{c.name}</span>
                  <span className="cabinet-list-meta">
                    <span>{c.city}</span>
                    <span>{c.email}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

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
