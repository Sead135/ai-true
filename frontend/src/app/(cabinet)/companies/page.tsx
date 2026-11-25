"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useEditModals } from "@/components/cabinet/edit-modals-context";
import { ListPagination, type PageSize } from "@/components/cabinet/list-pagination";
import { ListSearch } from "@/components/cabinet/list-search";
import { useSession } from "@/components/cabinet/session-context";
import { ListCardSkeleton } from "@/components/cabinet/skeletons";
import { usePageTransition } from "@/components/page-transition";
import { errMessage } from "@/lib/api";
import { listCompanies } from "@/lib/companies";
import { qk } from "@/lib/query-keys";

export default function CompaniesPage() {
  const { me } = useSession();
  const { navigate } = usePageTransition();
  const { openCompany } = useEditModals();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSize>(10);
  const params = { q: search || undefined, page, limit };

  useEffect(() => {
    if (me.role !== "admin") {
      navigate("/");
    }
  }, [me.role, navigate]);

  const { data, error: queryError } = useQuery({
    queryKey: qk.companies.list(params),
    queryFn: () => listCompanies(params),
    enabled: me.role === "admin",
  });

  if (me.role !== "admin") {
    return null;
  }

  const items = data?.items;
  const total = data?.total ?? 0;
  const error = queryError ? errMessage(queryError, "Ошибка") : null;

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
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
      </div>

      {error ? <p className="cabinet-error">{error}</p> : null}
      {(() => {
        if (!items) {
          return <ListCardSkeleton />;
        }
        if (items.length === 0) {
          return <p className="cabinet-empty">Компаний пока нет</p>;
        }
        return (
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
                    {c.city.trim() || c.email.trim() ? (
                      <span className="cabinet-list-meta">
                        {c.city.trim() ? <span>{c.city.trim()}</span> : null}
                        {c.email.trim() ? <span>{c.email.trim()}</span> : null}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        );
      })()}

      <ListPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
      />
    </div>
  );
}
