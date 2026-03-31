import { initialGameState } from "@/features/game/initialGameState";
import type {
  CareerFocus,
  FactionAlignment,
  PathType,
  PlayerState,
  ResourcesState,
} from "@/features/game/gameTypes";
import { createInitialLoadoutSlots } from "@/features/player/loadoutState";
import { createInitialMarketState } from "@/features/market/marketActions";

function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 18);
}

/** One-line summaries for New Game UI (must match `SCHOOL_STARTER_RESOURCES`). */
export const SCHOOL_STARTER_PACK_SUMMARY: Record<PathType, string> = {
  bio: "500 credits · 15 iron ore · 10 scrap alloy · 20 bio samples · 5 rune dust · 3 moss rations",
  mecha:
    "500 credits · 30 iron ore · 25 scrap alloy · 5 bio samples · 5 rune dust · 2 moss rations",
  pure:
    "500 credits · 10 iron ore · 8 scrap alloy · 5 bio samples · 20 rune dust · 3 ember cores · 2 moss rations",
};

const SCHOOL_STARTER_RESOURCES: Record<PathType, Partial<ResourcesState>> = {
  bio: {
    credits: 500,
    ironOre: 15,
    scrapAlloy: 10,
    bioSamples: 20,
    runeDust: 5,
    mossRations: 3,
  },
  mecha: {
    credits: 500,
    ironOre: 30,
    scrapAlloy: 25,
    bioSamples: 5,
    runeDust: 5,
    mossRations: 2,
  },
  pure: {
    credits: 500,
    ironOre: 10,
    scrapAlloy: 8,
    bioSamples: 5,
    runeDust: 20,
    emberCore: 3,
    mossRations: 2,
  },
};

export function createNewPlayer(params: {
  name: string;
  school: PathType;
  career: CareerFocus;
}): PlayerState {
  const now = Date.now();
  const name = normalizeName(params.name);
  const school: FactionAlignment = params.school;

  const schoolResources = SCHOOL_STARTER_RESOURCES[params.school];

  return {
    ...initialGameState.player,
    characterCreated: true,
    playerName: name.length >= 2 ? name : "Puppy",
    factionAlignment: school,
    careerFocus: params.career,

    rank: "Puppy",
    rankLevel: 1,
    rankXp: 0,
    rankXpToNext: 100,

    condition: 100,
    hunger: 100,
    conditionRecoveryAvailableAt: 0,
    lastConditionTickAt: now,
    activeFeastHallOfferId: null,

    resources: {
      ...initialGameState.player.resources,
      ...schoolResources,
    },

    fieldLootGainedThisRun: {},
    activeProcess: null,
    lastHuntResult: null,
    missionQueue: [],

    loadoutSlots: createInitialLoadoutSlots(),
    market: createInitialMarketState(),
    lastStallRentResolvedAt: now,
    stallArrearsCount: 0,
  };
}
