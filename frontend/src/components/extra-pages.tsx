"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, api, createBooking, normalizeItem, rows } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/store";
import { Item, ItemCard, PageHero, Reveal, Status } from "./site";
import { Link, useRouter } from "@/i18n/navigation";

const IMG = {
  deals: "/images/destinations/dubai.jpg",
  events: "/images/hero/balloons.jpg",
  transfer: "/images/hotels/hero-pool.jpg",
  insurance: "/images/stories/visa-002.jpg",
  faq: "/images/about/events/travellab-qarabagda.jpg",
  cookies: "/images/hero/mosque.jpg",
  visa: "/images/stories/visa-002.jpg",
  flights: "/images/hero/balloons.jpg",
  blog: "/images/about/events/travellab-qarabagda.jpg",
  orders: "/images/stories/reviews-001.jpg",
  favorites: "/images/destinations/maldives.jpg",
};

export const VISA_COUNTRIES = [
  { slug: "almaniya", name: "Almaniya", region: "Schengen" },
  { slug: "fransa", name: "Fransa", region: "Schengen" },
  { slug: "italiya", name: "İtaliya", region: "Schengen" },
  { slug: "ispaniya", name: "İspaniya", region: "Schengen" },
  { slug: "niderland", name: "Niderland", region: "Schengen" },
  { slug: "avstriya", name: "Avstriya", region: "Schengen" },
  { slug: "cexiya", name: "Çexiya", region: "Schengen" },
  { slug: "yunanistan", name: "Yunanıstan", region: "Schengen" },
  { slug: "polsa", name: "Polşa", region: "Schengen" },
  { slug: "macaristan", name: "Macarıstan", region: "Schengen" },
  { slug: "portuqaliya", name: "Portuqaliya", region: "Schengen" },
  { slug: "isvecre", name: "İsveçrə", region: "Schengen" },
  { slug: "boyuk-britaniya", name: "Böyük Britaniya", region: "UK" },
  { slug: "amerika-birlesmis-statlari", name: "ABŞ", region: "Americas" },
  { slug: "kanada", name: "Kanada", region: "Americas" },
  { slug: "avstraliya", name: "Avstraliya", region: "Oceania" },
  { slug: "birlesmis-ereb-emirlikleri", name: "BƏE", region: "MENA" },
  { slug: "cin", name: "Çin", region: "Asia" },
  { slug: "yaponiya", name: "Yaponiya", region: "Asia" },
  { slug: "cenubi-koreya", name: "Cənubi Koreya", region: "Asia" },
  { slug: "tailand", name: "Tayland", region: "Asia" },
  { slug: "vyetnam", name: "Vyetnam", region: "Asia" },
  { slug: "hindistan", name: "Hindistan", region: "Asia" },
  { slug: "rusiya", name: "Rusiya", region: "CIS" },
];

/** Marketing reference ranges (AZN) — live fares come from Travelpayouts search. */
export const FLIGHT_ROUTES = [
  { slug: "baki-istanbul", from: "Bakı", to: "İstanbul", origin: "GYD", destination: "IST", km: 1788, hours: "2 saat 55 dəq", price: "270₼-dan (gediş-dönüş)", priceHint: "Birbaşa ~270₼, 1 dayanacaq ~334₼+", airlines: "Ajet, Pegasus, Turkish Airlines, AZAL" },
  { slug: "baki-dubay", from: "Bakı", to: "Dubay", origin: "GYD", destination: "DXB", km: 1820, hours: "3 saat 10 dəq", price: "180-450 AZN", priceHint: "Tarixdən asılı real axtarış", airlines: "AZAL, flydubai, Emirates" },
  { slug: "baki-tbilisi", from: "Bakı", to: "Tbilisi", origin: "GYD", destination: "TBS", km: 450, hours: "1 saat 10 dəq", price: "90-220 AZN", priceHint: "Tarixdən asılı real axtarış", airlines: "AZAL, Georgian Airways" },
  { slug: "baki-moskva", from: "Bakı", to: "Moskva", origin: "GYD", destination: "SVO", km: 1880, hours: "3 saat", price: "150-380 AZN", priceHint: "Tarixdən asılı real axtarış", airlines: "AZAL, Aeroflot" },
  { slug: "baki-london", from: "Bakı", to: "London", origin: "GYD", destination: "LHR", km: 3950, hours: "5 saat 40 dəq", price: "280-650 AZN", priceHint: "Tarixdən asılı real axtarış", airlines: "AZAL, British Airways" },
  { slug: "baki-paris", from: "Bakı", to: "Paris", origin: "GYD", destination: "CDG", km: 3750, hours: "5 saat 20 dəq", price: "260-620 AZN", priceHint: "Tarixdən asılı real axtarış", airlines: "AZAL, Air France" },
  { slug: "baki-antalya", from: "Bakı", to: "Antalya", origin: "GYD", destination: "AYT", km: 1650, hours: "2 saat 40 dəq", price: "140-320 AZN", priceHint: "Tarixdən asılı real axtarış", airlines: "AZAL, Pegasus" },
  { slug: "baki-maldiv-adalari", from: "Bakı", to: "Maldiv adaları", origin: "GYD", destination: "MLE", km: 4800, hours: "7 saat+", price: "500-1100 AZN", priceHint: "Tarixdən asılı real axtarış", airlines: "AZAL + connection" },
];

export const SHOP_CATEGORY_SLUGS: Record<string, string> = {
  elektronika: "Elektronika",
  aksesuarlar: "Aksesuar",
  camadan: "Səyahət",
  "camadan-l": "Səyahət",
  "camadan-m": "Səyahət",
  "camadan-s": "Səyahət",
  setler: "Gözəllik",
  "gigiyena-ve-baxim": "Gözəllik",
  "ilk-yardim-cantasi": "Aksesuar",
  termos: "Səyahət",
  cetir: "Aksesuar",
  biznes: "Elektronika",
};

const FAQ_ITEMS = [
  { q: "Aviabilet bronu necə edilir?", a: "Axtarış panelindən istiqamət və tarixi seçin, nəticələrdən uyğun uçuşu seçib hesabınıza daxil olaraq demo bron edin." },
  { q: "Labpoint nədir?", a: "Labpoint loyallıq balansıdır. Hər bron zamanı bonus qazanır və növbəti tur/xidmətdə istifadə edə bilərsiniz." },
  { q: "Viza müraciəti nə qədər çəkir?", a: "Müddət ölkədən və mövsümdən asılıdır. Formu göndərdikdən sonra mütəxəssisimiz dəqiq müddəti bildirir." },
  { q: "Transfer və sığorta ayrıca sifariş oluna bilər?", a: "Bəli. Transfer və səyahət sığortası səhifələrindən və ya Xidmətlər bölməsindən sifariş edə bilərsiniz." },
  { q: "Shop sifarişləri necə çatdırılır?", a: "Demo rejimdə sifariş lokal bazaya yazılır. Real çatdırılma inteqrasiyası yoxdur; müraciətiniz əlaqə komandasına düşür." },
  { q: "Ödəniş təhlükəsizdirmi?", a: "Demo platformada ödəniş DemoPayment ilə simulyasiya olunur. Real kart məlumatı tələb olunmur." },
];

function LeadForm({ source, subject }: { source: string; subject: string }) {
  const t = useTranslations();
  const [status, setStatus] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      await api("contact", { method: "POST", body: JSON.stringify({ ...data, subject, source }) });
      form.reset();
      setStatus(t("common.success"));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t("common.error"));
    }
  }
  return (
    <form onSubmit={submit} className="card mt-8 grid max-w-xl gap-3 p-6">
      <input name="name" required className="field" placeholder={t("forms.name")} />
      <input name="email" type="email" required className="field" placeholder={t("forms.email")} />
      <input name="phone" className="field" placeholder={t("forms.phone")} />
      <textarea name="message" required className="field" rows={4} placeholder={t("forms.message")} />
      <Status message={status} />
      <button className="btn btn-green" type="submit">{t("common.submit")}</button>
    </form>
  );
}

export function DealsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuthStore();
  const [tours, setTours] = useState<Item[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    setLoadState("loading");
    api("tours/?ordering=price")
      .then((x) => {
        setTours(rows(x as Item[]).map((i) => normalizeItem(i) as Item).slice(0, 8));
        setLoadState("ready");
      })
      .catch(() => {
        setTours([]);
        setLoadState("error");
      });
  }, []);

  return (
    <>
      <PageHero title="Endirimlər" body="Endirimləri görmək üçün qeydiyyatdan keçin — Labpoint balansı tur qiymətlərindən avtomatik çıxılır." image={IMG.deals} />
      <section className="section">
        <div className="shell">
          {!user && (
            <div className="card mb-8 flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <h2 className="text-2xl font-bold">Labpoint ilə endirim açın</h2>
                <p className="muted mt-2">Qeydiyyatdan keçin və balansınızla tur qiymətlərindən istifadə edin.</p>
              </div>
              <div className="flex gap-2">
                <Link href="/auth/register" className="btn btn-green">Qeydiyyatdan keç</Link>
                <Link href="/labpoint" className="btn btn-outline-green">Labpoint</Link>
              </div>
            </div>
          )}
          <div className="tour-grid">
            {tours.map((tour) => (
              <Reveal key={tour.id}>
                <ItemCard
                  item={{ ...tour, price: Math.round(Number(tour.price || tour.price_from || 0) * 0.9) }}
                  kind="tour"
                  onFavorite={async (item) => {
                    try {
                      if (!useAuthStore.getState().requireAuth()) {
                        router.push("/auth/login");
                        return;
                      }
                      await api("favorites/toggle", { method: "POST", body: JSON.stringify({ object_type: "tour", object_id: Number(item.id) }) });
                    } catch {
                      /* ignore */
                    }
                  }}
                />
              </Reveal>
            ))}
          </div>
          {loadState === "loading" && <p className="muted py-16 text-center">{t("common.loading")}</p>}
          {loadState === "error" && <p className="muted py-16 text-center">Endirimlər yüklənmədi. Bir az sonra yenidən yoxlayın.</p>}
          {loadState === "ready" && !tours.length && <p className="muted py-16 text-center">Hal-hazırda endirimli tur yoxdur.</p>}
        </div>
      </section>
    </>
  );
}

export function EventsPage() {
  const events = [
    { title: "Bruno Mars — Bangkok", date: "2026-01-18", place: "Bangkok", image: "/images/destinations/thailand.jpg", href: "/tours?search=Bangkok" },
    { title: "Yeni il konserti — İstanbul", date: "2026-12-31", place: "İstanbul", image: "/images/destinations/istanbul.jpg", href: "/tours?search=İstanbul" },
    { title: "Festival — Dubai", date: "2026-02-10", place: "Dubai", image: "/images/destinations/dubai.jpg", href: "/tours?search=Dubai" },
    { title: "Şou — London", date: "2026-03-05", place: "London", image: "/images/destinations/london.jpg", href: "/tours?search=London" },
    { title: "Opera — Vyana", date: "2026-04-12", place: "Vyana", image: "/images/destinations/vienna.jpg", href: "/tours?search=Vyana" },
    { title: "Festival — Seul", date: "2026-05-20", place: "Seul", image: "/images/destinations/seoul.jpg", href: "/tours?search=Seul" },
  ];

  return (
    <>
      <PageHero title="Tədbir Biletləri" body="Konsert, şou və festival biletlərini tur paketləri ilə birlikdə planlaşdırın." image={IMG.events} />
      <section className="section">
        <div className="shell">
          <div className="grid-3">
            {events.map((e) => (
              <Link key={e.title} href={e.href} className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.image} alt={e.title} className="h-44 w-full object-cover" />
                <div className="p-5">
                  <p className="section-label">{e.date} · {e.place}</p>
                  <h3 className="mt-2 text-xl font-bold">{e.title}</h3>
                </div>
              </Link>
            ))}
          </div>
          <LeadForm source="events" subject="Tədbir bileti sorğusu" />
        </div>
      </section>
    </>
  );
}

export function TransferPage() {
  const t = useTranslations();
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [service, setService] = useState<Item | null>(null);

  useEffect(() => {
    api("services")
      .then((x) => {
        const list = rows(x as Item[]).map((i) => normalizeItem(i) as Item);
        setService(list.find((s) => String(s.slug || "").includes("transfer") || /transfer/i.test(String(s.title || s.name))) || list[0] || null);
      })
      .catch(() => setService({ id: "transfer", title: "VIP Transfer", price_from: 45, currency: "AZN", summary: "Hava limanı və şəhərdaxili transfer" }));
  }, []);

  async function book() {
    try {
      if (!useAuthStore.getState().requireAuth()) {
        router.push("/auth/login");
        return;
      }
      await createBooking({
        booking_type: "service",
        title: String(service?.title || service?.name || "Transfer"),
        subtotal: service?.price_from || service?.price || 45,
        currency: service?.currency || "AZN",
        related_object_id: service?.id,
        details: { source: "transfer", demo: true },
      });
      setStatus(t("common.success"));
    } catch (e) {
      setStatus(e instanceof ApiError && e.status === 401 ? "Davam etmək üçün daxil olun" : e instanceof Error ? e.message : t("common.error"));
    }
  }

  return (
    <>
      <PageHero title="Transfer xidmətləri" body="Hava limanı qarşılama, hotelə çatdırılma və şəhərdaxili VIP transfer." image={IMG.transfer} />
      <section className="section">
        <div className="shell grid gap-10 md:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="grid-3 !grid-cols-1 sm:!grid-cols-3">
              {["Meet & Greet", "VIP avtomobil", "24/7 dəstək"].map((x, i) => (
                <div key={x} className="card p-5">
                  <span className="font-black text-[var(--tl-green)]">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-bold">{x}</h3>
                  <p className="muted mt-2 text-sm">Peşəkar sürücü və vaxtında çatdırılma.</p>
                </div>
              ))}
            </div>
            <LeadForm source="transfer" subject="Transfer sorğusu" />
          </div>
          <aside className="card h-fit p-6">
            <p className="section-label">Başlayan qiymət</p>
            <div className="mt-2 text-4xl font-extrabold text-[var(--tl-green)]">
              {service?.price_from || service?.price || 45} {service?.currency || "AZN"}
            </div>
            <p className="muted mt-3">{service?.summary || service?.short_description || "Hava limanı və şəhərdaxili VIP transfer"}</p>
            <Status message={status} />
            <button type="button" className="btn btn-green mt-5 w-full" onClick={book}>Demo bron et</button>
            <a href="tel:+994125550505" className="btn btn-call mt-3 w-full">{t("common.call")}</a>
          </aside>
        </div>
      </section>
    </>
  );
}

export function InsurancePage() {
  const t = useTranslations();
  const router = useRouter();
  const [status, setStatus] = useState("");
  const plans = [
    { name: "Standart", price: 25, features: ["Tibbi xərclər", "Bagaj itkisi", "Uçuş gecikməsi"] },
    { name: "Komfort", price: 45, features: ["Geniş tibbi örtük", "Ləğv sığortası", "24/7 hotline"] },
    { name: "Premium", price: 79, features: ["Ailə paketi", "Ekstrim idman", "VIP dəstək"] },
  ];

  async function book(plan: (typeof plans)[0]) {
    try {
      if (!useAuthStore.getState().requireAuth()) {
        router.push("/auth/login");
        return;
      }
      await createBooking({
        booking_type: "service",
        title: `Səyahət sığortası — ${plan.name}`,
        subtotal: plan.price,
        currency: "AZN",
        details: { source: "insurance", plan: plan.name, demo: true },
      });
      setStatus(t("common.success"));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : t("common.error"));
    }
  }

  return (
    <>
      <PageHero title="Səyahət sığortası" body="Tibbi, bagaj və ləğv sığortası paketləri ilə rahat səyahət edin." image={IMG.insurance} />
      <section className="section">
        <div className="shell">
          <Status message={status} />
          <div className="grid-3">
            {plans.map((p) => (
              <article key={p.name} className="card p-6">
                <p className="section-label">{p.name}</p>
                <div className="mt-2 text-4xl font-extrabold text-[var(--tl-green)]">{p.price} AZN</div>
                <ul className="mt-4 space-y-2 text-sm text-[var(--tl-muted)]">
                  {p.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
                <button type="button" className="btn btn-green mt-6 w-full" onClick={() => book(p)}>Seç və bron et</button>
              </article>
            ))}
          </div>
          <LeadForm source="insurance" subject="Sığorta sorğusu" />
        </div>
      </section>
    </>
  );
}

export function FaqPage() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <PageHero title="Tez-tez verilən suallar" body="Aviabilet, tur, viza, Labpoint və shop haqqında cavablar." image={IMG.faq} />
      <section className="section">
        <div className="shell max-w-3xl">
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} className="card overflow-hidden">
                <button type="button" className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold" onClick={() => setOpen(open === i ? -1 : i)}>
                  {item.q}
                  <span className="text-[var(--tl-green)]">{open === i ? "−" : "+"}</span>
                </button>
                {open === i && <p className="muted border-t border-[var(--tl-line)] px-5 py-4 leading-7">{item.a}</p>}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/contact" className="btn btn-green">Əlaqə saxla</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function CookiesPage() {
  return (
    <>
      <PageHero title="Cookies Policy" body="Saytın cookie istifadəsi və seçimləriniz haqqında məlumat." image={IMG.cookies} />
      <section className="section">
        <div className="shell prose max-w-3xl space-y-4 leading-8 text-[var(--tl-ink)]">
          <p>Travellab saytı istifadə təcrübəsini yaxşılaşdırmaq, dil/valyuta seçimlərini yadda saxlamaq və analitika üçün cookie-lərdən istifadə edir.</p>
          <p>Zəruri cookie-lər saytın işləməsi üçündür. Analitik cookie-lər isə trafik və performans ölçüləri üçündür. “Accept” düyməsi ilə razılığınızı bildirə bilərsiniz.</p>
          <p>Brauzer ayarlarından cookie-ləri silmək və ya bloklamaq mümkündür; bu halda bəzi funksiyalar məhdudlaşa bilər.</p>
          <Link href="/privacy" className="btn btn-outline-green">Məxfilik Siyasəti</Link>
        </div>
      </section>
    </>
  );
}

export function VisaHubPage() {
  return (
    <>
      <PageHero title="Viza Xidmətləri" body="Sənədləri, müraciəti və görüşü biz aparırıq. Sorğunuza qısa müddətdə cavab veririk." image={IMG.visa} />
      <section className="section">
        <div className="shell">
          <h2 className="section-title mb-6">Ölkə seçin</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {VISA_COUNTRIES.map((c) => (
              <Link key={c.slug} href={`/viza/${c.slug}`} className="card p-4 transition hover:-translate-y-0.5">
                <p className="section-label">{c.region}</p>
                <h3 className="mt-1 text-lg font-bold">{c.name}</h3>
              </Link>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {["Müraciət edirsiniz", "Mütəxəssis danışır", "Vizanı alırsınız"].map((x, i) => (
              <div key={x} className="card p-5">
                <span className="font-black text-[var(--tl-green)]">0{i + 1}</span>
                <h3 className="mt-3 text-xl font-bold">{x}</h3>
              </div>
            ))}
          </div>
          <LeadForm source="visa" subject="Viza sorğusu" />
        </div>
      </section>
    </>
  );
}

export function VisaCountryPage({ slug }: { slug: string }) {
  const country = VISA_COUNTRIES.find((c) => c.slug === slug) || { slug, name: slug.replace(/-/g, " "), region: "Visa" };
  const faqs = [
    { q: `${country.name} vizası neçə günə çıxır?`, a: "Müddət konsulluqdan, mövsümdən və müraciət növündən asılıdır. Formu göndərdikdən sonra mütəxəssisimiz dəqiq müddəti bildirəcək." },
    { q: `${country.name} vizası üçün hansı sənədlər lazımdır?`, a: "Sənədlər səyahət məqsədindən asılıdır. Ölkəni seçib formu göndərdikdən sonra fərdi siyahı hazırlanır." },
    { q: `Travellab ${country.name} vizası üçün necə kömək edir?`, a: "Sənəd hazırlığından müraciətə qədər tam dəstək göstəririk — siyahı, yoxlama və görüş yönləndirməsi daxil." },
  ];
  const [open, setOpen] = useState(0);
  const t = useTranslations();
  const [status, setStatus] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      await api("contact", {
        method: "POST",
        body: JSON.stringify({
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          phone: data.phone,
          email: data.email || "visa@travellab.az",
          message: `Ölkə: ${country.name}\nTarix: ${data.date || "-"}\nNəfər: ${data.guests || 1}\nQeyd: ${data.note || ""}`,
          subject: `${country.name} viza sorğusu`,
          source: `viza/${slug}`,
        }),
      });
      form.reset();
      setStatus(t("common.success"));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t("common.error"));
    }
  }

  return (
    <>
      <PageHero title={`${country.name} Vizası`} body="Sənədləri, müraciəti və görüşü biz aparırıq." image={IMG.visa} />
      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <form onSubmit={submit} className="card h-fit space-y-3 p-6">
            <h2 className="text-2xl font-bold">Vizanı Asanlıqla Alın</h2>
            <p className="muted text-sm">Ödəniş tələb olunmur · Mütəxəssis qısa müddətdə əlaqə saxlayır</p>
            <input name="first_name" required className="field" placeholder="Ad" />
            <input name="last_name" required className="field" placeholder="Soyad" />
            <input name="phone" required className="field" placeholder="+994 50 123 45 67" />
            <input name="email" type="email" className="field" placeholder="E-poçt" />
            <input name="date" type="date" className="field" />
            <input name="guests" type="number" min={1} defaultValue={1} className="field" placeholder="Nəfər sayı" />
            <textarea name="note" className="field" rows={3} placeholder="Əlavə qeyd" />
            <Status message={status} />
            <button className="btn btn-green w-full" type="submit">Sorğu göndər</button>
          </form>
          <div>
            <h2 className="section-title mb-4">{country.name} Vizası Haqqında</h2>
            <div className="space-y-3">
              {faqs.map((item, i) => (
                <div key={item.q} className="card overflow-hidden">
                  <button type="button" className="flex w-full items-center justify-between gap-3 p-4 text-left font-semibold" onClick={() => setOpen(open === i ? -1 : i)}>
                    {item.q}
                    <span>{open === i ? "−" : "+"}</span>
                  </button>
                  {open === i && <p className="muted border-t px-4 py-3 leading-7">{item.a}</p>}
                </div>
              ))}
            </div>
            <Link href="/viza" className="btn btn-outline-green mt-6">Bütün ölkələr</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function FlightRoutePage({ slug }: { slug: string }) {
  const route = FLIGHT_ROUTES.find((r) => r.slug === slug) || {
    slug,
    from: "Bakı",
    to: slug.replace(/^baki-/, "").replace(/-/g, " "),
    origin: "GYD",
    destination: "XXX",
    km: 0,
    hours: "—",
    price: "sorğu ilə",
    airlines: "Müxtəlif aviaşirkətlər",
  };
  const href = `/search?origin=${route.origin}&destination=${route.destination}`;
  const hint = "priceHint" in route ? String((route as { priceHint?: string }).priceHint || "") : "";

  return (
    <>
      <PageHero
        title={`${route.from}–${route.to} Aviabiletləri`}
        body="Real aviabilet axtarışı Travelpayouts vasitəsilə — tarix seçin, canlı qiymətləri görün."
        image={IMG.flights}
      />
      <section className="section">
        <div className="shell">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Məsafə", `${route.km || "—"} km`],
              ["Uçuş", route.hours],
              ["İstinad qiymət", route.price],
              ["Aviaşirkət", route.airlines],
            ].map(([k, v]) => (
              <div key={k} className="card p-5">
                <p className="section-label">{k}</p>
                <p className="mt-2 font-bold">{v}</p>
              </div>
            ))}
          </div>
          <p className="muted mt-8 max-w-3xl leading-8">
            {route.from}–{route.to} marşrutu üzrə canlı qiymətlər axtarış nəticələrində göstərilir.
            {hint ? ` ${hint}.` : ""} Səhifədəki diapazon marketinq istinadıdır — bron üçün real axtarışdan istifadə edin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={href} className="btn btn-green">Uçuşları axtar</Link>
            <Link href="/ucuslar" className="btn btn-outline-green">Bütün marşrutlar</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function FlightRoutesIndexPage() {
  return (
    <>
      <PageHero title="Populyar uçuş marşrutları" body="Bakıdan istiqamətlər üzrə aviabilet məlumatları və axtarış." image={IMG.flights} />
      <section className="section">
        <div className="shell grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FLIGHT_ROUTES.map((r) => (
            <Link key={r.slug} href={`/ucuslar/${r.slug}`} className="card p-5 hover:-translate-y-0.5 transition">
              <p className="section-label">{r.origin} → {r.destination}</p>
              <h3 className="mt-2 text-xl font-bold">{r.from} – {r.to}</h3>
              <p className="muted mt-2 text-sm">{r.price} · {r.hours}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function OrdersPage() {
  const t = useTranslations();
  const router = useRouter();
  const { loadUser } = useAuthStore();
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      const me = await loadUser();
      if (!me) {
        router.push("/auth/login");
        return;
      }
      try {
        const data = await api("bookings");
        setBookings(rows(data as Record<string, unknown>[] | { results?: Record<string, unknown>[] }));
      } catch (e) {
        setStatus(e instanceof Error ? e.message : t("common.error"));
      }
    })();
  }, [loadUser, router, t]);

  return (
    <>
      <PageHero title="Sifarişlər və rezervasiyalar" body="Bütün bronlarınız, status və Labpoint məlumatları." image={IMG.orders} />
      <section className="section">
        <div className="shell">
          <Status message={status} />
          <div className="mb-6 flex gap-3">
            <Link href="/account" className="btn btn-soft">Kabinet</Link>
            <Link href="/favorites" className="btn btn-soft">Favoritlər</Link>
          </div>
          <div className="grid gap-3">
            {!bookings.length && <p className="muted py-12 text-center">Hələ sifariş yoxdur.</p>}
            {bookings.map((b) => (
              <div key={String(b.id || b.reference)} className="card flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-bold">{String(b.title || "Booking")}</p>
                  <p className="text-sm text-[var(--tl-muted)]">{String(b.reference)} · {String(b.booking_type)} · {String(b.status)}</p>
                </div>
                <strong className="text-[var(--tl-green)]">{String(b.total)} {String(b.currency || "USD")}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function FavoritesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { loadUser } = useAuthStore();
  const [favorites, setFavorites] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    (async () => {
      const me = await loadUser();
      if (!me) {
        router.push("/auth/login");
        return;
      }
      try {
        const data = await api("favorites");
        setFavorites(Array.isArray(data) ? data : rows(data as { results?: Record<string, unknown>[] }));
      } catch {
        setFavorites([]);
      }
    })();
  }, [loadUser, router]);

  return (
    <>
      <PageHero title="Sevimlilər" body="Bəyəndiyiniz turlar, otellər və məhsullar." image={IMG.favorites} />
      <section className="section">
        <div className="shell">
          <div className="grid gap-3">
            {!favorites.length && <p className="muted py-12 text-center">Favorit siyahısı boşdur. {t("common.empty")}</p>}
            {favorites.map((f) => {
              const obj = (f.object_data || {}) as Record<string, unknown>;
              return (
                <div key={String(f.id)} className="card p-5">
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

export function BlogArticlePage({ slug }: { slug: string }) {
  const articles: Record<string, { title: string; body: string; image: string }> = {
    "labpoint-nece-isleyir": {
      title: "Labpoint necə işləyir?",
      body: "Hər bron zamanı bonus xallar qazanırsınız. Balansınızı kabinetdə izləyin və növbəti səyahətdə endirim kimi istifadə edin.",
      image: "/images/stories/labpoint-001.jpg",
    },
    "viza-senedleri": {
      title: "Viza üçün əsas sənədlər",
      body: "Pasport, foto, sığorta, otel və aviabilet təsdiqi — ölkədən asılı olaraq siyahı dəyişir. Travellab fərdi yoxlama aparır.",
      image: "/images/stories/visa-002.jpg",
    },
    "qis-turu-ideyalari": {
      title: "Qış turu ideyaları",
      body: "İstanbul, Tbilisi, Dubay və Avropa paytaxtları — qış mövsümü üçün hazır paketlərimizi kəşf edin.",
      image: "/images/destinations/istanbul.jpg",
    },
  };
  const article = articles[slug] || {
    title: slug.replace(/-/g, " "),
    body: "Travellab bloq məqaləsi. Səyahət məsləhətləri, kampaniyalar və istiqamət bələdçiləri.",
    image: IMG.blog,
  };

  return (
    <>
      <PageHero title={article.title} body="Səyahət bələdçisi və məsləhətlər" image={article.image} />
      <section className="section">
        <div className="shell max-w-3xl">
          <p className="leading-8 text-[var(--tl-ink)]">{article.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/blog" className="btn btn-outline-green">Bloqa qayıt</Link>
            <Link href="/tours" className="btn btn-green">Turları kəşf et</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function ShopCategoryPage({ category }: { category: string }) {
  const label = SHOP_CATEGORY_SLUGS[category] || category;
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("shop/products")
      .then((x) => {
        const all = rows(x as Item[]).map((i) => normalizeItem(i) as Item);
        const filtered = all.filter((p) => {
          const hay = `${p.category || ""} ${p.name || ""} ${p.title || ""} ${p.slug || ""}`.toLowerCase();
          return hay.includes(label.toLowerCase()) || hay.includes(category.toLowerCase()) ||
            (label === "Elektronika" && /power|bank|cable|usb|baseus|laptop/i.test(hay)) ||
            (label === "Səyahət" && /pillow|travel|yastıq|çanta|suitcase|camadan|termos/i.test(hay)) ||
            (label === "Gözəllik" && /aroma|ətir|beauty|gigiyena|set/i.test(hay)) ||
            (label === "Aksesuar" && /kit|access|çanta|cetir|passport/i.test(hay));
        });
        setItems(filtered.length ? filtered : all);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category, label]);

  return (
    <>
      <PageHero title={label} body="Sərfəli qiymətlərlə səyahət məhsulları — Travellab Shop." image="/images/shop/lifestyle-couple.jpg" />
      <section className="section">
        <div className="shell">
          <div className="mb-6 flex flex-wrap gap-2">
            <Link href="/shop" className="btn btn-soft !min-h-9">Hamısı</Link>
            {Object.entries(SHOP_CATEGORY_SLUGS).filter(([k], i, arr) => arr.findIndex(([kk, v]) => v === SHOP_CATEGORY_SLUGS[k] && kk === k) === i).slice(0, 6).map(([slug, name]) => (
              <Link key={slug} href={`/shop/${slug}`} className={`btn !min-h-9 ${slug === category ? "btn-green" : "btn-soft"}`}>{name}</Link>
            ))}
          </div>
          {loading && <p>Yüklənir…</p>}
          <div className="grid-3">
            {items.map((x, i) => (
              <Reveal key={x.id || i}>
                <ItemCard item={x} kind="product" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ServicesHubPage() {
  const cards = [
    { href: "/visa", title: "Viza", body: "Schengen və digər ölkələr üçün tam dəstək", image: IMG.visa },
    { href: "/transfer", title: "Transfer", body: "Hava limanı və VIP transfer xidməti", image: IMG.transfer },
    { href: "/sigorta", title: "Sığorta", body: "Tibbi və bagaj sığortası paketləri", image: IMG.insurance },
    { href: "/hediyye-karti", title: "Hədiyyə kartı", body: "Yaxınlarınıza səyahət hədiyyəsi", image: "/images/stories/labpoint-001.jpg" },
    { href: "/corporate", title: "Korporativ", body: "Biznes səfərləri və MICE", image: "/images/about/events/travellab-qarabagda.jpg" },
    { href: "/faq", title: "FAQ", body: "Tez-tez verilən suallar", image: IMG.faq },
  ];
  return (
    <>
      <PageHero title="Xidmətlər" body="Viza, transfer, sığorta və digər səyahət xidmətləri." image={IMG.faq} />
      <section className="section">
        <div className="shell grid-3">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt={c.title} className="h-40 w-full object-cover" />
              <div className="p-5">
                <h3 className="text-xl font-bold">{c.title}</h3>
                <p className="muted mt-2">{c.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
