import { describe, it, expect } from "vitest";
import { initialGameState } from "@/features/game/initialGameState";
import type { PlayerState } from "@/features/game/gameTypes";
import type { RuneCapacityState } from "@/features/mastery/runeMasteryTypes";
import { CORRUPTION_CEILING, applyBlessing } from "./blessingResolver";
import type { Blessing, FusionBlessing } from "./blessingTypes";

/**
 * Resolver cost debits — clamp + purity. Canon anchor:
 * lore-canon/01 Master Canon/World Laws/The Void.md — the Void taxes those
 * who draw power from it; blessings' costs persist after the run.
 */
function basePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  // initialGameState is deep-frozen only structurally; spread-clone
  // sub-objects the tests mutate via applyBlessing.
  const p = initialGameState.player;
  const capacityMax: RuneCapacityState = { blood: 10, frame: 10, resonance: 10 };
  const capacity: RuneCapacityState = { blood: 10, frame: 10, resonance: 10 };
  return {
    ...p,
    voidInstability: 0,
    condition: 100,
    runeMastery: {
      ...p.runeMastery,
      capacity: { ...capacity },
      capacityMax: { ...capacityMax },
    },
    ...overrides,
  };
}

const corruptionBlessing: Blessing = {
  id: "test.corruption",
  name: "Test Corruption",
  school: "pure",
  flavor: "Ember Vault test line.",
  effect: { damagePct: 10 },
  cost: { kind: "corruption", amount: 15 },
  rarity: "common",
};

const conditionBlessing: Blessing = {
  id: "test.condition",
  name: "Test Condition",
  school: "bio",
  flavor: "Verdant Coil test line.",
  effect: { damagePct: 10 },
  cost: { kind: "condition", amount: 25 },
  rarity: "common",
};

const capacityBlessing: Blessing = {
  id: "test.capacity",
  name: "Test Capacity",
  school: "mecha",
  flavor: "Chrome Synod test line.",
  effect: { shieldPct: 10 },
  cost: { kind: "capacity", amount: 3, pool: "frame" },
  rarity: "common",
};

const fusionBlessing: FusionBlessing = {
  id: "test.fusion",
  name: "Test Fusion",
  flavor: "Black City test line.",
  pair: "bio+mecha",
  effect: { damagePct: 20 },
  costs: [
    { kind: "condition", amount: 10 },
    { kind: "capacity", amount: 2, pool: "frame" },
  ],
  rarity: "fusion",
};

describe("applyBlessing: corruption cost", () => {
  it("adds corruption and clamps at CORRUPTION_CEILING", () => {
    const player = basePlayer({ voidInstability: CORRUPTION_CEILING - 5 });
    const res = applyBlessing({ player, blessing: corruptionBlessing });
    expect(res.player.voidInstability).toBe(CORRUPTION_CEILING);
    expect(res.debited.corruptionAdded).toBe(5);
  });

  it("debited reports exactly the amount actually applied, not the cost", () => {
    const player = basePlayer({ voidInstability: CORRUPTION_CEILING });
    const res = applyBlessing({ player, blessing: corruptionBlessing });
    expect(res.debited.corruptionAdded).toBe(0);
    expect(res.player.voidInstability).toBe(CORRUPTION_CEILING);
  });
});

describe("applyBlessing: condition cost", () => {
  it("drains condition and floors at 0", () => {
    const player = basePlayer({ condition: 10 });
    const res = applyBlessing({ player, blessing: conditionBlessing });
    expect(res.player.condition).toBe(0);
    expect(res.debited.conditionDrained).toBe(10);
  });

  it("drains the full cost when headroom allows", () => {
    const player = basePlayer({ condition: 100 });
    const res = applyBlessing({ player, blessing: conditionBlessing });
    expect(res.player.condition).toBe(75);
    expect(res.debited.conditionDrained).toBe(25);
  });
});

describe("applyBlessing: capacity cost", () => {
  it("shaves the named pool and floors at 0", () => {
    const player = basePlayer();
    player.runeMastery.capacity.frame = 2;
    const res = applyBlessing({ player, blessing: capacityBlessing });
    expect(res.player.runeMastery.capacity.frame).toBe(0);
    expect(res.debited.capacityStress.frame).toBe(2);
  });

  it("only touches the targeted pool", () => {
    const player = basePlayer();
    const res = applyBlessing({ player, blessing: capacityBlessing });
    expect(res.player.runeMastery.capacity.blood).toBe(10);
    expect(res.player.runeMastery.capacity.resonance).toBe(10);
    expect(res.player.runeMastery.capacity.frame).toBe(7);
  });
});

describe("applyBlessing: purity", () => {
  it("does not mutate the input player ref", () => {
    const player = basePlayer();
    const snapshot = JSON.parse(JSON.stringify(player));
    applyBlessing({ player, blessing: conditionBlessing });
    applyBlessing({ player, blessing: capacityBlessing });
    applyBlessing({ player, blessing: corruptionBlessing });
    expect(player).toEqual(snapshot);
  });

  it("applied entry tags kind correctly for school vs fusion", () => {
    const player = basePlayer();
    const school = applyBlessing({ player, blessing: conditionBlessing });
    expect(school.applied.kind).toBe("school");
    const fusion = applyBlessing({ player, blessing: fusionBlessing });
    expect(fusion.applied.kind).toBe("fusion");
  });

  it("applied.acceptedAt reflects the supplied now", () => {
    const player = basePlayer();
    const res = applyBlessing({
      player,
      blessing: conditionBlessing,
      now: 1234567,
    });
    expect(res.applied.acceptedAt).toBe(1234567);
  });
});

describe("applyBlessing: fusion debits both costs", () => {
  it("drains condition and stresses capacity for a fusion blessing", () => {
    const player = basePlayer();
    const res = applyBlessing({ player, blessing: fusionBlessing });
    expect(res.debited.conditionDrained).toBe(10);
    expect(res.debited.capacityStress.frame).toBe(2);
    expect(res.player.condition).toBe(90);
    expect(res.player.runeMastery.capacity.frame).toBe(8);
  });
});
