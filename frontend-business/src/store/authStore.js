import { create } from "zustand";
import api from "../lib/ownerApi";

const savedToken = localStorage.getItem("km_travel_token") || localStorage.getItem("km_biz_token");
let savedUser = null;

try {
  const stored = localStorage.getItem("km_travel_user") || localStorage.getItem("km_biz_user");
  if (stored) {
    const parsed = JSON.parse(stored);
    savedUser = parsed?.user || parsed;
  }
} catch {
  savedUser = null;
}

const checkIsAdmin = (user) => {
  const u = user?.user || user;
  if (!u || !u.roles) return false;
  const adminRoles = [
    "super_admin", "Super Admin",
    "admin", "Admin",
    "business_manager", "Business Manager",
    "content_manager", "Content Manager",
    "moderator", "Moderator",
  ];
  return u.roles.some((r) => adminRoles.includes(typeof r === "string" ? r : r.name));
};

const checkIsBusinessOwner = (user) => {
  const u = user?.user || user;
  if (!u) return false;
  const roles = Array.isArray(u.roles) ? u.roles : [];
  const isOwnerRole =
    Boolean(u.business_role) ||
    roles.some((r) =>
      ["business_owner", "Business Owner"].includes(typeof r === "string" ? r : r.name)
    );
  return isOwnerRole && Boolean(u.business_id);
};

export const useAuthStore = create((set, get) => ({
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken && !!savedUser,
  isAdmin: checkIsAdmin(savedUser),
  isBusinessOwner: checkIsBusinessOwner(savedUser),
  isLoading: false,

  hasPermission: (permission) => {
    const u = get().user;
    if (!u) return false;
    // Super admin has all permissions
    if (u.roles?.some((r) => ["super_admin", "Super Admin"].includes(typeof r === "string" ? r : r.name))) {
      return true;
    }
    if (Array.isArray(u.permissions)) {
      return u.permissions.some((p) => (typeof p === "string" ? p : p.name) === permission);
    }
    return false;
  },

  hasBusinessCapability: (capability) => {
    const u = get().user;
    if (!u) return false;
    if (u.business_role === "owner") return true;
    return Array.isArray(u.business_capabilities)
      ? u.business_capabilities.includes(capability)
      : false;
  },

  businessRole: () => get().user?.business_role || null,

  setAuth: (rawUser, token) => {
    const user = rawUser?.user || rawUser;
    localStorage.setItem("km_travel_token", token);
    localStorage.setItem("km_biz_token", token);
    localStorage.setItem("km_travel_user", JSON.stringify(user));
    localStorage.setItem("km_biz_user", JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: checkIsAdmin(user),
      isBusinessOwner: checkIsBusinessOwner(user),
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
      return user;
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("km_travel_token") || localStorage.getItem("km_biz_token");
    if (!token) return;
    try {
      const res = await api.get("/auth/me");
      const user = res.data?.data?.user || res.data?.data || res.data;
      if (user) {
        get().setAuth(user, token);
      }
    } catch {
      get().logout();
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem("km_travel_token");
      localStorage.removeItem("km_biz_token");
      localStorage.removeItem("km_travel_user");
      localStorage.removeItem("km_biz_user");
      set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isBusinessOwner: false });
    }
  },
}));
