import { describe, expect, it } from "vitest";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";

const HG_MISSION_ID = "hg-rustfang-prowl";

function stateWithFinishedHunt(opts: {
  endsAt: number;
  fieldLootGainedThisRun?: GameState["player"]["fieldLootGainedThisRun"];
}): GameState {
  const { endsAt, fieldLootGainedThisRun = {} } = opts;
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      fieldLootGainedThisRun,
      missionQueue: [
        {
          queueId: "test-hunt-q1",
          missionId: HG_MISSION_ID,
          queuedAt: endsAt - 120_000,
          startsAt: endsAt - 60_000,
          endsAt,
          completedAt: null,
        },
      ],
    },
  };
}

describe("hunt resolution vs field loot ledger", () => {
  it("copies fieldLootGainedThisRun into lastHuntResult.fieldLootGained when the queue resolves before extract", () => {
    const endsAt = 9_000_000;
    const base = stateWithFinishedHunt({
      endsAt,
      fieldLootGainedThisRun: { scrapAlloy: 11, emberCore: 2 },
    });
    const orbFirst = gameReducer(base, {
      type: "VOID_FIELD_ORB_COLLECTED",
      payload: { key: "scrapAlloy", amount: 3 },
    });
    expect(orbFirst.player.fieldLootGainedThisRun.scrapAlloy).toBe(14);

    const settled = gameReducer(orbFirst, {
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: endsAt + 1 },
    });

    expect(settled.player.lastHuntResult?.missionId).toBe(HG_MISSION_ID);
    expect(settled.player.lastHuntResult?.fieldLootGained?.scrapAlloy).toBe(14);
    expect(settled.player.lastHuntResult?.fieldLootGained?.emberCore).toBe(2);
    expect(settled.player.fieldLootGainedThisRun).toEqual({});
  });

  it("snapshots an empty ledger when no orb pickups were recorded", () => {
    const endsAt = 8_000_000;
    const base = stateWithFinishedHunt({ endsAt, fieldLootGainedThisRun: {} });
    const settled = gameReducer(base, {
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: endsAt + 1 },
    });
    expect(settled.player.lastHuntResult?.fieldLootGained).toEqual({});
  });
});

describe("ADD_FIELD_LOOT skipRunLedger (extract after orb ledger)", () => {
  it("does not double-count fieldLootGainedThisRun when skipRunLedger is true", () => {
    const s0: GameState = {
      ...initialGameState,
      player: {
        ...initialGameState.player,
        fieldLootGainedThisRun: { scrapAlloy: 6 },
      },
    };
    const s1 = gameReducer(s0, {
      type: "ADD_FIELD_LOOT",
      payload: { key: "scrapAlloy", amount: 6, skipRunLedger: true },
    });
    expect(s1.player.fieldLootGainedThisRun.scrapAlloy).toBe(6);
  });

  it("extends fieldLootGainedThisRun when skipRunLedger is omitted (non-orb path)", () => {
    const s0: GameState = {
      ...initialGameState,
      player: {
        ...initialGameState.player,
        fieldLootGainedThisRun: { scrapAlloy: 2 },
      },
    };
    const s1 = gameReducer(s0, {
      type: "ADD_FIELD_LOOT",
      payload: { key: "scrapAlloy", amount: 3 },
    });
    expect(s1.player.fieldLootGainedThisRun.scrapAlloy).toBe(5);
  });
});
