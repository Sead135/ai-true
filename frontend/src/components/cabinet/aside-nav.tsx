"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { listCompanies } from "@/lib/companies";
import { qk } from "@/lib/query-keys";
import { BrandLogo } from "../brand-logo";
import { ThemeToggle } from "../theme-toggle";
import { AccountMenu } from "./account-menu";
import { AsideCompanyBlock } from "./aside-company-block";
import { CollapseIcon, NavLink } from "./aside-nav-link";
import { useEditModals } from "./edit-modals-context";
import { IconBranch, IconBuilding, IconChart, IconReviews, IconUsers } from "./nav-icons";
import { useSession } from "./session-context";

const COLLAPSE_KEY = "cabinet-aside-collapsed";

type AsideNavProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export function AsideNav({ mobileOpen, onMobileOpenChange }: AsideNavProps) {
  const { me } = useSession();
  const pathname = usePathname();
  const { openCompany } = useEditModals();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const companyQuery = useQuery({
    queryKey: qk.companies.mine,
    queryFn: async () => (await listCompanies({ limit: 1 })).items[0] ?? null,
    enabled: me.role === "client",
  });
  const company = companyQuery.isPending ? undefined : (companyQuery.data ?? null);

  useEffect(() => {
    onMobileOpenChange(false);
  }, [pathname, onMobileOpenChange]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function closeMobile() {
    onMobileOpenChange(false);
  }

  function openCompanyEditor() {
    closeMobile();
    openCompany(company ? company.id : "new");
  }

  const backdropOpenClass = mobileOpen ? "cabinet-sheet-backdrop--open" : "";
  const asideCollapsedClass = collapsed ? "cabinet-aside--collapsed" : "";
  const asideOpenClass = mobileOpen ? "cabinet-aside--open" : "";
  const asideClassName = `cabinet-aside ${asideCollapsedClass} ${asideOpenClass}`;

  return (
    <>
      <button
        type="button"
        className={`cabinet-sheet-backdrop ${backdropOpenClass}`}
        aria-label="Закрыть меню"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={closeMobile}
      />

      <aside className={asideClassName}>
        <div className="cabinet-sheet-handle" aria-hidden>
          <span />
        </div>

        <div className="cabinet-aside-head">
          <div className="cabinet-brand">
            <BrandLogo className="cabinet-brand-full h-7 w-auto" />
            <BrandLogo mark className="cabinet-brand-mark h-7 w-auto" />
          </div>
          <button
            type="button"
            className="cabinet-sheet-close"
            aria-label="Закрыть меню"
            onClick={closeMobile}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="cabinet-collapse-btn"
            aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
          >
            <CollapseIcon collapsed={collapsed} />
          </button>
        </div>

        {me.role === "client" ? (
          <AsideCompanyBlock company={company} collapsed={collapsed} onEdit={openCompanyEditor} />
        ) : null}

        <nav className="cabinet-aside-nav">
          <NavLink
            href="/"
            label="Аналитика"
            icon={<IconChart />}
            collapsed={collapsed}
            onNavigate={closeMobile}
          />
          {me.role === "admin" ? (
            <>
              <NavLink
                href="/companies"
                label="Компании"
                icon={<IconBuilding />}
                collapsed={collapsed}
                onNavigate={closeMobile}
              />
              <NavLink
                href="/users"
                label="Пользователи"
                icon={<IconUsers />}
                collapsed={collapsed}
                onNavigate={closeMobile}
              />
            </>
          ) : null}
          <NavLink
            href="/branches"
            label="Филиалы"
            icon={<IconBranch />}
            collapsed={collapsed}
            onNavigate={closeMobile}
          />
          <NavLink
            href="/reviews"
            label="Отзывы"
            icon={<IconReviews />}
            collapsed={collapsed}
            onNavigate={closeMobile}
          />
        </nav>

        <div className="cabinet-aside-foot mt-auto">
          <div className="cabinet-aside-theme">
            <ThemeToggle labeled collapsed={collapsed} />
          </div>
          <AccountMenu collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}
