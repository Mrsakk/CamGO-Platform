import api from "../axios";

export const tripsApi = {
  getAll: async () => {
    const response = await api.get("/trips");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post("/trips", payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/trips/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },

  syncGuestPlans: async (plans) => {
    const response = await api.post("/trips/sync", { plans });
    return response.data;
  }
};

export default tripsApi;
