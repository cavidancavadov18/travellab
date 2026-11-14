"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api/client";

export type User = {
  id?: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  labpoint_balance?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  refresh: string | null;
  hydrated: boolean;
  setSession: (token: string, user?: User | null, refresh?: string | null) => void;
  loadUser: () => Promise<User | null>;
  logout: () => void;
  requireAuth: () => boolean;
};

function writeTokens(token: string | null, refresh: string | null = null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("travellab-token", token);
  else localStorage.removeItem("travellab-token");
  if (refresh) localStorage.setItem("travellab-refresh", refresh);
  else if (refresh === null && !token) localStorage.removeItem("travellab-refresh");
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("travellab-token");
  localStorage.removeItem("travellab-refresh");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refresh: null,
      hydrated: false,
      setSession: (token, user = null, refresh = undefined) => {
        const nextRefresh = refresh === undefined ? get().refresh : refresh;
        writeTokens(token, nextRefresh);
        if (nextRefresh) localStorage.setItem("travellab-refresh", nextRefresh);
        set({ token, user, refresh: nextRefresh });
      },
      loadUser: async () => {
        const token = get().token || (typeof window !== "undefined" ? localStorage.getItem("travellab-token") : null);
        if (!token) {
          set({ user: null, token: null });
          return null;
        }
        writeTokens(token, get().refresh);
        try {
          const user = await api<User>("auth/me");
          set({ user, token });
          return user;
        } catch {
          clearAuthStorage();
          set({ user: null, token: null, refresh: null });
          return null;
        }
      },
      logout: () => {
        clearAuthStorage();
        set({ token: null, refresh: null, user: null });
      },
      requireAuth: () => {
        const token = get().token || (typeof window !== "undefined" ? localStorage.getItem("travellab-token") : null);
        return Boolean(token);
      },
    }),
    {
      name: "travellab-auth",
      partialize: (s) => ({ token: s.token, refresh: s.refresh, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) writeTokens(state.token, state.refresh || null);
        useAuthStore.setState({ hydrated: true });
      },
    },
  ),
);
