import { get, set, del } from "idb-keyval";

/**
 * Creates an offline-first storage persister supporting IndexedDB with fallback
 * to localStorage and in-memory map. Wraps every call in try/catch to ensure
 * zero app crashes in incognito mode or restricted iframe environments.
 */
export function createIdbPersister(key = "CAMGO_TRAVEL_CACHE") {
  const memoryFallback = new Map();

  return {
    async persistClient(persistedClient) {
      try {
        await set(key, persistedClient);
        return;
      } catch (idbErr) {
        // Fallback to localStorage
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(key, JSON.stringify(persistedClient));
            return;
          }
        } catch (lsErr) {
          // Quota exceeded or private mode, fallback to memory
          memoryFallback.set(key, persistedClient);
        }
      }
    },

    async restoreClient() {
      try {
        const idbData = await get(key);
        if (idbData) return idbData;
      } catch (idbErr) {
        // Try localStorage
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            const raw = window.localStorage.getItem(key);
            if (raw) return JSON.parse(raw);
          }
        } catch (lsErr) {
          // Try memory
          return memoryFallback.get(key);
        }
      }

      // Check localStorage if IndexedDB returned undefined
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
