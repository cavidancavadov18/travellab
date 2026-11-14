export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  (API_URL.replace(/\/api\/v1\/?$/, "") + "/admin/");

function clearTokenStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("travellab-token");
  localStorage.removeItem("travellab-refresh");
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function extractError(body: unknown): string {
  if (!body || typeof body !== "object") return "Request failed";
  const data = body as Record<string, unknown>;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  if (data.error && typeof data.error === "object") return JSON.stringify(data.error);
  if (data.detail) return JSON.stringify(data.detail);
  return "Request failed";
}

async function tryRefreshAccess(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refresh = localStorage.getItem("travellab-refresh");
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access?: string; refresh?: string };
    if (!data.access) return null;
    localStorage.setItem("travellab-token", data.access);
    if (data.refresh) localStorage.setItem("travellab-refresh", data.refresh);
    return data.access;
  } catch {
    return null;
  }
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  let token = typeof window !== "undefined" ? localStorage.getItem("travellab-token") : null;
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const [pathname, query = ""] = path.replace(/^\/+/, "").split("?");
  const cleanPath = pathname.replace(/\/+$/g, "");
  const url = `${API_URL}/${cleanPath}/${query ? `?${query}` : ""}`;

  let response = await fetch(url, {
    ...options,
    headers,
    cache: options.cache || "no-store",
  });

  if (response.status === 401 && token && typeof window !== "undefined") {
    const next = await tryRefreshAccess();
    if (next) {
      headers.set("Authorization", `Bearer ${next}`);
      response = await fetch(url, {
        ...options,
        headers,
        cache: options.cache || "no-store",
      });
    } else {
      clearTokenStorage();
      headers.delete("Authorization");
      const method = (options.method || "GET").toUpperCase();
      if (method === "GET" || method === "HEAD") {
        response = await fetch(url, {
          ...options,
          headers,
          cache: options.cache || "no-store",
        });
      }
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, extractError(body));
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export function rows<T>(payload: T[] | { results?: T[]; offers?: T[] } | null | undefined): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload?.results) return payload.results;
  if (payload?.offers) return payload.offers;
  return [];
}

export type CatalogItem = {
  id?: number | string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  short_description?: string;
  summary?: string;
  image?: string;
  image_url?: string;
  cover_image?: string;
  price?: number | string;
  price_from?: number | string;
  location?: string;
  city?: string;
  destination_name?: string;
  currency?: string;
  airline?: string;
  origin?: string;
  destination?: string;
  total?: string | number;
  labpoint_earn?: string | number;
  reference?: string;
};

export function normalizeItem(raw: CatalogItem): CatalogItem {
  return {
    ...raw,
    title: raw.title || raw.name,
    name: raw.name || raw.title,
    cover_image: raw.cover_image || raw.image_url || raw.image,
    image: raw.image || raw.image_url || raw.cover_image,
    price_from: raw.price_from ?? raw.price ?? raw.total,
    price: raw.price ?? raw.price_from ?? raw.total,
    location: raw.location || raw.destination_name || raw.city,
    short_description: raw.short_description || raw.summary || raw.description,
  };
}

export async function createBooking(payload: {
  booking_type: "tour" | "hotel" | "flight" | "service" | "shop";
  title: string;
  subtotal: number | string;
  currency?: string;
  contact_email?: string;
  related_object_id?: number | string;
  details?: Record<string, unknown>;
  labpoint_to_redeem?: number | string;
}) {
  const me = await api<{ email: string }>("auth/me").catch(() => null);
  if (!me?.email) throw new ApiError(401, "Davam etmək üçün daxil olun");
  return api<{ reference?: string; status?: string }>("bookings", {
    method: "POST",
    body: JSON.stringify({
      booking_type: payload.booking_type,
      title: payload.title,
      subtotal: String(payload.subtotal),
      currency: payload.currency || "AZN",
      contact_email: payload.contact_email || me.email,
      related_object_id: payload.related_object_id ? Number(payload.related_object_id) : null,
      details: payload.details || {},
      labpoint_to_redeem: payload.labpoint_to_redeem || 0,
      pay_now: true,
      quantity: 1,
    }),
  });
}
