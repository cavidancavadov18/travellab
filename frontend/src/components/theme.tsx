"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useThemeStore } from "@/lib/theme/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useThemeStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return <>{children}</>;
}

/** Flowing star field — only visible in night mode */
export function NightStarfield() {
  const mode = useThemeStore((s) => s.mode);
  const hydrated = useThemeStore((s) => s.hydrated);
  const reduce = useReducedMotion();

  const stars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        top: `${(i * 17 + 7) % 96}%`,
        left: `${(i * 29 + 3) % 100}%`,
        size: 1.2 + (i % 4) * 0.7,
        delay: (i % 12) * 0.35,
        duration: 10 + (i % 8) * 1.8,
        drift: 40 + (i % 6) * 18,
        twinkle: 1.6 + (i % 5) * 0.4,
      })),
    [],
  );

  if (!hydrated || mode !== "night") return null;

  return (
    <div className="tl-starfield" aria-hidden>
      {stars.map((s) => (
        <span
          key={s.id}
          className={`tl-star ${reduce ? "is-static" : ""}`}
          style={
            {
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              ["--star-delay" as string]: `${s.delay}s`,
              ["--star-dur" as string]: `${s.duration}s`,
              ["--star-drift" as string]: `${s.drift}vw`,
              ["--twinkle" as string]: `${s.twinkle}s`,
            } as React.CSSProperties
          }
        />
      ))}
      {!reduce && (
        <>
          <span className="tl-star-stream tl-star-stream-a" />
          <span className="tl-star-stream tl-star-stream-b" />
          <span className="tl-star-stream tl-star-stream-c" />
        </>
      )}
    </div>
  );
}

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);
  const night = mode === "night";

  return (
    <button
      type="button"
      className="tl-theme-toggle"
      onClick={toggle}
      aria-label={night ? "Gündüz rejiminə keç" : "Gecə rejiminə keç"}
      title={night ? "Gündüz" : "Gecə"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {night ? (
          <motion.span
            key="sun"
            className="tl-theme-icon"
            initial={{ rotate: -40, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 40, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.28 }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
              <path d="M12 2v2.5M12 19.5V22M4.5 12H2M22 12h-2.5M5.2 5.2l1.8 1.8M17 17l1.8 1.8M17 7l1.8-1.8M5.2 18.8 7 17" strokeLinecap="round" />
            </svg>
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            className="tl-theme-icon"
            initial={{ rotate: 40, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -40, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.28 }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
              <path d="M20.2 14.3A8.5 8.5 0 0 1 9.7 3.8a7.2 7.2 0 1 0 10.5 10.5z" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

