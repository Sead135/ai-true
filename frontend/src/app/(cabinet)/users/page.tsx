"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useEditModals } from "@/components/cabinet/edit-modals-context";
import { FilterComboBox } from "@/components/cabinet/filter-combo-box";
import { IconRole } from "@/components/cabinet/filter-icons";
import { FiltersBar } from "@/components/cabinet/filters-bar";
import { ListPagination, type PageSize } from "@/components/cabinet/list-pagination";
import { ListSearch } from "@/components/cabinet/list-search";
import { IconBuilding } from "@/components/cabinet/nav-icons";
import { useSession } from "@/components/cabinet/session-context";
import { ListCardSkeleton } from "@/components/cabinet/skeletons";
import { usePageTransition } from "@/components/page-transition";
import { errMessage } from "@/lib/api";
import { listCompanies } from "@/lib/companies";
import { qk } from "@/lib/query-keys";
import { listUsers, type UserRow } from "@/lib/users";

const ROLE_LABEL: Record<UserRow["role"], string> = {
  admin: "Админ",
  client: "Клиент",
};

export default function UsersPage() {
  const { me } = useSession();
  const { navigate } = usePageTransition();
  const { openUser } = useEditModals();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSize>(10);
  const userParams = {
    q: search || undefined,
    role: (role as "admin" | "client") || undefined,
    companyId: companyId || undefined,
    page,
    limit,
  };

  useEffect(() => {
    if (me.role !== "admin") {
      navigate("/");
    }
  }, [me.role, navigate]);

  const companiesQuery = useQuery({
    queryKey: qk.companies.options,
    queryFn: async () => (await listCompanies({ limit: 100 })).items,
    enabled: me.role === "admin",
  });

  const usersQuery = useQuery({
    queryKey: qk.users.list(userParams),
    queryFn: () => listUsers(userParams),
    enabled: me.role === "admin",
  });

  if (me.role !== "admin") {
    return null;
  }

  const companies = companiesQuery.data ?? [];
  const items = usersQuery.data?.items;
  const total = usersQuery.data?.total ?? 0;
  const error = usersQuery.error ? errMessage(usersQuery.error, "Ошибка") : null;

  return (
    <div>
      <div className="cabinet-page-head">
        <h1>Пользователи</h1>
        <p>Фильтры по роли и компании</p>
      </div>

      <FiltersBar
        className="mt-5"
        values={{ role, companyId }}
        defaults={{ role: "", companyId: "" }}
        onChange={(next) => {
          setRole(next.role);
          setCompanyId(next.companyId);
          setPage(1);
        }}
        search={
          <ListSearch
            value={search}
            placeholder="Email или имя"
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
              label="Роль"
              placeholder="Любая роль"
              icon={<IconRole />}
              value={values.role}
              onChange={(v) => set("role", v)}
              options={[
                { id: "", label: "Любая роль" },
                { id: "client", label: "Клиент" },
                { id: "admin", label: "Админ" },
              ]}
            />
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
          </>
        )}
      </FiltersBar>

      {error ? <p className="cabinet-error">{error}</p> : null}
      {(() => {
        if (!items) {
          return <ListCardSkeleton />;
        }
        if (items.length === 0) {
          return <p className="cabinet-empty">Пользователей пока нет</p>;
        }
        return (
          <ul className="cabinet-list">
            {items.map((u) => {
              const initial = (u.name?.trim() || u.email).charAt(0).toUpperCase();
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => openUser(u.id)}
                    className="cabinet-list-card flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="size-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--field-background)] text-sm font-bold text-[var(--color-signal)]">
                          {initial}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="cabinet-list-title">{u.name?.trim() || u.email}</span>
                        <span className="cabinet-list-meta">
                          {u.name?.trim() ? <span>{u.email}</span> : null}
                          <span>{ROLE_LABEL[u.role]}</span>
                          {u.companyName ? <span>{u.companyName}</span> : null}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-foreground/35">
                      {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </button>
                </li>
              );
            })}
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
