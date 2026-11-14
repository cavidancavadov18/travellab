"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/store";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { FeatureLogo, OfficialLogo } from "@/components/brand-marks";
import { ThemeToggle } from "@/components/theme";
import { buildFlightSearchCode } from "@/components/travelpayouts-flights";

const mainNav = [
  ["flights", "/flights"],
  ["hotels", "/hotels"],
  ["tours", "/tours"],
  ["labpoint", "/labpoint"],
  ["visa", "/visa"],
] as const;

export function Logo({ variant = "default" }: { variant?: "default" | "light" | "mark" }) {
  return <OfficialLogo variant={variant} />;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("travellab-cookies")) setVisible(true);
  }, []);
  if (!visible) return null;
  return (
    <div className="cookie-banner">
      <p>
        Sayt cookie-lərdən istifadə edir.{" "}
        <Link href="/cookies" className="underline">
          Cookies Policy
        </Link>
      </p>
      <button
        type="button"
        className="btn btn-green !min-h-9"
        onClick={() => {
          localStorage.setItem("travellab-cookies", "1");
          setVisible(false);
        }}
      >
        Accept
      </button>
    </div>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { requireAuth } = useAuthStore();
  const [items, setItems] = useState<{ id?: number; product?: { name?: string; price?: string }; quantity?: number }[]>([]);
  const [subtotal, setSubtotal] = useState("0");
  const [status, setStatus] = useState("");

  function applyCart(cart: { items?: typeof items; subtotal?: string }) {
    setItems(cart.items || []);
    setSubtotal(String(cart.subtotal || "0"));
  }

  useEffect(() => {
    if (!open) return;
    if (!requireAuth()) {
      setItems([]);
      setSubtotal("0");
      setStatus("Səbəti görmək üçün daxil olun");
      return;
    }
    api<{ items?: typeof items; subtotal?: string }>("shop/cart")
      .then((cart) => {
        applyCart(cart);
        setStatus("");
      })
      .catch(() => {
        setItems([]);
        setStatus("Səbət yüklənmədi");
      });
  }, [open, requireAuth]);

  async function updateQty(itemId: number, quantity: number) {
    try {
      const cart = await api<{ items?: typeof items; subtotal?: string }>("shop/cart", {
        method: "PATCH",
        body: JSON.stringify({ item_id: itemId, quantity }),
      });
      applyCart(cart);
      setStatus("");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Xəta");
    }
  }

  async function checkout() {
    if (!requireAuth()) {
      onClose();
      router.push("/auth/login");
      return;
    }
    try {
      const order = await api<{ reference?: string }>("shop/checkout", {
        method: "POST",
        body: JSON.stringify({ shipping_address: "Bakı, Azərbaycan (Demo)" }),
      });
      setStatus(`Demo ödəniş uğurlu. Sifariş: ${order.reference || "—"}`);
      setItems([]);
      setSubtotal("0");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Xəta");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close overlay"
            className="fixed inset-0 z-[60] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-extrabold">Səbət</h3>
              <button type="button" className="btn btn-soft !min-h-9 !px-3" onClick={onClose}>
                Bağla
              </button>
            </div>
            <div className="mt-6 flex-1 space-y-3 overflow-auto">
              {!items.length && <p className="muted">Səbətiniz boşdur.</p>}
              {items.map((it) => (
                <div key={String(it.id)} className="rounded-xl border border-[var(--tl-line)] p-3">
                  <p className="font-semibold">{it.product?.name || "Məhsul"}</p>
                  <p className="text-sm text-[var(--tl-muted)]">{it.product?.price || "—"} AZN</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" className="btn btn-soft !min-h-8 !px-3" onClick={() => updateQty(Number(it.id), Math.max(0, (it.quantity || 1) - 1))}>
                      −
                    </button>
                    <span className="min-w-8 text-center font-semibold">{it.quantity || 1}</span>
                    <button type="button" className="btn btn-soft !min-h-8 !px-3" onClick={() => updateQty(Number(it.id), (it.quantity || 1) + 1)}>
                      +
                    </button>
                    <button type="button" className="btn btn-ghost !min-h-8 !px-3 ml-auto" onClick={() => updateQty(Number(it.id), 0)}>
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {status && <p className="notice mt-4">{status}</p>}
            <div className="mt-4 border-t border-[var(--tl-line)] pt-4">
              <p className="mb-3 font-bold">Cəmi: {subtotal} AZN</p>
              <button type="button" className="btn btn-green w-full" disabled={!items.length} onClick={checkout}>
                Demo sifarişi tamamla
              </button>
              <Link href="/shop" className="btn btn-soft mt-3 w-full" onClick={onClose}>
                Alış-verişə davam et
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [currency, setCurrency] = useState("AZN");
  const { token, user, hydrated, loadUser, logout } = useAuthStore();
  const loggedIn = Boolean(token || user);

  useEffect(() => {
    if (hydrated && token && !user) void loadUser();
  }, [hydrated, token, user, loadUser]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("travellab-currency") : null;
    if (saved) setCurrency(saved);
  }, []);

  return (
    <header className="tl-header">
      <div className="shell tl-header-inner">
        <Logo />
        <nav className="tl-nav">
          {mainNav.map(([key, href]) => (
            <Link key={key} href={href} className={pathname.startsWith(href) || (key === "visa" && pathname.startsWith("/viza")) ? "active" : ""}>
              {t(key)}
              {key === "labpoint" ? <span className="nav-count-badge">8</span> : null}
            </Link>
          ))}
        </nav>
        <div className="tl-actions">
          <Link href="/premium" className="btn btn-soft hide-sm">
            Premium
          </Link>
          <Link href="/shop" className="btn btn-outline-green hide-sm">
            {t("shop")}
          </Link>
          <Link href="/corporate" className="btn btn-green hide-sm">
            {t("corporate")}
          </Link>
          <button type="button" className="btn btn-ghost" aria-label="Səbət" onClick={() => setCartOpen(true)}>
            🛒
          </button>
          <ThemeToggle />
          <select
            aria-label="Currency"
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              localStorage.setItem("travellab-currency", e.target.value);
            }}
            className="field !min-h-9 !w-auto !rounded-full !px-3 text-sm font-bold"
          >
            <option value="AZN">AZN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <select
            aria-label="Language"
            value={locale}
            onChange={(e) => router.replace(pathname, { locale: e.target.value as "az" | "en" | "ru" })}
            className="field !min-h-9 !w-auto !rounded-full !px-3 text-sm font-bold"
          >
            <option value="az">AZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
          {loggedIn ? (
            <>
              <Link href="/account" className="btn btn-ghost hide-sm">
                {user?.first_name || t("account")}
              </Link>
              <button
                type="button"
                className="btn btn-register"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost hide-sm">
                {t("login")}
              </Link>
              <Link href="/auth/register" className="btn btn-register">
                {t("register")}
              </Link>
            </>
          )}
          <button className="btn btn-soft lg:!hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--tl-line)] bg-white lg:hidden"
          >
            <div className="shell grid gap-2 py-4">
              <div className="mb-1 px-1">
                <Logo />
              </div>
              {[...mainNav, ["shop", "/shop"] as const, ["corporate", "/corporate"] as const, ["account", "/account"] as const, ["gift", "/hediyye-karti"] as const].map(
                ([key, href]) => (
                  <Link key={key} href={href} className="rounded-xl px-3 py-3 hover:bg-[#f2f4f7]" onClick={() => setOpen(false)}>
                    {key === "gift" ? "Hədiyyə Kartı" : t(key as "flights")}
                  </Link>
                ),
              )}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--tl-line)] pt-3">
                {(
                  [
                    ["ai-planner", "AI Planner"],
                    ["labpoint", "Labpoint"],
                    ["my-trip", "My Trip"],
                    ["smart-deals", "Smart Deals"],
                  ] as const
                ).map(([id, label]) => (
                  <Link
                    key={id}
                    href={id === "labpoint" ? "/labpoint" : `/${id}`}
                    className="tl-feature-mobile-item"
                    onClick={() => setOpen(false)}
                  >
                    <FeatureLogo id={id} size={32} animated={false} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

const FOOTER_SHOTS = [
  { src: "/images/destinations/maldives.jpg", label: "Maldives" },
  { src: "/images/destinations/istanbul.jpg", label: "İstanbul" },
  { src: "/images/destinations/dubai.jpg", label: "Dubai" },
  { src: "/images/destinations/paris.jpg", label: "Paris" },
  { src: "/images/destinations/bali.jpg", label: "Bali" },
] as const;

function FooterTravelShot() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % FOOTER_SHOTS.length), 3800);
    return () => window.clearInterval(id);
  }, []);
  const shot = FOOTER_SHOTS[index];
  return (
    <div className="tl-footer-shot" aria-hidden={false}>
      <div className="tl-footer-shot-frame">
        <AnimatePresence initial={false}>
          <motion.img
            key={shot.src}
            src={shot.src}
            alt={shot.label}
            className="tl-footer-shot-img"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
        <span className="tl-footer-shot-label">{shot.label}</span>
      </div>
    </div>
  );
}

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="tl-footer">
      <div className="shell tl-footer-inner">
        <div className="tl-footer-top">
          <div className="tl-footer-brand">
            <Logo />
            <p className="tl-footer-tagline">{t("footer.tagline")}</p>
            <div className="tl-footer-trust">
              <div className="tl-footer-membership">
                <span className="tl-footer-membership-label">Üzvüyük:</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/partners/aztaa-logo.jpeg"
                  alt="Azərbaycan Turizm Agentlikləri Assosiasiyası"
                  className="tl-footer-membership-logo"
                />
              </div>
              <a
                href="https://www.google.com/search?q=travellab+az#lrd=0x6ddb39431b5ebc71:0x4fae5a1248077495,1,,,,"
                target="_blank"
                rel="noreferrer"
                className="tl-footer-rating"
                aria-label="Google 5.0"
              >
                <span className="tl-footer-rating-inner" aria-hidden>
                  <svg className="tl-footer-g" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="tl-footer-rating-score">5.0</span>
                  <span className="tl-footer-rating-stars">★★★★★</span>
                </span>
              </a>
            </div>
          </div>

          <div className="tl-footer-cols">
            <div className="tl-footer-col">
              <div className="tl-footer-col-title">{t("footer.company")}</div>
              <Link href="/about">{t("nav.about")}</Link>
              <Link href="/blog?category=news">{t("footer.news")}</Link>
              <Link href="/blog">{t("footer.blog")}</Link>
              <Link href="/hediyye-karti">{t("footer.gift")}</Link>
            </div>
            <div className="tl-footer-col">
              <div className="tl-footer-col-title">{t("footer.account")}</div>
              <Link href="/auth/login">{t("nav.login")}</Link>
              <Link href="/auth/register">{t("nav.register")}</Link>
            </div>
            <div className="tl-footer-col">
              <div className="tl-footer-col-title">{t("footer.legal")}</div>
              <Link href="/privacy">{t("footer.privacy")}</Link>
              <Link href="/terms">{t("footer.terms")}</Link>
              <Link href="/contact">{t("nav.contact")}</Link>
            </div>
          </div>

          <FooterTravelShot />
        </div>

        <div className="tl-footer-contact">
          <div>
            <div className="tl-footer-contact-label">Mail ünvanı</div>
            <div className="tl-footer-contact-value">
              <a href="mailto:info@travellab.az">info@travellab.az</a>
            </div>
          </div>
          <div>
            <div className="tl-footer-contact-label">Ünvan</div>
            <div className="tl-footer-contact-value">{t("footer.office")}</div>
          </div>
          <div>
            <div className="tl-footer-contact-label">Sosial şəbəkələr</div>
            <div className="tl-footer-social">
              <a href="https://www.facebook.com/travellab.az/" target="_blank" rel="noreferrer" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.1 15.95 2 14.66 2 11.98 2 10 3.66 10 6.7v2.8H7v4h3V22h4v-8.5z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/travellab-azerbaijan/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M6.94 5a2 2 0 1 1-4-.001 2 2 0 0 1 4 0zM3.4 8.75h3.1V21H3.4V8.75zm6.2 0h2.97v1.68h.04c.41-.78 1.43-1.6 2.94-1.6 3.14 0 3.72 2.07 3.72 4.76V21h-3.1v-5.44c0-1.3-.02-2.97-1.81-2.97-1.82 0-2.1 1.42-2.1 2.88V21H9.6V8.75z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/travellab.az/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@travellab.az" target="_blank" rel="noreferrer" aria-label="TikTok">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M16.5 4c.4 1.8 1.7 3.2 3.5 3.6v2.4c-1.3-.1-2.5-.5-3.5-1.2v5.5c0 3.2-2.6 5.7-5.8 5.7S5 17.5 5 14.3s2.6-5.7 5.7-5.7c.3 0 .6 0 .9.1v2.6a3.2 3.2 0 0 0-.9-.1 3.2 3.2 0 1 0 3.2 3.2V4h2.6z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="tl-footer-waves" aria-hidden>
          <div className="tl-fw-row">
            <span className="tl-fw-sun" />
            <span className="tl-fw-wave" />
            <span className="tl-fw-path" />
            <span className="tl-fw-sun tl-fw-sun-2" />
            <span className="tl-fw-wave tl-fw-wave-2" />
            <span className="tl-fw-path tl-fw-path-2" />
          </div>
        </div>

        <div className="tl-footer-bottom">
          <span>© {new Date().getFullYear()} Travellab. {t("footer.rights")}</span>
          <span>Az · Bakı, Azərbaycan</span>
        </div>
      </div>
    </footer>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function PageHero({ title, body, image }: { title: string; body: string; image: string }) {
  return (
    <section className="page-hero" style={{ "--hero": `url(${image})` } as React.CSSProperties}>
      <div className="shell">
        <p className="section-label !text-white/80">Travellab</p>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
    </section>
  );
}

export type Item = {
  id?: number | string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  short_description?: string;
  summary?: string;
  image?: string;
  image_url?: string;
  cover_image?: string;
  price?: number | string;
  price_from?: number | string;
  location?: string;
  city?: string;
  destination_name?: string;
  currency?: string;
  airline?: string;
  origin?: string;
  destination?: string;
  total?: string | number;
  labpoint_earn?: string | number;
  duration_days?: number;
  duration_nights?: number;
  category?: string;
};

const fallbackImage = "/images/hero/mosque.jpg";

export function ItemCard({
  item,
  kind,
  onBook,
  onFavorite,
}: {
  item: Item;
  kind: "tour" | "hotel" | "product";
  onBook?: (i: Item) => void;
  onFavorite?: (i: Item) => void;
}) {
  const t = useTranslations("common");
  const href =
    kind === "tour" ? `/tours/${item.slug || item.id}` : kind === "product" ? `/shop/${item.slug || item.id}` : `/hotels/${item.slug || item.id}`;
  const price = item.price_from || item.price || "—";
  const currency = item.currency || (kind === "product" ? "AZN" : "USD");
  const img = item.cover_image || item.image_url || item.image || fallbackImage;

  if (kind === "tour") {
    return (
      <motion.article
        className="tour-card tour-card-3d"
        whileHover={{ y: -8, rotateX: 2, rotateY: -2, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        style={{ transformStyle: "preserve-3d", perspective: 900 }}
      >
        <div className="tour-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={item.title || ""} />
          {item.labpoint_earn != null && <span className="badge-lp">+{item.labpoint_earn} Lab Point</span>}
          {onFavorite && (
            <button className="fav-btn" type="button" onClick={() => onFavorite(item)} aria-label={t("favorite")}>
              ♡
            </button>
          )}
          <span className="badge-price">
            {price}
            {currency === "USD" ? "$" : ` ${currency}`} -dan
          </span>
        </div>
        <div className="tour-body">
          <h3>{item.title || item.name}</h3>
          <p className="meta">
            {item.short_description || item.summary || item.description ||
              `${item.duration_nights || 4} gecə ${item.duration_days || 5} gün · ${item.destination_name || item.location || ""}`}
          </p>
          <div className="tour-price">
            {currency === "USD" ? "$" : ""}
            {price}
            {currency !== "USD" ? ` ${currency}` : ""}
          </div>
          <div className="tour-actions">
            <Link href={href} className="btn btn-detail">
              {t("details")}
            </Link>
            <a href="tel:+994125550505" className="btn btn-call">
              {t("call")}
            </a>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article whileHover={{ y: -3 }} className="card group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="card-image" src={img} alt={item.title || item.name || ""} />
      <div className="card-body">
        <p className="soft text-xs uppercase tracking-wide">{item.location || item.destination_name || kind}</p>
        <h3 className="mt-1 text-lg font-bold">{item.title || item.name}</h3>
        <p className="muted mt-2 line-clamp-2 text-sm">{item.short_description || item.summary || item.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <strong className="text-[var(--tl-green)]">
            {price} {currency}
          </strong>
          <div className="flex gap-2">
            <Link href={href} className="btn btn-soft !min-h-9 !px-3 text-xs">
              {t("details")}
            </Link>
            {onBook && (
              <button type="button" onClick={() => onBook(item)} className="btn btn-green !min-h-9 !px-3 text-xs">
                {t("book")}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function Status({ message, error = false }: { message: string; error?: boolean }) {
  return message ? <div role="status" className="notice" style={error ? { borderColor: "#f04438" } : undefined}>{message}</div> : null;
}

export function SearchWidget({ embedded = false, homeMode = false }: { embedded?: boolean; homeMode?: boolean }) {
  const t = useTranslations();
  const router = useRouter();
  const [tab, setTab] = useState<"flights" | "hotels" | "tours">("flights");
  const [multiCity, setMultiCity] = useState(false);
  const activeTab = homeMode ? "flights" : tab;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = new URLSearchParams();
    const cityCode: Record<string, string> = {
      bakı: "GYD",
      baku: "GYD",
      "bakı, azərbaycan": "GYD",
      "baku, azerbaijan": "GYD",
      istanbul: "IST",
      "istanbul, türkiyə": "IST",
      "istanbul, turkey": "IST",
      dubai: "DXB",
      "dubai, uae": "DXB",
      tbilisi: "TBS",
      "tbilisi, gürcüstan": "TBS",
    };
    const resolved: Record<string, string> = {};
    data.forEach((v, k) => {
      let val = String(v).trim();
      if (activeTab === "flights" && (k === "origin" || k === "destination")) {
        const mapped = cityCode[val.toLowerCase()];
        if (mapped) val = mapped;
        else if (val.length > 3 && !/^[A-Za-z]{3}$/.test(val)) {
          const token = val.split(/[,\s]/)[0]?.toLowerCase() || "";
          val = cityCode[token] || val.slice(0, 3).toUpperCase();
        } else val = val.toUpperCase();
      }
      if (k === "passengers") {
        const n = parseInt(val.replace(/[^\d]/g, ""), 10);
        val = String(Number.isFinite(n) && n > 0 ? n : 1);
      }
      resolved[k] = val;
      q.set(k, val);
    });
    if (activeTab === "flights") {
      const code = buildFlightSearchCode({
        origin: resolved.origin || "GYD",
        destination: resolved.destination || "IST",
        departDate: resolved.depart_date || "",
        returnDate: resolved.return_date || null,
        adults: Number(resolved.passengers || 1),
      });
      if (code) {
        router.push(`/search?flightSearch=${code}`);
        return;
      }
      router.push(`/search?${q.toString()}`);
      return;
    }
    if (multiCity) q.set("multi", "1");
    router.push(`/${activeTab}?${q.toString()}`);
  }

  const form = (
    <>
      <form className="search-grid" onSubmit={submit}>
        <div>
          <label className="search-label">{activeTab === "flights" ? t("forms.origin") : t("forms.query")}</label>
          <input
            name={activeTab === "flights" ? "origin" : "q"}
            required
            className="field"
            defaultValue={activeTab === "flights" ? "Bakı, Azərbaycan" : ""}
            placeholder={activeTab === "flights" ? "Bakı, Azərbaycan" : t("forms.query")}
          />
        </div>
        <div>
          <label className="search-label">{t("forms.destination")}</label>
          <input
            name={activeTab === "flights" ? "destination" : "location"}
            required
            className="field"
            defaultValue={activeTab === "flights" ? "İstanbul, Türkiyə" : ""}
            placeholder={t("forms.destination")}
          />
        </div>
        <div>
          <label className="search-label">{t("forms.depart")}</label>
          <input name={activeTab === "flights" ? "depart_date" : "date"} type="date" required className="field" />
        </div>
        <div>
          <label className="search-label">{activeTab === "flights" ? t("forms.return") : t("forms.guests")}</label>
          <input
            name={activeTab === "flights" ? "return_date" : "guests"}
            type={activeTab === "flights" ? "date" : "number"}
            className="field"
            defaultValue={activeTab === "flights" ? undefined : 2}
          />
        </div>
        <div>
          <label className="search-label">{t("forms.passengers")}</label>
          <input name="passengers" type="text" className="field" defaultValue="1 sərnişin, ekonom" />
        </div>
        <button className="search-btn" type="submit">
          {activeTab === "flights" ? t("common.searchFlights") : t("common.search")}
        </button>
      </form>
      {activeTab === "flights" && (
        <>
          <button type="button" className="search-link" onClick={() => setMultiCity((v) => !v)}>
            {multiCity ? "Sadə axtarış" : t("common.multiCity")}
          </button>
          {multiCity && (
            <div className="mt-3 grid gap-3 rounded-2xl border border-[var(--tl-line)] bg-[#f8faf9] p-3 md:grid-cols-3">
              <input name="leg2_origin" form="" className="field" defaultValue="IST" placeholder="2-ci: çıxış" />
              <input name="leg2_destination" form="" className="field" defaultValue="DXB" placeholder="2-ci: təyinat" />
              <input name="leg2_date" form="" type="date" className="field" />
              <p className="muted text-sm md:col-span-3">Multi-city demo: axtarış flights səhifəsində birləşdirilmiş nəticə kimi açılır.</p>
            </div>
          )}
        </>
      )}
    </>
  );

  if (embedded) {
    if (homeMode) {
      return <div className="search-widget-premium">{form}</div>;
    }
    return (
      <div className="search-widget-premium">
        <div className="mb-4 flex flex-wrap gap-2 search-tabs">
          {(["flights", "hotels", "tours"] as const).map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => setTab(x)}
              className={`search-tab ${tab === x ? "is-active" : ""}`}
            >
              {t(`nav.${x}`)}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
          >
            {form}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return <div className="search-card">{form}</div>;
}
