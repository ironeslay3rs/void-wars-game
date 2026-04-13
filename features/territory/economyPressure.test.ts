/**
 * Tests — economyPressure selectors.
 *
 * Coverage:
 * - Stable world (full stability, no wars) → incomeMult ~ 1, raidRisk ~ 0.
 * - Many active wars + low stability → incomeMult drops, raidRisk rises,
 *   priceMult rises.
 * - Resolved wars do not contribute to activeWars count.
 * - Pure: selector does not mutate input arrays or their elements.
 * - selectTerritoryPressure flags underSiege correctly for siege/assault.
 */

import { describe, expect, it } from "vitest";
import { makeTerritoryRegistry } from "./territoryRegistry";
import {
  selectEconomyPressure,
  selectTerritoryPressure,
} from "./economyPressure";
import type {
  PlayerState,
} from "@/features/game/gameTypes";
import type { Territory, TerritoryOwner, War } from "./territoryTypes";

// PlayerState is broad and fully optional in the selector signature.
// For these tests we only need a placeholder — the selector ignores it.
const PLAYER = {} as unknown as PlayerState;

const ATTACKER: TerritoryOwner = { kind: "empire", id: "chrome-synod" };
const DEFENDER: TerritoryOwner = { kind: "empire", id: "verdant-coil" };

function stableWorld(): Territory[] {
  const reg = makeTerritoryRegistry();
  // Pin every territory to high stability.
  return reg.map((t) => ({ ...t, stability: 0.95 }));
}

function unstableWorld(): Territory[] {
  return makeTerritoryRegistry().map((t) => ({ ...t, stability: 0.1 }));
}

function mkWar(id: string, territoryId: string, phase: War["phase"]): War {
  return {
    id,
    territoryId,
    attacker: ATTACKER,
    defender: DEFENDER,
    phase,
    ticks: 0,
    momentum: 0,
  };
}

describe("selectEconomyPressure — stable world", () => {
  it("no wars + high stability → incomeMult near 1, raidRisk near 0", () => {
    const p = selectEconomyPressure(stableWorld(), [], PLAYER);
    expect(p.activeWars).toBe(0);
    expect(p.incomeMult).toBeGreaterThanOrEqual(0.9);
    expect(p.incomeMult).toBeLessThanOrEqual(1.15);
    expect(p.raidRisk).toBeLessThan(0.05);
    expect(p.priceMult).toBeGreaterThanOrEqual(0.9);
    expect(p.priceMult).toBeLessThanOrEqual(1.1);
    expect(p.avgStability).toBeGreaterThan(0.9);
  });
});

describe("selectEconomyPressure — pressure scaling", () => {
  it("many wars + low stability → incomeMult drops, raidRisk rises", () => {
    const territories = unstableWorld();
    const wars: War[] = [
      mkWar("w1", territories[0].id, "siege"),
      mkWar("w2", territories[1].id, "assault"),
      mkWar("w3", territories[2].id, "skirmish"),
      mkWar("w4", territories[3].id, "siege"),
      mkWar("w5", territories[4].id, "skirmish"),
    ];
    const p = selectEconomyPressure(territories, wars, PLAYER);
    expect(p.activeWars).toBe(5);
    expect(p.incomeMult).toBeLessThan(0.9);
    expect(p.raidRisk).toBeGreaterThan(0.2);
    expect(p.priceMult).toBeGreaterThan(1.1);
  });

  it("resolved wars do not contribute to activeWars", () => {
    const territories = stableWorld();
    const wars: War[] = [
      mkWar("r1", territories[0].id, "resolved"),
      mkWar("r2", territories[1].id, "resolved"),
    ];
    const p = selectEconomyPressure(territories, wars, PLAYER);
    expect(p.activeWars).toBe(0);
  });

  it("monotonic: adding wars monotonically worsens pressure", () => {
    const territories = makeTerritoryRegistry();
    const a = selectEconomyPressure(territories, [], PLAYER);
    const b = selectEconomyPressure(
      territories,
      [mkWar("x1", territories[0].id, "siege")],
      PLAYER,
    );
    const c = selectEconomyPressure(
      territories,
      [
        mkWar("x1", territories[0].id, "siege"),
        mkWar("x2", territories[1].id, "assault"),
        mkWar("x3", territories[2].id, "siege"),
      ],
      PLAYER,
    );
    expect(b.incomeMult).toBeLessThanOrEqual(a.incomeMult);
    expect(c.incomeMult).toBeLessThanOrEqual(b.incomeMult);
    expect(b.raidRisk).toBeGreaterThanOrEqual(a.raidRisk);
    expect(c.raidRisk).toBeGreaterThanOrEqual(b.raidRisk);
    expect(c.priceMult).toBeGreaterThanOrEqual(a.priceMult);
  });
});

describe("selectEconomyPressure — purity", () => {
  it("does not mutate input territories or wars", () => {
    const territories = stableWorld();
    const wars: War[] = [mkWar("w1", territories[0].id, "siege")];
    const tSnap = JSON.parse(JSON.stringify(territories));
    const wSnap = JSON.parse(JSON.stringify(wars));

    selectEconomyPressure(territories, wars, PLAYER);

    expect(territories).toEqual(tSnap);
    expect(wars).toEqual(wSnap);
  });

  it("handles empty world without throwing (avgStability = 1)", () => {
    const p = selectEconomyPressure([], [], PLAYER);
    expect(p.avgStability).toBe(1);
    expect(p.activeWars).toBe(0);
  });
});

describe("selectTerritoryPressure", () => {
  it("flags underSiege for siege/assault phases", () => {
    const t = makeTerritoryRegistry()[0];
    const siegeWar = mkWar("s1", t.id, "siege");
    const skirmishWar = mkWar("s2", t.id, "skirmish");

    const siege = selectTerritoryPressure(t, [siegeWar]);
    expect(siege.underSiege).toBe(true);
    expect(siege.activeWars).toBe(1);

    const skirmish = selectTerritoryPressure(t, [skirmishWar]);
    expect(skirmish.underSiege).toBe(false);
    expect(skirmish.activeWars).toBe(1);
  });

  it("ignores wars for other territories and resolved wars", () => {
    const [t, other] = makeTerritoryRegistry();
    const wars: War[] = [
      mkWar("w1", other.id, "assault"),
      mkWar("w2", t.id, "resolved"),
    ];
    const p = selectTerritoryPressure(t, wars);
    expect(p.activeWars).toBe(0);
    expect(p.underSiege).toBe(false);
  });

  it("raidRisk rises as stability falls", () => {
    const base = makeTerritoryRegistry()[0];
    const calm: Territory = { ...base, stability: 0.95 };
    const panic: Territory = { ...base, stability: 0.05 };
    const calmP = selectTerritoryPressure(calm, []);
    const panicP = selectTerritoryPressure(panic, []);
    expect(panicP.raidRisk).toBeGreaterThan(calmP.raidRisk);
  });
});
