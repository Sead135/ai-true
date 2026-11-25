"use client";

import { Toast } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { PageTransitionProvider } from "@/components/page-transition";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Toast.Provider placement="top end" />
      <PageTransitionProvider>{children}</PageTransitionProvider>
    </ThemeProvider>
  );
}
