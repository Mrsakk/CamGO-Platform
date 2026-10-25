/**
 * Unified hierarchical Query Key factory for A-Khemra-supper-admin
 */
export const queryKeys = {
  stats: () => ["admin", "stats"],
  userRegistrations: (days) => ["admin", "user-registrations", days],

  destinations: {
    all: () => ["admin", "destinations"],
    list: (filters = {}) => ["admin", "destinations", "list", filters],
    detail: (id) => ["admin", "destinations", "detail", id],
  },

  provinces: {
    all: () => ["admin", "provinces"],
    list: (params = {}) => ["admin", "provinces", "list", params],
    detail: (id) => ["admin", "provinces", "detail", id],
  },

  categories: {
    all: () => ["admin", "categories"],
    list: () => ["admin", "categories", "list"],
    detail: (id) => ["admin", "categories", "detail", id],
  },

  reviews: {
    all: () => ["admin", "reviews"],
    list: (filters = {}) => ["admin", "reviews", "list", filters],
  },

  testimonials: {
    all: () => ["admin", "testimonials"],
    list: (filters = {}) => ["admin", "testimonials", "list", filters],
  },

  users: {
    all: () => ["admin", "users"],
    list: (filters = {}) => ["admin", "users", "list", filters],
    detail: (id) => ["admin", "users", "detail", id],
  },

  events: {
    all: () => ["admin", "events"],
    list: (filters = {}) => ["admin", "events", "list", filters],
    detail: (id) => ["admin", "events", "detail", id],
  },

  blog: {
    all: () => ["admin", "blog"],
    list: (filters = {}) => ["admin", "blog", "list", filters],
    detail: (id) => ["admin", "blog", "detail", id],
  },

  banners: {
    all: () => ["admin", "banners"],
  },

  faqs: {
    all: () => ["admin", "faqs"],
  },

  pages: {
    all: () => ["admin", "pages"],
    detail: (slug) => ["admin", "pages", "detail", slug],
  },

  subscribers: {
    all: () => ["admin", "subscribers"],
    list: (filters = {}) => ["admin", "subscribers", "list", filters],
  },

  contactMessages: {
    all: () => ["admin", "contact-messages"],
    list: (filters = {}) => ["admin", "contact-messages", "list", filters],
  },

  auditLogs: {
    all: () => ["admin", "audit-logs"],
    list: (filters = {}) => ["admin", "audit-logs", "list", filters],
  },

  settings: () => ["admin", "settings"],
  roles: () => ["admin", "roles"],
};
