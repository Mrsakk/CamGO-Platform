import api from "../axios";
const adminApi = {
  // Dashboard
  getStats: async () => {
    const res = await api.get("/admin/dashboard/stats");
    return res.data;
  },
  getUserRegistrations: async (days = 30) => {
    const res = await api.get("/admin/dashboard/user-registrations", { params: { days } });
    return res.data;
  },
  // Destinations
  getDestinations: async (params) => {
    const res = await api.get("/admin/destinations", { params });
    return res.data;
  },
  getDestination: async (id) => {
    const res = await api.get(`/admin/destinations/${id}`);
    return res.data;
  },
  createDestination: async (data) => {
    const res = await api.post("/admin/destinations", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
    });
    return res.data;
  },
  updateDestination: async (id, data) => {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const res2 = await api.post(`/admin/destinations/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res2.data;
    }
    const res = await api.put(`/admin/destinations/${id}`, data);
    return res.data;
  },
  deleteDestination: async (id) => {
    const res = await api.delete(`/admin/destinations/${id}`);
    return res.data;
  },
  toggleDestinationFeatured: async (id) => {
    const res = await api.patch(`/admin/destinations/${id}/toggle-featured`);
    return res.data;
  },
  toggleDestinationStatus: async (id) => {
    const res = await api.patch(`/admin/destinations/${id}/toggle-status`);
    return res.data;
  },
  uploadDestinationImages: async (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images[]", file));
    const res = await api.post(`/admin/destinations/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },
  deleteDestinationImage: async (destinationId, imageId) => {
    const res = await api.delete(`/admin/destinations/${destinationId}/images/${imageId}`);
    return res.data;
  },
  // Provinces
  getProvinces: async (params) => {
    const res = await api.get("/admin/provinces", { params });
    return res.data;
  },
  createProvince: async (data) => {
    const res = await api.post("/admin/provinces", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
    });
    return res.data;
  },
  updateProvince: async (id, data) => {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const res2 = await api.post(`/admin/provinces/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res2.data;
    }
    const res = await api.put(`/admin/provinces/${id}`, data);
    return res.data;
  },
  deleteProvince: async (id) => {
    const res = await api.delete(`/admin/provinces/${id}`);
    return res.data;
  },
  // Categories
  getCategories: async () => {
    const res = await api.get("/admin/categories");
    return res.data;
  },
  createCategory: async (data) => {
    const res = await api.post("/admin/categories", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
    });
    return res.data;
  },
  updateCategory: async (id, data) => {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const res2 = await api.post(`/admin/categories/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res2.data;
    }
    const res = await api.put(`/admin/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id) => {
    const res = await api.delete(`/admin/categories/${id}`);
    return res.data;
  },
  // Reviews Moderation
  getReviews: async (params) => {
    const res = await api.get("/admin/reviews", { params });
    return res.data;
  },
  approveReview: async (id) => {
    const res = await api.patch(`/admin/reviews/${id}/approve`);
    return res.data;
  },
  rejectReview: async (id) => {
    const res = await api.patch(`/admin/reviews/${id}/reject`);
    return res.data;
  },
  deleteReview: async (id) => {
    const res = await api.delete(`/admin/reviews/${id}`);
    return res.data;
  },
  // Website Testimonials ("Loved by Explorers Worldwide")
  getTestimonials: async (params) => {
    const res = await api.get("/admin/testimonials", { params });
    return res.data;
  },
  approveTestimonial: async (id) => {
    const res = await api.patch(`/admin/testimonials/${id}/approve`);
    return res.data;
  },
  rejectTestimonial: async (id) => {
    const res = await api.patch(`/admin/testimonials/${id}/reject`);
    return res.data;
  },
  deleteTestimonial: async (id) => {
    const res = await api.delete(`/admin/testimonials/${id}`);
    return res.data;
  },
  // Users
  getUsers: async (params) => {
    const res = await api.get("/admin/users", { params });
    return res.data;
  },
  updateUserRole: async (id, role) => {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },
  toggleUserStatus: async (id) => {
    const res = await api.patch(`/admin/users/${id}/toggle-status`);
    return res.data;
  },
  // Blog Posts
  getBlogPosts: async (params) => {
    const res = await api.get("/admin/blog-posts", { params });
    return res.data;
  },
  createBlogPost: async (data) => {
    const res = await api.post("/admin/blog-posts", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
    });
    return res.data;
  },
  updateBlogPost: async (id, data) => {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const res2 = await api.post(`/admin/blog-posts/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res2.data;
    }
    const res = await api.put(`/admin/blog-posts/${id}`, data);
    return res.data;
  },
  deleteBlogPost: async (id) => {
    const res = await api.delete(`/admin/blog-posts/${id}`);
    return res.data;
  },
  // Provinces
  getProvinces: async () => {
    const res = await api.get("/admin/provinces", { params: { per_page: 50 } });
    return res.data;
  },
  // Events
  getEvents: async (params) => {
    const res = await api.get("/admin/events", { params });
    return res.data;
  },
  createEvent: async (data) => {
    const res = await api.post("/admin/events", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
    });
    return res.data;
  },
  updateEvent: async (id, data) => {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const res2 = await api.post(`/admin/events/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res2.data;
    }
    const res = await api.put(`/admin/events/${id}`, data);
    return res.data;
  },
  deleteEvent: async (id) => {
    const res = await api.delete(`/admin/events/${id}`);
    return res.data;
  },
  // Banners
  getBanners: async () => {
    const res = await api.get("/admin/banners");
    return res.data;
  },
  createBanner: async (data) => {
    const res = await api.post("/admin/banners", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
    });
    return res.data;
  },
  updateBanner: async (id, data) => {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const res2 = await api.post(`/admin/banners/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res2.data;
    }
    const res = await api.put(`/admin/banners/${id}`, data);
    return res.data;
  },
  deleteBanner: async (id) => {
    const res = await api.delete(`/admin/banners/${id}`);
    return res.data;
  },
  // FAQs
  getFaqs: async () => {
    const res = await api.get("/admin/faqs");
    return res.data;
  },
  createFaq: async (data) => {
    const res = await api.post("/admin/faqs", data);
    return res.data;
  },
  updateFaq: async (id, data) => {
    const res = await api.put(`/admin/faqs/${id}`, data);
    return res.data;
  },
  deleteFaq: async (id) => {
    const res = await api.delete(`/admin/faqs/${id}`);
    return res.data;
  },
  // Pages
  getPages: async () => {
    const res = await api.get("/admin/pages");
    return res.data;
  },
  createPage: async (data) => {
    const res = await api.post("/admin/pages", data);
    return res.data;
  },
  updatePage: async (id, data) => {
    const res = await api.put(`/admin/pages/${id}`, data);
    return res.data;
  },
  deletePage: async (id) => {
    const res = await api.delete(`/admin/pages/${id}`);
    return res.data;
  },
  // Team Members (Our Team)
  getTeamMembers: async (params) => {
    const res = await api.get("/admin/team-members", { params });
    return res.data;
  },
  createTeamMember: async (data) => {
    const res = await api.post("/admin/team-members", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
    });
    return res.data;
  },
  updateTeamMember: async (id, data) => {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const res2 = await api.post(`/admin/team-members/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res2.data;
    }
    const res = await api.put(`/admin/team-members/${id}`, data);
    return res.data;
  },
  deleteTeamMember: async (id) => {
    const res = await api.delete(`/admin/team-members/${id}`);
    return res.data;
  },
  // Contacts
  getContacts: async (params) => {
    const res = await api.get("/admin/contacts", { params });
    return res.data;
  },
  markContactRead: async (id) => {
    const res = await api.patch(`/admin/contacts/${id}/read`);
    return res.data;
  },
  deleteContact: async (id) => {
    const res = await api.delete(`/admin/contacts/${id}`);
    return res.data;
  },
  // Subscribers
  getSubscribers: async (params) => {
    const res = await api.get("/admin/subscribers", { params });
    return res.data;
  },
  deleteSubscriber: async (id) => {
    const res = await api.delete(`/admin/subscribers/${id}`);
    return res.data;
  },
  exportSubscribersCsv: async () => {
    const res = await api.get("/admin/subscribers/export", { responseType: "blob" });
    return res.data;
  },
  // Roles
  getRoles: async () => {
    const res = await api.get("/admin/roles");
    return res.data;
  },
  syncRolePermissions: async (roleName, permissions) => {
    const res = await api.post(`/admin/roles/${roleName}/permissions`, { permissions });
    return res.data;
  },
  // Settings
  getSettings: async () => {
    const res = await api.get("/admin/settings");
    return res.data;
  },
  updateSettings: async (settings) => {
    const res = await api.post("/admin/settings", { settings });
    return res.data;
  },
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append("logo", file);
    const res = await api.post("/admin/settings/upload-logo", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },
  uploadFavicon: async (file) => {
    const formData = new FormData();
    formData.append("favicon", file);
    const res = await api.post("/admin/settings/upload-favicon", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },
  // Audit Logs
  getAuditLogs: async (params) => {
    const res = await api.get("/admin/audit-logs", { params });
    return res.data;
  }
};
export {
  adminApi
};
