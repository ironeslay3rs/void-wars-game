import { describe, it, expect } from "vitest";
import {
  FUSION_SWAP_CHANCE,
  SCHOOL_SLOT_ORDER,
  generateBlessingOffer,
  resolveOfferChoices,
} from "./blessingOffer";
import {
  BLACK_CITY_FUSION_BLESSINGS,
  blessingsForSchool,
} from "./blessingRegistry";

/**
 * Offer determinism, slot order, and fusion swap discipline.
 * Canon anchor: lore-canon/14 TaskQueue/Block-4-New-Mechanics.md §4.1 —
 * "3 blessings (1 per school)", plus a rare Black City fusion swap.
 */
describe("generateBlessingOffer: determinism + layout", () => {
  it("produces identical offers for identical inputs", () => {
    const a = generateBlessingOffer({ seed: 42, runId: "run-xyz" });
    const b = generateBlessingOffer({ seed: 42, runId: "run-xyz" });
    expect(a).toEqual(b);
  });

  it("picks exactly 3 blessings, one per school, in canonical order", () => {
    const offer = generateBlessingOffer({ seed: 101, runId: "run-a" });
    expect(offer.picks).toHaveLength(3);
    expect(offer.picks[0].school).toBe(SCHOOL_SLOT_ORDER[0]);
    expect(offer.picks[1].school).toBe(SCHOOL_SLOT_ORDER[1]);
    expect(offer.picks[2].school).toBe(SCHOOL_SLOT_ORDER[2]);
  });

  it("each pick is drawn from its own school's table", () => {
    for (let seed = 0; seed < 40; seed++) {
      const offer = generateBlessingOffer({ seed, runId: `run-${seed}` });
      offer.picks.forEach((pick, idx) => {
        const school = SCHOOL_SLOT_ORDER[idx];
        const pool = blessingsForSchool(school);
        expect(pool.map((b) => b.id)).toContain(pick.id);
      });
    }
  });

  it("offer.seed is a stable derivation of inputs", () => {
    const a = generateBlessingOffer({ seed: 1, runId: "alpha" });
    const b = generateBlessingOffer({ seed: 1, runId: "alpha" });
    expect(a.seed).toBe(b.seed);
    const c = generateBlessingOffer({ seed: 1, runId: "beta" });
    expect(c.seed).not.toBe(a.seed);
  });

  it("different player alignment produces different offers (salt mixes in)", () => {
    const a = generateBlessingOffer({
      seed: 7,
      runId: "run-salt",
      player: { alignment: "bio" },
    });
    const b = generateBlessingOffer({
      seed: 7,
      runId: "run-salt",
      player: { alignment: "mecha" },
    });
    expect(a.seed).not.toBe(b.seed);
  });
});

describe("generateBlessingOffer: fusion swap", () => {
  it("fusion only swaps into a slot its pair overlaps", () => {
    let fusions = 0;
    for (let seed = 0; seed < 1000; seed++) {
      const offer = generateBlessingOffer({ seed, runId: `r-${seed}` });
      if (!offer.fusionSwap) continue;
      fusions++;
      const slotSchool = SCHOOL_SLOT_ORDER[offer.fusionSwap.slotIndex];
      expect(offer.fusionSwap.fusion.pair).toContain(slotSchool);
    }
    // sanity: over 1000 seeds we should see at least a handful of fusions
    expect(fusions).toBeGreaterThan(0);
  });

  it("fusion swap frequency hovers near FUSION_SWAP_CHANCE over many seeds", () => {
    const N = 2000;
    let fusions = 0;
    for (let seed = 0; seed < N; seed++) {
      const offer = generateBlessingOffer({ seed, runId: `bulk-${seed}` });
      if (offer.fusionSwap) fusions++;
    }
    const rate = fusions / N;
    // Allow generous margin since the PRNG is seed-deterministic but not
    // uniformly distributed over a tiny seed span.
    expect(rate).toBeGreaterThan(FUSION_SWAP_CHANCE - 0.07);
    expect(rate).toBeLessThan(FUSION_SWAP_CHANCE + 0.07);
  });

  it("fusion is drawn from the canon fusion table when present", () => {
    const ids = new Set(BLACK_CITY_FUSION_BLESSINGS.map((f) => f.id));
    for (let seed = 0; seed < 300; seed++) {
      const offer = generateBlessingOffer({ seed, runId: `t-${seed}` });
      if (offer.fusionSwap) {
        expect(ids.has(offer.fusionSwap.fusion.id)).toBe(true);
      }
    }
  });
});

describe("resolveOfferChoices", () => {
  it("returns the three picks unchanged when no fusion swap", () => {
    // seed chosen so fusionSwap == null
    const offer = generateBlessingOffer({ seed: 0, runId: "no-fusion" });
    if (offer.fusionSwap) {
      // skip if this seed happened to fuse — find one that didn't.
      return;
    }
    const choices = resolveOfferChoices(offer);
    expect(choices).toHaveLength(3);
    expect(choices[0]).toBe(offer.picks[0]);
    expect(choices[1]).toBe(offer.picks[1]);
    expect(choices[2]).toBe(offer.picks[2]);
  });

  it("replaces the fused slot with the fusion blessing", () => {
    // find a seed that fuses
    for (let seed = 0; seed < 2000; seed++) {
      const offer = generateBlessingOffer({ seed, runId: `fx-${seed}` });
      if (!offer.fusionSwap) continue;
      const choices = resolveOfferChoices(offer);
      const idx = offer.fusionSwap.slotIndex;
      expect(choices[idx]).toBe(offer.fusionSwap.fusion);
      for (let i = 0; i < 3; i++) {
        if (i === idx) continue;
        expect(choices[i]).toBe(offer.picks[i]);
      }
      return;
    }
    throw new Error("no fusion found in 2000 seeds — review FUSION_SWAP_CHANCE");
  });
});
