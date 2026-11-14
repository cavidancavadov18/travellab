"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  STORY_CATEGORIES,
  StoryCategory,
  StoryMedia,
  flattenRecent,
  getCategoryById,
} from "@/lib/stories";

function StoryGlyph({ kind }: { kind: StoryCategory["icon"] }) {
  const p = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "users":
      return (
        <svg {...p}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
          <path d="M15.5 4.5c1.6.4 2.8 1.9 2.8 3.6 0 1.7-1.2 3.2-2.8 3.6M18 14c2 .4 3.5 1.9 3.5 3.8" />
        </svg>
      );
    case "passport":
      return (
        <svg {...p}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <circle cx="12" cy="10" r="2.6" />
          <path d="M8.5 16.5c.7-1.6 2-2.4 3.5-2.4s2.8.8 3.5 2.4" />
        </svg>
      );
    case "tag":
      return (
        <svg {...p}>
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <path d="M18 6L6 18" />
        </svg>
      );
    case "camera":
      return (
        <svg {...p}>
          <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h2l1.2-1.8h6.6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9z" />
          <circle cx="12" cy="13" r="3.2" />
        </svg>
      );
    case "gift":
      return (
        <svg {...p}>
          <rect x="4" y="9" width="16" height="11" rx="1.5" />
          <path d="M4 13h16M12 9v11M12 9c-2.2 0-4-1.2-4-2.6S10.2 4 12 5.5C13.8 4 16 4.8 16 6.4S14.2 9 12 9z" />
        </svg>
      );
    case "bag":
      return (
        <svg {...p}>
          <path d="M6 8h12l1 12H5L6 8Z" />
          <path d="M9 8V7a3 3 0 0 1 6 0v1" />
        </svg>
      );
    case "star":
      return (
        <svg {...p}>
          <path d="M12 3.5l2.7 5.5 6 .9-4.4 4.3 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.3 6-.9z" />
        </svg>
      );
    case "reviews":
      return (
        <svg {...p}>
          <path d="M5 5h14v10H9l-4 4V5z" />
          <path d="M8 9h8M8 12h5" />
        </svg>
      );
    case "ticket":
      return (
        <svg {...p}>
          <rect x="3" y="7" width="18" height="10" rx="2" />
          <path d="M8 7v10M3 12h2M19 12h2" />
        </svg>
      );
  }
}

function useStoryProgress(active: boolean, durationMs: number, paused: boolean, onDone: () => void) {
  const [progress, setProgress] = useState(0);
  const start = useRef(0);
  const acc = useRef(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      acc.current = 0;
      return;
    }
    if (paused) return;
    start.current = performance.now();
    let raf = 0;
    let done = false;
    const tick = (now: number) => {
      const elapsed = acc.current + (now - start.current);
      const p = Math.min(1, elapsed / durationMs);
      setProgress(p);
      if (p >= 1) {
        if (!done) {
          done = true;
          onDone();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (!done) acc.current += performance.now() - start.current;
    };
  }, [active, paused, durationMs, onDone]);

  useEffect(() => {
    if (!active) return;
    acc.current = 0;
    setProgress(0);
  }, [active, durationMs]);

  return progress;
}

function StoryViewer({
  open,
  categoryId,
  startIndex = 0,
  onClose,
}: {
  open: boolean;
  categoryId: string;
  startIndex?: number;
  onClose: () => void;
}) {
  const [catId, setCatId] = useState(categoryId);
  const [index, setIndex] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const category = getCategoryById(catId);
  const item = category.items[index] || category.items[0];
  const duration = item?.type === "video" ? 12000 : 5500;

  useEffect(() => {
    if (!open) return;
    setCatId(categoryId);
    setIndex(startIndex);
  }, [open, categoryId, startIndex]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i < category.items.length - 1) return i + 1;
      const catIdx = STORY_CATEGORIES.findIndex((c) => c.id === category.id);
      const nextCat = STORY_CATEGORIES[(catIdx + 1) % STORY_CATEGORIES.length];
      setCatId(nextCat.id);
      return 0;
    });
  }, [category]);

  const goPrev = useCallback(() => {
    setIndex((i) => {
      if (i > 0) return i - 1;
      const catIdx = STORY_CATEGORIES.findIndex((c) => c.id === category.id);
      const prevCat = STORY_CATEGORIES[(catIdx - 1 + STORY_CATEGORIES.length) % STORY_CATEGORIES.length];
      setCatId(prevCat.id);
      return Math.max(0, prevCat.items.length - 1);
    });
  }, [category]);

  const onDone = useCallback(() => goNext(), [goNext]);
  const progress = useStoryProgress(open && Boolean(item), duration, paused, onDone);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goPrev();
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
      if (e.key.toLowerCase() === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goNext, goPrev]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (paused) v.pause();
    else void v.play().catch(() => {});
  }, [muted, paused, item?.id, open]);

  if (!open || !item) return null;

  const likes = (item.likes || 0) + (liked[item.id] ? 1 : 0);

  return (
    <AnimatePresence>
      <motion.div
        className="tl-story-viewer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Storilər"
      >
        <aside className="tl-story-viewer-sidebar">
          <div className="tl-story-viewer-sidebar-title">Storilərimiz</div>
          {STORY_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`tl-story-viewer-sidebar-item ${c.id === category.id ? "active" : ""}`}
              onClick={() => {
                setCatId(c.id);
                setIndex(0);
              }}
            >
              <span className={`tl-story-viewer-sidebar-icon tl-logo-color-${c.color}`}>
                <StoryGlyph kind={c.icon} />
              </span>
              <span className="tl-story-viewer-sidebar-name">{c.label}</span>
              <span className="tl-story-viewer-sidebar-count">{c.items.length}</span>
            </button>
          ))}
        </aside>

        <div className="tl-story-viewer-stage">
          <div className="tl-story-viewer-phone">
            <div className="tl-story-progress">
              {category.items.map((s, i) => (
                <span key={s.id} className="tl-story-progress-seg">
                  <i
                    style={{
                      width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                    }}
                  />
                </span>
              ))}
            </div>

            <div className="tl-story-viewer-head">
              <div className="tl-story-viewer-author">
                <span className={`tl-story-viewer-author-avatar tl-logo-color-${category.color}`}>
                  <StoryGlyph kind={category.icon} />
                </span>
                <div className="tl-story-viewer-author-text">
                  <strong>Travellab</strong>
                  <span>{category.label}</span>
                </div>
              </div>
              <div className="tl-story-viewer-head-actions">
                <button type="button" className="tl-story-viewer-iconbtn" onClick={() => setMuted((m) => !m)} aria-label="Səs">
                  {muted ? "🔇" : "🔊"}
                </button>
                <button type="button" className="tl-story-viewer-iconbtn" onClick={onClose} aria-label="Bağla">
                  ✕
                </button>
              </div>
            </div>

            <div
              className="tl-story-viewer-media"
              onPointerDown={() => setPaused(true)}
              onPointerUp={() => setPaused(false)}
              onPointerLeave={() => setPaused(false)}
            >
              {item.type === "video" ? (
                <video
                  key={item.id}
                  ref={videoRef}
                  className="tl-story-viewer-media-el"
                  src={item.src}
                  poster={item.poster}
                  autoPlay
                  playsInline
                  muted={muted}
                  loop={false}
                  onEnded={goNext}
                  onError={() => goNext()}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={item.id} src={item.src} alt="" className="tl-story-viewer-media-el" onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/hero/mosque.jpg";
                }} />
              )}
              <button type="button" className="tl-story-tap tl-story-tap-left" aria-label="Əvvəlki" onClick={goPrev} />
              <button type="button" className="tl-story-tap tl-story-tap-right" aria-label="Növbəti" onClick={goNext} />
            </div>

            <div className="tl-story-viewer-nav">
              <button type="button" onClick={goPrev} aria-label="Yuxarı">↑</button>
              <button type="button" onClick={goNext} aria-label="Aşağı">↓</button>
            </div>

            <div className="tl-story-viewer-bottom">
              <div className="tl-story-viewer-social">
                <button
                  type="button"
                  className={`tl-story-viewer-socialbtn ${liked[item.id] ? "is-liked" : ""}`}
                  onClick={() => setLiked((s) => ({ ...s, [item.id]: !s[item.id] }))}
                  aria-label="Bəyən"
                >
                  ♥ <span className="tl-story-viewer-socialcount">{likes}</span>
                </button>
                <span className="tl-story-viewer-socialbtn">
                  💬 <span className="tl-story-viewer-socialcount">{item.comments || 0}</span>
                </span>
              </div>
              {item.cta && (
                <Link href={item.cta.href} className="tl-story-viewer-linkbtn" onClick={onClose}>
                  {item.cta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function StoriesSection() {
  const t = useTranslations("home");
  const [open, setOpen] = useState(false);
  const [catId, setCatId] = useState("turistler");
  const [startIndex, setStartIndex] = useState(0);
  const recent = useMemo(() => flattenRecent(12), []);

  function openStory(id: string, index = 0) {
    setCatId(id);
    setStartIndex(index);
    setOpen(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("story", `${id}-${String(index + 1).padStart(3, "0")}`);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function closeStory() {
    setOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("story");
      window.history.replaceState({}, "", url.toString());
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = new URLSearchParams(window.location.search).get("story");
    if (!raw) return;
    const [id] = raw.split("-");
    if (STORY_CATEGORIES.some((c) => c.id === id)) openStory(id, 0);
  }, []);

  return (
    <>
      <section className="section">
        <div className="shell">
          <p className="section-label">{t("stories")}</p>
          <h2 className="section-title">{t("stories")}</h2>

          <div className="stories-row mt-6">
            {STORY_CATEGORIES.map((s) => (
              <button key={s.id} type="button" className="story-item" onClick={() => openStory(s.id)}>
                <div className="story-ring">
                  <span className={`story-avatar tl-logo-color-${s.color}`} aria-hidden>
                    <StoryGlyph kind={s.icon} />
                  </span>
                </div>
                <p>{s.label}</p>
              </button>
            ))}
          </div>

          <h2 className="section-title mt-8">{t("recentStories")}</h2>
          <div className="story-cards mt-4">
            {recent.map(({ category, item }) => (
              <button
                key={`${category.id}-${item.id}`}
                type="button"
                className="story-card story-card-btn"
                onClick={() => openStory(category.id, Math.max(0, category.items.findIndex((x) => x.id === item.id)))}
              >
                {item.type === "video" ? (
                  <video src={item.src} muted playsInline preload="metadata" className="story-card-media" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.src} alt="" className="story-card-media" />
                )}
                <span className="story-card-pill">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <StoryViewer open={open} categoryId={catId} startIndex={startIndex} onClose={closeStory} />
    </>
  );
}
