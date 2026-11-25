"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { BrandLogo } from "../brand-logo";

const COLLAPSE_KEY = "cabinet-aside-collapsed";

type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
};

type CountProps = {
  count?: number;
};

type PageHeadSkeletonProps = {
  withFilters?: boolean;
};

type CabinetShellSkeletonProps = {
  children: React.ReactNode;
};

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <span className={`cabinet-skeleton ${className}`.trim()} style={style} aria-hidden />;
}

export function ListCardSkeleton({ count = 5 }: CountProps) {
  return (
    <ul className="cabinet-list" aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="cabinet-list-card flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </li>
      ))}
    </ul>
  );
}

export function MetricsSkeleton({ count = 4 }: CountProps) {
  return (
    <div className={`cabinet-metrics${count === 6 ? " cabinet-metrics--6" : ""}`} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="cabinet-metric">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-3 h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  const heights = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 48, 68];
  return (
    <div
      className="flex h-full min-h-[14rem] items-end gap-2 px-2 py-4"
      aria-busy="true"
      aria-label="Загрузка графика"
    >
      {heights.map((h, i) => (
        <Skeleton key={i} className="min-w-0 flex-1 rounded-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="flex max-w-md flex-col gap-4" aria-busy="true" aria-label="Загрузка">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <Skeleton className="mt-2 h-11 w-full rounded-[15px]" />
      <Skeleton className="h-11 w-full rounded-[15px]" />
      <Skeleton className="h-11 w-full rounded-[15px]" />
    </div>
  );
}

function PageHeadSkeleton({ withFilters = false }: PageHeadSkeletonProps) {
  return (
    <div className="cabinet-page-head">
      <div className={withFilters ? "cabinet-page-head-row" : undefined}>
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        {withFilters ? (
          <Skeleton className="mt-3 h-11 w-full max-w-sm rounded-[15px] md:mt-0" />
        ) : null}
      </div>
    </div>
  );
}

type DashboardPageSkeletonProps = {
  metrics?: number;
};

export function DashboardPageSkeleton({ metrics = 6 }: DashboardPageSkeletonProps) {
  return (
    <div className="cabinet-dashboard" aria-busy="true" aria-label="Загрузка">
      <PageHeadSkeleton withFilters />
      <MetricsSkeleton count={metrics} />
      <section className="cabinet-panel">
        <div className="cabinet-panel-head">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3.5 w-48" />
        </div>
        <div className="mt-4">
          <ChartSkeleton />
        </div>
      </section>
    </div>
  );
}

export function ListPageSkeleton({ count = 5 }: CountProps) {
  return (
    <div aria-busy="true" aria-label="Загрузка">
      <PageHeadSkeleton />
      <div className="filters-bar mt-5">
        <Skeleton className="h-11 w-full max-w-md rounded-[15px]" />
      </div>
      <ListCardSkeleton count={count} />
    </div>
  );
}

export function AsideSkeleton() {
  const [collapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });

  return (
    <aside className={`cabinet-aside ${collapsed ? "cabinet-aside--collapsed" : ""}`} aria-hidden>
      <div className="cabinet-aside-head">
        <div className="cabinet-brand">
          <BrandLogo className="cabinet-brand-full h-7 w-auto" />
          <BrandLogo mark className="cabinet-brand-mark h-7 w-auto" />
        </div>
      </div>

      <nav className="cabinet-aside-nav">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="cabinet-nav-link pointer-events-none">
            <Skeleton className="size-5 shrink-0 rounded-md" />
            <Skeleton className="cabinet-nav-label h-4 w-24" />
          </span>
        ))}
      </nav>

      <div className="cabinet-aside-foot mt-auto">
        <div className="cabinet-aside-theme">
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
        <Skeleton className="mt-2 h-12 w-full rounded-2xl" />
      </div>
    </aside>
  );
}

export function CabinetShellSkeleton({ children }: CabinetShellSkeletonProps) {
  return (
    <div className="cabinet-root" aria-busy="true" aria-label="Загрузка кабинета">
      <header className="cabinet-mobile-bar">
        <BrandLogo className="h-7 w-auto" />
        <Skeleton className="size-9 rounded-xl" />
      </header>

      <AsideSkeleton />

      <div className="cabinet-main">
        <div className="cabinet-content">{children}</div>
      </div>
    </div>
  );
}

const LIST_PATHS = new Set(["/companies", "/branches", "/users", "/reviews"]);

export function pageSkeletonForPath(pathname: string) {
  if (pathname === "/") {
    return <DashboardPageSkeleton />;
  }
  if (LIST_PATHS.has(pathname)) {
    return <ListPageSkeleton />;
  }
  return <DetailSkeleton />;
}
