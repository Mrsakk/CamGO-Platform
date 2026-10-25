import { create } from "zustand";
import api from "../lib/axios";

const savedToken = localStorage.getItem("km_travel_token");
let savedUser = null;

try {
  const stored = localStorage.getItem("km_travel_user");
  if (stored) {
    const parsed = JSON.parse(stored);
    savedUser = parsed?.user || parsed;
  }
} catch {
  savedUser = null;
}

const checkIsAdmin = (user) => {
  const actualUser = user?.user || user;
  if (!actualUser || !actualUser.roles) return false;
  const adminRoles = [
    "super_admin",
    "content_manager",
    "moderator",
    "Super Admin",
    "Content Manager",
    "Moderator"
  ];
  return actualUser.roles.some((r) => adminRoles.includes(r));
};

const checkIsSuperAdmin = (user) => {
  const actualUser = user?.user || user;
  if (!actualUser || !actualUser.roles) return false;
  return actualUser.roles.includes("super_admin") || actualUser.roles.includes("Super Admin");
};

const useAuthStore = create((set, get) => ({
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken && !!savedUser,
  isAdmin: checkIsAdmin(savedUser),
  isSuperAdmin: checkIsSuperAdmin(savedUser),
  isLoading: false,

  setAuth: (rawUser, token) => {
    const user = rawUser?.user || rawUser;
    localStorage.setItem("km_travel_token", token);
    localStorage.setItem("km_travel_user", JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: checkIsAdmin(user),
      isSuperAdmin: checkIsSuperAdmin(user)
    });

    // Merge guest local trip plans into account asynchronously
    import("./tripPlannerStore").then(({ useTripPlannerStore }) => {
      useTripPlannerStore.getState().syncGuestPlansOnLogin();
    }).catch(() => {});
  },

  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const actualFields = updatedFields?.user || updatedFields;
      const avatarUrl = updatedFields?.avatar_url || actualFields?.avatar;
      const newUser = {
        ...state.user,
        ...actualFields,
        ...(avatarUrl ? { avatar: avatarUrl } : {})
      };
      localStorage.setItem("km_travel_user", JSON.stringify(newUser));
      return {
        user: newUser,
        isAdmin: checkIsAdmin(newUser),
        isSuperAdmin: checkIsSuperAdmin(newUser)
      };
    });
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", credentials);
      const payload = res.data?.data || res.data;
      const user = payload?.user || payload;
      const token = payload?.token || res.data?.token;
      get().setAuth(user, token);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/register", data);
      const payload = res.data?.data || res.data;
      const user = payload?.user || payload;
      const token = payload?.token || res.data?.token;
      get().setAuth(user, token);
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("km_travel_token");
    if (!token) return;
    try {
      const res = await api.get("/auth/me");
      const payload = res.data?.data || res.data;
      const user = payload?.user || payload;
      if (user && (user.name || user.email || user.id)) {
        localStorage.setItem("km_travel_user", JSON.stringify(user));
        set({
          user,
          isAuthenticated: true,
          isAdmin: checkIsAdmin(user),
          isSuperAdmin: checkIsSuperAdmin(user)
        });
      }
    } catch {
      get().logout();
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
    } finally {
      localStorage.removeItem("km_travel_token");
      localStorage.removeItem("km_travel_user");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        isSuperAdmin: false
      });
    }
  }
}));

export {
  useAuthStore
};
