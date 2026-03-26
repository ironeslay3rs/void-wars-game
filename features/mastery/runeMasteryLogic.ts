import type { FactionAlignment, PlayerState } from "@/features/game/gameTypes";
import {
  RUNE_SCHOOLS,
  type PlayerRuneMasteryState,
  type RuneCapacityPool,
  type RuneCapacityState,
  type RuneSchool,
  getPrimaryRuneSchool,
  schoolToCapacityPool,
} from "@/features/mastery/runeMasteryTypes";

export const MAX_MINORS_PER_SCHOOL = 6;
export const RUNE_DEPTH_MAX = 7;
export const HYBRID_CAP_SHRINK_PER_STACK = 2;
export const MIN_EFFECTIVE_CAP = 3;

const BASE_CAP: RuneCapacityState = {
  blood: 10,
  frame: 10,
  resonance: 10,
};

export function createInitialRuneMastery(): PlayerRuneMasteryState {
  const baseDepth: Record<RuneSchool, number> = {
    bio: 1,
    mecha: 1,
    pure: 1,
  };
  const zeroMinors: Record<RuneSchool, number> = {
    bio: 0,
    mecha: 0,
    pure: 0,
  };
  return {
    depthBySchool: { ...baseDepth },
    minorCountBySchool: { ...zeroMinors },
    capacity: { ...BASE_CAP },
    capacityMax: { ...BASE_CAP },
    hybridDrainStacks: 0,
  };
}

export function getEffectiveCapacityMax(
  mastery: PlayerRuneMasteryState,
): RuneCapacityState {
  const shrink =
    mastery.hybridDrainStacks * HYBRID_CAP_SHRINK_PER_STACK;
  return {
    blood: Math.max(MIN_EFFECTIVE_CAP, mastery.capacityMax.blood - shrink),
    frame: Math.max(MIN_EFFECTIVE_CAP, mastery.capacityMax.frame - shrink),
    resonance: Math.max(
      MIN_EFFECTIVE_CAP,
      mastery.capacityMax.resonance - shrink,
    ),
  };
}

/**
 * Executional tier by minor count: 0 none, 1 = L2 (3–4 minors), 2 = L3 (5–6 minors).
 * Drives aligned-zone yield and optional deploy gates.
 */
export function getExecutionalTier(
  mastery: PlayerRuneMasteryState,
  school: RuneSchool,
): 0 | 1 | 2 {
  const n = mastery.minorCountBySchool[school];
  if (n >= 5) return 2;
  if (n >= 3) return 1;
  return 0;
}

/** True when three or more minors of the same school are installed (Executional set, L2). */
export function hasExecutionalSet(
  mastery: PlayerRuneMasteryState,
  school: RuneSchool,
): boolean {
  return getExecutionalTier(mastery, school) >= 1;
}

export function maxRuneDepthAcrossSchools(
  mastery: PlayerRuneMasteryState,
): number {
  return Math.max(
    mastery.depthBySchool.bio,
    mastery.depthBySchool.mecha,
    mastery.depthBySchool.pure,
  );
}

function clampCapacityToEffectiveMax(mastery: PlayerRuneMasteryState) {
  const eff = getEffectiveCapacityMax(mastery);
  const next = { ...mastery.capacity };
  (Object.keys(next) as RuneCapacityPool[]).forEach((k) => {
    next[k] = Math.min(next[k], eff[k]);
  });
  return next;
}

export function computeInstallCost(params: {
  alignment: FactionAlignment;
  school: RuneSchool;
}): RuneCapacityState {
  const primary = getPrimaryRuneSchool(params.alignment);
  const pool = schoolToCapacityPool(params.school);
  const cost: RuneCapacityState = { blood: 0, frame: 0, resonance: 0 };

  const isDabble = primary !== null && params.school !== primary;

  cost[pool] += isDabble ? 3 : 2;
  if (isDabble) {
    (Object.keys(cost) as RuneCapacityPool[]).forEach((k) => {
      if (k !== pool) cost[k] += 1;
    });
  }

  return cost;
}

export function canAffordCapacityCost(
  capacity: RuneCapacityState,
  cost: RuneCapacityState,
): boolean {
  return (
    capacity.blood >= cost.blood &&
    capacity.frame >= cost.frame &&
    capacity.resonance >= cost.resonance
  );
}

function spendCapacity(
  capacity: RuneCapacityState,
  cost: RuneCapacityState,
): RuneCapacityState {
  return {
    blood: capacity.blood - cost.blood,
    frame: capacity.frame - cost.frame,
    resonance: capacity.resonance - cost.resonance,
  };
}

export type InstallMinorRuneResult =
  | { ok: true; player: PlayerState }
  | { ok: false; reason: string };

export function tryInstallMinorRune(
  player: PlayerState,
  school: RuneSchool,
): InstallMinorRuneResult {
  if (player.runeMastery.minorCountBySchool[school] >= MAX_MINORS_PER_SCHOOL) {
    return { ok: false, reason: "School minor cap reached for this path." };
  }

  const cost = computeInstallCost({
    alignment: player.factionAlignment,
    school,
  });

  const mastery = player.runeMastery;

  if (!canAffordCapacityCost(mastery.capacity, cost)) {
    return {
      ok: false,
      reason: "Not enough Blood / Frame / Resonance capacity for this install.",
    };
  }

  const primary = getPrimaryRuneSchool(player.factionAlignment);
  const isHybrid =
    primary !== null && school !== primary ? true : false;

  const nextMinors = {
    ...mastery.minorCountBySchool,
    [school]: mastery.minorCountBySchool[school] + 1,
  };

  const nextDepthVal = Math.min(
    RUNE_DEPTH_MAX,
    1 + nextMinors[school],
  );

  let hybridDrainStacks = mastery.hybridDrainStacks;
  if (isHybrid) hybridDrainStacks += 1;

  let nextMastery: PlayerRuneMasteryState = {
    ...mastery,
    minorCountBySchool: nextMinors,
    depthBySchool: {
      ...mastery.depthBySchool,
      [school]: nextDepthVal,
    },
    capacity: spendCapacity(mastery.capacity, cost),
    hybridDrainStacks,
  };

  nextMastery = {
    ...nextMastery,
    capacity: clampCapacityToEffectiveMax(nextMastery),
  };

  return {
    ok: true,
    player: {
      ...player,
      runeMastery: nextMastery,
    },
  };
}

/** Sync depths from minor counts (repair saves after rule tweaks). */
export function normalizeRuneDepthFromMinors(
  mastery: PlayerRuneMasteryState,
): PlayerRuneMasteryState {
  const depthBySchool = { ...mastery.depthBySchool };
  for (const s of RUNE_SCHOOLS) {
    depthBySchool[s] = Math.min(
      RUNE_DEPTH_MAX,
      Math.max(1, 1 + mastery.minorCountBySchool[s]),
    );
  }
  return {
    ...mastery,
    depthBySchool,
    capacity: clampCapacityToEffectiveMax(mastery),
  };
}
