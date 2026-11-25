"use client";

import { usePathname } from "next/navigation";
import { usePageTransition } from "../page-transition";

type NavLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
  onNavigate?: () => void;
};

export function NavLink({ href, label, icon, collapsed, onNavigate }: NavLinkProps) {
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

type CollapseIconProps = {
  collapsed: boolean;
};

export function CollapseIcon({ collapsed }: CollapseIconProps) {
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
