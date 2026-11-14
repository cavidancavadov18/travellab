"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link, useRouter } from "@/i18n/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

export const HERO_SLIDES = [
  { src: "/images/hero/mosque.jpg", label: "Bakı", caption: "Şəhərin qızıl işıqları" },
  { src: "/images/destinations/maldives.jpg", label: "Maldives", caption: "Ada cənnəti" },
  { src: "/images/destinations/istanbul.jpg", label: "İstanbul", caption: "Boğaz mənzərəsi" },
  { src: "/images/destinations/dubai.jpg", label: "Dubai", caption: "Lüks qaçış" },
  { src: "/images/hero/balloons.jpg", label: "Kapadokiya", caption: "Səhər uçuşu" },
  { src: "/images/destinations/paris.jpg", label: "Paris", caption: "Romantik küçələr" },
] as const;

const MAP_POINTS = [
  { id: "gyd", name: "Bakı", x: 58.5, y: 42, href: "/tours?search=Bakı" },
  { id: "ist", name: "İstanbul", x: 53.2, y: 39, href: "/tours?search=İstanbul" },
  { id: "dxb", name: "Dubai", x: 61.2, y: 52, href: "/tours?search=Dubai" },
  { id: "mle", name: "Maldives", x: 66.5, y: 62, href: "/tours?search=Maldiv" },
  { id: "par", name: "Paris", x: 46.8, y: 36, href: "/tours?search=Paris" },
  { id: "nyc", name: "New York", x: 26.5, y: 40, href: "/tours?search=New York" },
  { id: "bkk", name: "Bangkok", x: 74.2, y: 55, href: "/tours?search=Tayland" },
] as const;

const DISCOVERY = [
  { label: "Maldives", image: "/images/destinations/maldives.jpg", href: "/tours?search=Maldiv", tag: "Ada" },
  { label: "Dubai", image: "/images/destinations/dubai.jpg", href: "/tours?search=Dubai", tag: "Şəhər" },
  { label: "Paris", image: "/images/destinations/paris.jpg", href: "/tours?search=Paris", tag: "Romantik" },
  { label: "Bali", image: "/images/destinations/bali.jpg", href: "/tours?search=Bali", tag: "Təbiət" },
  { label: "Tokyo", image: "/images/destinations/tokyo.jpg", href: "/tours?search=Tokyo", tag: "Mədəniyyət" },
] as const;

export function HomeHeroShell({
  children,
  badge,
}: {
  children: ReactNode;
  badge?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [activePoint, setActivePoint] = useState<string | null>("gyd");
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.08]);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), 5200);
    return () => window.clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setActivePoint((prev) => {
        const i = MAP_POINTS.findIndex((p) => p.id === prev);
        return MAP_POINTS[(i + 1) % MAP_POINTS.length].id;
      });
    }, 2600);
    return () => window.clearInterval(id);
  }, [reduce]);

  const slide = HERO_SLIDES[index];

  return (
    <section ref={sectionRef} className="hero hero-premium">
      <motion.div className="hero-media" style={{ y, scale }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.src}
            className="hero-slide"
            style={{ backgroundImage: `url(${slide.src})` }}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.2 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
        <div className="hero-wash" />
        <div className="hero-grain" aria-hidden />
      </motion.div>

      <div className="shell hero-inner hero-premium-inner">
        <div className="hero-copy">
          {children}
        </div>

        <div className="hero-map-stage" aria-label="Dünya xəritəsi üzərində istiqamətlər">
          <svg className="hero-map-svg" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet" role="img">
            <defs>
              <linearGradient id="hm-land" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,.22)" />
                <stop offset="100%" stopColor="rgba(255,255,255,.08)" />
              </linearGradient>
              <filter id="hm-glow">
                <feGaussianBlur stdDeviation="0.6" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Simplified continents */}
            <path
              fill="url(#hm-land)"
              d="M8 28c4-8 12-12 18-10 5 1 8 6 7 11-2 6-9 9-15 8-7-1-12-4-10-9zm22 2c6-4 14-3 18 2 3 4 2 10-2 13-5 4-13 3-17-1-4-5-3-10 1-14zm20-8c7-3 16-1 20 5 4 6 2 14-4 17-7 4-16 1-20-5-3-6-2-13 4-17zm24 8c5-5 14-6 19-1 5 4 5 12 0 16-5 5-14 5-19 0-4-4-4-10 0-15zM12 48c5-2 11 0 14 4 2 4 0 9-4 11-5 2-11 0-13-4-2-4 0-9 3-11zm48 6c6-3 14-2 17 3 2 4 0 9-5 11-6 2-13 0-16-4-2-4 0-8 4-10z"
            />
            {/* Flight arcs */}
            <path className="hero-map-route" d="M58.5 42 C 56 40, 54.5 39.2, 53.2 39" />
            <path className="hero-map-route" d="M58.5 42 C 59.5 46, 60.5 50, 61.2 52" />
            <path className="hero-map-route" d="M58.5 42 C 52 40, 48 38, 46.8 36" />
            <path className="hero-map-route hero-map-route-long" d="M58.5 42 C 48 38, 36 38, 26.5 40" />
            {MAP_POINTS.map((p) => {
              const on = activePoint === p.id;
              return (
                <g
                  key={p.id}
                  className={`hero-map-point ${on ? "is-active" : ""}`}
                  role="link"
                  tabIndex={0}
                  aria-label={p.name}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setActivePoint(p.id)}
                  onClick={() => router.push(p.href)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(p.href);
                    }
                  }}
                >
                  <circle cx={p.x} cy={p.y} r={on ? 1.8 : 1.2} className="hero-map-dot" filter="url(#hm-glow)" />
                  <circle cx={p.x} cy={p.y} r={on ? 4.2 : 3} className="hero-map-pulse" />
                  {on && (
                    <text x={p.x} y={p.y - 3.2} textAnchor="middle" className="hero-map-label">
                      {p.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="hero-map-caption">
            <span className="hero-map-live" />
            Canlı istiqamətlər · {MAP_POINTS.find((p) => p.id === activePoint)?.name}
          </div>
        </div>
      </div>

      <div className="hero-slide-meta" aria-hidden>
        <strong>{slide.label}</strong>
        <span>{slide.caption}</span>
      </div>
      <div className="hero-slide-dots" role="tablist" aria-label="Hero şəkilləri">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={i === index ? "is-active" : undefined}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
      {badge}
    </section>
  );
}

export function HeroEntrance({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Creative #2 — attention-grabbing travel discovery orbit */
export function TravelDiscovery() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % DISCOVERY.length), 3400);
    return () => window.clearInterval(id);
  }, [reduce]);

  const current = DISCOVERY[index];

  return (
    <section className="section !py-4">
      <div className="shell">
        <div className="tl-discovery">
          <div className="tl-discovery-radar" aria-hidden>
            <span />
            <span />
            <span />
            <i className="tl-discovery-plane" />
          </div>
          <div className="tl-discovery-copy">
            <p className="section-label">Kəşfiyyat</p>
            <h2 className="section-title">Bu gün hara uçaq?</h2>
            <p className="muted mt-2 max-w-md">
              Real vaxt kəşf animasiyası — istiqaməti seç, turları dərhal aç.
            </p>
          </div>
          <div className="tl-discovery-stage">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.label}
                className="tl-discovery-card"
                initial={reduce ? false : { opacity: 0, x: 28, rotateY: -8 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -18, rotateY: 6 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.image} alt={current.label} />
                <div>
                  <span>{current.tag}</span>
                  <strong>{current.label}</strong>
                  <Link href={current.href} className="btn btn-green">
                    Kəşf et →
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="tl-discovery-chips">
              {DISCOVERY.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  className={i === index ? "is-active" : undefined}
                  onClick={() => setIndex(i)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ParallaxMedia({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  return (
    <div ref={ref} className={`tl-parallax ${className}`}>
      <motion.div style={{ y }} className="tl-parallax-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
      </motion.div>
    </div>
  );
}

export function StaggerReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
