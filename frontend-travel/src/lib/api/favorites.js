import api from "../axios";

const favoriteApi = {
  toggle: async (destinationId) => {
    const response = await api.post(
      `/destinations/${destinationId}/favorite`
    );
    return response.data?.data || response.data;
  },
  getIds: async () => {
    const response = await api.get("/favorites/ids");
    return response.data?.data?.favorited_ids || response.data?.favorited_ids || response.data || [];
  },
  getMyFavorites: async (page = 1) => {
    const response = await api.get(`/profile/favorites?page=${page}`);
    return response.data;
  },
  getAll: async (page = 1) => {
    const response = await api.get(`/profile/favorites?page=${page}`);
    return response.data;
  },
  getFavorites: async (page = 1) => {
    return favoriteApi.getMyFavorites(page);
  },
  removeFavorite: async (destinationId) => {
    return favoriteApi.toggle(destinationId);
  }
};

const favoritesApi = favoriteApi;

export {
  favoriteApi as default,
  favoriteApi,
  favoritesApi
};
