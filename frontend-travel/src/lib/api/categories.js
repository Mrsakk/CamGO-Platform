import api from "../axios";
const categoryApi = {
  getAll: async () => {
    const response = await api.get("/categories");
    return response.data;
  },
  list: async () => {
    const res = await categoryApi.getAll();
    return res.data;
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },
  getDetail: async (slug) => {
    const res = await categoryApi.getBySlug(slug);
    return res.data;
  }
};
const categoriesApi = categoryApi;
var stdin_default = categoryApi;
export {
  categoriesApi,
  categoryApi,
  stdin_default as default
};
