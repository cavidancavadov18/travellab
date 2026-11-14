import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Səyahət Agentliyi Bakı - Aviabilet, Otel, Tur | Travellab",
    template: "%s | Travellab",
  },
  description:
    "Biletlər, otellər, turlar və transferlər — hamısı bir yerdə. Labpoint ilə hər səyahətdən qazanın.",
  icons: {
    icon: [
      { url: "/images/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/images/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/brand/favicon.ico" },
    ],
    apple: [{ url: "/images/brand/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/images/brand/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Travellab",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
