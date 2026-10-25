export const queryKeys = {
  admin: {
    stats: () => ["admin", "business", "stats"],
    businesses: {
      all: () => ["admin", "businesses"],
      list: (params) => ["admin", "businesses", params],
      detail: (id) => ["admin", "businesses", id],
    },
    reviews: {
      all: () => ["admin", "business", "reviews"],
      list: (params) => ["admin", "business", "reviews", params],
      pendingCount: () => ["admin", "business", "reviews", "pendingCount"],
    },
    categories: () => ["admin", "business", "categories"],
    reports: (id, range) => ["admin", "business", "reports", id, range],
    billing: {
      stats: () => ["admin", "billing", "stats"],
      plans: () => ["admin", "billing", "plans"],
      subscriptions: (params) => ["admin", "billing", "subscriptions", params],
      payments: (params) => ["admin", "billing", "payments", params],
      requests: (params) => ["admin", "billing", "requests", params],
    },
    auditLogs: (params) => ["admin", "business", "auditLogs", params],
  },

  owner: {
    stats: (range = "30d") => ["owner-stats", range],
    myBusiness: () => ["owner-my-business"],
    kyc: () => ["owner-kyc"],
    leads: {
      list: (params) => ["owner-leads", params],
      stats: () => ["owner-leads-stats"],
    },
    reviews: {
      list: (params) => ["owner-reviews", params],
      stats: () => ["owner-reviews-stats"],
    },
    notifications: (params) => ["owner-notifications", params],
    unreadNotifications: () => ["owner-unread-notifications"],
    team: () => ["owner-team"],
    subscription: () => ["owner-subscription"],
    subscriptionPlans: () => ["owner-subscription-plans"],
  },

  taxonomy: {
    provinces: () => ["provinces"],
    categories: () => ["categories"],
  },
};
