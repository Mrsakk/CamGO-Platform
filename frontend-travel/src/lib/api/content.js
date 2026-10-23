import api from "../axios";
const contentApi = {
  // Banners
  getBanners: async () => {
    const response = await api.get("/banners");
    return response.data;
  },
  // Blog
  getBlogPosts: async (paramsOrPage = 1) => {
    const params = new URLSearchParams();
    if (typeof paramsOrPage === "number") {
      params.append("page", paramsOrPage.toString());
    } else if (paramsOrPage && typeof paramsOrPage === "object") {
      Object.entries(paramsOrPage).forEach(([k, v]) => {
        if (v !== void 0 && v !== null) params.append(k, String(v));
      });
    }
    const response = await api.get(`/blog?${params.toString()}`);
    return response.data;
  },
  getRecentBlogPosts: async () => {
    const response = await api.get("/blog/recent");
    return response.data;
  },
  getBlogPost: async (slug) => {
    const response = await api.get(`/blog/${slug}`);
    return response.data;
  },
  getBlogPostBySlug: async (slug) => {
    return contentApi.getBlogPost(slug);
  },
  // Events
  getEvents: async (paramsOrPage = 1) => {
    const params = new URLSearchParams();
    if (typeof paramsOrPage === "number") {
      params.append("page", paramsOrPage.toString());
    } else if (paramsOrPage && typeof paramsOrPage === "object") {
      Object.entries(paramsOrPage).forEach(([k, v]) => {
        if (v !== void 0 && v !== null) params.append(k, String(v));
      });
    }
    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  },
  getUpcomingEvents: async () => {
    const response = await api.get("/events/upcoming");
    return response.data;
  },
  getEvent: async (slug) => {
    const response = await api.get(`/events/${slug}`);
    return response.data;
  },
  getEventBySlug: async (slug) => {
    return contentApi.getEvent(slug);
  },
  // FAQs
  getFaqs: async (category) => {
    const url = category ? `/faqs?category=${category}` : "/faqs";
    const response = await api.get(url);
    return response.data;
  },
  // CMS Pages
  getPage: async (slug) => {
    const response = await api.get(`/pages/${slug}`);
    return response.data;
  },
  // Our Team Members
  getTeamMembers: async () => {
    const response = await api.get("/team-members");
    return response.data;
  },
  // Contact & Subscribe
  sendContactMessage: async (payload) => {
    const response = await api.post("/contact", payload);
    return response.data;
  },
  submitContact: async (payload) => {
    return contentApi.sendContactMessage(payload);
  },
  subscribeNewsletter: async (email) => {
    const response = await api.post("/subscribe", { email });
    return response.data;
  },
  subscribe: async (email) => {
    return contentApi.subscribeNewsletter(email);
  },
  // Settings
  getSettings: async () => {
    const response = await api.get("/settings");
    return response.data;
  },
  // Testimonials / Website Reviews ("Loved by Explorers Worldwide")
  getTestimonials: async () => {
    const response = await api.get("/testimonials");
    return response.data;
  },
  submitTestimonial: async (payload) => {
    const response = await api.post("/testimonials", payload);
    return response.data;
  },
  // Community & Users Stats
  getCommunityStats: async () => {
    const response = await api.get("/community/stats");
    return response.data;
  }
};
var stdin_default = contentApi;
export {
  contentApi,
  stdin_default as default
};
