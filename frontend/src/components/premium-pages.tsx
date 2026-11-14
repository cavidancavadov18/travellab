"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api, rows } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/store";
import { Reveal, Status } from "./site";
import { Link, useRouter } from "@/i18n/navigation";
import {
  CinematicHero,
  FloatingOrbs,
  MotionCard,
  ParallaxStrip,
  PremiumQuickLinks,
  ZoomImage,
} from "./premium-visuals";
import { FeatureLogo } from "./brand-marks";

const PREMIUM = "/images/destinations/maldives.jpg";
const STRIP = [
  "/images/destinations/maldives.jpg",
  "/images/destinations/dubai.jpg",
  "/images/destinations/istanbul.jpg",
  "/images/destinations/paris.jpg",
  "/images/destinations/bali.jpg",
  "/images/destinations/phuket.jpg",
  "/images/destinations/tokyo.jpg",
  "/images/destinations/rome.jpg",
];

function authGate(router: ReturnType<typeof useRouter>) {
  if (!useAuthStore.getState().requireAuth()) {
    router.push("/auth/login");
    return false;
  }
  return true;
}

export function AiPlannerPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setLoading(true);
    setStatus("");
    try {
      const interests = String(data.interests || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      const res = await api<Record<string, unknown>>("premium/plans", {
        method: "POST",
        body: JSON.stringify({
          destination: data.destination,
          origin: data.origin || "Bakı",
          days: Number(data.days || 5),
          budget: Number(data.budget || 1000),
          travelers: Number(data.travelers || 2),
          interests,
          preferences: data.preferences || "",
        }),
      });
      setPlan(res);
      setStatus("AI plan yaradıldı və database-ə yazıldı (demo AI).");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Xəta");
    } finally {
      setLoading(false);
    }
  }

  async function saveToTrip() {
    if (!plan || !authGate(router)) return;
    try {
      const trip = await api<{ id: number }>("premium/trips", {
        method: "POST",
        body: JSON.stringify({
          title: plan.title,
          destination: plan.destination,
          status: "planned",
          budget: plan.estimated_total || plan.budget,
          currency: plan.currency || "USD",
          notes: "AI Travel Planner-dan yaradılıb",
          cover_image: PREMIUM,
        }),
      });
      const days = (plan.itinerary as { day: number; title: string; estimated_cost?: number }[]) || [];
      for (const d of days) {
        await api(`premium/trips/${trip.id}/items`, {
          method: "POST",
          body: JSON.stringify({ kind: "activity", title: d.title, day_number: d.day, cost: d.estimated_cost || 0 }),
        });
      }
      setStatus("My Trip-ə əlavə olundu.");
      router.push("/my-trip");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Xəta");
    }
  }

  const itinerary = (plan?.itinerary as { day: number; title: string; focus?: string; activities?: string[]; estimated_cost?: number }[]) || [];

  return (
    <>
      <CinematicHero
        theme="planner"
        title="AI Travel Planner"
        body="Fərdi səyahət planı — maraqlarınıza və büdcənizə uyğun cinematic demo AI generator."
        badge="AI · Live itinerary"
        actions={<PremiumQuickLinks />}
      />
      <ParallaxStrip images={STRIP} />
      <section className="section premium-stage">
        <FloatingOrbs />
        <div className="shell grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <motion.form onSubmit={submit} className="premium-panel glass-lift space-y-3" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="section-label">Demo AI</p>
            <h2 className="text-2xl font-bold">Plan yarat</h2>
            <input name="origin" className="field" defaultValue="Bakı" placeholder="Çıxış" />
            <input name="destination" required className="field" placeholder="Təyinat (məs. Maldiv)" />
            <div className="grid grid-cols-3 gap-2">
              <input name="days" type="number" min={2} max={14} defaultValue={5} className="field" />
              <input name="travelers" type="number" min={1} defaultValue={2} className="field" />
              <input name="budget" type="number" min={100} defaultValue={1200} className="field" />
            </div>
            <input name="interests" className="field" defaultValue="mədəniyyət, qastronomiya, foto" placeholder="Maraqlar" />
            <textarea name="preferences" className="field" rows={3} placeholder="Əlavə istəklər" />
            <Status message={status} />
            <button className="btn btn-green w-full" disabled={loading}>{loading ? "Hazırlanır…" : "AI plan yarat"}</button>
          </motion.form>
          <div>
            {!plan && (
              <MotionCard>
                <div className="premium-empty relative overflow-hidden">
                  <ZoomImage src={PREMIUM} alt="" className="absolute inset-0 !h-full opacity-30" />
                  <p className="relative z-[1]">Plan hələ yoxdur — formu doldurun.</p>
                </div>
              </MotionCard>
            )}
            {plan && (
              <div className="space-y-4">
                <MotionCard>
                  <div className="premium-panel !p-0 overflow-hidden">
                    <ZoomImage src={PREMIUM} alt="" className="h-40" />
                    <div className="p-5">
                      <h3 className="text-2xl font-extrabold">{String(plan.title)}</h3>
                      <p className="muted mt-2">Təxmini: {String(plan.estimated_total)} {String(plan.currency || "USD")} · Demo AI</p>
                      <button type="button" className="btn btn-outline-green mt-4" onClick={saveToTrip}>My Trip-ə köçür</button>
                    </div>
                  </div>
                </MotionCard>
                {itinerary.map((d, i) => (
                  <MotionCard key={d.day} delay={i * 0.05}>
                    <article className="premium-card media-hover">
                      <p className="section-label">Gün {d.day} · {d.focus}</p>
                      <h4 className="mt-1 text-lg font-bold">{d.title}</h4>
                      <ul className="mt-3 space-y-1 text-sm text-[var(--tl-muted)]">
                        {(d.activities || []).map((a) => <li key={a}>• {a}</li>)}
                      </ul>
                      <p className="mt-3 font-semibold text-[var(--tl-green)]">~{d.estimated_cost} USD</p>
                    </article>
                  </MotionCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export function WorldMapPage() {
  const [countries, setCountries] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    api("premium/countries").then((x) => setCountries(rows(x as Record<string, unknown>[]))).catch(() => setCountries([]));
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return countries.filter((c) => !s || `${c.name} ${c.name_az} ${c.region} ${c.capital}`.toLowerCase().includes(s));
  }, [countries, q]);

  return (
    <>
      <CinematicHero theme="map" title="İnteraktiv dünya xəritəsi" body="Ölkələri kəşf edin — cinematic pinlər, parallax və hover zoom ilə premium kəşf." badge="Explore · Live map" />
      <ParallaxStrip images={STRIP} />
      <section className="section premium-stage">
        <FloatingOrbs />
        <div className="shell">
          <input className="field mb-6 max-w-md" placeholder="Ölkə axtar…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
            <div className="map-canvas">
              {filtered.map((c) => {
                const x = ((Number(c.lng) + 180) / 360) * 100;
                const y = ((90 - Number(c.lat)) / 180) * 100;
                return (
                  <button
                    key={String(c.slug)}
                    type="button"
                    className={`map-pin ${selected?.slug === c.slug ? "active" : ""}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => setSelected(c)}
                    title={String(c.name_az || c.name)}
                  />
                );
              })}
              <p className="map-legend">Demo xəritə · lat/lng pinləri database-dən</p>
            </div>
            <div className="space-y-3">
              {filtered.map((c) => (
                <button key={String(c.id)} type="button" className={`premium-card w-full text-left ${selected?.slug === c.slug ? "ring-2 ring-[var(--tl-green)]" : ""}`} onClick={() => setSelected(c)}>
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={String(c.image_url)} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-bold">{String(c.name_az || c.name)}</h3>
                      <p className="text-sm text-[var(--tl-muted)]">{String(c.region)} · {String(c.best_season)}</p>
                      <p className="text-sm font-semibold text-[var(--tl-green)]">~{String(c.avg_flight_price)} USD</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {selected && (
            <div className="premium-panel mt-8 grid gap-6 md:grid-cols-[1fr_280px]">
              <div>
                <h2 className="text-3xl font-extrabold">{String(selected.name_az || selected.name)}</h2>
                <p className="muted mt-3 leading-7">{String(selected.summary)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(selected.highlights as string[] || []).map((h) => <span key={h} className="filter-chip active !cursor-default">{h}</span>)}
                </div>
              </div>
              <div className="space-y-3">
                <Link href={`/ai-planner`} className="btn btn-green w-full">AI plan yarat</Link>
                <Link href={`/tours?search=${encodeURIComponent(String(selected.name_az || selected.name))}`} className="btn btn-outline-green w-full">Turları gör</Link>
                <WishlistButton item={{ kind: "country", title: String(selected.name_az || selected.name), slug: String(selected.slug), image_url: String(selected.image_url), href: `/map` }} />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function BudgetPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await api<Record<string, unknown>>("premium/budgets", {
        method: "POST",
        body: JSON.stringify({
          destination: data.destination,
          days: Number(data.days || 5),
          travelers: Number(data.travelers || 2),
          style: data.style || "comfort",
        }),
      });
      setResult(res);
      setStatus("Büdcə hesablandı və saxlanıldı.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Xəta");
    }
  }

  const breakdown = (result?.breakdown as Record<string, number>) || {};

  return (
    <>
      <CinematicHero theme="budget" title="Səyahət büdcəsi kalkulyatoru" body="Uçuş, otel, yemək və sığorta — canlı vizual breakdown ilə." badge="Finance · Smart estimate" />
      <section className="section premium-stage">
        <FloatingOrbs />
        <div className="shell grid gap-10 md:grid-cols-2">
          <form onSubmit={submit} className="premium-panel space-y-3">
            <input name="destination" required className="field" placeholder="İstiqamət" defaultValue="İstanbul" />
            <div className="grid grid-cols-2 gap-2">
              <input name="days" type="number" min={1} defaultValue={5} className="field" />
              <input name="travelers" type="number" min={1} defaultValue={2} className="field" />
            </div>
            <select name="style" className="field" defaultValue="comfort">
              <option value="budget">Budget</option>
              <option value="comfort">Comfort</option>
              <option value="luxury">Luxury</option>
            </select>
            <Status message={status} />
            <button className="btn btn-green w-full">Hesabla</button>
          </form>
          <div className="premium-panel">
            {!result && <p className="muted">Nəticə burada görünəcək.</p>}
            {result && (
              <>
                <p className="section-label">{String(result.destination)} · {String(result.style)}</p>
                <div className="mt-2 text-5xl font-black text-[var(--tl-green)]">{String(result.total)} {String(result.currency)}</div>
                <p className="muted mt-2">Adam başına ~{breakdown.per_person} USD</p>
                <div className="mt-6 space-y-2">
                  {["flight", "hotel", "food", "activities", "transfer", "insurance"].map((k) => (
                    <div key={k} className="flex justify-between border-b border-[var(--tl-line)] py-2 text-sm">
                      <span className="capitalize">{k}</span>
                      <strong>{breakdown[k]} USD</strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export function ComparePage() {
  const [kind, setKind] = useState<"tour" | "hotel">("tour");
  const [catalog, setCatalog] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [comparison, setComparison] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setSelected([]);
    setComparison(null);
    api(kind === "tour" ? "tours" : "hotels")
      .then((x) => setCatalog(rows(x as Record<string, unknown>[]).slice(0, 12)))
      .catch(() => setCatalog([]));
  }, [kind]);

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id]));
  }

  async function compare() {
    if (selected.length < 2) {
      setStatus("Ən azı 2 element seçin.");
      return;
    }
    try {
      const res = await api<Record<string, unknown>>("premium/comparisons", {
        method: "POST",
        body: JSON.stringify({ object_type: kind, item_ids: selected }),
      });
      setComparison(res);
      setStatus("Müqayisə saxlanıldı.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Xəta");
    }
  }

  const items = (comparison?.items_snapshot as Record<string, unknown>[]) || [];

  return (
    <>
      <CinematicHero theme="compare" title="Tur & Otel müqayisəsi" body="2–4 seçimi cinematic kartlarla müqayisə edin — hover zoom və scroll reveal." badge="Compare · Side by side" />
      <ParallaxStrip images={STRIP} />
      <section className="section premium-stage">
        <div className="shell">
          <div className="filter-chips mb-6">
            <button type="button" className={`filter-chip ${kind === "tour" ? "active" : ""}`} onClick={() => setKind("tour")}>Turlar</button>
            <button type="button" className={`filter-chip ${kind === "hotel" ? "active" : ""}`} onClick={() => setKind("hotel")}>Otellər</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((item) => {
              const id = Number(item.id);
              const active = selected.includes(id);
              return (
                <button key={id} type="button" className={`premium-card media-hover text-left ${active ? "ring-2 ring-[var(--tl-green)]" : ""}`} onClick={() => toggle(id)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={String(item.image_url || item.cover_image || PREMIUM)} alt="" className="mb-3 h-36 w-full rounded-xl object-cover" />
                  <h3 className="font-bold">{String(item.title || item.name)}</h3>
                  <p className="mt-1 text-[var(--tl-green)] font-semibold">{String(item.price || item.price_from)} {String(item.currency || "USD")}</p>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn btn-green" onClick={compare}>Müqayisə et ({selected.length})</button>
            <Status message={status} />
          </div>
          {items.length > 0 && (
            <div className="mt-8 overflow-x-auto">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Xüsusiyyət</th>
                    {items.map((i) => <th key={String(i.id)}>{String(i.title)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {["price", "location", "rating", "nights", "stars"].map((key) => (
                    <tr key={key}>
                      <td className="capitalize font-semibold">{key}</td>
                      {items.map((i) => <td key={`${i.id}-${key}`}>{String(i[key] ?? "—")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function Venue360Page() {
  const [venues, setVenues] = useState<Record<string, unknown>[]>([]);
  const [active, setActive] = useState<Record<string, unknown> | null>(null);
  const [yaw, setYaw] = useState(0);

  useEffect(() => {
    api("premium/venues-360").then((x) => {
      const list = rows(x as Record<string, unknown>[]);
      setVenues(list);
      setActive(list[0] || null);
    }).catch(() => setVenues([]));
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setYaw((y) => (y + 0.4) % 360), 40);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <>
      <CinematicHero theme="venue" title="360° məkan görüntüləri" body="Cinematic panorama panning — soft motion, hotspots və immersive stage." badge="Immersive · 360 demo" />
      <section className="section premium-stage">
        <FloatingOrbs />
        <div className="shell grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
          <div className="pano-stage" style={{ backgroundImage: `url(${String(active?.panorama_url || active?.cover_image || PREMIUM)})`, backgroundPosition: `${yaw % 100}% center` }}>
            <div className="pano-overlay">
              <h2 className="text-2xl font-extrabold">{String(active?.title || "360°")}</h2>
              <p className="text-white/80">{String(active?.location)} · Demo panning</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {((active?.hotspots as { label: string }[]) || []).map((h) => (
                  <span key={h.label} className="rounded-full bg-black/40 px-3 py-1 text-sm backdrop-blur">{h.label}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {venues.map((v) => (
              <button key={String(v.id)} type="button" className={`premium-card w-full text-left ${active?.slug === v.slug ? "ring-2 ring-[var(--tl-green)]" : ""}`} onClick={() => { setActive(v); setYaw(0); }}>
                <h3 className="font-bold">{String(v.title)}</h3>
                <p className="text-sm text-[var(--tl-muted)]">{String(v.country)} · {String(v.location)}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!authGate(router)) return;
    api("premium/dashboard")
      .then((x) => setData(x as Record<string, unknown>))
      .catch((e) => {
        setData(null);
        setStatus(e instanceof Error ? e.message : "Xəta");
      });
  }, [router]);

  const stats = (data?.stats as Record<string, number>) || {};

  return (
    <>
      <CinematicHero theme="dashboard" title="Smart Travel Dashboard" body="Bronlar, Labpoint və deals — motion cards ilə premium analitika." badge="Insight · Personal hub" />
      <section className="section premium-stage">
        <FloatingOrbs />
        <div className="shell">
          <Status message={status} />
          {!data && !status && <p className="muted">Yüklənir…</p>}
          {!data && status && <p className="muted">Dashboard yüklənmədi.</p>}
          {data && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Bronlar", stats.bookings],
                  ["Labpoint", stats.labpoint],
                  ["Wishlist", stats.wishlist],
                  ["AI planlar", stats.plans],
                ].map(([k, v]) => (
                  <div key={String(k)} className="premium-stat">
                    <p className="section-label">{k}</p>
                    <div className="mt-2 text-4xl font-black text-[var(--tl-green)]">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="premium-panel">
                  <h3 className="text-xl font-bold">Son sifarişlər</h3>
                  <div className="mt-4 space-y-2">
                    {((data.recent_bookings as Record<string, unknown>[]) || []).map((b) => (
                      <div key={String(b.id)} className="flex justify-between gap-3 border-b border-[var(--tl-line)] py-2 text-sm">
                        <span>{String(b.title)}</span>
                        <strong>{String(b.total)} {String(b.currency)}</strong>
                      </div>
                    ))}
                    {!((data.recent_bookings as unknown[]) || []).length && <p className="muted">Hələ sifariş yoxdur.</p>}
                  </div>
                  <Link href="/sifarisler" className="btn btn-soft mt-4">Bütün sifarişlər</Link>
                </div>
                <div className="premium-panel">
                  <h3 className="text-xl font-bold">Smart Deals</h3>
                  <div className="mt-4 space-y-3">
                    {((data.smart_deals as Record<string, unknown>[]) || []).map((d) => (
                      <Link key={String(d.id)} href={String(d.cta_href || "/smart-deals")} className="flex gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={String(d.image_url)} alt="" className="h-14 w-14 rounded-lg object-cover" />
                        <div>
                          <p className="font-semibold">{String(d.title)}</p>
                          <p className="text-sm text-[var(--tl-green)]">-{String(d.discount_percent)}%</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/ai-planner" className="btn btn-green">AI Planner</Link>
                <Link href="/my-trip" className="btn btn-outline-green">My Trip</Link>
                <Link href="/wishlist" className="btn btn-soft">Wishlist</Link>
                <Link href="/assistant" className="btn btn-soft">AI Assistant</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export function MyTripPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Record<string, unknown>[]>([]);
  const [active, setActive] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState("");

  async function load(keepId?: number) {
    if (!authGate(router)) return;
    const data = await api("premium/trips");
    const list = rows(data as Record<string, unknown>[]);
    setTrips(list);
    const current = keepId ? list.find((t) => Number(t.id) === keepId) : null;
    setActive(current || list[0] || null);
  }

  useEffect(() => {
    load().catch((e) => setStatus(e instanceof Error ? e.message : "Xəta"));
  }, [router]);

  async function createTrip(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!authGate(router)) return;
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      await api("premium/trips", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          destination: data.destination,
          status: "planned",
          budget: Number(data.budget || 0),
          notes: data.notes || "",
          cover_image: "/images/destinations/istanbul.jpg",
        }),
      });
      (e.target as HTMLFormElement).reset();
      setStatus("Trip yaradıldı.");
      await load();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Xəta");
    }
  }

  async function addItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!active) return;
    const tripId = Number(active.id);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      await api(`premium/trips/${tripId}/items`, {
        method: "POST",
        body: JSON.stringify({
          kind: data.kind || "activity",
          title: data.title,
          day_number: Number(data.day_number || 1),
          cost: Number(data.cost || 0),
        }),
      });
      setStatus("Aktivlik əlavə olundu.");
      await load(tripId);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Xəta");
    }
  }

  const items = (active?.items as Record<string, unknown>[]) || [];

  return (
    <>
      <CinematicHero theme="trip" title="My Trip" body="Günbəgün plan və xərclər — cinematic timeline ilə idarə edin." badge="Journey · My Trip" />
      <ParallaxStrip images={STRIP} />
      <section className="section premium-stage">
        <div className="shell grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <div className="space-y-4">
            <form onSubmit={createTrip} className="premium-panel space-y-3">
              <h3 className="text-xl font-bold">Yeni trip</h3>
              <input name="title" required className="field" placeholder="Trip adı" />
              <input name="destination" className="field" placeholder="İstiqamət" />
              <input name="budget" type="number" className="field" placeholder="Büdcə" />
              <textarea name="notes" className="field" rows={2} placeholder="Qeyd" />
              <button className="btn btn-green w-full">Yarat</button>
            </form>
            <Status message={status} />
            {trips.map((t) => (
              <button key={String(t.id)} type="button" className={`premium-card w-full text-left ${active?.id === t.id ? "ring-2 ring-[var(--tl-green)]" : ""}`} onClick={() => setActive(t)}>
                <p className="section-label">{String(t.status)}</p>
                <h3 className="font-bold">{String(t.title)}</h3>
                <p className="text-sm text-[var(--tl-muted)]">{String(t.destination)}</p>
              </button>
            ))}
          </div>
          <div>
            {!active && <div className="premium-empty">Trip seçin və ya yaradın.</div>}
            {active && (
              <div className="space-y-4">
                <div className="premium-panel">
                  <h2 className="text-3xl font-extrabold">{String(active.title)}</h2>
                  <p className="muted mt-2">{String(active.destination)} · Büdcə {String(active.budget)} {String(active.currency)}</p>
                </div>
                <form onSubmit={addItem} className="premium-panel grid gap-2 md:grid-cols-4">
                  <input name="title" required className="field md:col-span-2" placeholder="Aktivlik" />
                  <input name="day_number" type="number" min={1} defaultValue={1} className="field" />
                  <select name="kind" className="field">
                    <option value="activity">Activity</option>
                    <option value="flight">Flight</option>
                    <option value="hotel">Hotel</option>
                    <option value="tour">Tour</option>
                    <option value="transfer">Transfer</option>
                  </select>
                  <input name="cost" type="number" className="field" placeholder="Cost" />
                  <button className="btn btn-green md:col-span-3">Əlavə et</button>
                </form>
                <div className="space-y-2">
                  {(items.length ? items : ((trips.find((t) => t.id === active.id) as { items?: Record<string, unknown>[] })?.items || [])).map((item) => (
                    <div key={String(item.id)} className="premium-card flex justify-between gap-3">
                      <div>
                        <p className="section-label">Gün {String(item.day_number)} · {String(item.kind)}</p>
                        <p className="font-bold">{String(item.title)}</p>
                      </div>
                      <strong className="text-[var(--tl-green)]">{String(item.cost)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export function SmartDealsPage() {
  const [deals, setDeals] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    api("premium/deals").then((x) => setDeals(rows(x as Record<string, unknown>[]))).catch(() => setDeals([]));
  }, []);

  return (
    <>
      <CinematicHero theme="deals" title="Smart Deals" body="Endirimlər cinematic kartlarda — hover zoom, badge pulse və scroll reveal." badge="Offers · Flash deals" />
      <ParallaxStrip images={STRIP} />
      <section className="section premium-stage">
        <div className="shell grid-3">
          {deals.map((d) => (
            <Reveal key={String(d.id)}>
              <article className="premium-card media-hover overflow-hidden !p-0 deal-pulse">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={String(d.image_url)} alt="" className="h-44 w-full object-cover" />
                <div className="p-5">
                  <span className="deal-badge">-{String(d.discount_percent)}%</span>
                  <h3 className="mt-3 text-xl font-bold">{String(d.title)}</h3>
                  <p className="muted mt-2 text-sm leading-6">{String(d.summary)}</p>
                  {Number(d.price_from) > 0 && <p className="mt-3 font-semibold text-[var(--tl-green)]">from {String(d.price_from)} {String(d.currency)}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={String(d.cta_href || "/tours")} className="btn btn-green !min-h-9">Bax</Link>
                    <WishlistButton item={{ kind: "deal", title: String(d.title), slug: String(d.slug), image_url: String(d.image_url), price: Number(d.price_from), href: String(d.cta_href || "/smart-deals") }} />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function AssistantPage() {
  const [threadId, setThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Salam! Mən Travellab AI Travel Assistant-am (demo). Plan, büdcə, viza və ya tur müqayisəsi haqqında soruşun." },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(["/ai-planner", "/budget", "/viza", "/compare"]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    try {
      const res = await api<{
        thread: { id: number };
        reply: string;
        suggestions?: string[];
      }>("premium/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message, thread_id: threadId || undefined, session_key: "web" }),
      });
      setThreadId(res.thread.id);
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      if (res.suggestions?.length) setSuggestions(res.suggestions);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Xəta");
    }
  }

  return (
    <>
      <CinematicHero theme="assistant" title="AI Travel Assistant" body="Ağıllı çat — soft motion bubbles və cinematic backdrop." badge="Assistant · Demo AI" />
      <section className="section premium-stage">
        <FloatingOrbs />
        <div className="shell max-w-3xl">
          <div className="chat-shell">
            <div className="chat-stream">
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role === "user" ? "user" : "bot"}`}>{m.content}</div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 p-3">
              {suggestions.map((s) => (
                <button key={s} type="button" className="filter-chip" onClick={() => send(`${s} haqqında məlumat ver`)}>{s}</button>
              ))}
            </div>
            <form
              className="chat-input"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <input className="field" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Sualınızı yazın…" />
              <button className="btn btn-green" type="submit">Göndər</button>
            </form>
          </div>
          <Status message={status} />
        </div>
      </section>
    </>
  );
}

function WishlistButton({ item }: { item: { kind: string; title: string; slug?: string; image_url?: string; price?: number; href?: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  async function add() {
    if (!authGate(router)) return;
    try {
      await api("premium/wishlist", {
        method: "POST",
        body: JSON.stringify(item),
      });
      setStatus("Wishlist-ə əlavə olundu");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Xəta");
    }
  }
  return (
    <div>
      <button type="button" className="btn btn-soft !min-h-9" onClick={add}>♡ Wishlist</button>
      {status && <p className="mt-1 text-xs text-[var(--tl-green)]">{status}</p>}
    </div>
  );
}

export function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [status, setStatus] = useState("");

  async function load() {
    if (!authGate(router)) return;
    const data = await api("premium/wishlist");
    setItems(rows(data as Record<string, unknown>[]));
  }

  useEffect(() => {
    load().catch((e) => setStatus(e instanceof Error ? e.message : "Xəta"));
  }, [router]);

  async function remove(id: number) {
    try {
      await api(`premium/wishlist/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Xəta");
    }
  }

  return (
    <>
      <CinematicHero theme="wishlist" title="Wishlist" body="Sevimli istiqamətlər — ürək animasiyası və media hover kartlar." badge="Saved · Wishlist" />
      <ParallaxStrip images={STRIP} />
      <section className="section premium-stage">
        <div className="shell">
          <Status message={status} />
          <div className="mb-6 flex flex-wrap gap-3">
            <Link href="/map" className="btn btn-soft">Xəritədən əlavə et</Link>
            <Link href="/smart-deals" className="btn btn-soft">Smart Deals</Link>
            <Link href="/tours" className="btn btn-soft">Turlar</Link>
          </div>
          {!items.length && <div className="premium-empty">Wishlist boşdur.</div>}
          <div className="grid-3">
            {items.map((item) => (
              <article key={String(item.id)} className="premium-card">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={String(item.image_url)} alt="" className="mb-3 h-36 w-full rounded-xl object-cover" />
                ) : null}
                <p className="section-label">{String(item.kind)}</p>
                <h3 className="text-lg font-bold">{String(item.title)}</h3>
                {item.price != null && <p className="mt-2 text-[var(--tl-green)] font-semibold">{String(item.price)} {String(item.currency)}</p>}
                <div className="mt-4 flex gap-2">
                  {item.href ? <Link href={String(item.href)} className="btn btn-green !min-h-9">Aç</Link> : null}
                  <button type="button" className="btn btn-soft !min-h-9" onClick={() => remove(Number(item.id))}>Sil</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function PremiumHubPage() {
  const cards = [
    { href: "/ai-planner", title: "AI Travel Planner", body: "Fərdi səyahət planı", feature: "ai-planner" as const },
    { href: "/map", title: "Dünya xəritəsi", body: "Ölkə kəşfi", feature: "map" as const },
    { href: "/budget", title: "Büdcə kalkulyatoru", body: "Xərc planı", feature: "budget" as const },
    { href: "/compare", title: "Müqayisə", body: "Tur & otel", feature: "compare" as const },
    { href: "/360", title: "360° məkanlar", body: "Panorama demo", feature: "venue360" as const },
    { href: "/dashboard", title: "Smart Dashboard", body: "Şəxsi analitika", feature: "dashboard" as const },
    { href: "/my-trip", title: "My Trip", body: "Səyahət idarəetməsi", feature: "my-trip" as const },
    { href: "/smart-deals", title: "Smart Deals", body: "Xüsusi təkliflər", feature: "smart-deals" as const },
    { href: "/assistant", title: "AI Assistant", body: "Ağıllı çat", feature: "assistant" as const },
    { href: "/wishlist", title: "Wishlist", body: "Sevimlilər", feature: "wishlist" as const },
  ];
  return (
    <>
      <CinematicHero theme="hub" title="Travellab Premium" body="Innovativ funksiyalar — cinematic video, parallax və interaktiv vizual dil." badge="Premium Suite" actions={<PremiumQuickLinks />} />
      <ParallaxStrip images={STRIP} />
      <section className="section premium-stage">
        <FloatingOrbs />
        <div className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="premium-card media-hover hover:-translate-y-1 transition hub-glow hub-feature-card">
              <FeatureLogo id={c.feature} size={48} />
              <p className="section-label">Premium</p>
              <h3 className="mt-1 text-xl font-bold">{c.title}</h3>
              <p className="muted mt-2">{c.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
