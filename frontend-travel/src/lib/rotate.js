/**
 * rotate.js – Deterministic, weighted rotation engine for CamGO Travel.
 *
 * DESIGN CONTRACT
 * ───────────────
 * • SESSION_SEED: one random 32-bit value per page load (crypto.getRandomValues)
 *   → browser refresh gives a new arrangement.
 * • useRotation(): returns { seed, seen } memoized per location.key.
 *   `seen` snapshot read once per navigation (never on every render).
 * • pickRotated(pool, count, opts): Efraimidis-Spirakis weighted reservoir shuffle.
 *   – Same (seed + id) always produces the exact same key → background refetches
 *     that add/remove other items do NOT reorder items already on screen.
 *   – Items recently seen get lower weight (recency decay over 24 h).
 *   – Quality boost: weight *= (1 + avg_rating / 10).
 *   – Pool smaller than count → fill with repeats.
 * • useRotatedHome(data): picks all sections in one useMemo with shared `used` set,
 *   marks seen in a useEffect after render (localStorage key kmt_seen_v1, max 400).
 */

import { useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";

// ── Constants ──────────────────────────────────────────────────────────────────
export const SEEN_KEY = "kmt_seen_v1";
export const SEEN_MAX = 400;

// ── SESSION SEED (generated once per page load) ───────────────────────────────
function generateSessionSeed() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] || 0xdeadbeef;
  }
  return (Math.random() * 0xffffffff) >>> 0;
}

export const SESSION_SEED = generateSessionSeed();

// ── Deterministic rand01(seed, key) in (0, 1) ────────────────────────────────
/**
 * Deterministic hash-based float in (0, 1).
 * Supports rand01(seed, key) or rand01("seed:key").
 */
export function rand01(seedOrCombined, maybeKey) {
  const combined = maybeKey !== undefined ? `${seedOrCombined}:${maybeKey}` : String(seedOrCombined);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < combined.length; i++) {
    h = Math.imul(h ^ combined.charCodeAt(i), 16777619) >>> 0;
  }
  // Avalanche mixing
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  // Strictly positive float in (0, 1)
  return ((h >>> 0) + 1) / (0x100000000 + 1);
}

// ── Read/Write seen store ──────────────────────────────────────────────────────
export function readSeen() {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeSeen(seenMap) {
  try {
    if (typeof localStorage === "undefined") return;
    const entries = Object.entries(seenMap).sort((a, b) => b[1] - a[1]);
    const trimmed = Object.fromEntries(entries.slice(0, SEEN_MAX));
    localStorage.setItem(SEEN_KEY, JSON.stringify(trimmed));
  } catch {
    // Silent fail if quota exceeded or storage disabled
  }
}

// ── Core rotation algorithm (Efraimidis-Spirakis) ──────────────────────────────
/**
 * @param {Array}  pool    – Full pool from the server.
 * @param {number} count   – How many items to pick.
 * @param {object} opts
 *   seed    {number}  – SESSION_SEED ^ navigation hash.
 *   seen    {object}  – { "kind:id": timestamp_ms } snapshot (read once per nav).
 *   kind    {string}  – Namespace for seen keys ("dest", "event", "post", "prov").
 *   exclude {Set}     – IDs already placed on this page render.
 * @returns {Array} Picked items (length === count, repeats allowed if pool too small).
 */
export function pickRotated(
  pool,
  count,
  { seed = SESSION_SEED, seen = {}, kind = "item", exclude = new Set() } = {}
) {
  const safePool = Array.isArray(pool)
    ? pool
    : (pool && typeof pool === "object" ? Object.values(pool) : []);
  if (!safePool || safePool.length === 0 || count <= 0) return [];

  const now = Date.now();

  // Filter out excluded items
  const candidates = safePool.filter((item) => item && !exclude.has(item.id));
  const itemsToScore = candidates.length > 0 ? candidates : safePool;

  // Compute deterministic score for each item: key = u^(1/weight)
  const scored = itemsToScore.map((item) => {
    const k = `${kind}:${item.id}`;
    const seenAt = seen[k];
    const hours = seenAt != null ? Math.max(0, (now - seenAt) / 3_600_000) : null;
    const recency = hours != null ? Math.min(1, 0.15 + (hours / 24) * 0.85) : 1;
    const rating = Number(item.rating_avg ?? item.avg_rating ?? item.rating ?? 0);
    const quality = 1 + rating / 10;
    const weight = Math.max(0.01, recency * quality);
    const u = rand01(seed, k);
    const key = Math.pow(u, 1 / weight);
    return { item, key };
  });

  // Sort descending by key
  scored.sort((a, b) => b.key - a.key);

  // Pick up to count items; repeat deterministically when the pool is smaller than count.
  const maxUnique = Math.min(count, scored.length);
  const picked = scored.slice(0, maxUnique).map((s) => s.item);

  if (picked.length === 0) return picked;

  while (picked.length < count) {
    picked.push(scored[picked.length % scored.length].item);
  }

  return picked;
}

// ── useRotation hook ───────────────────────────────────────────────────────────
/**
 * Returns { seed, seen } memoized per location.key.
 * `seen` is a snapshot taken once per navigation (never per render).
 */
export function useRotation() {
  const location = useLocation();
  return useMemo(() => {
    // XOR session seed with a hash of location.key for unique arrangement per navigation
    const navHash = rand01(SESSION_SEED, location.key || "init") * 0xffffffff;
    const seed = (SESSION_SEED ^ (navHash | 0)) >>> 0;
    const seen = readSeen();
    return { seed, seen };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);
}

// ── useRotatedHome hook ────────────────────────────────────────────────────────
/**
 * Picks all homepage sections in one useMemo with a shared `used` set.
 *
 * @param {object|null} data – The /api/v1/home response data object.
 * @returns {{ featured, provinces, events, posts, byCategory }}
 */
export function useRotatedHome(data) {
  const { seed, seen } = useRotation();

  const picks = useMemo(() => {
    if (!data) {
      return { featured: [], provinces: [], events: [], posts: [], byCategory: {} };
    }

    const used = new Set();

    // 1. Featured destinations – 8 picks
    const featured = pickRotated(data.featured ?? [], 8, {
      seed,
      seen,
      kind: "dest",
      exclude: used,
    });
    featured.forEach((d) => used.add(d.id));

    // 2. Provinces atlas – 12 picks
    const provinces = pickRotated(data.provinces ?? [], 12, {
      seed,
      seen,
      kind: "prov",
      exclude: used,
    });
    provinces.forEach((p) => used.add(`prov_${p.id}`));

    // 3. Cultural events – 6 picks (rotate first, then sort picked ones by start_date)
    const pickedEvents = pickRotated(data.events ?? [], 6, {
      seed,
      seen,
      kind: "event",
      exclude: used,
    });
    const events = [...pickedEvents].sort((a, b) => {
      const ta = a.start_date ? new Date(a.start_date).getTime() : 0;
      const tb = b.start_date ? new Date(b.start_date).getTime() : 0;
      return ta - tb;
    });
    events.forEach((e) => used.add(`ev_${e.id}`));

    // 4. Blog posts – 3 picks
    const posts = pickRotated(data.posts ?? [], 3, {
      seed,
      seen,
      kind: "post",
      exclude: used,
    });
    posts.forEach((p) => used.add(`post_${p.id}`));

    // 5. By-Category map – 8 picks per category
    const byCategory = {};
    const catMap = data.by_category ?? {};
    for (const [slug, pool] of Object.entries(catMap)) {
      byCategory[slug] = pickRotated(pool ?? [], 8, {
        seed,
        seen,
        kind: `cat_${slug}`,
        exclude: used,
      });
      byCategory[slug].forEach((item) => used.add(item.id));
    }

    return { featured, provinces, events, posts, byCategory };
  }, [data, seed, seen]);

  // Mark shown items as seen AFTER render in localStorage
  useEffect(() => {
    if (!data) return;
    const now = Date.now();
    const update = {};

    picks.featured.forEach((i) => {
      if (i?.id) update[`dest:${i.id}`] = now;
    });
    picks.provinces.forEach((p) => {
      if (p?.id) update[`prov:${p.id}`] = now;
    });
    picks.events.forEach((e) => {
      if (e?.id) update[`event:${e.id}`] = now;
    });
    picks.posts.forEach((p) => {
      if (p?.id) update[`post:${p.id}`] = now;
    });
    Object.values(picks.byCategory).forEach((arr) => {
      arr.forEach((i) => {
        if (i?.id) update[`dest:${i.id}`] = now;
      });
    });

    const currentSeen = readSeen();
    writeSeen({ ...currentSeen, ...update });
  }, [picks, data]);

  return picks;
}

export default {
  SESSION_SEED,
  rand01,
  readSeen,
  writeSeen,
  pickRotated,
  useRotation,
  useRotatedHome,
};
