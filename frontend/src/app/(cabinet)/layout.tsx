"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CabinetShell } from "@/components/cabinet/cabinet-shell";
import { DetailSkeleton, ListCardSkeleton, MetricsSkeleton } from "@/components/cabinet/skeletons";
import { fetchMe, type Me } from "@/lib/auth";

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
    return (
      <div className="cabinet-root">
        <div className="cabinet-main">
          <div className="cabinet-content flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="cabinet-skeleton h-8 w-40" />
              <span className="cabinet-skeleton h-4 w-64" />
            </div>
            <MetricsSkeleton count={6} />
            <ListCardSkeleton count={3} />
            <DetailSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!me) return null;

  return (
    <CabinetShell me={me}>
      <Suspense fallback={null}>{children}</Suspense>
    </CabinetShell>
  );
}
