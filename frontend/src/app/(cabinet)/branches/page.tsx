"use client";

import { Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useEditModals } from "@/components/cabinet/edit-modals-context";
import { FilterComboBox } from "@/components/cabinet/filter-combo-box";
import { IconPlus, IconStatus } from "@/components/cabinet/filter-icons";
import { FiltersBar } from "@/components/cabinet/filters-bar";
import { ListPagination, type PageSize } from "@/components/cabinet/list-pagination";
import { ListSearch } from "@/components/cabinet/list-search";
import { IconBuilding } from "@/components/cabinet/nav-icons";
import { useSession } from "@/components/cabinet/session-context";
import { ListCardSkeleton } from "@/components/cabinet/skeletons";
import { errMessage } from "@/lib/api";
import { listBranches } from "@/lib/branches";
import { listCompanies } from "@/lib/companies";
import { qk } from "@/lib/query-keys";

export default function BranchesPage() {
  const { me } = useSession();
  const { openBranch } = useEditModals();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSize>(10);

  const branchParams = {
    q: search || undefined,
    status: (status as "active" | "inactive") || undefined,
    companyId: me.role === "admin" && companyId ? companyId : undefined,
    page,
    limit,
  };

  const companiesQuery = useQuery({
    queryKey: qk.companies.options,
    queryFn: async () => (await listCompanies({ limit: 100 })).items,
    enabled: me.role === "admin",
  });

  const branchesQuery = useQuery({
    queryKey: qk.branches.list(branchParams),
    queryFn: () => listBranches(branchParams),
  });

  const companies = companiesQuery.data ?? [];
  const items = branchesQuery.data?.items;
  const total = branchesQuery.data?.total ?? 0;
  const error = branchesQuery.error ? errMessage(branchesQuery.error, "Ошибка") : null;

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
          setStatus(next.status);
          setCompanyId(next.companyId);
          setPage(1);
        }}
        search={
          <ListSearch
            value={search}
            placeholder="Название, город или адрес"
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
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
        onPageChange={setPage}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
      />
    </div>
  );
}
