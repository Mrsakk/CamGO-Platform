import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("km_travel_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data && typeof response.data.data === "object") {
      const payload = response.data.data;
      if ("items" in payload && Array.isArray(payload.items)) {
        response.data = {
          ...response.data,
          data: payload.items,
          meta: payload.meta || response.data.meta,
          total: payload.total ?? payload.meta?.total
        };
      } else if ("destination" in payload && payload.destination) {
        response.data = {
          ...response.data,
          data: payload.destination
        };
      } else if ("province" in payload && payload.province) {
        const dests = Array.isArray(payload.destinations) ? payload.destinations : [];
        response.data = {
          ...response.data,
          data: {
            ...payload.province,
            destinations: dests
          },
          destinations: dests
        };
      } else if ("category" in payload && payload.category) {
        const dests = Array.isArray(payload.destinations) ? payload.destinations : [];
        response.data = {
          ...response.data,
          data: {
            ...payload.category,
            destinations: dests
          },
          destinations: dests
        };
      } else if ("post" in payload && payload.post) {
        response.data = {
          ...response.data,
          data: payload.post,
          related: payload.related || []
        };
      } else if ("event" in payload && payload.event) {
        response.data = {
          ...response.data,
          data: payload.event
        };
      } else if ("page" in payload && payload.page) {
        response.data = {
          ...response.data,
          data: payload.page
        };
      } else if ("user" in payload && payload.user) {
        response.data = {
          ...response.data,
          data: payload.user,
          user: payload.user,
          token: payload.token || response.data.token
        };
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem("km_travel_token");
      localStorage.removeItem("km_travel_token");
      localStorage.removeItem("km_travel_user");
      if (hadToken && !window.location.pathname.includes("/login")) {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);
var stdin_default = api;
export {
  api,
  stdin_default as default
};
