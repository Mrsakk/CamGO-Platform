import { get, set, del } from "idb-keyval";

/**
 * Creates an offline-first storage persister supporting IndexedDB with fallback
 * to localStorage and in-memory map. Wraps every call in try/catch to ensure
 * zero app crashes in incognito mode or restricted iframe environments.
 */
export function createIdbPersister(key = "CAMGO_BUSINESS_CACHE") {
  const memoryFallback = new Map();

  return {
    async persistClient(persistedClient) {
      try {
        await set(key, persistedClient);
        return;
      } catch (idbErr) {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(key, JSON.stringify(persistedClient));
            return;
          }
        } catch (lsErr) {
          memoryFallback.set(key, persistedClient);
        }
      }
    },

    async restoreClient() {
      try {
        const idbData = await get(key);
        if (idbData) return idbData;
      } catch (idbErr) {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            const raw = window.localStorage.getItem(key);
            if (raw) return JSON.parse(raw);
          }
        } catch (lsErr) {
          return memoryFallback.get(key);
        }
      }

      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const raw = window.localStorage.getItem(key);
          if (raw) return JSON.parse(raw);
        }
      } catch (e) {
        // silent
      }

      return memoryFallback.get(key);
    },

    async removeClient() {
      try {
        await del(key);
      } catch (e) {
        // silent
      }
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (e) {
        // silent
      }
      memoryFallback.delete(key);
    },
  };
}
