import { describe, expect, it } from "vitest";

import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";
import {
  SHELL_ABILITIES,
  SURGE_DAMAGE_BONUS_PCT,
  SURGE_DURATION_MS,
  getActiveShellDamageBonusPct,
  getShellAbility,
  pruneExpiredShellBuffs,
  type ShellBuff,
} from "@/features/combat/shellAbilities";

function makeState(overrides: Partial<GameState["player"]> = {}): GameState {
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      ...overrides,
    },
  };
}

describe("SHELL_ABILITIES table", () => {
  it("Surge has affordable mana cost in the foundation slice band", () => {
    expect(SHELL_ABILITIES.surge.manaCost).toBeGreaterThanOrEqual(10);
    expect(SHELL_ABILITIES.surge.manaCost).toBeLessThanOrEqual(25);
  });

  it("Surge duration is in seconds, not minutes", () => {
    expect(SURGE_DURATION_MS).toBeGreaterThanOrEqual(3_000);
    expect(SURGE_DURATION_MS).toBeLessThanOrEqual(15_000);
  });

  it("Surge has assault loadout affinity (body-forward kits)", () => {
    expect(SHELL_ABILITIES.surge.loadoutAffinity).toBe("assault");
  });

  it("getShellAbility returns the same record indexed by id", () => {
    expect(getShellAbility("surge").id).toBe("surge");
  });
});

describe("pruneExpiredShellBuffs", () => {
  it("drops buffs whose expiresAt is in the past", () => {
    const buffs: ShellBuff[] = [
      { abilityId: "surge", expiresAt: 100, damageBonusPct: 50 },
      { abilityId: "surge", expiresAt: 200, damageBonusPct: 50 },
    ];
    const pruned = pruneExpiredShellBuffs(buffs, 150);
    expect(pruned).toHaveLength(1);
    expect(pruned[0].expiresAt).toBe(200);
  });

  it("drops a buff exactly at expiry (strict greater-than)", () => {
    const buffs: ShellBuff[] = [
      { abilityId: "surge", expiresAt: 100, damageBonusPct: 50 },
    ];
    expect(pruneExpiredShellBuffs(buffs, 100)).toHaveLength(0);
  });
});

describe("getActiveShellDamageBonusPct", () => {
  it("returns 0 when no buffs are active", () => {
    expect(getActiveShellDamageBonusPct([], 100)).toBe(0);
  });

  it("sums active damage bonuses (and ignores expired)", () => {
    const buffs: ShellBuff[] = [
      { abilityId: "surge", expiresAt: 50, damageBonusPct: 50 },
      { abilityId: "surge", expiresAt: 200, damageBonusPct: 30 },
      { abilityId: "surge", expiresAt: 300, damageBonusPct: 20 },
    ];
    expect(getActiveShellDamageBonusPct(buffs, 100)).toBe(50);
  });
});

describe("ACTIVATE_SHELL_ABILITY reducer", () => {
  it("spends mana and adds a buff with the right expiresAt + damageBonusPct", () => {
    const start = makeState({
      mana: 30,
      manaMax: 50,
      activeShellBuffs: [],
    });
    const next = gameReducer(start, {
      type: "ACTIVATE_SHELL_ABILITY",
      payload: { abilityId: "surge", nowMs: 1_000_000 },
    });
    expect(next.player.mana).toBe(30 - SHELL_ABILITIES.surge.manaCost);
    expect(next.player.activeShellBuffs).toHaveLength(1);
    expect(next.player.activeShellBuffs[0]).toMatchObject({
      abilityId: "surge",
      expiresAt: 1_000_000 + SURGE_DURATION_MS,
      damageBonusPct: SURGE_DAMAGE_BONUS_PCT,
    });
  });

  it("is a no-op when mana is short", () => {
    const start = makeState({ mana: 5, activeShellBuffs: [] });
    const next = gameReducer(start, {
      type: "ACTIVATE_SHELL_ABILITY",
      payload: { abilityId: "surge", nowMs: 1_000_000 },
    });
    expect(next.player.mana).toBe(5);
    expect(next.player.activeShellBuffs).toEqual([]);
  });

  it("re-activating a Surge refreshes the expiry rather than stacking duplicates", () => {
    const start = makeState({
      mana: 50,
      activeShellBuffs: [
        { abilityId: "surge", expiresAt: 1_000_500, damageBonusPct: 50 },
      ],
    });
    const next = gameReducer(start, {
      type: "ACTIVATE_SHELL_ABILITY",
      payload: { abilityId: "surge", nowMs: 1_000_000 },
    });
    // Single Surge, refreshed expiry from the new activation.
    expect(next.player.activeShellBuffs).toHaveLength(1);
    expect(next.player.activeShellBuffs[0].expiresAt).toBe(
      1_000_000 + SURGE_DURATION_MS,
    );
    expect(next.player.mana).toBe(50 - SHELL_ABILITIES.surge.manaCost);
  });

  it("prunes expired buffs from other ability types when activating Surge", () => {
    const start = makeState({
      mana: 50,
      activeShellBuffs: [
        { abilityId: "surge", expiresAt: 999_000, damageBonusPct: 50 },
      ],
    });
    const next = gameReducer(start, {
      type: "ACTIVATE_SHELL_ABILITY",
      payload: { abilityId: "surge", nowMs: 1_000_000 },
    });
    // Old expired buff dropped, new buff added.
    expect(next.player.activeShellBuffs).toHaveLength(1);
    expect(next.player.activeShellBuffs[0].expiresAt).toBeGreaterThan(
      1_000_000,
    );
  });
});
