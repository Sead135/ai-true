"use client";

import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function SunIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M21 14.3A8.5 8.5 0 1 1 9.7 3a7 7 0 0 0 11.3 11.3z" />
    </svg>
  );
}

export function ThemeToggle({
  className,
  labeled = false,
  collapsed = false,
}: {
  className?: string;
  labeled?: boolean;
  collapsed?: boolean;
} = {}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        className={
          labeled && !collapsed
            ? "cabinet-theme-toggle-skeleton"
            : `inline-block size-9 ${className ?? ""}`
        }
        aria-hidden
      />
    );
  }

  const isDark = theme === "dark";
  const label = isDark ? "Светлая тема" : "Тёмная тема";

  if (labeled) {
    return (
      <button
        type="button"
        className={`cabinet-theme-toggle${collapsed ? " cabinet-theme-toggle--collapsed" : ""}${className ? ` ${className}` : ""}`}
        aria-label={label}
        title={collapsed ? label : undefined}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        <span className="cabinet-theme-toggle-icon">
          {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
        </span>
        {collapsed ? null : <span className="cabinet-theme-toggle-label">{label}</span>}
      </button>
    );
  }

  return (
    <Button
      isIconOnly
      variant="ghost"
      size="sm"
      className={className}
      aria-label={label}
      onPress={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
