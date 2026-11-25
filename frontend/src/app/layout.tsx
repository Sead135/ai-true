import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Истинный интеллект",
  description: "Аналитический кабинет",
  applicationName: "Истинный интеллект",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ИИ",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f53b00" },
    { media: "(prefers-color-scheme: dark)", color: "#ff5a2a" },
  ],
  width: "device-width",
  initialScale: 1,
  // Prevents iOS Safari auto-zoom on <16px inputs (and stuck zoom after login)
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={onest.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
