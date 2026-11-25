"use client";

import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { useEditModals } from "@/components/cabinet/edit-modals-context";
import { FilterComboBox } from "@/components/cabinet/filter-combo-box";
import { IconPlus, IconStatus } from "@/components/cabinet/filter-icons";
import { FiltersBar } from "@/components/cabinet/filters-bar";
import { ListPagination } from "@/components/cabinet/list-pagination";
import { ListSearch } from "@/components/cabinet/list-search";
import { IconBuilding } from "@/components/cabinet/nav-icons";
import { useSession } from "@/components/cabinet/session-context";
import { ListCardSkeleton } from "@/components/cabinet/skeletons";
import { listBranches, type Branch } from "@/lib/branches";
import { listCompanies, type Company } from "@/lib/companies";
import { parseLimit, parsePage, useUrlQuery } from "@/lib/use-url-query";

export default function BranchesPage() {
  const { me } = useSession();
  const { openBranch, revision } = useEditModals();
  const [query, setQuery] = useUrlQuery({
    q: "",
    status: "",
    companyId: "",
    page: "1",
    limit: "10",
  });
  const search = query.q;
  const status = query.status;
  const companyId = query.companyId;
  const page = parsePage(query.page);
  const limit = parseLimit(query.limit);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [items, setItems] = useState<Branch[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (me.role !== "admin") {
      return;
    }
    listCompanies({ limit: 100 })
      .then((res) => setCompanies(res.items))
      .catch(() => setCompanies([]));
  }, [me.role]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    listBranches({
      q: search || undefined,
      status: (status as "active" | "inactive") || undefined,
      companyId: me.role === "admin" && companyId ? companyId : undefined,
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
  }, [me.role, search, status, companyId, page, limit, revision]);

  return (
    <div>
      <div className="cabinet-page-head">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1>Филиалы</h1>
            <p>Список точек и статусы. Клик — редактирование</p>
          </div>
          {me.role === "client" ? (
            <Button
              size="sm"
              variant="secondary"
              isIconOnly
              aria-label="Добавить филиал"
              className="mt-0.5 shrink-0"
              onPress={() => openBranch("new")}
            >
              <IconPlus />
            </Button>
          ) : null}
        </div>
      </div>

      <FiltersBar
        className="mt-5"
        values={{ status, companyId }}
        defaults={{ status: "", companyId: "" }}
        onChange={(next) => {
          setQuery({
            status: next.status,
            companyId: next.companyId,
            page: "1",
          });
        }}
        search={
          <ListSearch
            value={search}
            placeholder="Название, город или адрес"
            onChange={(v) => setQuery({ q: v, page: "1" })}
          />
        }
      >
        {({ values, set }) => (
          <>
            <FilterComboBox
              className="min-w-[140px] w-full sm:w-auto"
              label="Статус"
              placeholder="Любой статус"
              icon={<IconStatus />}
              value={values.status}
              onChange={(v) => set("status", v)}
              options={[
                { id: "", label: "Любой статус" },
                { id: "active", label: "Активен" },
                { id: "inactive", label: "Неактивен" },
              ]}
            />
            {me.role === "admin" ? (
              <FilterComboBox
                className="min-w-[180px] w-full sm:w-auto"
                label="Компания"
                placeholder="Любая компания"
                icon={<IconBuilding />}
                value={values.companyId}
                onChange={(v) => set("companyId", v)}
                options={[
                  { id: "", label: "Любая компания" },
                  ...companies.map((c) => ({ id: c.id, label: c.name })),
                ]}
              />
            ) : null}
          </>
        )}
      </FiltersBar>

      {error ? <p className="cabinet-error">{error}</p> : null}
      {(() => {
        if (!items) {
          return <ListCardSkeleton />;
        }
        if (items.length === 0) {
          return <p className="cabinet-empty">Филиалов пока нет</p>;
        }
        return (
          <ul className="cabinet-list">
            {items.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => openBranch(b.id)}
                  className="cabinet-list-card flex w-full items-start justify-between gap-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="cabinet-list-title">{b.name}</span>
                    {b.city.trim() || b.address.trim() ? (
                      <span className="cabinet-list-meta">
                        {b.city.trim() ? <span>{b.city.trim()}</span> : null}
                        {b.address.trim() ? <span>{b.address.trim()}</span> : null}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`cabinet-status ${b.isActive ? "cabinet-status--ok" : "cabinet-status--mute"}`}
                  >
                    {b.isActive ? "Активен" : "Неактивен"}
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
        onPageChange={(next) => setQuery({ page: String(next) })}
        onLimitChange={(next) => setQuery({ limit: String(next), page: "1" })}
      />
    </div>
  );
}
