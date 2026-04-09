import { describe, expect, it } from "vitest";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";

describe("INSTALL_MINOR_RUNE outcome + CLEAR", () => {
  it("records failure when capacity blocks install", () => {
    const s: GameState = {
      ...initialGameState,
      player: {
        ...initialGameState.player,
        factionAlignment: "mecha",
        runeMastery: {
          ...initialGameState.player.runeMastery,
          capacity: { blood: 0, frame: 0, resonance: 0 },
        },
      },
    };
    const n = gameReducer(s, {
      type: "INSTALL_MINOR_RUNE",
      payload: { school: "mecha" },
    });
    expect(n.player.runeMastery).toEqual(s.player.runeMastery);
    expect(n.player.lastRuneInstallOutcome?.ok).toBe(false);
    if (n.player.lastRuneInstallOutcome && !n.player.lastRuneInstallOutcome.ok) {
      expect(n.player.lastRuneInstallOutcome.school).toBe("mecha");
      expect(n.player.lastRuneInstallOutcome.reason.length).toBeGreaterThan(0);
    }
  });

  it("applies install and records success with new depth", () => {
    const n = gameReducer(initialGameState, {
      type: "INSTALL_MINOR_RUNE",
      payload: { school: "mecha" },
    });
    expect(n.player.runeMastery.minorCountBySchool.mecha).toBe(1);
    expect(n.player.lastRuneInstallOutcome?.ok).toBe(true);
    if (n.player.lastRuneInstallOutcome?.ok) {
      expect(n.player.lastRuneInstallOutcome.newDepth).toBe(2);
      expect(n.player.lastRuneInstallOutcome.school).toBe("mecha");
    }
  });

  it("CLEAR_LAST_RUNE_INSTALL_OUTCOME clears the slot", () => {
    const afterInstall = gameReducer(initialGameState, {
      type: "INSTALL_MINOR_RUNE",
      payload: { school: "bio" },
    });
    expect(afterInstall.player.lastRuneInstallOutcome).not.toBeNull();
    const cleared = gameReducer(afterInstall, {
      type: "CLEAR_LAST_RUNE_INSTALL_OUTCOME",
    });
    expect(cleared.player.lastRuneInstallOutcome).toBeNull();
  });
});
