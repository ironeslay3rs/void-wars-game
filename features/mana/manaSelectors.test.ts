import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import {
  canSpendMana,
  getManaDisplay,
  getManaPercent,
} from "@/features/mana/manaSelectors";

const basePlayer = initialGameState.player;

describe("getManaDisplay", () => {
  it("returns school-flavored long + short names + spend verb per faction", () => {
    expect(getManaDisplay("unbound")).toMatchObject({
      longName: "Mana",
      shortName: "Mana",
      spendVerb: "Vent Mana",
    });
    expect(getManaDisplay("bio")).toMatchObject({
      longName: "Ichor Flow",
      shortName: "Ichor",
      spendVerb: "Vent Ichor",
    });
    expect(getManaDisplay("mecha")).toMatchObject({
      longName: "Charge Stack",
      shortName: "Charge",
      spendVerb: "Vent Charge",
    });
    expect(getManaDisplay("pure")).toMatchObject({
      longName: "Will Reservoir",
      shortName: "Will",
      spendVerb: "Vent Will",
    });
  });

  it("every faction has a non-empty config (no null gaps)", () => {
    const factions = ["unbound", "bio", "mecha", "pure"] as const;
    for (const faction of factions) {
      const display = getManaDisplay(faction);
      expect(display.longName.length).toBeGreaterThan(0);
      expect(display.shortName.length).toBeGreaterThan(0);
      expect(display.spendVerb.length).toBeGreaterThan(0);
      expect(display.faction).toBe(faction);
    }
  });
});

describe("getManaPercent", () => {
  it("returns 0..100 integer based on mana / manaMax", () => {
    expect(getManaPercent({ ...basePlayer, mana: 0, manaMax: 50 })).toBe(0);
    expect(getManaPercent({ ...basePlayer, mana: 25, manaMax: 50 })).toBe(50);
    expect(getManaPercent({ ...basePlayer, mana: 50, manaMax: 50 })).toBe(100);
  });

  it("clamps to [0, 100] and returns 0 on degenerate manaMax", () => {
    expect(getManaPercent({ ...basePlayer, mana: 80, manaMax: 50 })).toBe(100);
    expect(getManaPercent({ ...basePlayer, mana: -5, manaMax: 50 })).toBe(0);
    expect(getManaPercent({ ...basePlayer, mana: 25, manaMax: 0 })).toBe(0);
  });
});

describe("canSpendMana", () => {
  it("returns true when mana >= amount and false otherwise", () => {
    expect(canSpendMana({ ...basePlayer, mana: 30 }, 20)).toBe(true);
    expect(canSpendMana({ ...basePlayer, mana: 20 }, 20)).toBe(true);
    expect(canSpendMana({ ...basePlayer, mana: 19 }, 20)).toBe(false);
  });

  it("treats negative / fractional amounts as floored non-negative", () => {
    expect(canSpendMana({ ...basePlayer, mana: 0 }, -5)).toBe(true);
    expect(canSpendMana({ ...basePlayer, mana: 5 }, 5.9)).toBe(true);
  });
});
