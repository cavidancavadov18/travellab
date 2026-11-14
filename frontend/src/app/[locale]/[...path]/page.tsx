import type { Metadata } from "next";
import { Suspense } from "react";
import { RoutePage } from "@/components/pages";

const titles: Record<string, string> = {
  flights: "Aviabilet axtarışı",
  hotels: "Otellər",
  tours: "Tur Paketləri - Hazır Turlar",
  services: "Xidmətlər",
  visa: "Viza dəstəyi",
  labpoint: "Labpoint",
  shop: "Travellab Shop",
  corporate: "Korporativ səyahət",
  about: "Haqqımızda",
  contact: "Əlaqə",
  account: "Şəxsi kabinet",
  "admin-panel": "Admin panel",
  auth: "Daxil ol",
  search: "Aviabilet axtarışı",
  viza: "Viza dəstəyi",
  korporativ: "Korporativ səyahət",
  "hediyye-karti": "Hədiyyə Kartı",
  blog: "Bloqlar və Xəbərlər",
  privacy: "Məxfilik Siyasəti",
  terms: "Şərtlər və Qaydalar",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  const title =
    path.length > 1 && ["tours", "shop", "hotels"].includes(path[0])
      ? path[1].replaceAll("-", " ")
      : titles[path[0]] || "Travellab";
  return {
    title,
    description: `${title} — Travellab Bakı səyahət agentliyi.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  return (
    <Suspense fallback={<div className="shell py-24">Yüklənir…</div>}>
      <RoutePage parts={path} />
    </Suspense>
  );
}
