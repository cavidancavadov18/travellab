"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { FeatureKey, FeatureLogo } from "@/components/brand-marks";

export const PREMIUM_VISUALS = {
  planner: {
    image: "/images/destinations/maldives.jpg",
    video: "/videos/travel.mp4",
    accent: "#0ea5e9",
    motif: "ai",
  },
  map: {
    image: "/images/destinations/dubai.jpg",
    video: "/videos/travel.mp4",
    accent: "#22c55e",
    motif: "globe",
  },
  budget: {
    image: "/images/destinations/paris.jpg",
    video: "/videos/travel.mp4",
    accent: "#f59e0b",
    motif: "budget",
  },
  compare: {
    image: "/images/destinations/istanbul.jpg",
    video: "/videos/city.mp4",
    accent: "#14b8a6",
    motif: "compare",
  },
  venue: {
    image: "/images/hotels/hero-pool.jpg",
    video: "/videos/travel.mp4",
    accent: "#38bdf8",
    motif: "360",
  },
  dashboard: {
    image: "/images/stories/labpoint-001.jpg",
    video: "/videos/city.mp4",
    accent: "#34d399",
    motif: "dash",
  },
  trip: {
    image: "/images/destinations/tokyo.jpg",
    video: "/videos/city.mp4",
    accent: "#a78bfa",
    motif: "trip",
  },
  deals: {
    image: "/images/destinations/phuket.jpg",
    video: "/videos/travel.mp4",
    accent: "#f97316",
    motif: "deals",
  },
  assistant: {
    image: "/images/stories/reviews-001.jpg",
    video: "/videos/travel.mp4",
    accent: "#2dd4bf",
    motif: "chat",
  },
  wishlist: {
    image: "/images/destinations/bali.jpg",
    video: "/videos/travel.mp4",
    accent: "#fb7185",
    motif: "heart",
  },
  hub: {
    image: "/images/hero/mosque.jpg",
    video: "/videos/city.mp4",
    accent: "#22c55e",
    motif: "hub",
  },
} as const;

type ThemeKey = keyof typeof PREMIUM_VISUALS;

const THEME_FEATURE: Partial<Record<ThemeKey, FeatureKey>> = {
  planner: "ai-planner",
  map: "map",
  budget: "budget",
  compare: "compare",
  venue: "venue360",
  dashboard: "dashboard",
  trip: "my-trip",
  deals: "smart-deals",
  assistant: "assistant",
  wishlist: "wishlist",
  hub: "premium",
};

export function CinematicHero({
  theme,
  title,
  body,
  badge = "Premium Experience",
  actions,
  feature,
}: {
  theme: ThemeKey;
  title: string;
  body: string;
  badge?: string;
  actions?: ReactNode;
  feature?: FeatureKey;
}) {
  const cfg = PREMIUM_VISUALS[theme];
  const brand = feature || THEME_FEATURE[theme];
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOk, setVideoOk] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce && videoRef.current) {
      videoRef.current.pause();
      setVideoOk(false);
    }
  }, []);

  return (
    <section ref={ref} className="cine-hero" style={{ ["--cine-accent" as string]: cfg.accent }}>
      <motion.div className="cine-media" style={{ y, scale, opacity }}>
        {videoOk ? (
          <video
            ref={videoRef}
            className="cine-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={cfg.image}
            onError={() => setVideoOk(false)}
          >
            <source src={cfg.video} type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cfg.image} alt="" className="cine-fallback kenburns" />
        )}
        <div className="cine-grain" />
        <div className="cine-wash" />
      </motion.div>

      <div className="shell cine-content">
        {brand && (
          <motion.div
            className="cine-brand"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <FeatureLogo id={brand} size={52} withLabel />
          </motion.div>
        )}
        <motion.p
          className="cine-badge"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {badge}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="cine-body"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16 }}
        >
          {body}
        </motion.p>
        {actions && (
          <motion.div
            className="cine-actions"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
          >
            {actions}
          </motion.div>
        )}
      </div>

      <div className={`cine-motif motif-${cfg.motif}`} aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

export function MotionCard({
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
      className={`motion-card ${className}`}
      initial={{ opacity: 0, y: 36, rotateX: 6 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      {children}
    </motion.div>
  );
}

export function ZoomImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`zoom-frame ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}

export function ParallaxStrip({ images }: { images: string[] }) {
  return (
    <div className="parallax-strip" aria-hidden>
      <div className="parallax-track">
        {[...images, ...images].map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${src}-${i}`} src={src} alt="" loading="lazy" />
        ))}
      </div>
    </div>
  );
}

export function FloatingOrbs() {
  return (
    <div className="float-orbs" aria-hidden>
      <i />
      <i />
      <i />
    </div>
  );
}

export function PremiumQuickLinks() {
  const links = [
    ["/ai-planner", "AI Planner", "ai-planner"],
    ["/map", "Xəritə", "map"],
    ["/budget", "Büdcə", "budget"],
    ["/compare", "Müqayisə", "compare"],
    ["/360", "360°", "venue360"],
    ["/smart-deals", "Deals", "smart-deals"],
  ] as const;
  return (
    <div className="premium-quick">
      {links.map(([href, label, id], i) => (
        <motion.div key={href} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
          <Link href={href} className="premium-quick-link" aria-label={label}>
            <FeatureLogo id={id} size={22} animated={false} />
            <span>{label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
