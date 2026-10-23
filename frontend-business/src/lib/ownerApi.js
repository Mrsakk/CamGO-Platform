import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("km_travel_token") || localStorage.getItem("km_biz_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Unbox standard ApiController response if needed
    if (response.data && response.data.data !== undefined) {
      const payload = response.data.data;
      if (payload && typeof payload === "object" && "items" in payload && Array.isArray(payload.items)) {
        response.data = {
          ...response.data,
          items: payload.items,
          meta: payload.meta || response.data.meta,
          total: payload.meta?.total,
        };
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("km_travel_token");
      localStorage.removeItem("km_biz_token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
