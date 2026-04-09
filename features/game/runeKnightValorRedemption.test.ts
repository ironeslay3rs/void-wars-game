import { describe, expect, it } from "vitest";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";

function withConvergedKnight(
  valor: number,
  credits: number,
  mastery = 0,
  influence = 0,
): GameState {
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      masteryProgress: mastery,
      influence,
      resources: {
        ...initialGameState.player.resources,
        credits,
      },
      mythicAscension: {
        ...initialGameState.player.mythicAscension,
        convergencePrimed: true,
        runeKnightValor: valor,
      },
    },
  };
}

describe("REDEEM_RUNE_KNIGHT_VALOR", () => {
  it("mastery-boon spends 5 valor and adds mastery progress when convergence is primed", () => {
    const s = withConvergedKnight(10, 0, 100);
    const n = gameReducer(s, {
      type: "REDEEM_RUNE_KNIGHT_VALOR",
      payload: "mastery-boon",
    });
    expect(n.player.mythicAscension.runeKnightValor).toBe(5);
    expect(n.player.masteryProgress).toBe(112);
  });

  it("does nothing without convergence filed", () => {
    const s: GameState = {
      ...initialGameState,
      player: {
        ...initialGameState.player,
        mythicAscension: {
          ...initialGameState.player.mythicAscension,
          convergencePrimed: false,
          runeKnightValor: 10,
        },
      },
    };
    const n = gameReducer(s, {
      type: "REDEEM_RUNE_KNIGHT_VALOR",
      payload: "mastery-boon",
    });
    expect(n).toStrictEqual(s);
  });

  it("influence-seal spends 3 valor", () => {
    const s = withConvergedKnight(5, 0, 0, 3);
    const n = gameReducer(s, {
      type: "REDEEM_RUNE_KNIGHT_VALOR",
      payload: "influence-seal",
    });
    expect(n.player.mythicAscension.runeKnightValor).toBe(2);
    expect(n.player.influence).toBe(5);
  });

  it("ivory-prestige-rite spends valor and credits, restores condition", () => {
    const s = withConvergedKnight(6, 200, 0, 0);
    const p = { ...s.player, condition: 40 };
    const s2 = { ...s, player: p };
    const n = gameReducer(s2, {
      type: "REDEEM_RUNE_KNIGHT_VALOR",
      payload: "ivory-prestige-rite",
    });
    expect(n.player.mythicAscension.runeKnightValor).toBe(2);
    expect(n.player.resources.credits).toBe(80);
    expect(n.player.condition).toBe(55);
  });

  it("ivory-prestige-rite noop when credits insufficient", () => {
    const s = withConvergedKnight(6, 50, 0, 0);
    const n = gameReducer(s, {
      type: "REDEEM_RUNE_KNIGHT_VALOR",
      payload: "ivory-prestige-rite",
    });
    expect(n).toStrictEqual(s);
  });

  it("arena-edge-sigil spends 2 valor and grants one charge", () => {
    const s = withConvergedKnight(6, 0, 0, 0);
    const n = gameReducer(s, {
      type: "REDEEM_RUNE_KNIGHT_VALOR",
      payload: "arena-edge-sigil",
    });
    expect(n.player.mythicAscension.runeKnightValor).toBe(4);
    expect(n.player.mythicAscension.arenaEdgeSigils).toBe(1);
  });
});

describe("CONSUME_ARENA_EDGE_SIGIL", () => {
  it("consumes a stored sigil by one", () => {
    const s = withConvergedKnight(0, 0);
    const withCharge: GameState = {
      ...s,
      player: {
        ...s.player,
        mythicAscension: {
          ...s.player.mythicAscension,
          arenaEdgeSigils: 2,
        },
      },
    };
    const n = gameReducer(withCharge, { type: "CONSUME_ARENA_EDGE_SIGIL" });
    expect(n.player.mythicAscension.arenaEdgeSigils).toBe(1);
  });
});
