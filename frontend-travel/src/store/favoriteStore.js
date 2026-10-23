import { create } from "zustand";
import { favoriteApi } from "@/lib/api/favorites";
const useFavoriteStore = create((set, get) => ({
  favoritedIds: [],
  count: 0,
  setFavoritedIds: (ids) => {
    set({ favoritedIds: ids, count: ids.length });
  },
  syncFavorites: async () => {
    try {
      const ids = await favoriteApi.getIds();
      if (Array.isArray(ids)) {
        set({ favoritedIds: ids, count: ids.length });
      }
    } catch {
    }
  },
  toggleFavorite: async (id) => {
    const current = get().favoritedIds;
    const exists = current.includes(id);
    if (exists) {
      const next = current.filter((item) => item !== id);
      set({ favoritedIds: next, count: next.length });
    } else {
      const next = [...current, id];
      set({ favoritedIds: next, count: next.length });
    }
    try {
      await favoriteApi.toggle(id);
      return !exists;
    } catch (err) {
      set({ favoritedIds: current, count: current.length });
      throw err;
    }
  },
  isFavorite: (id) => {
    return get().favoritedIds.includes(id);
  },
  isFavorited: (id) => {
    return get().favoritedIds.includes(id);
  }
}));
export {
  useFavoriteStore
};
