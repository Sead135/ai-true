"use client";

import { Button } from "@heroui/react";
import { FilterComboBox } from "./filter-combo-box";
import { IconRows } from "./filter-icons";

export const PAGE_SIZES = [10, 25, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

type Props = {
  page: number;
  limit: PageSize;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: PageSize) => void;
};

function scrollListTop() {
  document.querySelector(".cabinet-content")?.scrollTo({ top: 0, behavior: "smooth" });
}

export function ListPagination({ page, limit, total, onPageChange, onLimitChange }: Props) {
  if (total < 10) return null;
  const pages = Math.max(1, Math.ceil(total / limit));

  function goToPage(next: number) {
    onPageChange(next);
    scrollListTop();
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Button
        size="sm"
        variant="secondary"
        isDisabled={page <= 1}
        onPress={() => goToPage(page - 1)}
      >
        Назад
      </Button>
      <span className="text-sm text-foreground/50">
        {page} из {pages}
      </span>
      <Button
        size="sm"
        variant="secondary"
        isDisabled={page >= pages}
        onPress={() => goToPage(page + 1)}
      >
        Вперёд
      </Button>
      <FilterComboBox
        className="min-w-[120px] ml-auto"
        label="На странице"
        placeholder="На странице"
        icon={<IconRows />}
        value={String(limit)}
        onChange={(v) => onLimitChange(Number(v) as PageSize)}
        options={PAGE_SIZES.map((n) => ({ id: String(n), label: `${n} на стр.` }))}
      />
    </div>
  );
}
