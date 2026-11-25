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
  let src: string;
  if (mark) {
    src = dark ? "/logo-mark-light.svg" : "/logo-mark.svg";
  } else {
    src = dark ? "/logo-light.svg" : "/logo.svg";
  }

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
