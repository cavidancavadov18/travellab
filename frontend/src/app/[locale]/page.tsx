import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HomePage } from "@/components/pages";

export const metadata: Metadata = {
  title: "Səyahət Agentliyi Bakı - Aviabilet, Otel, Tur",
  description:
    "Biletlər, otellər, turlar və transferlər — hamısı bir yerdə. Labpoint ilə hər səyahətdən qazanın.",
  openGraph: {
    title: "Travellab — Aviabilet, Otel və Tur Bir Yerdə",
    images: ["/images/hero/mosque.jpg"],
  },
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomePage />;
}
