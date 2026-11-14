"use client";

import { create } from "zustand";

export type ThemeMode = "day" | "night";

type ThemeState = {
  mode: ThemeMode;
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  hydrate: () => void;
};

function applyDom(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode === "night" ? "dark" : "light";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "day",
  hydrated: false,
  setMode: (mode) => {
    applyDom(mode);
    try {
      localStorage.setItem("travellab-theme", mode);
    } catch {
      /* ignore */
    }
    set({ mode });
  },
  toggle: () => {
    const next = get().mode === "day" ? "night" : "day";
    get().setMode(next);
  },
  hydrate: () => {
    if (get().hydrated) return;
    let mode: ThemeMode = "day";
    try {
      const saved = localStorage.getItem("travellab-theme");
      if (saved === "day" || saved === "night") mode = saved;
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) mode = "night";
    } catch {
      /* ignore */
    }
    applyDom(mode);
    set({ mode, hydrated: true });
  },
}));
