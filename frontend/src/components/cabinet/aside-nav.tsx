"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { listCompanies, type Company } from "@/lib/companies";
import { BrandLogo } from "../brand-logo";
import { usePageTransition } from "../page-transition";
import { ThemeToggle } from "../theme-toggle";
import { AccountMenu } from "./account-menu";
import { useEditModals } from "./edit-modals-context";
import { IconBranch, IconBuilding, IconChart, IconReviews, IconUsers } from "./nav-icons";
import { useSession } from "./session-context";

const COLLAPSE_KEY = "cabinet-aside-collapsed";

function NavLink({
  href,
  label,
  icon,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { navigate } = usePageTransition();
  const active =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <button
      type="button"
      title={collapsed ? label : undefined}
      onClick={() => {
        onNavigate?.();
        navigate(href);
      }}
      className={`cabinet-nav-link ${active ? "cabinet-nav-link--active" : ""}`}
    >
      <span className="cabinet-nav-icon">{icon}</span>
      <span className="cabinet-nav-label">{label}</span>
    </button>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      {collapsed ? (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
          <path d="M13 12h5M15.5 9.5 18 12l-2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
          <path d="M18 12h-5M15.5 9.5 13 12l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export function AsideNav({
  mobileOpen,
  onMobileOpenChange,
}: {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const { me } = useSession();
  const pathname = usePathname();
  const { openCompany, revision } = useEditModals();
  const [company, setCompany] = useState<Company | null | undefined>(undefined);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    onMobileOpenChange(false);
  }, [pathname, onMobileOpenChange]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (me.role !== "client") return;
    let cancelled = false;
    listCompanies({ limit: 1 })
      .then((res) => {
        if (!cancelled) setCompany(res.items[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setCompany(null);
      });
    return () => {
      cancelled = true;
    };
  }, [me.role, revision]);

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

  return (
    <>
      <button
        type="button"
        className={`cabinet-sheet-backdrop ${mobileOpen ? "cabinet-sheet-backdrop--open" : ""}`}
        aria-label="Закрыть меню"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={closeMobile}
      />

      <aside
        className={`cabinet-aside ${collapsed ? "cabinet-aside--collapsed" : ""} ${mobileOpen ? "cabinet-aside--open" : ""}`}
      >
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
          <button
            type="button"
            title={collapsed ? (company?.name ?? "Компания") : undefined}
            onClick={() => {
              closeMobile();
              openCompany(company ? company.id : "new");
            }}
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
