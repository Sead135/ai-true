"use client";

import { useEffect, useState } from "react";
import type { Me } from "@/lib/auth";
import { BrandLogo } from "../brand-logo";
import { AsideNav } from "./aside-nav";
import { EditModalsProvider } from "./edit-modals-context";
import { SessionProvider } from "./session-context";

type CabinetShellProps = {
  me: Me;
  children: React.ReactNode;
};

export function CabinetShell({ me, children }: CabinetShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <SessionProvider me={me}>
      <EditModalsProvider>
        <div className="cabinet-root">
          <header className="cabinet-mobile-bar">
            <BrandLogo className="h-7 w-auto" />
            <button
              type="button"
              className="cabinet-mobile-menu-btn"
              aria-label="Открыть меню"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <AsideNav mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />

          <div className="cabinet-main">
            <div className="cabinet-content">{children}</div>
          </div>
        </div>
      </EditModalsProvider>
    </SessionProvider>
  );
}
