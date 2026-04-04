import type {
  FactionAlignment,
  MissionReward,
  PathType,
  PlayerState,
} from "@/features/game/gameTypes";

function clampValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Phase 3 — path-shaped growth: aligned school contracts grant more mastery progress. */
export const PATH_ALIGNED_MASTERY_MULTIPLIER = 1.15;

export function applyPathAlignedMasteryBonus(
  reward: MissionReward,
  missionPath: PathType | "neutral",
  factionAlignment: FactionAlignment,
): MissionReward {
  if (missionPath === "neutral" || missionPath !== factionAlignment) {
    return reward;
  }
  return {
    ...reward,
    masteryProgress: Math.max(
      0,
      Math.round(reward.masteryProgress * PATH_ALIGNED_MASTERY_MULTIPLIER),
    ),
  };
}

/** Extra condition loss on contracts when the body is accumulating Void strain. */
export function getVoidInstabilityExtraConditionDrain(voidInstability: number): number {
  if (voidInstability < 35) return 0;
  if (voidInstability < 60) return 1;
  if (voidInstability < 80) return 2;
  return 3;
}

/**
 * Strain rises after dangerous work: low condition after resolve, heavy wear, and
 * running off-path contracts while aligned.
 */
export function computeVoidInstabilityGain(params: {
  conditionAfter: number;
  resolvedConditionDelta: number;
  missionPath: PathType | "neutral";
  factionAlignment: FactionAlignment;
}): number {
  const strain = Math.max(0, 100 - params.conditionAfter);
  const wound = Math.max(0, -params.resolvedConditionDelta);
  let gain =
    2 +
    Math.round(strain * 0.07) +
    Math.round(wound * 0.12);

  if (
    params.missionPath !== "neutral" &&
    params.missionPath !== params.factionAlignment
  ) {
    gain += 4;
  }

  return Math.max(0, Math.min(18, gain));
}

/**
 * Strain from a void field extraction (shell drill): kills, wear, and cargo carried out.
 * No gain for empty extracts (no kills and no loot).
 */
export function computeVoidStrainFromVoidFieldExtraction(params: {
  kills: number;
  conditionAfter: number;
  conditionDelta: number;
  lootUnits: number;
}): number {
  const kills = Math.max(0, Math.floor(params.kills));
  const lootUnits = Math.max(0, Math.floor(params.lootUnits));
  if (kills <= 0 && lootUnits <= 0) {
    return 0;
  }

  const strain = Math.max(0, 100 - params.conditionAfter);
  const wound = Math.max(0, -params.conditionDelta);

  const gain =
    (kills > 0 ? 2 : 0) +
    Math.round(strain * 0.05) +
    Math.round(wound * 0.1) +
    Math.min(5, Math.floor(kills / 2)) +
    Math.min(3, Math.floor(lootUnits / 12));

  return Math.max(0, Math.min(16, gain));
}

/** Discrete hunt/broker field loot events (non-extraction). Capped per pickup. */
export function computeVoidStrainFromFieldLootPickup(amount: number): number {
  if (amount <= 0) return 0;
  return Math.min(2, Math.max(1, Math.ceil(amount / 6)));
}

export function withVoidInstabilityDelta(
  player: PlayerState,
  delta: number,
): PlayerState {
  return {
    ...player,
    voidInstability: clampValue(player.voidInstability + delta, 0, 100),
  };
}

/** Slow bleed-down while the operative is genuinely stable (rest + fed). */
export function decayVoidInstabilityOnSurvivalTick(
  player: PlayerState,
  ticks: number,
): number {
  if (ticks <= 0) return player.voidInstability;
  if (player.condition < 72 || player.hunger < 45) {
    return player.voidInstability;
  }
  const decay = Math.floor(ticks * 0.35);
  return Math.max(0, player.voidInstability - decay);
}

/**
 * Credits charged when starting a field sweep while instability is elevated
 * (broker tithe / stabilization prep). Scales softly; caps to stay M1-fair.
 */
export function getExplorationInstabilitySurchargeCredits(
  voidInstability: number,
): number {
  if (voidInstability < 48) return 0;
  return Math.min(75, 8 + Math.round((voidInstability - 48) * 1.1));
}

export function getVoidInstabilityTierLabel(voidInstability: number): {
  label: string;
  hint: string;
} {
  if (voidInstability < 20) {
    return {
      label: "Quiet",
      hint: "Void infusion is quiet — no meaningful resonance scarring this cycle.",
    };
  }
  if (voidInstability < 45) {
    return {
      label: "Stirring",
      hint: "Infusion is stirring. Watch condition on the next contract.",
    };
  }
  if (voidInstability < 70) {
    return {
      label: "Pressing",
      hint: "Infusion is pressing — extra wear when contracts resolve.",
    };
  }
  return {
    label: "Severe",
    hint: "Deep infusion: contracts bite harder until you stabilize, eat, and recover.",
  };
}
