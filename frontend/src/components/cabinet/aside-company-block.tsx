"use client";

import type { Company } from "@/lib/companies";

type AsideCompanyBlockProps = {
  company: Company | null | undefined;
  collapsed: boolean;
  onEdit: () => void;
};

export function AsideCompanyBlock({ company, collapsed, onEdit }: AsideCompanyBlockProps) {
  return (
    <button
      type="button"
      title={collapsed ? (company?.name ?? "Компания") : undefined}
      onClick={onEdit}
      className="cabinet-company"
    >
      {company?.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={company.logoUrl}
          alt=""
          className="h-[36px] w-[36px] shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-xl bg-[var(--color-signal)]/10 text-sm font-bold text-[var(--color-signal)]">
          {company?.name?.charAt(0) ?? "+"}
        </span>
      )}
      <span className="cabinet-company-meta min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold">
          {company === undefined ? (
            <span className="cabinet-skeleton inline-block h-4 w-24 align-middle" />
          ) : (
            (company?.name ?? "Нет компании")
          )}
        </span>
        <span className="block text-xs text-foreground/45">
          {company ? "Редактировать" : "Добавить компанию"}
        </span>
      </span>
    </button>
  );
}
