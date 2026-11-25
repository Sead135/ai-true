"use client";

import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CabinetShell } from "@/components/cabinet/cabinet-shell";
import { CabinetShellSkeleton, pageSkeletonForPath } from "@/components/cabinet/skeletons";
import { fetchMe, type Me } from "@/lib/auth";

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((user) => {
        if (cancelled) return;
        if (!user) {
          router.replace("/login");
          return;
        }
        setMe(user);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (me === undefined) {
    return <CabinetShellSkeleton>{pageSkeletonForPath(pathname)}</CabinetShellSkeleton>;
  }

  if (!me) return null;

  return (
    <CabinetShell me={me}>
      <Suspense fallback={pageSkeletonForPath(pathname)}>{children}</Suspense>
    </CabinetShell>
  );
}
