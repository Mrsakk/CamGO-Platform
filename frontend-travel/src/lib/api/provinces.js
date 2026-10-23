import api from "../axios";
const provinceApi = {
  getAll: async (params) => {
    const response = await api.get("/provinces", { params });
    return response.data;
  },
  list: async (featured) => {
    const res = await provinceApi.getAll(featured ? { featured: true } : {});
    return res.data;
  },
  getBySlug: async (slugOrCode) => {
    const response = await api.get(`/provinces/${slugOrCode}`);
    return response.data;
  },
  getDetail: async (slugOrCode) => {
    const res = await provinceApi.getBySlug(slugOrCode);
    return res.data;
  }
};
const provincesApi = provinceApi;
var stdin_default = provinceApi;
export {
  stdin_default as default,
  provinceApi,
  provincesApi
};
