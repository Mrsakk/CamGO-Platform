/**
 * Deterministic query key factory for frontend-business.
 * Ensures strict hierarchical cache scoping and precise mutation invalidations.
 */
export const businessKeys = {
  all: ["business"],
  home: () => ["business", "home"],
  categories: {
    all: ["business", "categories"],
    list: () => ["business", "categories", "list"],
    detail: (slug) => ["business", "categories", "detail", String(slug)],
  },
  provinces: () => ["business", "provinces"],
  directory: {
    all: ["business", "directory"],
    list: (filters = {}) => ["business", "directory", "list", filters],
    detail: (slug) => ["business", "directory", "detail", String(slug)],
    featured: () => ["business", "directory", "featured"],
    nearby: (lat, lng) => ["business", "directory", "nearby", { lat, lng }],
  },
  owner: {
    all: ["owner"],
    business: () => ["owner", "business"],
    stats: (range = "30d") => ["owner", "stats", range],
    leads: (filters = {}) => ["owner", "leads", filters],
    kyc: () => ["owner", "kyc"],
    subscription: () => ["owner", "subscription"],
    team: () => ["owner", "team"],
    reviews: (filters = {}) => ["owner", "reviews", filters],
  },
};
