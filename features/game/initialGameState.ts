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
    activeProvision: null,

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
      category: "operation",
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
      category: "operation",
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
      category: "operation",
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
      category: "operation",
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
    {
      id: "hg-rustfang-prowl",
      category: "hunting-ground",
      title: "Cull a Rustfang Pack",
      description:
        "Deploy a guild hunting team into the outer trenchline to bring back alloy scrap, credits, and stripped ore.",
      path: "neutral",
      durationHours: 0.0042,
      reward: {
        rankXp: 32,
        masteryProgress: 6,
        conditionDelta: -7,
        influence: 1,
        resources: {
          credits: 55,
          ironOre: 5,
          scrapAlloy: 7,
        },
      },
    },
    {
      id: "hg-bio-snag-run",
      category: "hunting-ground",
      title: "Run a Bio Sample Sweep",
      description:
        "Send a containment squad through the growth pits to recover raw tissue, saleable residue, and viable biotech samples.",
      path: "neutral",
      durationHours: 0.0056,
      reward: {
        rankXp: 38,
        masteryProgress: 7,
        conditionDelta: -9,
        influence: 2,
        resources: {
          credits: 65,
          bioSamples: 4,
          ironOre: 2,
        },
      },
    },
    {
      id: "hg-scrapyard-burrower",
      category: "hunting-ground",
      title: "Flush a Scrapyard Burrower",
      description:
        "Track a burrowing scavenger through ruined machine nests and return with alloy fragments, ore, and bounty credit.",
      path: "neutral",
      durationHours: 0.007,
      reward: {
        rankXp: 46,
        masteryProgress: 9,
        conditionDelta: -11,
        influence: 2,
        resources: {
          credits: 85,
          scrapAlloy: 10,
          ironOre: 6,
          bioSamples: 2,
        },
      },
    },
  ],
};
