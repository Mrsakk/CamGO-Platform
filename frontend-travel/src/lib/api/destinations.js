import api from "../axios";
const destinationApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.province) params.append("province", filters.province);
    if (filters.province_id) params.append("province_id", String(filters.province_id));
    if (filters.category) params.append("category", filters.category);
    if (filters.category_id) params.append("category_id", String(filters.category_id));
    if (filters.rating) params.append("rating", filters.rating.toString());
    if (filters.min_rating) {
      params.append("rating", filters.min_rating.toString());
      params.append("min_rating", filters.min_rating.toString());
    }
    if (filters.entry_type && filters.entry_type !== "all") params.append("entry_type", filters.entry_type);
    if (filters.is_free !== void 0) params.append("is_free", filters.is_free ? "1" : "0");
    if (filters.search) params.append("search", filters.search);
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.sort_by) {
      params.append("sort", filters.sort_by);
      params.append("sort_by", filters.sort_by);
    }
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.per_page) params.append("per_page", filters.per_page.toString());
    if (filters.view_mode) params.append("view_mode", filters.view_mode);
    const response = await api.get(`/destinations?${params.toString()}`);
    return response.data;
  },
  list: async (filters = {}) => {
    return destinationApi.getAll(filters);
  },
  getBySlug: async (slugOrUlid) => {
    const response = await api.get(`/destinations/${slugOrUlid}`);
    return response.data;
  },
  getDetail: async (slugOrUlid) => {
    const res = await destinationApi.getBySlug(slugOrUlid);
    return res.data;
  },
  getFeatured: async () => {
    const response = await api.get("/destinations/featured");
    return response.data;
  },
  getPopular: async () => {
    const response = await api.get("/destinations/popular");
    return response.data;
  },
  getRelated: async (id) => {
    const response = await api.get(`/destinations/${id}/related`);
    return response.data;
  },
  getSuggestions: async (query) => {
    const response = await api.get(`/destinations/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};
const destinationsApi = destinationApi;
var stdin_default = destinationApi;
export {
  stdin_default as default,
  destinationApi,
  destinationsApi
};
