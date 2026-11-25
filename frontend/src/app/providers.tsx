"use client";

import { Toast } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { PageTransitionProvider } from "@/components/page-transition";
import { PwaRegister } from "@/components/pwa-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Toast.Provider placement="top end" />
      <PwaRegister />
      <PageTransitionProvider>{children}</PageTransitionProvider>
    </ThemeProvider>
  );
}
