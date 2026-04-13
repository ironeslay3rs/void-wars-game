/**
 * Canon slice: Void Suppression — mana gains are halved while the
 * operative is deployed in the void. Lifted on extraction.
 *
 * Canon anchor: `lore-canon/01 Master Canon/World Laws/The Void.md` +
 * `Mana/Mana System.md` ("how mana behaves inside the Void").
 */
import { describe, expect, it } from "vitest";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";
import {
  MANA_PER_HUNTING_GROUND_SETTLEMENT,
  MANA_PER_MISSION_SETTLEMENT,
  VOID_SUPPRESSION_MANA_MULT,
} from "@/features/mana/manaTypes";

const FIXED_NOW_MS = 1_704_000_000_000;
const HG_RUSTFANG = "hg-rustfang-prowl";

function settledQueueEntry(endsAt: number) {
  return {
    queueId: "test-sup-q1",
    missionId: HG_RUSTFANG,
    queuedAt: endsAt - 120_000,
    startsAt: endsAt - 60_000,
    endsAt,
    completedAt: null as number | null,
  };
}

function baseState(overrides: Partial<GameState["player"]> = {}): GameState {
  const endsAt = FIXED_NOW_MS - 1_000;
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      factionAlignment: "unbound",
      hunger: 100,
      condition: 100,
      mana: 0,
      manaMax: 60,
      missionQueue: [settledQueueEntry(endsAt)],
      ...overrides,
    },
  };
}

describe("Void Suppression — canon mana penalty while deployed", () => {
  it("grants full mana at mission settle when NOT deployed", () => {
    const state = baseState({ voidRealtimeBinding: null });
    const next = gameReducer(state, {
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: FIXED_NOW_MS },
    });
    expect(next.player.mana).toBe(MANA_PER_HUNTING_GROUND_SETTLEMENT);
  });

  it("halves mana gain at mission settle when deployed (voidRealtimeBinding set)", () => {
    const state = baseState({
      voidRealtimeBinding: {
        zoneId: "howling-scar",
        sessionBucketId: 1,
        clientId: "c-1",
      },
    });
    const next = gameReducer(state, {
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: FIXED_NOW_MS },
    });
    expect(next.player.mana).toBe(
      Math.floor(MANA_PER_HUNTING_GROUND_SETTLEMENT * VOID_SUPPRESSION_MANA_MULT),
    );
  });

  it("suppression constant is at most 1 (not a buff)", () => {
    expect(VOID_SUPPRESSION_MANA_MULT).toBeLessThanOrEqual(1);
    expect(VOID_SUPPRESSION_MANA_MULT).toBeGreaterThan(0);
  });

  it("suppression floor never drives gains below zero", () => {
    const suppressed = Math.floor(
      MANA_PER_MISSION_SETTLEMENT * VOID_SUPPRESSION_MANA_MULT,
    );
    expect(suppressed).toBeGreaterThanOrEqual(0);
  });
});
