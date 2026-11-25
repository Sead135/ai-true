"use client";

import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CabinetShell } from "@/components/cabinet/cabinet-shell";
import { pageSkeletonForPath } from "@/components/cabinet/skeletons";
import { PageTransitionScreen } from "@/components/page-transition";
import { fetchMe, type Me } from "@/lib/auth";

type CabinetLayoutProps = {
  children: React.ReactNode;
};

export default function CabinetLayout({ children }: CabinetLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const next = `${pathname}${window.location.search}`;
    const goLogin = () => router.replace(`/login?next=${encodeURIComponent(next)}`);
    fetchMe()
      .then((user) => {
        if (cancelled) {
          return;
        }
        if (!user) {
          goLogin();
          return;
        }
        setMe(user);
      })
      .catch(() => {
        if (!cancelled) {
          goLogin();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (me === undefined) {
    return <PageTransitionScreen />;
  }

  if (!me) {
    return null;
  }

  return (
    <CabinetShell me={me}>
      <Suspense fallback={pageSkeletonForPath(pathname)}>{children}</Suspense>
    </CabinetShell>
  );
}
