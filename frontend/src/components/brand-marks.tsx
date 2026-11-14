"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

export type FeatureKey =
  | "ai-planner"
  | "smart-deals"
  | "my-trip"
  | "labpoint"
  | "map"
  | "budget"
  | "compare"
  | "venue360"
  | "dashboard"
  | "assistant"
  | "wishlist"
  | "premium";

const FEATURE_META: Record<
  FeatureKey,
  { title: string; accent: string; accent2: string; href: string }
> = {
  "ai-planner": { title: "AI Travel Planner", accent: "#0ea5e9", accent2: "#0369a1", href: "/ai-planner" },
  "smart-deals": { title: "Smart Deals", accent: "#f97316", accent2: "#c2410c", href: "/smart-deals" },
  "my-trip": { title: "My Trip", accent: "#8b5cf6", accent2: "#5b21b6", href: "/my-trip" },
  labpoint: { title: "Labpoint", accent: "#069547", accent2: "#047857", href: "/labpoint" },
  map: { title: "World Map", accent: "#22c55e", accent2: "#15803d", href: "/map" },
  budget: { title: "Budget", accent: "#f59e0b", accent2: "#b45309", href: "/budget" },
  compare: { title: "Compare", accent: "#14b8a6", accent2: "#0f766e", href: "/compare" },
  venue360: { title: "360°", accent: "#38bdf8", accent2: "#0284c7", href: "/360" },
  dashboard: { title: "Dashboard", accent: "#34d399", accent2: "#059669", href: "/dashboard" },
  assistant: { title: "AI Assistant", accent: "#2dd4bf", accent2: "#0f766e", href: "/assistant" },
  wishlist: { title: "Wishlist", accent: "#fb7185", accent2: "#be123c", href: "/wishlist" },
  premium: { title: "Premium", accent: "#069547", accent2: "#314973", href: "/premium" },
};

function FeatureGlyph({ id }: { id: FeatureKey }) {
  switch (id) {
    case "ai-planner":
      return (
        <>
          <circle cx="32" cy="32" r="10" fill="none" stroke="#fff" strokeWidth="2.2" />
          <path d="M32 18v4M32 42v4M18 32h4M42 32h4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M24 24l3 3M37 37l3 3M37 24l-3 3M24 40l3-3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="32" r="3.2" fill="#fff" />
        </>
      );
    case "smart-deals":
      return (
        <>
          <path d="M22 22h14l4 8-11 14-11-14 4-8z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M28 30h8M30 26v12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </>
      );
    case "my-trip":
      return (
        <>
          <rect x="20" y="24" width="24" height="18" rx="3" fill="none" stroke="#fff" strokeWidth="2.2" />
          <path d="M26 24v-3a6 6 0 0 1 12 0v3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M20 33h24" stroke="#fff" strokeWidth="2.2" />
          <circle cx="26" cy="38" r="1.6" fill="#fff" />
          <circle cx="38" cy="38" r="1.6" fill="#fff" />
        </>
      );
    case "labpoint":
      return (
        <>
          <path d="M32 16l3.2 9.2H45l-7.6 5.6 2.9 9.2L32 34.4l-8.3 5.6 2.9-9.2L19 25.2h9.8z" fill="#fff" />
          <circle cx="46" cy="18" r="2.2" fill="#fff" opacity=".85" />
          <circle cx="18" cy="42" r="1.6" fill="#fff" opacity=".7" />
        </>
      );
    case "map":
      return (
        <>
          <circle cx="32" cy="30" r="14" fill="none" stroke="#fff" strokeWidth="2.2" />
          <path d="M18 30h28M32 16c4 5 6 10 6 14s-2 9-6 14c-4-5-6-10-6-14s2-9 6-14z" fill="none" stroke="#fff" strokeWidth="2" />
          <circle cx="32" cy="30" r="3" fill="#fff" />
        </>
      );
    case "budget":
      return (
        <>
          <circle cx="32" cy="32" r="14" fill="none" stroke="#fff" strokeWidth="2.2" />
          <path d="M32 22v20M27 27h7.5a4 4 0 0 1 0 8H29a4 4 0 0 0 0 8h9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </>
      );
    case "compare":
      return (
        <>
          <rect x="17" y="20" width="12" height="24" rx="2.5" fill="none" stroke="#fff" strokeWidth="2.2" />
          <rect x="35" y="14" width="12" height="30" rx="2.5" fill="none" stroke="#fff" strokeWidth="2.2" />
          <path d="M21 38h4M39 36h4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </>
      );
    case "venue360":
      return (
        <>
          <ellipse cx="32" cy="32" rx="16" ry="10" fill="none" stroke="#fff" strokeWidth="2.2" />
          <path d="M32 22c4 3.5 6.5 7 6.5 10s-2.5 6.5-6.5 10c-4-3.5-6.5-7-6.5-10s2.5-6.5 6.5-10z" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M18 32h28" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "dashboard":
      return (
        <>
          <rect x="17" y="17" width="13" height="13" rx="2.5" fill="none" stroke="#fff" strokeWidth="2.2" />
          <rect x="34" y="17" width="13" height="8" rx="2.5" fill="none" stroke="#fff" strokeWidth="2.2" />
          <rect x="17" y="34" width="13" height="8" rx="2.5" fill="none" stroke="#fff" strokeWidth="2.2" />
          <rect x="34" y="29" width="13" height="13" rx="2.5" fill="none" stroke="#fff" strokeWidth="2.2" />
        </>
      );
    case "assistant":
      return (
        <>
          <path d="M18 24a10 10 0 0 1 10-8h8a10 10 0 0 1 10 10v2a10 10 0 0 1-10 10H30l-7 6v-6h-1a10 10 0 0 1-10-10v-4z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="28" cy="28" r="1.8" fill="#fff" />
          <circle cx="34" cy="28" r="1.8" fill="#fff" />
          <circle cx="40" cy="28" r="1.8" fill="#fff" />
        </>
      );
    case "wishlist":
      return (
        <path
          d="M32 46s-14-8.8-14-18.2A8.6 8.6 0 0 1 32 22a8.6 8.6 0 0 1 14 5.8C46 37.2 32 46 32 46z"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      );
    case "premium":
      return (
        <>
          <path d="M20 40l4-18 8 10 8-10 4 18H20z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M24 22l8-6 8 6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    default:
      return null;
  }
}

export function FeatureLogo({
  id,
  size = 44,
  withLabel = false,
  className = "",
  animated = true,
}: {
  id: FeatureKey;
  size?: number;
  withLabel?: boolean;
  className?: string;
  animated?: boolean;
}) {
  const meta = FEATURE_META[id];
  const mark = (
    <span
      className="tl-feature-mark"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${meta.accent}, ${meta.accent2})`,
      }}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" width={size * 0.58} height={size * 0.58}>
        <FeatureGlyph id={id} />
      </svg>
    </span>
  );

  const body = (
    <span className={`tl-feature-logo ${className}`}>
      {animated ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.75, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.06 }}
          className="inline-flex"
        >
          {mark}
        </motion.span>
      ) : (
        mark
      )}
      {withLabel && <span className="tl-feature-label">{meta.title}</span>}
    </span>
  );

  return body;
}

export function FeatureLogoLink({
  id,
  size = 40,
  withLabel = true,
}: {
  id: FeatureKey;
  size?: number;
  withLabel?: boolean;
}) {
  const meta = FEATURE_META[id];
  return (
    <Link href={meta.href} className="tl-feature-link" aria-label={meta.title}>
      <FeatureLogo id={id} size={size} withLabel={withLabel} />
    </Link>
  );
}

/** Official Travellab mark + wordmark — artwork unchanged, soft motion only. */
export function OfficialLogo({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "light" | "mark";
  className?: string;
}) {
  return (
    <Link href="/" className={`tl-logo tl-logo--${variant} ${className}`.trim()} aria-label="travellab">
      <motion.span
        className="tl-logo-official"
        initial={{ opacity: 0, scale: 0.9, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.035 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/official-mark.svg"
          alt=""
          width={36}
          height={38}
          className="tl-logo-mark-img"
          draggable={false}
        />
        {variant !== "mark" && (
          <motion.span
            className="tl-logo-word"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            travellab
          </motion.span>
        )}
      </motion.span>
    </Link>
  );
}

export { FEATURE_META };
