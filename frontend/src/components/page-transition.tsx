"use client";

import { Spinner } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { BrandLogo } from "./brand-logo";

type NavigateOptions = {
  /** Full-screen logo+spinner. Use only after login/register. */
  overlay?: boolean;
};

type TransitionApi = {
  navigate: (href: string, options?: NavigateOptions) => void;
};

const TransitionCtx = createContext<TransitionApi | null>(null);

export function usePageTransition() {
  const ctx = useContext(TransitionCtx);
  if (!ctx) throw new Error("usePageTransition outside provider");
  return ctx;
}

const MIN_VISIBLE_MS = 520;

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const pendingHref = useRef<string | null>(null);
  const shownAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    const elapsed = Date.now() - shownAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setExiting(true);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setExiting(false);
        pendingHref.current = null;
      }, 220);
    }, wait);
  }, []);

  const navigate = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (href === pathname) return;
      pendingHref.current = href;
      if (options?.overlay) {
        shownAt.current = Date.now();
        setExiting(false);
        setVisible(true);
      }
      router.push(href);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (!pendingHref.current) return;
    if (!visible) {
      pendingHref.current = null;
      return;
    }
    if (pathname === pendingHref.current || pathname.startsWith(pendingHref.current)) {
      hide();
    }
  }, [pathname, hide, visible]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <TransitionCtx.Provider value={{ navigate }}>
      {children}
      {visible ? (
        <div
          className={`page-transition${exiting ? " page-transition--out" : ""}`}
          role="status"
          aria-live="polite"
          aria-label="Загрузка"
        >
          <BrandLogo className="h-9 w-auto" />
          <Spinner size="lg" color="accent" className="mt-8" />
        </div>
      ) : null}
    </TransitionCtx.Provider>
  );
}
