import { initialGameState } from "@/features/game/initialGameState";
import type {
  CareerFocus,
  FactionAlignment,
  PathType,
  PlayerState,
} from "@/features/game/gameTypes";
import { createInitialLoadoutSlots } from "@/features/player/loadoutState";
import { createInitialMarketState } from "@/features/market/marketActions";

function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 18);
}

export function createNewPlayer(params: {
  name: string;
  school: PathType;
  career: CareerFocus;
}): PlayerState {
  const now = Date.now();
  const name = normalizeName(params.name);
  const school: FactionAlignment = params.school;

  return {
    ...initialGameState.player,
    playerName: name.length >= 2 ? name : "Puppy",
    factionAlignment: school,
    careerFocus: params.career,

    // Hour 0–3: puppy state (unmarked).
    rank: "Puppy",
    rankLevel: 0,
    rankXp: 0,
    rankXpToNext: 100,

    // Reset survival to a clean start.
    condition: 100,
    hunger: 100,
    conditionRecoveryAvailableAt: 0,
    lastConditionTickAt: now,
    activeFeastHallOfferId: null,

    // Starter economy pack.
    resources: {
      ...initialGameState.player.resources,
      credits: 500,
      ironOre: 20,
      bioSamples: 10,
      mossRations: 2,
    },

    // Fresh per-run/operational state.
    fieldLootGainedThisRun: {},
    activeProcess: null,
    lastHuntResult: null,
    missionQueue: [],

    // New loadout + market are always clean.
    loadoutSlots: createInitialLoadoutSlots(),
    market: createInitialMarketState(),
  };
}

