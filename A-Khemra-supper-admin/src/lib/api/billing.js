import api from "../axios";

const billingApi = {
  getPlans: async () => {
    const res = await api.get("/admin/business/billing/plans");
    return res.data;
  },
  createPlan: async (data) => {
    const res = await api.post("/admin/business/billing/plans", data);
    return res.data;
  },
  updatePlan: async (id, data) => {
    const res = await api.put(`/admin/business/billing/plans/${id}`, data);
    return res.data;
  },
  getSubscriptions: async (params) => {
    const res = await api.get("/admin/business/billing/subscriptions", { params });
    return res.data;
  },
  activateSubscription: async (businessId, data) => {
    const res = await api.post(`/admin/business/billing/businesses/${businessId}/activate`, data);
    return res.data;
  },
  recordPayment: async (subscriptionId, data) => {
    const res = await api.post(`/admin/business/billing/subscriptions/${subscriptionId}/payments`, data);
    return res.data;
  },
  getRequests: async (params) => {
    const res = await api.get("/admin/business/billing/subscription-requests", { params });
    return res.data;
  },
  approveRequest: async (id, data) => {
    const res = await api.post(`/admin/business/billing/subscription-requests/${id}/approve`, data);
    return res.data;
  },
  rejectRequest: async (id, data) => {
    const res = await api.post(`/admin/business/billing/subscription-requests/${id}/reject`, data);
    return res.data;
  },
  searchBusinesses: async (search) => {
    const res = await api.get("/admin/business/businesses", {
      params: { search, per_page: 8 },
    });
    const payload = res.data?.data;
    return payload?.items || (Array.isArray(payload) ? payload : []);
  },
};

export default billingApi;
