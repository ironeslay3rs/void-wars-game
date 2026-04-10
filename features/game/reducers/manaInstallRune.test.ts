import { describe, expect, it } from "vitest";

import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";
import {
  MANA_HYBRID_INSTALL_COST_BASE,
  MANA_HYBRID_INSTALL_COST_PURE,
} from "@/features/mana/manaTypes";

function makeState(overrides: Partial<GameState["player"]> = {}): GameState {
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      ...overrides,
    },
  };
}

describe("MANA_INSTALL_MINOR_RUNE — happy paths", () => {
  it("spends mana and installs the rune for a Bio-aligned player on-primary", () => {
    const start = makeState({
      factionAlignment: "bio",
      mana: 50,
      runeMastery: {
        ...initialGameState.player.runeMastery,
        capacity: { blood: 8, frame: 8, resonance: 8 },
      },
    });
    const next = gameReducer(start, {
      type: "MANA_INSTALL_MINOR_RUNE",
      payload: { school: "bio" },
    });
    expect(next.player.mana).toBe(50 - MANA_HYBRID_INSTALL_COST_BASE);
    expect(next.player.runeMastery.minorCountBySchool.bio).toBe(
      start.player.runeMastery.minorCountBySchool.bio + 1,
    );
    expect(next.player.lastRuneInstallOutcome).toMatchObject({
      ok: true,
      school: "bio",
    });
  });

  it("absorbs the hybrid drain bump when installing off-primary", () => {
    const start = makeState({
      factionAlignment: "bio",
      mana: 50,
      runeMastery: {
        ...initialGameState.player.runeMastery,
        hybridDrainStacks: 2,
        capacity: { blood: 8, frame: 8, resonance: 8 },
      },
    });
    const next = gameReducer(start, {
      type: "MANA_INSTALL_MINOR_RUNE",
      payload: { school: "mecha" },
    });
    // Mana spent.
    expect(next.player.mana).toBe(50 - MANA_HYBRID_INSTALL_COST_BASE);
    // Rune installed.
    expect(next.player.runeMastery.minorCountBySchool.mecha).toBe(
      start.player.runeMastery.minorCountBySchool.mecha + 1,
    );
    // Hybrid drain stacks DID NOT increase — soaked by mana.
    expect(next.player.runeMastery.hybridDrainStacks).toBe(
      start.player.runeMastery.hybridDrainStacks,
    );
  });

  it("Pure-aligned operatives pay the cheaper mana rate", () => {
    const start = makeState({
      factionAlignment: "pure",
      mana: 30,
      runeMastery: {
        ...initialGameState.player.runeMastery,
        capacity: { blood: 8, frame: 8, resonance: 8 },
      },
    });
    const next = gameReducer(start, {
      type: "MANA_INSTALL_MINOR_RUNE",
      payload: { school: "pure" },
    });
    expect(next.player.mana).toBe(30 - MANA_HYBRID_INSTALL_COST_PURE);
  });
});

describe("MANA_INSTALL_MINOR_RUNE — fail-soft paths", () => {
  it("is a no-op (with a reason on lastRuneInstallOutcome) when mana is short", () => {
    const start = makeState({
      factionAlignment: "bio",
      mana: 5,
      runeMastery: {
        ...initialGameState.player.runeMastery,
        capacity: { blood: 8, frame: 8, resonance: 8 },
      },
    });
    const next = gameReducer(start, {
      type: "MANA_INSTALL_MINOR_RUNE",
      payload: { school: "bio" },
    });
    expect(next.player.mana).toBe(5);
    expect(next.player.runeMastery.minorCountBySchool.bio).toBe(
      start.player.runeMastery.minorCountBySchool.bio,
    );
    expect(next.player.lastRuneInstallOutcome).toMatchObject({
      ok: false,
    });
    if (next.player.lastRuneInstallOutcome?.ok === false) {
      expect(next.player.lastRuneInstallOutcome.reason).toMatch(/mana/i);
    }
  });

  it("does not spend mana if the underlying install fails (capacity short)", () => {
    const start = makeState({
      factionAlignment: "bio",
      mana: 50,
      runeMastery: {
        ...initialGameState.player.runeMastery,
        capacity: { blood: 0, frame: 0, resonance: 0 },
      },
    });
    const next = gameReducer(start, {
      type: "MANA_INSTALL_MINOR_RUNE",
      payload: { school: "bio" },
    });
    // Underlying tryInstallMinorRune failed → reducer must NOT spend mana.
    expect(next.player.mana).toBe(50);
    expect(next.player.lastRuneInstallOutcome?.ok).toBe(false);
  });

  it("on-primary installs that succeed don't touch hybridDrainStacks (no soak needed)", () => {
    const start = makeState({
      factionAlignment: "mecha",
      mana: 50,
      runeMastery: {
        ...initialGameState.player.runeMastery,
        hybridDrainStacks: 3,
        capacity: { blood: 8, frame: 8, resonance: 8 },
      },
    });
    const next = gameReducer(start, {
      type: "MANA_INSTALL_MINOR_RUNE",
      payload: { school: "mecha" },
    });
    expect(next.player.mana).toBe(50 - MANA_HYBRID_INSTALL_COST_BASE);
    // hybridDrainStacks unchanged because the install was on-primary.
    expect(next.player.runeMastery.hybridDrainStacks).toBe(3);
  });
});

describe("Mana cost ordering", () => {
  it("Pure cost is strictly less than baseline cost", () => {
    expect(MANA_HYBRID_INSTALL_COST_PURE).toBeLessThan(
      MANA_HYBRID_INSTALL_COST_BASE,
    );
  });
});
