"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function BrandLogo({
  className = "h-8 w-auto",
  mark = false,
}: {
  className?: string;
  /** Icon-only mark without wordmark text */
  mark?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";
  const src = mark
    ? dark
      ? "/logo-mark-light.svg"
      : "/logo-mark.svg"
    : dark
      ? "/logo-light.svg"
      : "/logo.svg";

  return (
    <img
      src={src}
      alt="Истинный интеллект"
      width={mark ? 248 : 233}
      height={mark ? 120 : 60}
      className={className}
    />
  );
}
