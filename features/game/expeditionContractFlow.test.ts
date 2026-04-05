/**
 * M1 expedition source-of-truth coverage: `COMMIT_VOID_FIELD_EXTRACTION` +
 * `PROCESS_MISSION_QUEUE` (hunting-ground) + ledger parity helpers.
 *
 * @see huntLootLedgerResolution.test.ts — orb ledger vs extract skipRunLedger
 */
import { describe, expect, it } from "vitest";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";
import { computeVoidFieldExtractionLedger } from "@/features/expedition/voidFieldExtractionLedger";
import { INVENTORY_CAPACITY_MAX } from "@/features/resources/inventoryLogic";

const HG_RUSTFANG = "hg-rustfang-prowl";
/** Fixed clock for extraction / war-quote math (deterministic contested rotation). */
const FIXED_NOW_MS = 1_704_000_000_000;

function rustfangQueueEntry(endsAt: number) {
  return {
    queueId: "test-rustfang-q1",
    missionId: HG_RUSTFANG,
    queuedAt: endsAt - 120_000,
    startsAt: endsAt - 60_000,
    endsAt,
    completedAt: null as number | null,
  };
}

function baseExpeditionState(overrides: {
  endsAt: number;
  player?: Partial<GameState["player"]>;
}): GameState {
  const { endsAt, player: p = {} } = overrides;
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      factionAlignment: "unbound",
      hunger: 100,
      condition: 100,
      voidInstability: 0,
      runInstability: 0,
      lastConditionTickAt: endsAt,
      lastHuntResult: null,
      fieldLootGainedThisRun: {},
      missionQueue: [rustfangQueueEntry(endsAt)],
      expeditionContractSnapshots: {},
      ...p,
    },
  };
}

describe("M1 expedition contract flow — normal successful run", () => {
  it("extracts ledger then settles contract; contract payout matches fusion-adjusted mission row (no double field loot)", () => {
    const endsAt = 50_000_000;
    let state = baseExpeditionState({
      endsAt,
      player: {
        resources: { ...initialGameState.player.resources },
        fieldLootGainedThisRun: { scrapAlloy: 2 },
        rankXp: 0,
      },
    });

    state = gameReducer(state, {
      type: "COMMIT_VOID_FIELD_EXTRACTION",
      payload: {
        kills: 2,
        zoneName: "Ash Relay",
        zoneId: "ash-relay",
        nowMs: FIXED_NOW_MS,
      },
    });

    expect(state.player.fieldLootGainedThisRun).toEqual({});
    expect(state.player.resources.scrapAlloy).toBe(2);
    expect(state.player.rankXp).toBe(24);

    state = gameReducer(state, {
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: endsAt + 1 },
    });

    const lr = state.player.lastHuntResult;
    expect(lr).not.toBeNull();
    expect(lr!.missionId).toBe(HG_RUSTFANG);
    expect(lr!.fieldLootGained).toEqual({});
    expect(state.player.missionQueue).toEqual([]);

    const fusionAndCadenceMult = 1.04;
    expect(lr!.resourcesGained.credits).toBe(
      Math.round(55 * fusionAndCadenceMult),
    );
    expect(lr!.resourcesGained.scrapAlloy).toBe(
      Math.round(7 * fusionAndCadenceMult),
    );
    expect(lr!.resourcesGained.ironOre).toBe(
      Math.round(5 * fusionAndCadenceMult),
    );
    expect(lr!.rankXpGained).toBe(Math.round(32 * fusionAndCadenceMult));
    expect(lr!.masteryProgressGained).toBe(Math.round(6 * fusionAndCadenceMult));

    expect(lr!.warExchangeSellPressureLines?.length).toBeGreaterThan(0);
    expect(lr!.warExchangeSellPressureLines!.join(" ")).toMatch(
      /scrapAlloy|ironOre/,
    );
    expect(lr!.carryPressureSummary).toMatch(/within citadel haul limits/i);

    expect(state.player.resources.credits).toBe(lr!.resourcesGained.credits);
    expect(state.player.resources.scrapAlloy).toBe(
      2 + (lr!.resourcesGained.scrapAlloy ?? 0),
    );
    expect(state.player.rankXp).toBe(24 + lr!.rankXpGained);
  });
});

describe("M1 expedition contract flow — overloaded extraction gate", () => {
  it("banks partial scrap, records rejection + overload copy, and applies banking strain", () => {
    const used = INVENTORY_CAPACITY_MAX - 5;
    const state: GameState = {
      ...initialGameState,
      player: {
        ...initialGameState.player,
        condition: 100,
        voidInstability: 10,
        resources: {
          ...initialGameState.player.resources,
          ironOre: used,
        },
        fieldLootGainedThisRun: { scrapAlloy: 12 },
      },
    };

    const next = gameReducer(state, {
      type: "COMMIT_VOID_FIELD_EXTRACTION",
      payload: {
        kills: 1,
        zoneName: "Ash Relay",
        zoneId: "ash-relay",
        nowMs: FIXED_NOW_MS,
      },
    });

    const ledger = next.player.lastVoidFieldExtractionLedger;
    expect(ledger).not.toBeNull();
    expect(ledger!.resourcesBanked.scrapAlloy).toBe(5);
    expect(ledger!.resourcesRejected.scrapAlloy).toBe(7);
    expect(ledger!.overloadWhy).toBeTruthy();
    expect(ledger!.overloadWhy).toMatch(/haul limit|Salvage/);

    expect(next.player.resources.ironOre).toBe(used);
    expect(next.player.resources.scrapAlloy).toBe(5);
    expect(next.player.fieldLootGainedThisRun).toEqual({});

    expect(ledger!.pickupStrainFromBanking).toBeGreaterThan(0);
    expect(ledger!.extractionStrainDelta).toBeGreaterThanOrEqual(0);
    expect(next.player.voidInstability).toBeGreaterThanOrEqual(
      state.player.voidInstability,
    );
  });

  it("computeVoidFieldExtractionLedger matches reducer path for carry trim (readable, deterministic)", () => {
    const used = INVENTORY_CAPACITY_MAX - 3;
    const player = {
      ...initialGameState.player,
      condition: 100,
      resources: {
        ...initialGameState.player.resources,
        ironOre: used,
      },
      fieldLootGainedThisRun: { scrapAlloy: 8 },
    };
    const ledger = computeVoidFieldExtractionLedger({
      player,
      kills: 0,
      zoneName: "Test",
      zoneId: "ash-relay",
      nowMs: FIXED_NOW_MS,
    });
    expect(ledger.resourcesBanked.scrapAlloy).toBe(3);
    expect(ledger.resourcesRejected.scrapAlloy).toBe(5);
    expect(ledger.carryAfter.used).toBeLessThanOrEqual(INVENTORY_CAPACITY_MAX);
  });
});

describe("M1 expedition contract flow — partial / pressure settlement (no dupes)", () => {
  it("starving hunger reduces contract payout consistently; ledger stays empty; no duplicate resource inflation", () => {
    const endsAt = 51_000_000;
    const state = baseExpeditionState({
      endsAt,
      player: {
        hunger: 15,
        resources: { ...initialGameState.player.resources },
        fieldLootGainedThisRun: {},
      },
    });

    const settled = gameReducer(state, {
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: endsAt + 1 },
    });

    const lr = settled.player.lastHuntResult;
    expect(lr).not.toBeNull();
    expect(lr!.hungerRewardPenaltyPct).toBe(20);
    expect(lr!.hungerPressureLabel).toBe("Starving");

    const fusionMult = 1.04;
    const hungerMult = 0.8;
    expect(lr!.resourcesGained.credits).toBe(
      Math.round(Math.round(55 * hungerMult) * fusionMult),
    );

    expect(Number.isFinite(settled.player.resources.credits)).toBe(true);
    expect(settled.player.missionQueue).toEqual([]);

    const creditsFromContract = lr!.resourcesGained.credits ?? 0;
    expect(settled.player.resources.credits).toBe(creditsFromContract);
  });

  it("orb ledger + extract + settle does not double-apply field scrap into inventory", () => {
    const endsAt = 52_000_000;
    let state = baseExpeditionState({
      endsAt,
      player: {
        resources: { ...initialGameState.player.resources },
        fieldLootGainedThisRun: { scrapAlloy: 4 },
      },
    });

    state = gameReducer(state, {
      type: "VOID_FIELD_ORB_COLLECTED",
      payload: { key: "scrapAlloy", amount: 2 },
    });
    expect(state.player.fieldLootGainedThisRun.scrapAlloy).toBe(6);

    state = gameReducer(state, {
      type: "COMMIT_VOID_FIELD_EXTRACTION",
      payload: {
        kills: 0,
        zoneName: "Ash Relay",
        zoneId: "ash-relay",
        nowMs: FIXED_NOW_MS,
      },
    });
    expect(state.player.resources.scrapAlloy).toBe(6);

    state = gameReducer(state, {
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: endsAt + 1 },
    });

    const lr = state.player.lastHuntResult!;
    expect(lr.fieldLootGained?.scrapAlloy).toBeUndefined();
    const fusionMult = 1.04;
    const missionScrap = Math.round(7 * fusionMult);
    expect(state.player.resources.scrapAlloy).toBe(6 + missionScrap);
  });
});

describe("M1 expedition contract flow — overloaded contract payout + war exchange readout", () => {
  it("applies overload penalty to mission payout; carry readout is explicit (tracked salvage may be blocked while overloaded)", () => {
    const endsAt = 53_000_000;
    const state = baseExpeditionState({
      endsAt,
      player: {
        hunger: 100,
        resources: {
          ...initialGameState.player.resources,
          ironOre: 121,
        },
        fieldLootGainedThisRun: {},
      },
    });

    const settled = gameReducer(state, {
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: endsAt + 1 },
    });

    const lr = settled.player.lastHuntResult!;
    const fusionMult = 1.04;
    const overloadMult = 0.8;
    expect(lr.resourcesGained.credits).toBe(
      Math.round(Math.round(55 * fusionMult) * overloadMult),
    );

    expect(lr.carryPressureSummary).toBeTruthy();
    expect(lr.carryPressureSummary!.toLowerCase()).toMatch(/overload/);

    expect(lr.resourcesGained.ironOre ?? 0).toBe(0);
    expect(lr.resourcesGained.scrapAlloy ?? 0).toBe(0);
  });

  it("COMMIT_VOID_FIELD_EXTRACTION keeps war broker lines for banked war-lane materials", () => {
    const state: GameState = {
      ...initialGameState,
      player: {
        ...initialGameState.player,
        factionAlignment: "bio",
        condition: 100,
        resources: { ...initialGameState.player.resources },
        fieldLootGainedThisRun: { scrapAlloy: 4 },
      },
    };

    const next = gameReducer(state, {
      type: "COMMIT_VOID_FIELD_EXTRACTION",
      payload: {
        kills: 1,
        zoneName: "Ash Relay",
        zoneId: "ash-relay",
        nowMs: FIXED_NOW_MS,
      },
    });

    const lines = next.player.lastVoidFieldExtractionLedger
      ?.warExchangeSellPressureLines;
    expect(lines?.length).toBeGreaterThan(0);
    expect(lines!.join(" ")).toMatch(/scrapAlloy/);
  });
});
