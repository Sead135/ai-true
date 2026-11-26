"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type BrandLogoProps = {
  className?: string;
  /** Icon-only mark without wordmark text */
  mark?: boolean;
};

export function BrandLogo({ className = "h-8 w-auto", mark = false }: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";
  const src = dark ? "/logo-mark-light.svg" : "/logo-mark.svg";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} role="img" aria-label="Точки">
      <img src={src} alt="" width={32} height={32} className="h-full w-auto shrink-0" aria-hidden />
      {mark ? null : (
        <span className="text-[0.95em] leading-none font-semibold tracking-[-0.03em]">Точки</span>
      )}
    </span>
  );
}
