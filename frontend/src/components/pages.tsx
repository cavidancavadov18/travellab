"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ADMIN_URL, ApiError, api, createBooking, normalizeItem, rows } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/store";
import { Item, ItemCard, Logo, PageHero, Reveal, SearchWidget, Status } from "./site";
import { FeatureLogo } from "./brand-marks";
import { StoriesSection } from "./stories";
import { HeroEntrance, HomeHeroShell, ParallaxMedia, TravelDiscovery } from "./home-motion";
import { TravelpayoutsFlightsWidget } from "./travelpayouts-flights";
import { Link, useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  BlogArticlePage,
  CookiesPage,
  DealsPage,
  EventsPage,
  FavoritesPage,
  FaqPage,
  FlightRoutePage,
  FlightRoutesIndexPage,
  InsurancePage,
  OrdersPage,
  ServicesHubPage,
  ShopCategoryPage,
  SHOP_CATEGORY_SLUGS,
  TransferPage,
  VisaCountryPage,
  VisaHubPage,
} from "./extra-pages";
import {
  AiPlannerPage,
  AssistantPage,
  BudgetPage,
  ComparePage,
  DashboardPage,
  MyTripPage,
  PremiumHubPage,
  SmartDealsPage,
  Venue360Page,
  WishlistPage,
  WorldMapPage,
} from "./premium-pages";

function authRedirectMessage(e: unknown, fallback: string) {
  if (e instanceof ApiError && e.status === 401) return "Davam etmək üçün daxil olun";
  return e instanceof Error ? e.message : fallback;
}

const images = {
  home: "/images/hero/mosque.jpg",
  hero: "/images/hero/mosque.jpg",
  flights: "/images/hero/balloons.jpg",
  hotels: "/images/hotels/hero-pool.jpg",
  tours: "/images/destinations/maldives.jpg",
  services: "/images/stories/visa-002.jpg",
  visa: "/images/stories/visa-002.jpg",
  labpoint: "/images/stories/labpoint-001.jpg",
  shop: "/images/shop/lifestyle-bottle.jpg",
  shopHero: "/images/shop/lifestyle-couple.jpg",
  corporate: "/images/about/events/travellab-qarabagda.jpg",
  about: "/images/about/events/travellab-qarabagda.jpg",
  contact: "/images/hero/balloons.jpg",
  account: "/images/stories/reviews-001.jpg",
  "admin-panel": "/images/stories/backend-18063878738792221.jpg",
  gift: "/images/stories/labpoint-001.jpg",
  blog: "/images/about/events/travellab-qarabagda.jpg",
  privacy: "/images/hero/mosque.jpg",
  terms: "/images/hero/mosque.jpg",
};


const destinations = [
  { name: "Maldives", image: "/images/destinations/maldives.jpg", href: "/tours?search=Maldiv" },
  { name: "İstanbul", image: "/images/destinations/istanbul.jpg", href: "/tours?search=İstanbul" },
  { name: "Dubai", image: "/images/destinations/dubai.jpg", href: "/tours?search=Dubai" },
  { name: "Phuket", image: "/images/destinations/phuket.jpg", href: "/tours?search=Phuket" },
  { name: "Paris", image: "/images/destinations/paris.jpg", href: "/tours?search=Paris" },
  { name: "New York", image: "/images/destinations/newyork.jpg", href: "/tours?search=New York" },
  { name: "Bali", image: "/images/destinations/bali.jpg", href: "/tours?search=Bali" },
  { name: "Seoul", image: "/images/destinations/seoul.jpg", href: "/tours?search=Seoul" },
];

const shopCategories = ["Hamısı", "Elektronika", "Aksesuar", "Səyahət", "Gözəllik"];
const partnerFallback = [
  { name: "Expedia", logo_url: "/images/partners/expedia.svg" },
  { name: "Tripadvisor", logo_url: "/images/partners/tripadvisor.svg" },
  { name: "Turkish Airlines", logo_url: "/images/partners/turkish-airlines.svg" },
  { name: "Emirates", logo_url: "/images/partners/emirates.svg" },
  { name: "Qatar Airways", logo_url: "/images/partners/qatar-airways.svg" },
  { name: "ATAA", logo_url: "/images/partners/aztaa-logo.jpeg" },
  { name: "Google", logo_url: "/images/partners/google-rating.svg" },
];

const fallbackTours: Item[] = [
  {
    id: 1,
    slug: "maldiv-escape",
    title: "Yerdəki Cənnət - Maldiv!",
    price: 1150,
    currency: "USD",
    labpoint_earn: 23,
    cover_image: "/images/destinations/maldives.jpg",
    summary: "Overwater villa · 6 gecə 7 gün",
  },
  {
    id: 2,
    slug: "new-york-lights",
    title: "Yeni ili New Yorkda qarşılayın",
    price: 1490,
    currency: "USD",
    labpoint_earn: 29.8,
    cover_image: "/images/destinations/newyork.jpg",
    summary: "Times Square · 5 gecə 6 gün",
  },
  {
    id: 3,
    slug: "phuket-tropik",
    title: "Phuket turu 6 gecə 7 gün",
    price: 899,
    currency: "USD",
    labpoint_earn: 18,
    cover_image: "/images/destinations/phuket.jpg",
    summary: "Tropik istirahət · All inclusive seçimi",
  },
  {
    id: 4,
    slug: "istanbul-yeni-il",
    title: "Yeni il turu İstanbul 4 gecə 5 gün",
    price: 589,
    currency: "USD",
    labpoint_earn: 11.8,
    cover_image: "/images/destinations/istanbul.jpg",
    summary: "Boğaz mənzərəli otel · Transfer daxil",
  },
];

export function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const tourRailRef = useRef<HTMLDivElement>(null);
  const [heroTab, setHeroTab] = useState<"hotels" | "deals" | "tours" | "group" | "gift">("hotels");
  const [tours, setTours] = useState<Item[]>(fallbackTours);
  const [products, setProducts] = useState<Item[]>([]);
  const [reviews, setReviews] = useState<{ author_name?: string; body?: string; rating?: number }[]>([]);
  const [partners, setPartners] = useState<{ name?: string; logo_url?: string }[]>([]);
  const [status, setStatus] = useState("");
  const [hotelFullscreen, setHotelFullscreen] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api("tours/?featured=true"),
      api("tours"),
      api("shop/products"),
      api("reviews"),
      api("partners"),
    ]).then((results) => {
      const featured = results[0].status === "fulfilled" ? rows(results[0].value as Item[]) : [];
      const all = results[1].status === "fulfilled" ? rows(results[1].value as Item[]) : [];
      const list = (featured.length ? featured : all).map((x) => normalizeItem(x) as Item);
      if (list.length) setTours(list.slice(0, 8));
      if (results[2].status === "fulfilled") setProducts(rows(results[2].value as Item[]).map((x) => normalizeItem(x) as Item).slice(0, 5));
      if (results[3].status === "fulfilled") setReviews(rows(results[3].value as { author_name?: string; body?: string }[]).slice(0, 4));
      if (results[4].status === "fulfilled") setPartners(rows(results[4].value as { name?: string }[]));
    });
  }, []);

  async function favorite(item: Item) {
    try {
      if (!useAuthStore.getState().requireAuth()) {
        router.push("/auth/login");
        return;
      }
      await api("favorites/toggle", { method: "POST", body: JSON.stringify({ object_type: "tour", object_id: Number(item.id) }) });
      setStatus(t("common.success"));
    } catch (e) {
      const msg = authRedirectMessage(e, t("common.error"));
      setStatus(msg);
      if (e instanceof ApiError && e.status === 401) router.push("/auth/login");
    }
  }

  function onHeroPill(tab: typeof heroTab) {
    setHeroTab(tab);
    if (tab === "tours") router.push("/tours");
    if (tab === "group") router.push("/tours?category=group");
    if (tab === "hotels") router.push("/hotels");
    if (tab === "deals") router.push("/endirimler");
    if (tab === "gift") router.push("/hediyye-karti");
  }

  return (
    <>
      <HomeHeroShell
        badge={
          <>
            <div className="hero-float hero-float-deal">{t("home.dealFloat")}</div>
            <div className="hero-badge">{t("home.badge")}</div>
          </>
        }
      >
        <HeroEntrance>
          <p className="hero-eyebrow">{t("home.eyebrow")}</p>
        </HeroEntrance>
        <HeroEntrance delay={0.08}>
          <h1>{t("home.title")}</h1>
        </HeroEntrance>
        <HeroEntrance delay={0.16}>
          <p>{t("home.body")}</p>
        </HeroEntrance>
        <HeroEntrance delay={0.24}>
          <div className="hero-pills">
            <button className={`hero-pill ${heroTab === "hotels" ? "active" : ""}`} onClick={() => onHeroPill("hotels")}>{t("home.tabHotels")}</button>
            <button className={`hero-pill ${heroTab === "deals" ? "active" : ""}`} onClick={() => onHeroPill("deals")}>{t("home.tabDeals")}</button>
            <button className={`hero-pill ${heroTab === "tours" ? "active" : ""}`} onClick={() => onHeroPill("tours")}>{t("home.tabTours")}</button>
            <button className={`hero-pill ${heroTab === "group" ? "active" : ""}`} onClick={() => onHeroPill("group")}>{t("home.tabGroup")}</button>
            <button className={`hero-pill gift ${heroTab === "gift" ? "active" : ""}`} onClick={() => onHeroPill("gift")}>{t("home.tabGift")}</button>
          </div>
        </HeroEntrance>
      </HomeHeroShell>

      <motion.div
        className="search-card search-card-premium"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <SearchWidget embedded homeMode />
      </motion.div>

      <StoriesSection />

      <TravelDiscovery />

      <section className="section !pt-2">
        <div className="shell">
          <Reveal>
            <p className="section-label">Destinations</p>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 className="section-title">Populyar istiqamətlər</h2>
              <Link href="/tours" className="font-semibold text-[var(--tl-green)]">{t("common.all")} →</Link>
            </div>
          </Reveal>
          <div className="dest-rail">
            {destinations.map((d, i) => (
              <Reveal key={d.name} className="dest-card-wrap" delay={i * 0.05}>
                <Link href={d.href} className="dest-card dest-card-3d" style={{ backgroundImage: `url(${d.image})` }}>
                  <span>{d.name}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section !pt-2">
        <div className="shell">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 className="section-title">{t("home.tours")}</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="carousel-btn" aria-label="Previous" onClick={() => tourRailRef.current?.scrollBy({ left: -360, behavior: "smooth" })}>‹</button>
                <button type="button" className="carousel-btn" aria-label="Next" onClick={() => tourRailRef.current?.scrollBy({ left: 360, behavior: "smooth" })}>›</button>
              </div>
            </div>
          </Reveal>
          <Status message={status} />
          <div className="tour-rail" ref={tourRailRef}>
            {tours.map((tour) => (
              <div key={tour.id} className="tour-rail-item">
                <ItemCard item={tour} kind="tour" onFavorite={favorite} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/tours" className="btn btn-outline-green">{t("common.all")} →</Link>
          </div>
        </div>
      </section>

      <section className="section !pt-2">
        <div className="shell">
          <Reveal>
            <h2 className="section-title mb-6">{t("home.shop")}</h2>
          </Reveal>
          <div className="shop-panel shop-panel-3">
            <div className="shop-features">
              <p className="section-label">{t("home.shopLabel")}</p>
              <h3 className="text-2xl font-extrabold leading-tight text-[var(--tl-ink)]">{t("home.shopTitle")}</h3>
              <p className="mt-3 text-[var(--tl-muted)] leading-7">{t("home.shopBody")}</p>
              <ul className="shop-feature-list">
                {[
                  "24 aya qədər hissəli ödəniş",
                  "2% cashback qazanın",
                  "Orijinal və keyfiyyətli",
                  "Sürətli çatdırılma",
                  "2.500+ məmnun müştəri",
                  "Peşəkar qablaşdırma",
                ].map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <Link href="/shop" className="btn btn-green mt-5 w-fit">Shop-a keç →</Link>
            </div>
            <div className="shop-hero" style={{ backgroundImage: `url(${images.shopHero})` }} />
            <div className="shop-list">
              <h3>{t("home.bestsellers")}</h3>
              {(products.length
                ? products
                : [
                    { id: "p1", slug: "baseus-power-bank-10000w", name: "Baseus Power Bank 10000W", price: 93.6, currency: "AZN", image: "/images/shop/products/TB-001-1.png", category: "Elektronika" },
                    { id: "p2", slug: "travel-neck-pillow", name: "Ergonomik Boyun Yastığı", price: 24.9, currency: "AZN", image: "/images/shop/products/TB-002-1.png", category: "Səyahət" },
                    { id: "p3", slug: "aroma-travel-set", name: "Ətir qabı + Aroma set", price: 18.6, currency: "AZN", image: "/images/shop/products/TB-003-1.png", category: "Gözəllik" },
                    { id: "p4", slug: "first-aid-travel-kit", name: "İlk yardım çantası", price: 24.9, currency: "AZN", image: "/images/shop/products/TB-005-1.jpg", category: "Aksesuar" },
                  ]
              )
                .slice(0, 5)
                .map((p) => (
                <Link key={String(p.id)} href={`/shop/${p.slug || p.id}`} className="shop-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.cover_image || p.image_url || p.image || images.shop} alt={p.name || p.title || ""} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name || p.title}</p>
                    <strong>{p.price_from || p.price} {p.currency || "AZN"}</strong>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section !pt-2">
        <div className="shell">
          <Reveal>
            <div className="hotel-card-light grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <span className="hotel-tag">{t("home.hotelsTag")}</span>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[var(--tl-ink)]">{t("home.hotels")}</h2>
                <p className="mt-4 text-[var(--tl-muted)] leading-7">{t("home.hotelsBody")}</p>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  {[
                    ["2.6M+", "Otel seçimi"],
                    ["Ani", "Təsdiq"],
                    ["220+", "Ölkə"],
                  ].map(([n, l]) => (
                    <div key={l} className="hotel-stat">
                      <div className="text-lg font-extrabold text-[var(--tl-green)]">{n}</div>
                      <div className="text-xs text-[var(--tl-muted)]">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/hotels" className="btn btn-green">Otelləri axtar →</Link>
                  <button type="button" className="btn btn-outline-green" onClick={() => setHotelFullscreen(true)}>
                    Tam ekranda aç →
                  </button>
                </div>
              </div>
              <ParallaxMedia src={images.hotels} alt="Hotels" className="h-64 md:h-80 rounded-2xl" />
              {hotelFullscreen && (
                <div className="lightbox" onClick={() => setHotelFullscreen(false)} role="dialog" aria-modal="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images.hotels} alt="Hotels fullscreen" />
                  <button type="button" className="lightbox-close" onClick={() => setHotelFullscreen(false)}>✕</button>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section !pt-2">
        <div className="shell">
          <Reveal>
            <div className="tl-cta-banner">
              <div className="tl-cta-copy">
                <h2>{t("home.cta")}</h2>
                <p>{t("home.ctaBody")}</p>
                <div className="tl-cta-tags">
                  <span>✈ Uçuş biletləri</span>
                  <span>🏨 Otellər</span>
                  <span>🧳 Hazır turlar</span>
                </div>
              </div>
              <Link href="/tours" className="btn btn-green tl-cta-btn">{t("home.ctaExplore")}</Link>
              <div className="tl-cta-plane" aria-hidden />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section !pt-2">
        <div className="shell">
          <Reveal>
            <div className="labpoint-card">
              <div>
                <p className="section-label">{t("home.labpointLabel")}</p>
                <h2 className="section-title mt-2">{t("home.labpoint")}</h2>
                <p className="muted mt-4 max-w-xl leading-7">{t("home.labpointBody")}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="https://travellab-point.az" target="_blank" rel="noreferrer" className="btn btn-green">
                    Kart yarat →
                  </a>
                  <Link href="/labpoint" className="btn btn-outline-green">Ətraflı Məlumat →</Link>
                </div>
              </div>
              <div className="labpoint-visual">
                <div className="labpoint-glow" aria-hidden />
                <div className="labpoint-black-card">
                  <div className="labpoint-black-top">
                    <FeatureLogo id="labpoint" size={36} withLabel />
                    <span className="labpoint-share">Paylaş</span>
                  </div>
                  <strong>{t("home.labpointBalance")}</strong>
                  <em>{t("home.labpointAz")}</em>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section !pt-2">
        <div className="shell">
          <Reveal>
            <p className="section-label">PARTNYORLAR</p>
            <h2 className="section-title mb-6">{t("home.partners")}</h2>
            <div className="partners-marquee" aria-hidden>
              <div className="partners-marquee-track">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/partners/partners-strip.svg" alt="" className="partners-strip" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/partners/partners-strip.svg" alt="" className="partners-strip" />
              </div>
            </div>
            <div className="partners mt-4">
              {(partners.length ? partners : partnerFallback).map((p) => (
                <span key={p.name} className="partner-chip">
                  {p.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo_url} alt={p.name || "partner"} className="partner-logo" />
                  ) : null}
                  <span className="sr-only">{p.name}</span>
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section !pt-2">
        <div className="shell">
          <Reveal>
            <div className="premium-home">
              <video className="premium-home-video" autoPlay muted loop playsInline poster="/images/destinations/maldives.jpg" preload="metadata">
                <source src="/videos/travel.mp4" type="video/mp4" />
              </video>
              <div className="premium-home-wash" />
              <div className="relative z-[1]">
                <FeatureLogo id="premium" size={48} withLabel />
                <h2 className="mt-3 text-3xl font-extrabold">Innovativ səyahət alətləri</h2>
                <p className="mt-3 max-w-xl text-white/75">AI Planner, dünya xəritəsi, büdcə, müqayisə, 360°, dashboard və ağıllı çat — cinematic vizual ilə.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/premium" className="btn btn-green">Premium hub</Link>
                  <Link href="/ai-planner" className="btn !border-white/30 !text-white" style={{ borderWidth: 1 }}>AI Planner</Link>
                  <Link href="/assistant" className="btn !border-white/30 !text-white" style={{ borderWidth: 1 }}>AI Chat</Link>
                </div>
              </div>
              <div className="relative z-[1] grid grid-cols-2 gap-3 text-sm">
                {(
                  [
                    ["/map", "Xəritə", "map"],
                    ["/budget", "Büdcə", "budget"],
                    ["/compare", "Müqayisə", "compare"],
                    ["/360", "360°", "venue360"],
                    ["/my-trip", "My Trip", "my-trip"],
                    ["/wishlist", "Wishlist", "wishlist"],
                  ] as const
                ).map(([href, label, id]) => (
                  <Link key={href} href={href} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-3 font-semibold backdrop-blur transition hover:bg-white/20 hover:scale-[1.03]">
                    <FeatureLogo id={id} size={28} animated={false} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="reviews" className="section !pt-2">
        <div className="shell">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 className="section-title">{t("home.reviews")}</h2>
              <Link href="/reyler" className="font-semibold text-[var(--tl-green)]">{t("common.all")} →</Link>
            </div>
            <div className="grid-3">
              {(reviews.length
                ? reviews
                : [
                    { author_name: "Leyla", body: "Peşəkar komanda, operativ dəstək və sərfəli tur paketləri.", rating: 5 },
                    { author_name: "John", body: "Best agency in Baku for flights and hotels.", rating: 5 },
                    { author_name: "Анна", body: "Отличный сервис и внимательная команда Travellab.", rating: 5 },
                  ]
              ).map((r, i) => (
                <article key={i} className="card p-5">
                  <div className="text-[var(--tl-orange)]">{"★".repeat(r.rating || 5)}</div>
                  <p className="mt-3 leading-7 text-[var(--tl-ink)]">“{r.body}”</p>
                  <p className="mt-4 text-sm font-semibold text-[var(--tl-muted)]">— {r.author_name}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section !pt-2 !pb-16">
        <div className="shell">
          <Reveal>
            <article className="tl-seo-body">
              <h2 className="sr-only">{t("home.seoTitle")}</h2>
              <p>{t("home.seoP1")}</p>
              <p>{t("home.seoP2")}</p>
              <p>
                {t("home.seoP3")}{" "}
                <Link href="/about" className="font-semibold text-[var(--tl-green)]">
                  Ətraflı oxu →
                </Link>
              </p>
            </article>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function useCatalog(endpoint: string, fallback: Item[] = []) {
  const [items, setItems] = useState<Item[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = (query = "") => {
    setLoading(true);
    api<unknown>(`${endpoint}${query}`)
      .then((x) => setItems(rows(x as Item[]).map((i) => normalizeItem(i) as Item)))
      .catch((e) => {
        setError(e.message);
        if (fallback.length) setItems(fallback);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => load(), [endpoint]); // eslint-disable-line react-hooks/exhaustive-deps
  return { items, loading, error, load };
}

function CatalogPage({ kind }: { kind: "tours" | "hotels" | "shop" }) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const endpoint = kind === "shop" ? "shop/products" : kind;
  const { items, loading, error, load } = useCatalog(endpoint, kind === "tours" ? fallbackTours : []);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState(searchParams.get("ordering") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "Hamısı");
  const [query, setQuery] = useState(searchParams.get("q") || searchParams.get("search") || searchParams.get("location") || "");
  const singular = kind === "tours" ? "tour" : kind === "hotels" ? "hotel" : "product";
  const tourCategories = ["Hamısı", "group", "beach", "city", "adventure"];

  useEffect(() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q") || searchParams.get("search") || searchParams.get("location") || "";
    const ordering = searchParams.get("ordering") || sort;
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
    if (q) params.set("search", q);
    if (cat && cat !== "Hamısı" && cat !== "group") params.set("category", cat);
    if (ordering) params.set("ordering", ordering === "price" && kind === "hotels" ? "price_from" : ordering === "-price" && kind === "hotels" ? "-price_from" : ordering);
    load(params.toString() ? `?${params}` : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, searchParams]);

  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = String(data.get("q") || "");
    setQuery(q);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (category && category !== "Hamısı" && kind !== "shop") params.set("category", category);
    let ordering = sort;
    if (ordering === "price" && kind === "hotels") ordering = "price_from";
    if (ordering === "-price" && kind === "hotels") ordering = "-price_from";
    if (ordering) params.set("ordering", ordering);
    load(params.toString() ? `?${params}` : "");
  }

  const visibleItems = useMemo(() => {
    if (kind === "shop" && category !== "Hamısı") {
      return items.filter((p) => {
        const hay = `${p.category || ""} ${p.name || ""} ${p.title || ""}`.toLowerCase();
        return hay.includes(category.toLowerCase()) ||
          (category === "Elektronika" && /power|bank|cable|usb|baseus/i.test(hay)) ||
          (category === "Səyahət" && /pillow|travel|yastıq|çanta|kit/i.test(hay)) ||
          (category === "Gözəllik" && /aroma|ətir|beauty/i.test(hay)) ||
          (category === "Aksesuar" && /kit|access|çanta/i.test(hay));
      });
    }
    if (kind === "tours" && category === "group") {
      return items.filter((p) => /group|qrup|komanda/i.test(`${p.title || ""} ${p.summary || ""} ${p.category || ""}`));
    }
    return items;
  }, [items, kind, category]);

  async function action(item: Item, type: "book" | "favorite") {
    try {
      if (!useAuthStore.getState().requireAuth()) {
        router.push("/auth/login");
        return;
      }
      if (type === "favorite") {
        await api("favorites/toggle", { method: "POST", body: JSON.stringify({ object_type: singular, object_id: Number(item.id) }) });
      } else if (singular === "product") {
        await api("shop/cart", { method: "POST", body: JSON.stringify({ product_id: Number(item.id), quantity: 1 }) });
        await api("shop/checkout", { method: "POST", body: JSON.stringify({ shipping_address: "Baku, Azerbaijan" }) });
      } else {
        await createBooking({
          booking_type: singular,
          title: String(item.title || item.name || "Booking"),
          subtotal: item.price_from || item.price || 0,
          currency: item.currency || "USD",
          related_object_id: item.id,
          details: { slug: item.slug, source: kind },
        });
      }
      setStatus(t("common.success"));
    } catch (e) {
      setStatus(authRedirectMessage(e, t("common.error")));
      if (e instanceof ApiError && e.status === 401) router.push("/auth/login");
    }
  }

  return (
    <>
      <PageHero title={t(`pages.${kind}.title`)} body={t(`pages.${kind}.body`)} image={images[kind]} />
      <section className="section">
        <div className="shell">
          <form onSubmit={search} className="mb-6 flex max-w-3xl flex-wrap gap-3">
            <input name="q" className="field min-w-[220px] flex-1" placeholder={t("forms.query")} defaultValue={query} />
            <select className="field max-w-[180px]" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort</option>
              <option value="price">Price ↑</option>
              <option value="-price">Price ↓</option>
              <option value="-created_at">Newest</option>
            </select>
            <button className="btn btn-green" type="submit">{t("common.search")}</button>
          </form>
          {(kind === "shop" || kind === "tours") && (
            <div className="filter-chips mb-8">
              {(kind === "shop" ? shopCategories : tourCategories).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`filter-chip ${category === c ? "active" : ""}`}
                  onClick={() => {
                    setCategory(c);
                    const params = new URLSearchParams();
                    if (query) params.set("search", query);
                    if (c && c !== "Hamısı") params.set("category", c);
                    if (sort) params.set("ordering", sort);
                    load(params.toString() ? `?${params}` : "");
                  }}
                >
                  {c === "group" ? "Qrup turları" : c === "beach" ? "Çimərlik" : c === "city" ? "Şəhər" : c === "adventure" ? "Macəra" : c}
                </button>
              ))}
            </div>
          )}
          <Status message={status || error} error={!!error && !status} />
          {loading && <p>{t("common.loading")}</p>}
          {!loading && !visibleItems.length && <p className="muted py-20 text-center">{t("common.empty")}</p>}
          <div className={kind === "tours" ? "tour-grid" : "grid-3"}>
            {visibleItems.map((x, i) => (
              <Reveal key={x.id || i}>
                <ItemCard
                  item={x}
                  kind={singular}
                  onBook={kind !== "tours" ? (item) => action(item, "book") : undefined}
                  onFavorite={kind === "tours" ? (item) => action(item, "favorite") : undefined}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function FlightsPage() {
  const t = useTranslations();

  return (
    <>
      <PageHero
        title={t("pages.flights.title")}
        body="Bakıdan dünyanın istənilən nöqtəsinə real aviabilet axtarışı — birbaşa və dayanacaqlı uçuşlar, gediş-dönüş və tək istiqamət qiymətləri AZN ilə."
        image={images.flights}
      />
      <section className="section !pt-4">
        <div className="shell">
          <TravelpayoutsFlightsWidget />
        </div>
      </section>
      <section className="section !pt-0 !pb-16">
        <div className="shell">
          <article className="tl-seo-body">
            <h2 className="section-title mb-4">Aviabilet Axtarışı — Bakıdan Sərfəli Uçuşlar</h2>
            <p>
              Travellab səyahət agentliyi vasitəsilə aviabilet axtarışı sadə və sürətlidir. Bakıdan dünyanın istənilən nöqtəsinə uçuş
              axtararkən, yüzlərlə aviaşirkətin təkliflərini bir yerdə müqayisə edə, ən sərfəli aviabilet qiymətini taparaq bron edə bilərsiniz.
            </p>
            <p>
              Qiymətlər real axtarış nəticələridir (Travelpayouts). Uydurma və ya sabit “demo” qiymətlər göstərilmir. Valyuta seçimi AZN/USD/EUR
              header-dən idarə olunur.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function DetailPage({ kind, slug }: { kind: "tours" | "shop" | "hotels"; slug: string }) {
  const t = useTranslations();
  const router = useRouter();
  const endpoint = kind === "tours" ? `tours/${slug}` : kind === "hotels" ? `hotels/${slug}` : `shop/products/${slug}`;
  const [item, setItem] = useState<Item | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "missing">("loading");
  const [status, setStatus] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setLoadState("loading");
    api<Item>(endpoint)
      .then((x) => {
        setItem(normalizeItem(x) as Item);
        setLoadState("ready");
      })
      .catch(() => {
        if (kind === "tours") {
          const fb = fallbackTours.find((x) => x.slug === slug);
          if (fb) {
            setItem(fb as Item);
            setLoadState("ready");
            return;
          }
        }
        setItem(null);
        setLoadState("missing");
      });
  }, [endpoint, slug, kind]);

  if (loadState === "loading") return <div className="shell min-h-screen pt-24">{t("common.loading")}</div>;
  if (loadState === "missing" || !item) {
    return (
      <div className="shell min-h-screen pt-24">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold">Tapılmadı</h1>
          <p className="muted mt-2">Bu səhifə mövcud deyil və ya silinib.</p>
          <Link href={`/${kind}`} className="btn btn-green mt-6 inline-flex">
            Geri qayıt
          </Link>
        </div>
      </div>
    );
  }
  const current = item;
  const pageKey = kind === "hotels" ? "hotels" : kind;
  const heroImg = current.cover_image || current.image_url || current.image || images[pageKey];

  async function book() {
    try {
      if (!useAuthStore.getState().requireAuth()) {
        router.push("/auth/login");
        return;
      }
      if (kind === "shop") {
        await api("shop/cart", { method: "POST", body: JSON.stringify({ product_id: Number(current.id), quantity: 1 }) });
        const order = await api<{ reference?: string }>("shop/checkout", {
          method: "POST",
          body: JSON.stringify({ shipping_address: "Bakı, Azərbaycan (Demo)" }),
        });
        setStatus(`Demo ödəniş uğurlu. Sifariş: ${order.reference || "—"}`);
      } else {
        const booking = await createBooking({
          booking_type: kind === "hotels" ? "hotel" : "tour",
          title: String(current.title || current.name || "Booking"),
          subtotal: current.price_from || current.price || 0,
          currency: current.currency || "AZN",
          related_object_id: current.id,
          details: { slug: current.slug, demo: true },
        });
        setStatus(`Demo bron uğurlu. Ref: ${booking.reference || "—"}`);
      }
    } catch (e) {
      setStatus(authRedirectMessage(e, t("common.error")));
      if (e instanceof ApiError && e.status === 401) router.push("/auth/login");
    }
  }

  async function favorite() {
    try {
      if (!useAuthStore.getState().requireAuth()) {
        router.push("/auth/login");
        return;
      }
      await api("favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ object_type: kind === "hotels" ? "hotel" : "tour", object_id: Number(current.id) }),
      });
      setStatus(t("common.success"));
    } catch (e) {
      setStatus(authRedirectMessage(e, t("common.error")));
      if (e instanceof ApiError && e.status === 401) router.push("/auth/login");
    }
  }

  return (
    <>
      <PageHero
        title={current.title || current.name || ""}
        body={current.description || current.short_description || t(`pages.${pageKey}.body`)}
        image={heroImg}
      />
      <section className="section">
        <div className="shell grid gap-10 md:grid-cols-[1fr_340px]">
          <div>
            <p className="section-label">{current.location || current.destination_name || "Travellab"}</p>
            <h2 className="section-title">{current.title || current.name}</h2>
            <p className="muted mt-6 max-w-2xl text-lg leading-8">{current.description || current.summary}</p>
            {(kind === "tours" || kind === "hotels") && (
              <p className="notice mt-6">Demo rezervasiya: ödəniş DemoPayment ilə təsdiqlənir və Labpoint hesablanır.</p>
            )}
            {kind === "hotels" && (
              <button type="button" className="btn btn-outline-green mt-6" onClick={() => setFullscreen(true)}>
                Tam ekranda aç
              </button>
            )}
            {fullscreen && (
              <div className="lightbox" onClick={() => setFullscreen(false)} role="dialog" aria-modal="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={String(heroImg)} alt={current.title || current.name || "hotel"} />
                <button type="button" className="lightbox-close" onClick={() => setFullscreen(false)}>✕</button>
              </div>
            )}
          </div>
          <aside className="card h-fit p-6">
            <p className="text-sm text-[var(--tl-soft)]">{t("common.from")}</p>
            <div className="mt-2 text-4xl font-extrabold text-[var(--tl-green)]">
              {current.price_from || current.price} {current.currency || "USD"}
            </div>
            <Status message={status} />
            <button className="btn btn-green mt-4 w-full" type="button" onClick={book}>{t("common.book")}</button>
            {(kind === "tours" || kind === "hotels") && (
              <button className="btn btn-soft mt-3 w-full" type="button" onClick={favorite}>♡ {t("common.favorite")}</button>
            )}
            <a href="tel:+994125550505" className="btn btn-call mt-3 w-full">{t("common.call")}</a>
          </aside>
        </div>
      </section>
    </>
  );
}

function ContactPage() {
  const t = useTranslations();
  const [status, setStatus] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      await api("contact", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      form.reset();
      setStatus(t("common.success"));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t("common.error"));
    }
  }
  return (
    <>
      <PageHero title={t("pages.contact.title")} body={t("pages.contact.body")} image={images.contact} />
      <section className="section">
        <div className="shell grid gap-10 md:grid-cols-2">
          <div>
            <p className="section-label">Baku</p>
            <h2 className="section-title">Travellab</h2>
            <p className="muted mt-5 leading-7">
              +994 12 555 05 05
              <br />
              info@travellab.az
              <br />
              40 Cəfər Cabbarlı küçəsi, Bakı
            </p>
          </div>
          <form onSubmit={submit} className="card grid gap-3 p-6">
            <input name="name" required className="field" placeholder={t("forms.name")} />
            <input name="email" type="email" required className="field" placeholder={t("forms.email")} />
            <input name="phone" className="field" placeholder={t("forms.phone")} />
            <textarea name="message" required className="field" placeholder={t("forms.message")} />
            <Status message={status} />
            <button className="btn btn-green">{t("common.submit")}</button>
          </form>
        </div>
      </section>
    </>
  );
}

function AuthPage({ mode }: { mode: "login" | "register" }) {
  const t = useTranslations();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [status, setStatus] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const form = Object.fromEntries(new FormData(e.currentTarget).entries());
      if (mode === "register" && form.password !== form.password_confirm) {
        setStatus("Passwords do not match");
        return;
      }
      const payload =
        mode === "register"
          ? { email: form.email, password: form.password, first_name: form.first_name, locale: "az" }
          : { email: form.email, password: form.password };
      const result = await api<{ access?: string; refresh?: string; user?: { email: string } }>(`auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (result.access) {
        setSession(result.access, result.user || null, result.refresh || null);
        if (!result.user) {
          const me = await api<{ email: string; first_name?: string; is_staff?: boolean }>("auth/me");
          setSession(result.access, me, result.refresh || null);
        }
        router.push("/account");
      } else setStatus(t("common.success"));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : t("common.error"));
    }
  }

  return (
    <section className="section">
      <div className="shell mx-auto max-w-md">
        <div className="card p-8">
          <div className="auth-brand">
            <Logo />
          </div>
          <p className="section-label text-center">Travellab</p>
          <h1 className="mt-2 text-center text-3xl font-extrabold">{t(`forms.${mode}`)}</h1>
          <form onSubmit={submit} className="mt-6 grid gap-3">
            {mode === "register" && <input required name="first_name" className="field" placeholder={t("forms.name")} />}
            <input
              required
              name="email"
              type={mode === "login" ? "text" : "email"}
              className="field"
              placeholder={mode === "login" ? "Email və ya admin" : t("forms.email")}
              autoComplete="username"
            />
            <input required name="password" type="password" className="field" placeholder={t("forms.password")} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            {mode === "register" && <input required name="password_confirm" type="password" className="field" placeholder={t("forms.confirm")} />}
            {mode === "login" && <p className="muted text-xs">Admin: admin / admin · Demo: demo@travellab.az / Demo1234!</p>}
            <Status message={status} />
            <button className="btn btn-green w-full">{t(`forms.${mode}`)}</button>
          </form>
          <Link href={mode === "login" ? "/auth/register" : "/auth/login"} className="mt-5 block text-center text-sm font-semibold text-[var(--tl-green)]">
            {mode === "login" ? t("forms.register") : t("forms.login")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function AccountPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, loadUser, logout } = useAuthStore();
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [favorites, setFavorites] = useState<Record<string, unknown>[]>([]);
  const [balance, setBalance] = useState<Record<string, unknown>>({});
  const [status, setStatus] = useState("");

  async function refresh() {
    const me = await loadUser();
    if (!me) {
      router.push("/auth/login");
      return;
    }
    const [b, f, lp] = await Promise.allSettled([api("bookings"), api("favorites"), api("labpoint/balance")]);
    if (b.status === "fulfilled") setBookings(rows(b.value as Record<string, unknown>[] | { results?: Record<string, unknown>[] }));
    if (f.status === "fulfilled") {
      const favPayload = f.value;
      setFavorites(Array.isArray(favPayload) ? favPayload : rows(favPayload as { results?: Record<string, unknown>[] }));
    }
    if (lp.status === "fulfilled") setBalance(lp.value as Record<string, unknown>);
  }

  useEffect(() => {
    refresh().catch(() => router.push("/auth/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHero title={t("pages.account.title")} body={t("pages.account.body")} image={images.account} />
      <section className="section">
        <div className="shell">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-extrabold">{user?.first_name || user?.email || "Traveler"}</h2>
            <div className="flex gap-2">
              <Link href="/sifarisler" className="btn btn-soft">Sifarişlər</Link>
              <Link href="/favorites" className="btn btn-soft">Sevimlilər</Link>
              {user?.is_staff && <Link href="/admin-panel" className="btn btn-outline-green">Admin</Link>}
              <button type="button" onClick={() => { logout(); router.push("/"); }} className="btn btn-soft">Logout</button>
            </div>
          </div>
          <Status message={status} />
          <div className="grid-3">
            <div className="card p-6">
              <p className="section-label">Bookings</p>
              <div className="mt-3 text-5xl font-black text-[var(--tl-green)]">{bookings.length}</div>
            </div>
            <div className="card p-6">
              <p className="section-label">Favorites</p>
              <div className="mt-3 text-5xl font-black text-[var(--tl-green)]">{favorites.length}</div>
            </div>
            <div className="card p-6">
              <FeatureLogo id="labpoint" size={36} withLabel />
              <div className="mt-3 text-5xl font-black text-[var(--tl-green)]">{String(balance.balance || 0)}</div>
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-[var(--tl-green)]"
                onClick={async () => {
                  try {
                    await api("labpoint/redeem", { method: "POST", body: JSON.stringify({ amount: "1.00", description: "Demo redeem" }) });
                    await refresh();
                    setStatus(t("common.success"));
                  } catch (e) {
                    setStatus(e instanceof Error ? e.message : t("common.error"));
                  }
                }}
              >
                Redeem 1 pt →
              </button>
            </div>
          </div>

          <h3 className="mt-10 text-xl font-bold">Sifarişlər</h3>
          <div className="mt-4 grid gap-3">
            {!bookings.length && <p className="muted">Hələ sifariş yoxdur.</p>}
            {bookings.map((b) => (
              <div key={String(b.id || b.reference)} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-bold">{String(b.title || "Booking")}</p>
                  <p className="text-sm text-[var(--tl-muted)]">{String(b.reference)} · {String(b.booking_type)} · {String(b.status)}</p>
                </div>
                <strong className="text-[var(--tl-green)]">{String(b.total)} {String(b.currency || "USD")}</strong>
              </div>
            ))}
          </div>

          <h3 className="mt-10 text-xl font-bold">Favoritlər</h3>
          <div className="mt-4 grid gap-3">
            {!favorites.length && <p className="muted">Favorit siyahısı boşdur.</p>}
            {favorites.map((f) => {
              const obj = (f.object_data || {}) as Record<string, unknown>;
              return (
                <div key={String(f.id)} className="card p-4">
                  <p className="font-bold">{String(obj.title || obj.name || f.object_type)}</p>
                  <p className="text-sm text-[var(--tl-muted)]">{String(f.object_type)} #{String(f.object_id)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function AdminPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");
  useEffect(() => {
    loadUser().then((me) => {
      if (!me) {
        router.push("/auth/login");
        return;
      }
      if (!me.is_staff) {
        setError("Admin panel yalnız staff üçündür. Sayt girişi: admin@travellab.az / admin");
        return;
      }
      api<Record<string, unknown>>("admin/stats").then(setStats).catch((e) => setError(e.message));
    });
  }, [loadUser, router]);
  return (
    <>
      <PageHero title={t("pages.admin-panel.title")} body={t("pages.admin-panel.body")} image={images["admin-panel"]} />
      <section className="section">
        <div className="shell">
          <Status message={error} error />
          {!error && (
            <div className="grid-4">
              {Object.entries(stats).map(([k, v]) => (
                <div className="card p-5" key={k}>
                  <p className="section-label">{k.replaceAll("_", " ")}</p>
                  <div className="mt-3 text-4xl font-black text-[var(--tl-green)]">{typeof v === "object" ? "—" : String(v)}</div>
                </div>
              ))}
            </div>
          )}
          {user?.is_staff && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a className="btn btn-green inline-flex" href={ADMIN_URL} target="_blank" rel="noreferrer">
                Django Admin aç →
              </a>
              <p className="muted text-sm">
                Django: <strong>admin</strong> / <strong>admin</strong> · Sayt: <strong>admin@travellab.az</strong> / <strong>admin</strong>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function StaticPage({ name }: { name: "services" | "visa" | "labpoint" | "corporate" | "about" }) {
  const t = useTranslations();
  const { user, loadUser } = useAuthStore();
  const [status, setStatus] = useState("");
  const [services, setServices] = useState<Item[]>([]);
  const [balance, setBalance] = useState<string>("0");
  const blocks = useMemo(
    () =>
      name === "services"
        ? ["Viza dəstəyi", "Transfer", "Sığorta"]
        : name === "visa"
          ? ["Sənəd yoxlaması", "Müraciət dəstəyi", "Görüş yönləndirməsi"]
          : name === "corporate"
            ? ["Travel policy", "24/7 dəstək", "Hesabatlılıq"]
            : name === "labpoint"
              ? ["Hər bronlardan qazan", "Balansını izlə", "Növbəti səfərdə istifadə et"]
              : ["Tam xidmətli agentlik", "Yerli bilik, qlobal şəbəkə", "Müştəri məmnuniyyəti"],
    [name],
  );

  useEffect(() => {
    if (name === "services" || name === "visa") {
      api("services").then((x) => setServices(rows(x as Item[]).map((i) => normalizeItem(i) as Item))).catch(() => {});
    }
    if (name === "labpoint") {
      loadUser().then((me) => {
        if (me) api<{ balance?: string }>("labpoint/balance").then((b) => setBalance(String(b.balance || 0))).catch(() => {});
      });
    }
  }, [name, loadUser]);

  async function lead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      await api("contact", { method: "POST", body: JSON.stringify({ ...data, subject: `${name} inquiry`, source: name }) });
      form.reset();
      setStatus(t("common.success"));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t("common.error"));
    }
  }

  return (
    <>
      <PageHero title={t(`pages.${name}.title`)} body={t(`pages.${name}.body`)} image={images[name]} />
      <section className="section">
        <div className="shell">
          {name === "labpoint" && (
            <div className="card mb-8 p-6">
              <FeatureLogo id="labpoint" size={48} withLabel />
              <p className="section-label mt-5">Balansınız</p>
              <div className="mt-2 text-5xl font-black text-[var(--tl-green)]">{user ? balance : "—"}</div>
              {!user && <Link href="/auth/login" className="btn btn-green mt-4">Daxil ol və balansa bax</Link>}
            </div>
          )}
          <div className="grid-3">
            {(services.length && (name === "services" || name === "visa") ? services.map((s) => s.title || s.name || "") : blocks).map((x, i) => (
              <Reveal key={`${x}-${i}`}>
                <div className="card p-6">
                  <span className="text-[var(--tl-green)] font-black">0{i + 1}</span>
                  <h2 className="mt-4 text-2xl font-bold">{x}</h2>
                  <p className="muted mt-3 leading-7">
                    {services[i]?.summary || services[i]?.short_description || "Peşəkar dəstək, şəffaf proses və sürətli cavab."}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          {name === "about" && (
            <div className="prose mt-10 max-w-3xl space-y-4 text-[var(--tl-ink)] leading-8">
              <p>
                Travellab, Bakıda fəaliyyət göstərən tam xidmətli səyahət agentliyi olaraq müştərilərinə aviabilet, otel bron,
                hazır tur paketləri, viza xidmətləri və tədbir biletlərini tək bir məkanda təqdim edir. Şirkətimiz Azərbaycan
                Turizm Agentlikləri Assosiasiyasının (ATAA) üzvüdür.
              </p>
              <p>
                Aviabilet axtarışında yüzlərlə aviaşirkətin təkliflərini müqayisə edir, otel bron xidməti ilə dünyanın istənilən
                nöqtəsində büdcənizə uyğun seçimlər təqdim edirik. Hazır tur paketlərimiz Dubay, Türkiyə, Gürcüstan və digər
                populyar istiqamətləri əhatə edir.
              </p>
              <p>
                Labpoint loyallıq proqramı ilə hər bron zamanı bonus xallar qazanır və növbəti səyahətinizdə istifadə edə
                bilərsiniz.
              </p>
            </div>
          )}
          {(name === "visa" || name === "corporate" || name === "services") && (
            <form onSubmit={lead} className="card mt-10 grid max-w-2xl gap-3 p-6">
              <h3 className="text-2xl font-bold">{name === "visa" ? "Viza müraciəti" : "Konsultasiya sifarişi"}</h3>
              <input name="name" required className="field" placeholder={t("forms.name")} />
              <input name="email" type="email" required className="field" placeholder={t("forms.email")} />
              <input name="phone" className="field" placeholder={t("forms.phone")} />
              <textarea name="message" required className="field" placeholder={t("forms.message")} />
              <Status message={status} />
              <button className="btn btn-green" type="submit">{t("common.submit")}</button>
            </form>
          )}
          <div className="mt-10">
            <Link href={name === "labpoint" ? "/account" : "/contact"} className="btn btn-green">
              {name === "labpoint" ? t("nav.account") : t("nav.contact")} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function GiftCardPage() {
  const t = useTranslations();
  const [status, setStatus] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      await api("contact", {
        method: "POST",
        body: JSON.stringify({ ...data, subject: "Gift card request", source: "hediyye-karti" }),
      });
      form.reset();
      setStatus(t("common.success"));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t("common.error"));
    }
  }
  return (
    <>
      <PageHero title={t("pages.gift.title")} body={t("pages.gift.body")} image={images.gift} />
      <section className="section">
        <div className="shell grid gap-10 md:grid-cols-2">
          <div>
            <p className="section-label">Labpoint</p>
            <h2 className="section-title">Hədiyyə kartı sifarişi</h2>
            <p className="muted mt-5 leading-7">
              Demo rejim: müraciətiniz Contact API-yə yazılır. Real ödəniş inteqrasiyası yoxdur.
            </p>
            <Link href="/labpoint" className="btn btn-outline-green mt-6">Labpoint haqqında</Link>
          </div>
          <form onSubmit={submit} className="card grid gap-3 p-6">
            <input name="name" required className="field" placeholder={t("forms.name")} />
            <input name="email" type="email" required className="field" placeholder={t("forms.email")} />
            <input name="phone" className="field" placeholder={t("forms.phone")} />
            <textarea name="message" required className="field" placeholder="Məbləğ və alıcı məlumatı" />
            <Status message={status} />
            <button className="btn btn-green" type="submit">Kart yarat</button>
          </form>
        </div>
      </section>
    </>
  );
}

function BlogPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const posts = [
    { title: "Labpoint necə işləyir?", href: "/blog/labpoint-nece-isleyir", tag: "news", image: images.labpoint },
    { title: "Viza üçün əsas sənədlər", href: "/blog/viza-senedleri", tag: "news", image: images.visa },
    { title: "Qış turu ideyaları", href: "/blog/qis-turu-ideyalari", tag: "guides", image: images.tours },
    { title: "Travellab Qarabağda", href: "/about", tag: "events", image: images.about },
    { title: "Tədbir və konsert turları", href: "/events", tag: "events", image: images.hero },
    { title: "Shop yenilikləri", href: "/shop", tag: "news", image: images.shop },
  ].filter((p) => !category || category === "news" || category === "events" || p.tag === category);

  return (
    <>
      <PageHero title={t("pages.blog.title")} body={t("pages.blog.body")} image={images.blog} />
      <section className="section">
        <div className="shell">
          <div className="mb-6 flex flex-wrap gap-2">
            <Link href="/blog" className="btn btn-soft !min-h-9">Hamısı</Link>
            <Link href="/blog?category=news" className="btn btn-soft !min-h-9">Xəbərlər</Link>
            <Link href="/blog?category=events" className="btn btn-soft !min-h-9">Tədbirlər</Link>
          </div>
          <div className="grid-3">
            {posts.map((p) => (
              <Link key={p.title} href={p.href} className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.title} className="h-44 w-full object-cover" />
                <div className="p-5">
                  <p className="section-label">{p.tag}</p>
                  <h3 className="mt-2 text-xl font-bold">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const t = useTranslations();
  return (
    <>
      <PageHero title={t(`pages.${kind}.title`)} body={t(`pages.${kind}.body`)} image={images[kind]} />
      <section className="section">
        <div className="shell prose max-w-3xl">
          <p className="muted leading-8">
            {kind === "privacy"
              ? "Travellab müştəri məlumatlarını yalnız xidmət göstərmək və əlaqə saxlamaq üçün istifadə edir. Məlumatlar üçüncü tərəflərə satılmır. Demo platformada məlumatlar lokal bazada saxlanılır."
              : "Bron və ödənişlər demo rejimindədir. Real aviabilet/otel API və ödəniş inteqrasiyası olmadan sifarişlər DemoPayment ilə təsdiqlənir. Xidmətdən istifadə etməklə bu şərtləri qəbul etmiş sayılırsınız."}
          </p>
          <Link href="/contact" className="btn btn-green mt-8">Əlaqə</Link>
        </div>
      </section>
    </>
  );
}

function ReviewsPage() {
  const t = useTranslations();
  const fallbackReviews = [
    { author_name: "Leyla M.", body: "Peşəkar komanda, operativ dəstək və sərfəli tur paketləri. Maldiv turumuz mükəmməl keçdi.", rating: 5 },
    { author_name: "John Carter", body: "Best agency in Baku for flights and hotels. Transparent pricing.", rating: 5 },
    { author_name: "Анна К.", body: "Отличный сервис и внимательная команда Travellab. Рекомендую!", rating: 5 },
    { author_name: "Rəşad", body: "Viza və otel bronu eyni gündə həll olundu. Labpoint bonusları da əlavə edildi.", rating: 5 },
    { author_name: "Nigar", body: "Shop-dan aldığım travel aksessuarlar keyfiyyətlidir, çatdırılma tez oldu.", rating: 4 },
    { author_name: "Emil", body: "Qrup turları üçün əla təşkilat. Təlimatçılar peşəkar idi.", rating: 5 },
  ];
  const [reviews, setReviews] = useState<{ author_name?: string; body?: string; rating?: number; created_at?: string }[]>(fallbackReviews);
  const [status, setStatus] = useState("");
  const [formStatus, setFormStatus] = useState("");

  useEffect(() => {
    api("reviews")
      .then((x) => {
        const list = rows(x as { author_name?: string; body?: string; rating?: number }[]);
        if (list.length) setReviews(list);
      })
      .catch(() => setReviews(fallbackReviews));
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setFormStatus("");
    try {
      await api("reviews", {
        method: "POST",
        body: JSON.stringify({
          author_name: String(data.name || "Qonaq"),
          body: String(data.body || ""),
          rating: Number(data.rating || 5),
        }),
      });
      setFormStatus(t("common.success"));
      form.reset();
      const refreshed = await api("reviews");
      setReviews(rows(refreshed as { author_name?: string; body?: string; rating?: number }[]));
    } catch (err) {
      setFormStatus(err instanceof Error ? err.message : t("common.error"));
      setStatus("Demo: rəy lokal siyahıya əlavə olundu.");
      setReviews((prev) => [
        { author_name: String(data.name || "Qonaq"), body: String(data.body || ""), rating: Number(data.rating || 5) },
        ...prev,
      ]);
    }
  }

  return (
    <>
      <PageHero title="Müştəri rəyləri" body="Travellab ilə səyahət edən müştərilərin real təcrübələri." image={images.account} />
      <section className="section">
        <div className="shell">
          <Status message={status || formStatus} />
          <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((r, i) => (
                <article key={i} className="card p-5">
                  <div className="text-[var(--tl-orange)]">{"★".repeat(r.rating || 5)}</div>
                  <p className="mt-3 leading-7 text-[var(--tl-ink)]">“{r.body}”</p>
                  <p className="mt-4 text-sm font-semibold text-[var(--tl-muted)]">— {r.author_name}</p>
                </article>
              ))}
            </div>
            <form onSubmit={submit} className="card h-fit space-y-3 p-6">
              <h3 className="text-xl font-bold">Rəy yazın</h3>
              <input name="name" required className="field" placeholder="Adınız" />
              <select name="rating" className="field" defaultValue="5">
                <option value="5">5 ulduz</option>
                <option value="4">4 ulduz</option>
                <option value="3">3 ulduz</option>
              </select>
              <textarea name="body" required rows={5} className="field" placeholder="Təcrübənizi yazın..." />
              <button type="submit" className="btn btn-green w-full">Göndər</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export function RoutePage({ parts }: { parts: string[] }) {
  const raw = parts[0] || "";
  const second = parts[1];
  const alias: Record<string, string> = {
    search: "flights",
    aviabilet: "flights",
    ucuslar: "flight-routes",
    viza: "visa",
    korporativ: "corporate",
    "hediyye-karti": "gift",
    "gift-card": "gift",
    mexfilik: "privacy",
    "mexfilik-siyaseti": "privacy",
    sertler: "terms",
    "sertler-ve-qaydalar": "terms",
    news: "blog",
    sebet: "shop",
    cart: "shop",
    reyler: "reviews",
    reviews: "reviews",
    tedbirler: "events",
    endirimler: "deals",
    deals: "deals",
    transfer: "transfer",
    transfers: "transfer",
    sigorta: "insurance",
    insurance: "insurance",
    faq: "faq",
    suallar: "faq",
    cookies: "cookies",
    "cookies-policy": "cookies",
    sifarisler: "orders",
    orders: "orders",
    bookings: "orders",
    favorites: "favorites",
    sevimliler: "favorites",
    xidmetler: "services",
    elaqe: "contact",
    haqqimizda: "about",
    login: "auth-login",
    register: "auth-register",
    profile: "account",
  };
  const first = alias[raw] || raw;

  if (first === "flights") return <FlightsPage />;
  if (first === "flight-routes" && second) return <FlightRoutePage slug={second} />;
  if (first === "flight-routes") return <FlightRoutesIndexPage />;
  if (first === "hotels" && second) return <DetailPage kind="hotels" slug={second} />;
  if (first === "hotels" || first === "otel") return <CatalogPage kind="hotels" />;
  if (first === "tours" && second) return <DetailPage kind="tours" slug={second} />;
  if (first === "tours" || first === "turlar") return <CatalogPage kind="tours" />;
  if (first === "shop" && second) {
    if (SHOP_CATEGORY_SLUGS[second]) return <ShopCategoryPage category={second} />;
    return <DetailPage kind="shop" slug={second} />;
  }
  if (first === "shop") return <CatalogPage kind="shop" />;
  if (first === "contact") return <ContactPage />;
  if (first === "auth-login") return <AuthPage mode="login" />;
  if (first === "auth-register") return <AuthPage mode="register" />;
  if (first === "auth" && (second === "login" || second === "register")) return <AuthPage mode={second} />;
  if (first === "account") return <AccountPage />;
  if (first === "orders") return <OrdersPage />;
  if (first === "favorites") return <FavoritesPage />;
  if (first === "admin-panel") return <AdminPage />;
  if (first === "gift") return <GiftCardPage />;
  if (first === "blog" && second) return <BlogArticlePage slug={second} />;
  if (first === "blog") return <BlogPage />;
  if (first === "reviews") return <ReviewsPage />;
  if (first === "deals") return <DealsPage />;
  if (first === "events") return <EventsPage />;
  if (first === "transfer") return <TransferPage />;
  if (first === "insurance") return <InsurancePage />;
  if (first === "faq") return <FaqPage />;
  if (first === "cookies") return <CookiesPage />;
  if (first === "privacy" || first === "terms") return <LegalPage kind={first} />;
  if (first === "visa" && second) return <VisaCountryPage slug={second} />;
  if (first === "visa") return <VisaHubPage />;
  if (first === "services") return <ServicesHubPage />;
  if (first === "premium" || first === "innovations") return <PremiumHubPage />;
  if (first === "ai-planner" || first === "ai-travel-planner") return <AiPlannerPage />;
  if (first === "map" || first === "world-map" || first === "kesf") return <WorldMapPage />;
  if (first === "budget" || first === "budce") return <BudgetPage />;
  if (first === "compare" || first === "muqayise") return <ComparePage />;
  if (first === "360" || first === "venues-360") return <Venue360Page />;
  if (first === "dashboard" || first === "smart-dashboard") return <DashboardPage />;
  if (first === "my-trip" || first === "mytrip") return <MyTripPage />;
  if (first === "smart-deals" || first === "smart-deal") return <SmartDealsPage />;
  if (first === "assistant" || first === "ai-assistant") return <AssistantPage />;
  if (first === "wishlist") return <WishlistPage />;
  if (["labpoint", "corporate", "about"].includes(first)) {
    return <StaticPage name={first as "labpoint" | "corporate" | "about"} />;
  }
  return (
    <div className="shell min-h-[50vh] py-24">
      <h1 className="text-4xl font-extrabold">Səhifə tapılmadı</h1>
      <Link href="/" className="btn btn-green mt-6">Ana səhifə</Link>
    </div>
  );
}
