import { describe, expect, it } from "vitest";

import {
  MAX_CORRUPTION,
  applyVoidExposure,
  cleanseCorruption,
  clampCorruption,
  exposureBudget,
  getCorruptionPct,
  ventCorruptionWithMana,
  type VoidExposureSource,
} from "@/features/condition/corruptionEngine";

type VoidHolder = { voidInstability: number; mana: number };

function holder(overrides: Partial<VoidHolder> = {}): VoidHolder {
  return { voidInstability: 0, mana: 0, ...overrides };
}

describe("clampCorruption + getCorruptionPct", () => {
  it("clamps below 0 to 0", () => {
    expect(clampCorruption(-5)).toBe(0);
  });

  it("clamps above MAX to MAX", () => {
    expect(clampCorruption(MAX_CORRUPTION + 42)).toBe(MAX_CORRUPTION);
  });

  it("passes valid values through", () => {
    expect(clampCorruption(37)).toBe(37);
  });

  it("returns 0 for non-finite inputs", () => {
    expect(clampCorruption(NaN)).toBe(0);
    // Infinity is not finite either — engine drops to MIN_CORRUPTION.
    expect(clampCorruption(Infinity)).toBe(0);
    expect(clampCorruption(-Infinity)).toBe(0);
  });

  it("getCorruptionPct reads the raw field with clamp semantics", () => {
    expect(getCorruptionPct({ voidInstability: 42 })).toBe(42);
    expect(getCorruptionPct({ voidInstability: -10 })).toBe(0);
    expect(getCorruptionPct({ voidInstability: 250 })).toBe(MAX_CORRUPTION);
  });
});

describe("exposureBudget", () => {
  it("exposes canonical per-event magnitudes for each source", () => {
    const sources: VoidExposureSource[] = [
      "field_tile_void",
      "boss_slain",
      "realtime_raid_tick",
      "contract_settle_failed",
      "crafting_misfire",
      "mismatch_install",
      "black_market_fence",
      "ambient_decay",
    ];
    for (const s of sources) {
      expect(exposureBudget(s)).toBeGreaterThan(0);
      expect(Number.isFinite(exposureBudget(s))).toBe(true);
    }
  });

  it("ambient_decay is the smallest tick; contract_settle_failed is heaviest", () => {
    const values = [
      exposureBudget("ambient_decay"),
      exposureBudget("field_tile_void"),
      exposureBudget("boss_slain"),
      exposureBudget("contract_settle_failed"),
    ];
    expect(Math.min(...values)).toBe(exposureBudget("ambient_decay"));
    expect(Math.max(...values)).toBe(exposureBudget("contract_settle_failed"));
  });
});

describe("applyVoidExposure — accumulation", () => {
  it("adds exposure to the current load and returns the new value", () => {
    const p = holder({ voidInstability: 10 });
    const result = applyVoidExposure(p, "boss_slain");
    expect(result.nextCorruption).toBe(10 + exposureBudget("boss_slain"));
    expect(result.delta).toBe(exposureBudget("boss_slain"));
    expect(result.source).toBe("boss_slain");
  });

  it("multiplies by count when provided", () => {
    const p = holder({ voidInstability: 0 });
    const result = applyVoidExposure(p, "field_tile_void", 4);
    expect(result.nextCorruption).toBe(exposureBudget("field_tile_void") * 4);
  });

  it("is pure — does not mutate the player", () => {
    const p = holder({ voidInstability: 12 });
    applyVoidExposure(p, "boss_slain", 3);
    expect(p.voidInstability).toBe(12);
  });

  it("clamps at MAX_CORRUPTION on overflow", () => {
    const p = holder({ voidInstability: 99 });
    const r = applyVoidExposure(p, "boss_slain", 10);
    expect(r.nextCorruption).toBe(MAX_CORRUPTION);
    expect(r.delta).toBe(MAX_CORRUPTION - 99);
  });

  it("treats negative counts as zero (no retroactive cleanse)", () => {
    const p = holder({ voidInstability: 30 });
    const r = applyVoidExposure(p, "boss_slain", -5);
    expect(r.nextCorruption).toBe(30);
    expect(r.delta).toBe(0);
  });

  it("accumulation across many calls matches manual sum", () => {
    let v = 0;
    for (let i = 0; i < 20; i++) {
      const step = applyVoidExposure({ voidInstability: v }, "field_tile_void");
      v = step.nextCorruption;
    }
    expect(v).toBeCloseTo(20 * exposureBudget("field_tile_void"), 5);
  });
});

describe("ventCorruptionWithMana", () => {
  it("1 mana relieves 2 corruption at baseline rate", () => {
    const p = holder({ voidInstability: 20, mana: 5 });
    const { delta, manaSpent } = ventCorruptionWithMana(p, 3);
    expect(manaSpent).toBe(3);
    expect(delta.nextCorruption).toBe(20 - 3 * 2);
    expect(delta.delta).toBe(-6);
    expect(delta.source).toBe("vent");
  });

  it("does not spend more mana than the player has", () => {
    const p = holder({ voidInstability: 40, mana: 2 });
    const { manaSpent, delta } = ventCorruptionWithMana(p, 10);
    expect(manaSpent).toBe(2);
    expect(delta.nextCorruption).toBe(40 - 2 * 2);
  });

  it("clamps nextCorruption at 0 when vent over-relieves", () => {
    const p = holder({ voidInstability: 3, mana: 100 });
    const { delta, manaSpent } = ventCorruptionWithMana(p, 50);
    // mana spent still 50 (full ask), but corruption floors at 0
    expect(manaSpent).toBe(50);
    expect(delta.nextCorruption).toBe(0);
    expect(delta.delta).toBe(-3);
  });

  it("rejects negative manaToSpend", () => {
    const p = holder({ voidInstability: 10, mana: 5 });
    const r = ventCorruptionWithMana(p, -5);
    expect(r.manaSpent).toBe(0);
    expect(r.delta.nextCorruption).toBe(10);
  });

  it("floors fractional mana asks", () => {
    const p = holder({ voidInstability: 10, mana: 5 });
    const r = ventCorruptionWithMana(p, 2.9);
    expect(r.manaSpent).toBe(2);
    expect(r.delta.nextCorruption).toBe(10 - 4);
  });

  it("is pure — does not mutate the player", () => {
    const p = holder({ voidInstability: 20, mana: 5 });
    ventCorruptionWithMana(p, 3);
    expect(p.voidInstability).toBe(20);
    expect(p.mana).toBe(5);
  });
});

describe("cleanseCorruption", () => {
  it("reduces corruption by a flat amount", () => {
    const p = holder({ voidInstability: 80 });
    const r = cleanseCorruption(p, 25);
    expect(r.nextCorruption).toBe(55);
    expect(r.delta).toBe(-25);
    expect(r.source).toBe("cleanse");
  });

  it("clamps at 0 on overflow cleanse", () => {
    const p = holder({ voidInstability: 10 });
    const r = cleanseCorruption(p, 100);
    expect(r.nextCorruption).toBe(0);
    expect(r.delta).toBe(-10);
  });

  it("treats negative amounts as zero (no sneaky re-taint)", () => {
    const p = holder({ voidInstability: 40 });
    const r = cleanseCorruption(p, -50);
    expect(r.nextCorruption).toBe(40);
    expect(r.delta).toBe(0);
  });

  it("is pure — does not mutate the player", () => {
    const p = holder({ voidInstability: 40 });
    cleanseCorruption(p, 20);
    expect(p.voidInstability).toBe(40);
  });
});
