import { describe, it, expect } from "vitest";
import { pickRotated, rand01 } from "./rotate.js";

describe("pickRotated rotation engine", () => {
  const samplePool = Array.from({ length: 40 }, (_, idx) => ({
    id: idx + 1,
    slug: `destination-${idx + 1}`,
    name_km: `ទីតាំង ${idx + 1}`,
    name_en: `Sanctuary ${idx + 1}`,
    avg_rating: 4.5,
  }));

  // TEST 1: Same seed and pool give the same picks; 50 different seeds give clearly different arrangements.
  it("produces identical results with same seed, and diverse arrangements across 50 seeds", () => {
    const seed = 987654321;
    const firstRun = pickRotated(samplePool, 8, { seed });
    const secondRun = pickRotated(samplePool, 8, { seed });

    expect(firstRun.map((i) => i.id)).toEqual(secondRun.map((i) => i.id));

    // Test 50 distinct seeds
    const arrangements = new Set();
    for (let i = 1; i <= 50; i++) {
      const distinctSeed = (i * 0x9e3779b9) >>> 0;
      const picks = pickRotated(samplePool, 8, { seed: distinctSeed });
      arrangements.add(picks.map((i) => i.id).join(","));
    }

    // 50 random seeds on a 40-item pool should give virtually 50 unique arrangements (at least 48)
    expect(arrangements.size).toBeGreaterThanOrEqual(48);
  });

  // TEST 2: Removing unpicked items from the pool does not change the picks (stability).
  it("maintains pick stability when unpicked items are removed from the pool", () => {
    const seed = 123456789;
    const initialPicks = pickRotated(samplePool, 8, { seed });
    const pickedIds = new Set(initialPicks.map((i) => i.id));

    // Remove half of the unpicked items from the pool
    const reducedPool = samplePool.filter((item) => {
      if (pickedIds.has(item.id)) return true;
      return item.id % 2 === 0; // Drop odd unpicked items
    });

    const newPicks = pickRotated(reducedPool, 8, { seed });

    expect(newPicks.map((i) => i.id)).toEqual(initialPicks.map((i) => i.id));
  });

  // TEST 3: With 8 of 40 items marked as just seen, over 2000 seeds those items appear far less than the 20% random baseline (expect under about 12%).
  it("significantly reduces appearance rate of recently seen items over 2000 seeds (< 12% vs 20% baseline)", () => {
    const now = Date.now();
    const seen = {};
    for (let i = 1; i <= 8; i++) {
      seen[`dest:${i}`] = now; // marked as just seen (0 hours ago)
    }

    let seenPickCount = 0;
    const TOTAL_SEEDS = 2000;
    const COUNT = 8;

    for (let s = 1; s <= TOTAL_SEEDS; s++) {
      const seed = (s * 104729) >>> 0;
      const picks = pickRotated(samplePool, COUNT, {
        seed,
        seen,
        kind: "dest",
      });

      for (const p of picks) {
        if (p.id <= 8) {
          seenPickCount++;
        }
      }
    }

    // Random baseline without weighting: 8 seen items out of 40 = 20% expected picks
    // Total picks across 2000 runs = 2000 * 8 = 16,000 picks.
    // Random baseline would be ~3,200 seen picks (20%).
    const seenAppearanceRate = seenPickCount / (TOTAL_SEEDS * COUNT);

    // Expect under 12% (empirically around 3-4% due to recency = 0.15 weight penalty)
    expect(seenAppearanceRate).toBeLessThan(0.12);
  });

  // TEST 4: exclude is respected; a tiny pool is filled with repeats up to count.
  it("respects exclude set and fills a tiny pool with repeats up to count", () => {
    // 4a. Exclude is respected
    const exclude = new Set([1, 2, 3]);
    const picksWithExclude = pickRotated(samplePool, 8, {
      seed: 55555,
      exclude,
    });
    for (const p of picksWithExclude) {
      expect(exclude.has(p.id)).toBe(false);
    }

    // 4b. Tiny pool of 2 items filled up to count 6 with repeats
    const tinyPool = [
      { id: 101, name_en: "Angkor Wat", avg_rating: 5.0 },
      { id: 102, name_en: "Bayon", avg_rating: 4.9 },
    ];
    const repeatedPicks = pickRotated(tinyPool, 6, { seed: 77777 });

    expect(repeatedPicks).toHaveLength(6);
    expect(repeatedPicks.every((i) => i.id === 101 || i.id === 102)).toBe(true);
    const count101 = repeatedPicks.filter((i) => i.id === 101).length;
    const count102 = repeatedPicks.filter((i) => i.id === 102).length;
    expect(count101).toBe(3);
    expect(count102).toBe(3);
  });
});
