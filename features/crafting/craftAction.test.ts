import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import type { PlayerState } from "@/features/game/gameTypes";
import {
  computeCraftingQualityBonus,
  computeCraftingSuccessBonus,
  performCraft,
} from "@/features/crafting/craftAction";
import { getRecipeById } from "@/features/crafting/recipeRegistry";

function playerWith(patch: Partial<PlayerState> = {}): PlayerState {
  return {
    ...initialGameState.player,
    ...patch,
    resources: {
      ...initialGameState.player.resources,
      ...(patch.resources ?? {}),
    },
  };
}

function stockedPlayer(patch: Partial<PlayerState> = {}): PlayerState {
  return playerWith({
    ...patch,
    resources: {
      ...initialGameState.player.resources,
      bioSamples: 100,
      ironOre: 100,
      scrapAlloy: 100,
      runeDust: 100,
      emberCore: 20,
      credits: 100,
      ...(patch.resources ?? {}),
    },
  });
}

describe("computeCraftingSuccessBonus", () => {
  it("returns 0 for non-crafter careers", () => {
    expect(computeCraftingSuccessBonus(playerWith({ careerFocus: "combat" }))).toBe(0);
    expect(computeCraftingSuccessBonus(playerWith({ careerFocus: "gathering" }))).toBe(0);
    expect(computeCraftingSuccessBonus(playerWith({ careerFocus: null }))).toBe(0);
  });

  it("scales +0.03/rank through rank 5, with rank 0 → 0", () => {
    for (let r = 0; r <= 5; r++) {
      const p = playerWith({ careerFocus: "crafting", rankLevel: r });
      expect(computeCraftingSuccessBonus(p)).toBeCloseTo(Math.min(0.15, r * 0.03), 10);
    }
  });

  it("caps at +0.15 past rank 5", () => {
    expect(computeCraftingSuccessBonus(playerWith({ careerFocus: "crafting", rankLevel: 10 }))).toBeCloseTo(0.15, 10);
    expect(computeCraftingSuccessBonus(playerWith({ careerFocus: "crafting", rankLevel: 999 }))).toBeCloseTo(0.15, 10);
  });

  it("clamps negative rankLevel to 0", () => {
    expect(computeCraftingSuccessBonus(playerWith({ careerFocus: "crafting", rankLevel: -5 }))).toBe(0);
  });
});

describe("computeCraftingQualityBonus", () => {
  it("returns 0 for non-crafters regardless of rank", () => {
    expect(computeCraftingQualityBonus(playerWith({ careerFocus: "combat", rankLevel: 10 }))).toBe(0);
    expect(computeCraftingQualityBonus(playerWith({ careerFocus: null, rankLevel: 99 }))).toBe(0);
  });

  it("returns 0 for a crafter at rank 0", () => {
    expect(computeCraftingQualityBonus(playerWith({ careerFocus: "crafting", rankLevel: 0 }))).toBe(0);
  });

  it("returns +1 for crafter ranks 1–4", () => {
    for (const r of [1, 2, 3, 4]) {
      expect(computeCraftingQualityBonus(playerWith({ careerFocus: "crafting", rankLevel: r }))).toBe(1);
    }
  });

  it("returns +2 for crafter ranks 5+", () => {
    for (const r of [5, 10, 99]) {
      expect(computeCraftingQualityBonus(playerWith({ careerFocus: "crafting", rankLevel: r }))).toBe(2);
    }
  });
});

describe("performCraft — happy path", () => {
  it("consumes materials and produces resource output on forced success", () => {
    const recipe = getRecipeById("moss-ration")!;
    const player = stockedPlayer();
    const outcome = performCraft({ player, recipe, rng: () => 0 });
    expect(outcome.result.ok).toBe(true);
    if (!outcome.result.ok) return;
    expect(outcome.result.success).toBe(true);
    expect(outcome.player.resources.bioSamples).toBe(player.resources.bioSamples - 10);
    expect(outcome.player.resources.ironOre).toBe(player.resources.ironOre - 5);
    expect(outcome.player.resources.mossRations).toBe((player.resources.mossRations ?? 0) + 1);
  });

  it("attaches a QualityTier to the outcome", () => {
    const recipe = getRecipeById("moss-ration")!;
    const outcome = performCraft({
      player: stockedPlayer(),
      recipe,
      materialQualities: ["standard", "standard"],
      rng: () => 0,
    });
    expect(["rough", "standard", "refined", "exemplary"]).toContain(outcome.quality);
  });
});

describe("performCraft — missing materials", () => {
  it("returns ok:false with a reason when player cannot pay", () => {
    const recipe = getRecipeById("moss-ration")!;
    const broke = playerWith({
      resources: { ...initialGameState.player.resources, bioSamples: 0, ironOre: 0 },
    });
    const outcome = performCraft({ player: broke, recipe, rng: () => 0 });
    expect(outcome.result.ok).toBe(false);
    if (outcome.result.ok) return;
    expect(outcome.result.reason).toMatch(/insufficient/i);
  });

  it("does not mutate player resources on failure-to-afford", () => {
    const recipe = getRecipeById("moss-ration")!;
    const broke = playerWith({
      resources: { ...initialGameState.player.resources, bioSamples: 1 },
    });
    const snap = { ...broke.resources };
    performCraft({ player: broke, recipe, rng: () => 0 });
    expect(broke.resources).toEqual(snap);
  });
});

describe("performCraft — rank-driven success chance", () => {
  it("rank 0 crafter: base successChance, roll above threshold fails", () => {
    const recipe = getRecipeById("rune-sigil")!; // 0.7
    const outcome = performCraft({
      player: stockedPlayer({ careerFocus: "crafting", rankLevel: 0 }),
      recipe,
      rng: () => 0.75, // above 0.7 → fail
    });
    expect(outcome.result.ok).toBe(true);
    if (!outcome.result.ok) return;
    expect(outcome.result.success).toBe(false);
  });

  it("rank 5 crafter lifts rune-sigil (0.7) past a 0.75 roll → success", () => {
    // +0.15 bonus → effective 0.85, beats 0.75 roll
    const recipe = getRecipeById("rune-sigil")!;
    const outcome = performCraft({
      player: stockedPlayer({ careerFocus: "crafting", rankLevel: 5 }),
      recipe,
      rng: () => 0.75,
    });
    expect(outcome.result.ok).toBe(true);
    if (!outcome.result.ok) return;
    expect(outcome.result.success).toBe(true);
  });

  it("bonus caps at +0.15 — rank 99 doesn't beat a 0.9 roll on rune-sigil", () => {
    const recipe = getRecipeById("rune-sigil")!; // 0.7 + 0.15 = 0.85
    const outcome = performCraft({
      player: stockedPlayer({ careerFocus: "crafting", rankLevel: 99 }),
      recipe,
      rng: () => 0.9,
    });
    expect(outcome.result.ok).toBe(true);
    if (!outcome.result.ok) return;
    expect(outcome.result.success).toBe(false);
  });

  it("non-crafter rank is ignored (no bonus)", () => {
    const recipe = getRecipeById("rune-sigil")!;
    const outcome = performCraft({
      player: stockedPlayer({ careerFocus: "combat", rankLevel: 99 }),
      recipe,
      rng: () => 0.75,
    });
    expect(outcome.result.ok).toBe(true);
    if (!outcome.result.ok) return;
    expect(outcome.result.success).toBe(false);
  });
});

describe("performCraft — quality integration", () => {
  it("crafter rank 1 lifts standard materials to refined output", () => {
    const recipe = getRecipeById("moss-ration")!;
    const outcome = performCraft({
      player: stockedPlayer({ careerFocus: "crafting", rankLevel: 1 }),
      recipe,
      materialQualities: ["standard", "standard"],
      rng: () => 0,
    });
    expect(outcome.quality).toBe("refined");
  });

  it("crafter rank 5 lifts standard → exemplary (+2 tiers)", () => {
    const recipe = getRecipeById("moss-ration")!;
    const outcome = performCraft({
      player: stockedPlayer({ careerFocus: "crafting", rankLevel: 5 }),
      recipe,
      materialQualities: ["standard"],
      rng: () => 0,
    });
    expect(outcome.quality).toBe("exemplary");
  });

  it("non-crafter passes material average through unchanged", () => {
    const recipe = getRecipeById("moss-ration")!;
    const outcome = performCraft({
      player: stockedPlayer({ careerFocus: "combat", rankLevel: 10 }),
      recipe,
      materialQualities: ["refined", "refined"],
      rng: () => 0,
    });
    expect(outcome.quality).toBe("refined");
  });

  it("omitted materialQualities defaults to standard baseline", () => {
    const recipe = getRecipeById("moss-ration")!;
    const outcome = performCraft({
      player: stockedPlayer({ careerFocus: null }),
      recipe,
      rng: () => 0,
    });
    expect(outcome.quality).toBe("standard");
  });
});

describe("performCraft — deterministic seeded RNG", () => {
  it("same seed + same inputs yields identical results across runs", () => {
    const recipe = getRecipeById("scrap-blade")!;
    const a = performCraft({ player: stockedPlayer(), recipe, rng: () => 0.42 });
    const b = performCraft({ player: stockedPlayer(), recipe, rng: () => 0.42 });
    expect(a.result).toEqual(b.result);
    expect(a.player.resources).toEqual(b.player.resources);
    expect(a.quality).toBe(b.quality);
  });

  it("different seeds can produce different success outcomes", () => {
    const recipe = getRecipeById("scrap-blade-upgrade")!; // 0.65
    const low = performCraft({ player: stockedPlayer(), recipe, rng: () => 0.1 });
    const high = performCraft({ player: stockedPlayer(), recipe, rng: () => 0.99 });
    expect(low.result.ok && high.result.ok).toBe(true);
    if (!low.result.ok || !high.result.ok) return;
    expect(low.result.success).toBe(true);
    expect(high.result.success).toBe(false);
  });
});

describe("performCraft — pure-function non-mutation", () => {
  it("does not mutate the input player object", () => {
    const recipe = getRecipeById("moss-ration")!;
    const player = stockedPlayer();
    const snapResources = { ...player.resources };
    const snapCrafted = { ...(player.craftedInventory ?? {}) };
    performCraft({ player, recipe, rng: () => 0 });
    expect(player.resources).toEqual(snapResources);
    expect(player.craftedInventory ?? {}).toEqual(snapCrafted);
  });

  it("does not mutate the recipe object", () => {
    const recipe = getRecipeById("rune-sigil")!;
    const snap = { ...recipe, materials: { ...recipe.materials } };
    performCraft({
      player: stockedPlayer({ careerFocus: "crafting", rankLevel: 5 }),
      recipe,
      rng: () => 0.8,
    });
    expect(recipe.successChance).toBe(snap.successChance);
    expect(recipe.materials).toEqual(snap.materials);
  });

  it("does not mutate the input materialQualities array", () => {
    const recipe = getRecipeById("moss-ration")!;
    const mats: ("rough" | "standard" | "refined" | "exemplary")[] = ["refined", "standard"];
    const snap = [...mats];
    performCraft({ player: stockedPlayer(), recipe, materialQualities: mats, rng: () => 0 });
    expect(mats).toEqual(snap);
  });
});
