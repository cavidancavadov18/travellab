export type StoryMedia = {
  id: string;
  type: "video" | "image";
  src: string;
  poster?: string;
  likes?: number;
  comments?: number;
  cta?: { label: string; href: string };
};

export type StoryCategory = {
  id: string;
  label: string;
  color: 0 | 1 | 2 | 3;
  icon: "users" | "passport" | "tag" | "camera" | "gift" | "bag" | "star" | "reviews" | "ticket";
  href: string;
  items: StoryMedia[];
};

const TL = "https://www.travellab.az";

function vid(cat: string, n: string, likes: number, comments: number, href = "/tours"): StoryMedia {
  return {
    id: `${cat}-${n}`,
    type: "video",
    src: `${TL}/stories/${cat}/${n}.mp4`,
    poster: `${TL}/stories/${cat}/${n}.jpg`,
    likes,
    comments,
    cta: { label: "Oxşar tura qoşul ↗", href },
  };
}

function img(cat: string, n: string, likes: number, comments: number, href = "/tours"): StoryMedia {
  return {
    id: `${cat}-${n}`,
    type: "image",
    src: `${TL}/stories/${cat}/${n}.jpg`,
    likes,
    comments,
    cta: { label: "Ətraflı bax ↗", href },
  };
}

function localImg(path: string, id: string, likes: number, comments: number, href: string): StoryMedia {
  return {
    id,
    type: "image",
    src: path,
    likes,
    comments,
    cta: { label: "Kəşf et ↗", href },
  };
}

/** Professional story catalog — remote Travellab media + local fallbacks */
export const STORY_CATEGORIES: StoryCategory[] = [
  {
    id: "turistler",
    label: "Turistlər",
    color: 0,
    icon: "users",
    href: "/tours",
    items: [
      vid("turistler", "001", 428, 36),
      vid("turistler", "002", 512, 41),
      vid("turistler", "003", 390, 28),
      vid("turistler", "004", 610, 52),
      vid("turistler", "005", 355, 19),
      vid("turistler", "010", 480, 33),
      vid("turistler", "020", 720, 61),
      vid("turistler", "030", 290, 17),
      vid("turistler", "040", 540, 44),
      vid("turistler", "050", 460, 31),
      vid("turistler", "060", 680, 55),
      vid("turistler", "062", 352, 24),
      vid("turistler", "063", 401, 29),
      vid("turistler", "064", 377, 22),
      vid("turistler", "065", 445, 38),
      vid("turistler", "066", 510, 40),
      img("turistler", "061", 220, 12),
      img("turistler", "067", 198, 9),
      localImg("/images/destinations/maldives.jpg", "turistler-local-1", 180, 8, "/tours"),
      localImg("/images/destinations/istanbul.jpg", "turistler-local-2", 210, 11, "/tours"),
    ],
  },
  {
    id: "viza",
    label: "Viza",
    color: 1,
    icon: "passport",
    href: "/visa",
    items: [
      vid("viza", "001", 310, 21, "/visa"),
      img("viza", "002", 265, 14, "/visa"),
      img("viza", "003", 240, 10, "/visa"),
      img("viza", "004", 288, 16, "/visa"),
      img("viza", "005", 199, 7, "/visa"),
      img("viza", "006", 233, 12, "/visa"),
      img("viza", "007", 271, 15, "/visa"),
      img("viza", "008", 215, 9, "/visa"),
      img("viza", "009", 250, 13, "/visa"),
      img("viza", "010", 305, 18, "/visa"),
      localImg("/images/stories/visa-002.jpg", "viza-local-1", 160, 6, "/visa"),
    ],
  },
  {
    id: "endirimler",
    label: "Endirimlər",
    color: 2,
    icon: "tag",
    href: "/endirimler",
    items: [
      img("endirimler", "001", 420, 27, "/endirimler"),
      img("endirimler", "002", 380, 22, "/endirimler"),
      img("endirimler", "003", 350, 19, "/endirimler"),
      localImg("/images/stories/deals-001.jpg", "deals-4", 410, 25, "/endirimler"),
      localImg("/images/destinations/dubai.jpg", "deals-5", 295, 14, "/endirimler"),
      {
        id: "deals-backend-1",
        type: "image",
        src: "https://backend.travellab-point.az/site-backend/v1/tours/stories/18063878738792221/image",
        likes: 512,
        comments: 44,
        cta: { label: "Endirimə bax ↗", href: "/endirimler" },
      },
      {
        id: "deals-backend-2",
        type: "image",
        src: "https://backend.travellab-point.az/site-backend/v1/tours/stories/17976990192141140/image",
        likes: 468,
        comments: 31,
        cta: { label: "Endirimə bax ↗", href: "/endirimler" },
      },
    ],
  },
  {
    id: "bloggerler",
    label: "Bloggerlər",
    color: 3,
    icon: "camera",
    href: "/blog",
    items: [
      vid("bloggerler", "001", 640, 58, "/blog"),
      vid("bloggerler", "002", 520, 41, "/blog"),
      vid("bloggerler", "003", 480, 36, "/blog"),
      localImg("/images/about/events/travellab-qarabagda.jpg", "blog-local-1", 300, 18, "/blog"),
    ],
  },
  {
    id: "hediyye-karti",
    label: "Hədiyyə Kartı",
    color: 0,
    icon: "gift",
    href: "/hediyye-karti",
    items: [
      vid("hediyye-karti", "001", 390, 26, "/hediyye-karti"),
      img("hediyye-karti", "002", 280, 15, "/hediyye-karti"),
      img("hediyye-karti", "003", 340, 20, "/hediyye-karti"),
      img("hediyye-karti", "004", 260, 12, "/hediyye-karti"),
      img("hediyye-karti", "005", 245, 11, "/hediyye-karti"),
    ],
  },
  {
    id: "shop",
    label: "Shop",
    color: 1,
    icon: "bag",
    href: "/shop",
    items: [
      img("shop", "001", 410, 29, "/shop"),
      img("shop", "002", 355, 21, "/shop"),
      img("shop", "003", 290, 14, "/shop"),
      localImg("/images/shop/products/TB-001-1.png", "shop-4", 275, 13, "/shop"),
      localImg("/images/shop/lifestyle-couple.jpg", "shop-5", 360, 22, "/shop"),
      localImg("/images/shop/lifestyle-bottle.jpg", "shop-6", 230, 10, "/shop"),
    ],
  },
  {
    id: "labpoint",
    label: "Labpoint",
    color: 2,
    icon: "star",
    href: "/labpoint",
    items: [
      img("labpoint", "001", 520, 40, "/labpoint"),
      img("labpoint", "002", 440, 33, "/labpoint"),
      localImg("/images/stories/labpoint-001.jpg", "lp-3", 310, 16, "/labpoint"),
    ],
  },
  {
    id: "reyler",
    label: "Rəylər",
    color: 3,
    icon: "reviews",
    href: "/reyler",
    items: [
      img("reyler", "001", 380, 47, "/reyler"),
      img("reyler", "002", 420, 55, "/reyler"),
      img("reyler", "003", 290, 18, "/reyler"),
      localImg("/images/stories/reviews-001.jpg", "rev-4", 265, 14, "/reyler"),
      localImg("/images/hero/mosque.jpg", "rev-5", 330, 22, "/reyler"),
    ],
  },
  {
    id: "tedbirler",
    label: "Tədbirlər",
    color: 0,
    icon: "ticket",
    href: "/events",
    items: [
      localImg("/images/about/events/travellab-qarabagda.jpg", "ev-1", 560, 48, "/events"),
      localImg("/images/hero/balloons.jpg", "ev-2", 410, 27, "/events"),
      localImg("/images/destinations/vienna.jpg", "ev-3", 300, 15, "/events"),
      localImg("/images/destinations/london.jpg", "ev-4", 285, 13, "/events"),
      localImg("/images/destinations/newyork.jpg", "ev-5", 370, 24, "/events"),
      {
        id: "ev-mice",
        type: "image",
        src: `${TL}/images/about/events/mice-leisure-turkiye-2025.jpg`,
        likes: 490,
        comments: 35,
        cta: { label: "Tədbirə bax ↗", href: "/events" },
      },
    ],
  },
];

export function getCategoryById(id: string) {
  return STORY_CATEGORIES.find((c) => c.id === id) || STORY_CATEGORIES[0];
}

export function flattenRecent(limit = 12) {
  const out: { category: StoryCategory; item: StoryMedia }[] = [];
  for (const cat of STORY_CATEGORIES) {
    if (cat.items[0]) out.push({ category: cat, item: cat.items[0] });
  }
  for (const cat of STORY_CATEGORIES) {
    if (cat.items[1] && out.length < limit) out.push({ category: cat, item: cat.items[1] });
  }
  return out.slice(0, limit);
}
