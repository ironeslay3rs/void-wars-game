import { buildNavigationState } from "@/features/navigation/navigationUtils";
import type { GameState } from "@/features/game/gameTypes";

export const initialGameState: GameState = {
  player: {
    playerName: "Iron",
    factionAlignment: "unbound",

    condition: 100,
    conditionRecoveryAvailableAt: 0,
    lastConditionTickAt: Date.now(),

    rank: "Initiate",
    rankLevel: 1,
    rankXp: 0,
    rankXpToNext: 100,

    masteryProgress: 0,
    influence: 0,
    hasBiotechSpecimenLead: false,

    resources: {
      credits: 250,
      ironOre: 20,
      scrapAlloy: 15,
      runeDust: 10,
      emberCore: 2,
      bioSamples: 0,
    },

    knownRecipes: [],
    unlockedRoutes: ["home", "bazaar"],
    navigation: buildNavigationState(1, ["home", "bazaar"], "home"),

    districtState: {
      forgeStatus: "idle",
      arenaStatus: "open",
      mechaStatus: "stable",
      mutationState: "dormant",
      attunementState: "unbound",
      gateStatus: "sealed",
    },

    activeProcess: null,
    lastHuntResult: null,
    missionQueue: [],
    maxMissionQueueSlots: 3,
  },

  missions: [
    {
      id: "outer-wastes-scavenge",
      title: "Scavenge the Outer Wastes",
      description:
        "Search broken trade routes and ruined outskirts for salvage, loose credits, and old alloy fragments.",
      path: "neutral",
      durationHours: 0.0028,
      reward: {
        rankXp: 25,
        masteryProgress: 5,
        conditionDelta: -8,
        influence: 1,
        resources: {
          credits: 60,
          scrapAlloy: 8,
          ironOre: 4,
        },
      },
    },
    {
      id: "bio-hunt-specimen",
      title: "Track a Mutant Specimen",
      description:
        "Hunt an unstable creature beyond the district wall and recover viable tissue samples.",
      path: "bio",
      durationHours: 0.0042,
      reward: {
        rankXp: 40,
        masteryProgress: 8,
        conditionDelta: -12,
        influence: 2,
        resources: {
          credits: 70,
          bioSamples: 5,
          ironOre: 3,
        },
      },
    },
    {
      id: "mecha-salvage-convoy",
      title: "Recover Synod Salvage",
      description:
        "Strip usable parts from a ruined convoy and return with alloys, cores, and market-grade scrap.",
      path: "mecha",
      durationHours: 0.0042,
      reward: {
        rankXp: 40,
        masteryProgress: 8,
        conditionDelta: -10,
        influence: 2,
        resources: {
          credits: 80,
          scrapAlloy: 12,
          emberCore: 1,
        },
      },
    },
    {
      id: "spirit-ember-trial",
      title: "Complete an Ember Trial",
      description:
        "Enter a guided memory rite to sharpen attunement and gather refined rune residue.",
      path: "spirit",
      durationHours: 0.0028,
      reward: {
        rankXp: 38,
        masteryProgress: 10,
        conditionDelta: -6,
        influence: 2,
        resources: {
          credits: 50,
          runeDust: 6,
          emberCore: 1,
        },
      },
    },
  ],
};
