/** Query param + stakes for `/arena/match`. */
export type ArenaMatchModeId = "ranked" | "practice" | "tournament";

export type ArenaScaledRewards = {
  credits: number;
  rankXp: number;
  influence: number;
  scrapAlloy: number;
  runeDust: number;
  bioSamples: number;
  emberCore: number;
};

/** Practice lane — mirror ranked material mix at reduced rate. */
export const ARENA_PRACTICE_REWARD_MULT = 0.35;

export function parseArenaMatchModeParam(raw: string | null): ArenaMatchModeId {
  if (raw === "ranked" || raw === "practice" || raw === "tournament") {
    return raw;
  }
  return "practice";
}

export function scaleArenaRewardsForMode(
  base: ArenaScaledRewards,
  mode: ArenaMatchModeId,
): ArenaScaledRewards {
  if (mode !== "practice") return base;
  const m = ARENA_PRACTICE_REWARD_MULT;
  return {
    credits: Math.floor(base.credits * m),
    rankXp: Math.floor(base.rankXp * m),
    influence: Math.max(0, Math.floor(base.influence * m)),
    scrapAlloy: Math.floor(base.scrapAlloy * m),
    runeDust: Math.floor(base.runeDust * m),
    bioSamples: Math.floor(base.bioSamples * m),
    emberCore: Math.floor(base.emberCore * m),
  };
}

export function arenaModeAppliesRankedStakes(mode: ArenaMatchModeId): boolean {
  return mode === "ranked" || mode === "tournament";
}
