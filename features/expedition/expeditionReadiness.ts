import type { MissionReward, PlayerState } from "@/features/game/gameTypes";
import { getActivePrepSurface } from "@/features/crafting/prepRunHooks";
import { getHungerPressureEffects } from "@/features/status/survival";
import { voidZoneById, type VoidZoneId } from "@/features/void-maps/zoneData";
import { getZoneDoctrineWarPack } from "@/features/world/zoneDoctrineWarEffects";
import { appendRunInstabilityLog } from "@/features/progression/runInstability";
import { LOADOUT_SLOT_ORDER } from "@/features/player/loadoutState";

export type ExpeditionReadinessBand = "ready" | "strained" | "risky" | "reckless";

export type ExpeditionReadiness = {
  readinessScore: number;
  readinessBand: ExpeditionReadinessBand;
  primaryWarning: string | null;
  suggestedFix: string | null;
};

/** Small cushion on first hunt closeout after a "ready" deploy (condition delta, not a new currency). */
export const EXPEDITION_READY_STABILITY_DELTA = 3;

function heatPoints(ri: number): number {
  if (ri <= 15) return 25;
  if (ri <= 35) return 20;
  if (ri <= 55) return 14;
  if (ri <= 75) return 8;
  return 3;
}

function conditionPoints(condition: number, recommended: number): number {
  const d = condition - recommended;
  if (d >= 10) return 25;
  if (d >= 0) return 20;
  if (d >= -12) return 12;
  if (d >= -22) return 7;
  return 3;
}

function hungerPoints(hunger: number): number {
  const t = getHungerPressureEffects(hunger).tier;
  if (t === "fed") return 15;
  if (t === "low") return 9;
  return 2;
}

function prepPoints(player: PlayerState): number {
  return getActivePrepSurface(player).state === "primed" ? 15 : 4;
}

function loadoutPoints(slots: PlayerState["loadoutSlots"]): number {
  let n = 0;
  for (const id of LOADOUT_SLOT_ORDER) {
    if (slots[id]) n += 1;
  }
  if (!slots.weapon) return Math.min(6, n * 2);
  return 10 + Math.min(5, Math.max(0, n - 1) * 2);
}

function warPoints(player: PlayerState, zoneId: VoidZoneId): number {
  const p = player.zoneDoctrinePressure[zoneId];
  if (!p) return 4;
  const pack = getZoneDoctrineWarPack(zoneId, p, player.factionAlignment);
  const m = pack.payoutMult;
  if (m >= 1.02) return 5;
  if (m >= 0.99) return 4;
  if (m >= 0.92) return 2;
  return 1;
}

function bandFromScore(score: number): ExpeditionReadinessBand {
  if (score >= 78) return "ready";
  if (score >= 60) return "strained";
  if (score >= 42) return "risky";
  return "reckless";
}

/**
 * Pre-deploy evaluation: run heat, survival pressure, prep kit, loadout, zone doctrine payout tilt.
 * Does not block deploy — surfaces risk + one fix line (Darkest Dungeon-style tension, M1 scope).
 */
export function evaluateExpeditionReadiness(
  player: PlayerState,
  zoneId: VoidZoneId,
): ExpeditionReadiness {
  const ri = Math.max(0, Math.min(100, Math.round(player.runInstability ?? 0)));
  const zone = voidZoneById[zoneId];
  const rec = zone.recommendedCondition;
  const cond = player.condition;
  const hunger = player.hunger;

  const score = Math.min(
    100,
    Math.round(
      heatPoints(ri) +
        conditionPoints(cond, rec) +
        hungerPoints(hunger) +
        prepPoints(player) +
        loadoutPoints(player.loadoutSlots) +
        warPoints(player, zoneId),
    ),
  );

  const band = bandFromScore(score);

  let primaryWarning: string | null = null;
  let suggestedFix: string | null = null;

  if (ri >= 70) {
    primaryWarning = `Run heat ${ri}% — backlash and meltdown math are hungry.`;
    suggestedFix = "Hub return clears heat, or vent before you queue another strip.";
  } else if (getHungerPressureEffects(hunger).tier === "starving") {
    primaryWarning = "Starvation pressure — payouts and condition math bite harder.";
    suggestedFix = "Feast Hall, rations, or a short hub meal before you commit.";
  } else if (cond < rec - 15) {
    primaryWarning = `Condition ${cond}% sits well below this realm's ${rec}% recommendation.`;
    suggestedFix = "Recover on Status, craft an extract balm, or pick a softer zone.";
  } else if (!player.loadoutSlots.weapon) {
    primaryWarning = "No weapon equipped — shell strike range and damage stay crippled.";
    suggestedFix = "Open Loadout and slot at least a weapon before the drop.";
  } else if (getActivePrepSurface(player).state !== "primed" && ri >= 35) {
    primaryWarning = "No primed prep kit — heat and wear will bite on closeout.";
    suggestedFix = "Craft a district kit (heat trim, salvage rig, or extract balm).";
  } else {
    const p = player.zoneDoctrinePressure[zoneId];
    if (p) {
      const pack = getZoneDoctrineWarPack(zoneId, p, player.factionAlignment);
      if (pack.payoutMult < 0.99) {
        primaryWarning =
          "Doctrine war leans against this lane — leaner payouts and extra void strain.";
        suggestedFix =
          "Check War Exchange for broker posture, or push a guild theatre contract.";
      }
    }
  }

  return {
    readinessScore: score,
    readinessBand: band,
    primaryWarning,
    suggestedFix,
  };
}

export function formatExpeditionReadinessBand(band: ExpeditionReadinessBand): string {
  switch (band) {
    case "ready":
      return "Ready";
    case "strained":
      return "Strained";
    case "risky":
      return "Risky";
    case "reckless":
      return "Reckless";
  }
}

/**
 * First hunting-ground settlement after a "ready" deploy: shave a few points of wear (client-only).
 */
export function maybeApplyExpeditionReadyStabilityToReward(
  player: PlayerState,
  reward: MissionReward,
  isHuntingGround: boolean,
): { player: PlayerState; reward: MissionReward } {
  if (!isHuntingGround || !player.expeditionReadyStabilityPending) {
    return { player, reward };
  }
  return {
    player: {
      ...player,
      expeditionReadyStabilityPending: false,
      runInstabilityLog: appendRunInstabilityLog(
        player.runInstabilityLog,
        `Expedition readiness held — first closeout sheds ${EXPEDITION_READY_STABILITY_DELTA} less wear.`,
      ),
    },
    reward: {
      ...reward,
      conditionDelta: reward.conditionDelta + EXPEDITION_READY_STABILITY_DELTA,
    },
  };
}
