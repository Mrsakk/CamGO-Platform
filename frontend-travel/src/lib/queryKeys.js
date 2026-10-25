/**
 * Deterministic query key factory for frontend-travel.
 * Ensures strict hierarchical cache scoping and precise mutation invalidations.
 */
export const travelKeys = {
  all: ["travel"],
  home: () => ["home"],
  categories: {
    all: ["categories"],
    list: () => ["categories", "list"],
    detail: (slug) => ["categories", "detail", String(slug)],
  },
  provinces: {
    all: ["provinces"],
    list: (featuredOnly = false) => ["provinces", "list", { featuredOnly }],
    detail: (slugOrCode) => ["provinces", "detail", String(slugOrCode)],
  },
  destinations: {
    all: ["destinations"],
    list: (filters = {}) => ["destinations", "list", filters],
    detail: (slug) => ["destinations", "detail", String(slug)],
    featured: () => ["destinations", "featured"],
    nearby: (lat, lng) => ["destinations", "nearby", { lat, lng }],
  },
  events: {
    all: ["events"],
    list: (filters = {}) => ["events", "list", filters],
    detail: (slug) => ["events", "detail", String(slug)],
    upcoming: () => ["events", "upcoming"],
  },
  blogs: {
    all: ["blogs"],
    list: (filters = {}) => ["blogs", "list", filters],
    detail: (slug) => ["blogs", "detail", String(slug)],
    recent: () => ["blogs", "recent"],
  },
  user: {
    all: ["user"],
    profile: () => ["user", "profile"],
    favorites: () => ["user", "favorites"],
    reviews: () => ["user", "reviews"],
    plans: () => ["user", "plans"],
  },
};
