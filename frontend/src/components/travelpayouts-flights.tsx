"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { api, rows } from "@/lib/api/client";

const WL_SCRIPT = "https://tpwgt.com/wl_web/main.js?wl_id=17018";
const MARKER = "571353";
const TRS = "349139";

type TpwlWindow = Window & {
  TPWL_CONFIGURATION?: Record<string, unknown>;
  TPWL_EXTRA?: Record<string, unknown>;
  TPWL_BACKEND_CONFIGURATION?: Record<string, unknown>;
  tpwlCurrencyChange?: (currency: string) => void;
  tpwlLocaleChange?: (locale: string) => void;
};

type DemoOffer = {
  id?: string | number;
  airline?: string;
  origin?: string;
  destination?: string;
  depart_at?: string;
  total?: string | number;
  currency?: string;
  stops?: number;
};

function mapLocale(locale: string) {
  const l = locale.toLowerCase();
  if (l.startsWith("ru")) return "RU";
  if (l.startsWith("en")) return "EN";
  return "AZ";
}

function readCurrency() {
  if (typeof window === "undefined") return "AZN";
  return localStorage.getItem("travellab-currency") || "AZN";
}

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

/** Travelpayouts White Label — eyni mənbə kimi orijinal travellab.az (wl_id=17018). */
export function TravelpayoutsFlightsWidget() {
  const locale = useLocale();
  const booted = useRef(false);
  const [fallback, setFallback] = useState<DemoOffer[] | null>(null);
  const [fallbackNote, setFallbackNote] = useState("");

  async function loadDemoFallback() {
    try {
      const data = await api<{ offers?: DemoOffer[]; demo?: boolean; source?: string }>("flights/search", {
        method: "POST",
        body: JSON.stringify({
          origin: "GYD",
          destination: "IST",
          depart_date: tomorrowIso(),
          passengers: 1,
          currency: readCurrency(),
        }),
      });
      const offers = rows(data as { offers?: DemoOffer[] });
      setFallback(offers);
      setFallbackNote(
        data.demo
          ? "Travelpayouts widget əlçatan deyil — backend demo/katalog təklifləri göstərilir."
          : `Mənbə: ${data.source || "API"} — ehtiyat axtarış nəticələri.`,
      );
    } catch {
      setFallback([]);
      setFallbackNote("Uçuş axtarışı hazırda əlçatan deyil.");
    }
  }

  useEffect(() => {
    const w = window as TpwlWindow;
    const currency = readCurrency();
    const tpLocale = mapLocale(locale);

    w.TPWL_EXTRA = {
      ...(w.TPWL_EXTRA || {}),
      currency,
      marker: MARKER,
      trs: TRS,
      domain: "www.travellab.az",
      locale: tpLocale,
      link_color: "FF6325",
    };

    w.TPWL_BACKEND_CONFIGURATION = {
      ...(w.TPWL_BACKEND_CONFIGURATION || {}),
      styles: {
        mainAccentColor: "#00965e",
        mainAccentContrastColor: "#FFFFFF",
        linkColor: "#FF6325",
        mainFontColor: "#353333",
        searchFormIconColor: "#2B8BD5",
        searchFormLinkColor: "#2B8BD5",
        fontFamily: "inter",
        borderRadius: 12,
        borderColor: "#FFFFFF",
        ticketCardsBackground: "#FFFFFF",
      },
      defaultLanguage: tpLocale,
      availableLanguages: ["AZ", "EN", "RU"],
      defaultCurrency: "AZN",
      availableCurrencies: ["AZN", "USD", "EUR"],
      flightParams: { origin: "BAK", destination: "" },
      marker: MARKER,
      showHotels: false,
      showReferralLink: false,
      onLocaleChange: "tpwlLocaleChange",
      onCurrencyChange: "tpwlCurrencyChange",
    };

    w.TPWL_CONFIGURATION = {
      ...(w.TPWL_CONFIGURATION || {}),
      version: "v2",
    };

    if (booted.current) {
      try {
        w.tpwlCurrencyChange?.(currency);
        w.tpwlLocaleChange?.(tpLocale);
      } catch {
        /* widget may not expose hooks until fully ready */
      }
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src^="https://tpwgt.com/wl_web/main.js"]`);
    if (existing) {
      booted.current = true;
      const timer = window.setTimeout(() => {
        const tickets = document.getElementById("tpwl-tickets");
        if (tickets && tickets.childElementCount === 0) void loadDemoFallback();
      }, 8000);
      return () => window.clearTimeout(timer);
    }

    const script = document.createElement("script");
    script.src = WL_SCRIPT;
    script.type = "module";
    script.async = true;
    script.dataset.travellabTpwl = "1";
    script.onerror = () => {
      void loadDemoFallback();
    };
    document.body.appendChild(script);
    booted.current = true;

    const timer = window.setTimeout(() => {
      const tickets = document.getElementById("tpwl-tickets");
      if (tickets && tickets.childElementCount === 0) void loadDemoFallback();
    }, 10000);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "travellab-currency" && e.newValue) {
        try {
          w.tpwlCurrencyChange?.(e.newValue);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearTimeout(timer);
    };
  }, [locale]);

  return (
    <div className="tpwl-shell">
      <div className="tpwl-main">
        <header className="tpwl-search-header" id="search">
          <div className="tpwl-search__wrapper">
            <div className="tpwl__content">
              <div id="tpwl-search" />
            </div>
          </div>
        </header>
        <div className="tpwl-tickets__wrapper">
          <div className="tpwl__content">
            <div id="tpwl-tickets" />
            {fallback && (
              <div className="mt-6 space-y-3">
                {fallbackNote && <p className="notice">{fallbackNote}</p>}
                {!fallback.length && <p className="muted">Nəticə tapılmadı.</p>}
                {fallback.map((o) => (
                  <div key={String(o.id || `${o.airline}-${o.total}`)} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        {o.origin || "GYD"} → {o.destination || "IST"} · {o.airline || "XX"}
                      </p>
                      <p className="muted text-sm">
                        {o.depart_at || "—"} · {o.stops ?? 0} dayanacaq
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[var(--tl-green)]">
                        {o.total} {o.currency || "AZN"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div id="tpwl-modals" />
      </div>
      <p className="tpwl-source-note">
        Əsas mənbə: Travelpayouts White Label (wl_id=17018). Widget uğursuz olsa, backend ehtiyat axtarışı göstərilir.
      </p>
    </div>
  );
}

/** Build original-style flightSearch code: GYD1512IST22121 */
export function buildFlightSearchCode(opts: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string | null;
  adults?: number;
}) {
  const origin = opts.origin.toUpperCase().slice(0, 3);
  const destination = opts.destination.toUpperCase().slice(0, 3);
  const toDdMm = (iso: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) return "";
    return `${m[3]}${m[2]}`;
  };
  const depart = toDdMm(opts.departDate);
  if (!origin || !destination || !depart) return "";
  let code = `${origin}${depart}${destination}`;
  if (opts.returnDate) {
    const ret = toDdMm(opts.returnDate);
    if (ret) code += ret;
  }
  code += String(Math.max(1, opts.adults || 1));
  return code;
}
