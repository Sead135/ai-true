"use client";

import { useCallback, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PAGE_SIZES, type PageSize } from "@/components/cabinet/list-pagination";

/** Syncs filter/pagination state with URL search params. Defaults are omitted from the URL. */
export function useUrlQuery<T extends Record<string, string>>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  const query = useMemo(() => {
    const next = { ...defaultsRef.current };
    for (const key of Object.keys(next)) {
      const raw = searchParams.get(key);
      if (raw !== null) (next as Record<string, string>)[key] = raw;
    }
    return next;
  }, [searchParams]);

  const setQuery = useCallback(
    (patch: Partial<T>) => {
      const defaultsNow = defaultsRef.current as Record<string, string>;
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        if (value === "" || value === defaultsNow[key]) next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return [query, setQuery] as const;
}

export function parsePage(raw: string): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function parseLimit(raw: string): PageSize {
  const n = Number(raw);
  return PAGE_SIZES.includes(n as PageSize) ? (n as PageSize) : 10;
}
