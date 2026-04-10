import { DEFAULT_CHARACTER_PORTRAIT_ID } from "@/features/characters/characterPortraits";
import { buildNavigationState } from "@/features/navigation/navigationUtils";
import type { GameState } from "@/features/game/gameTypes";
import { createInitialRuneMastery } from "@/features/mastery/runeMasteryLogic";
import { initialZoneDoctrineRecord } from "@/features/factions/factionWorldLogic";
import { initialMythicAscension } from "@/features/progression/mythicAscensionLogic";
import { initialGuildRoster } from "@/features/social/guildLiveLogic";
import { createInitialLoadoutSlots } from "@/features/player/loadoutState";
import { createInitialMarketState } from "@/features/market/marketActions";

export const initialGameState: GameState = {
  player: {
    playerName: "",
    characterCreated: false,
    factionAlignment: "unbound",
    affinitySchoolId: null,
    characterPortraitId: DEFAULT_CHARACTER_PORTRAIT_ID,
    careerFocus: null,
    fieldLoadoutProfile: "assault",
    loadoutSlots: createInitialLoadoutSlots(),

    condition: 100,
    hunger: 100,
    conditionRecoveryAvailableAt: 0,
    emergencyRationAvailableAt: 0,
    lastConditionTickAt: Date.now(),
    activeFeastHallOfferId: null,
    nextRunModifiers: null,
    nextRunModifiersAppliedForProcessId: null,
    expeditionReadyStabilityPending: false,

    rank: "Unmarked",
    rankLevel: 1,
    rankXp: 0,
    rankXpToNext: 100,

    masteryProgress: 0,
    influence: 0,
    hasBiotechSpecimenLead: false,
    voidInstability: 0,
    mana: 50,
    manaMax: 50,
    runInstability: 0,
    runInstabilityLog: [],
    runHeatPushBoost: null,
    instabilityStreakTurns: 0,
    runArchetype: "balanced",
    runStyleRiSamples: [],
    runStyleVentCount: 0,
    runStylePushCount: 0,

    resources: {
      credits: 0,
      ironOre: 0,
      scrapAlloy: 0,
      runeDust: 0,
      emberCore: 0,
      bioSamples: 0,
      mossRations: 0,
      coilboundLattice: 0,
      ashSynodRelic: 0,
      vaultLatticeShard: 0,
      ironHeart: 0,
    },
    fieldLootGainedThisRun: {},
    expeditionContractSnapshots: {},
    lastVoidFieldExtractionLedger: null,
    market: createInitialMarketState(),
    craftedInventory: {},
    craftWorkOrder: null,

    lastStallRentResolvedAt: Date.now(),
    stallArrearsCount: 0,

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

    voidRealtimeBinding: null,

    behaviorStats: {
      totalRealtimeHuntsWithContribution: 0,
      roleCounts: {
        Executioner: 0,
        Artillery: 0,
        "Pressure Specialist": 0,
        Spotter: 0,
      },
      lastRealtimeRole: null,
    },

    zoneMastery: {
      "howling-scar": 0,
      "ash-relay": 0,
      "echo-ruins": 0,
      "rift-maw": 0,
    },

    lastCompletedZoneId: null,
    zoneRunStreak: 0,
    missionQueue: [],
    activeRuns: [],
    maxMissionQueueSlots: 3,

    runeMastery: createInitialRuneMastery(),

    zoneDoctrinePressure: initialZoneDoctrineRecord(),
    guildContributionTotal: 0,
    guildContributionLog: [],
    guild: initialGuildRoster(),
    guildContracts: [],
    lastFactionHqStipendAt: 0,

    mythicAscension: initialMythicAscension(),
    lastCraftOutcome: null,
    lastRuneInstallOutcome: null,
    lastMythicGateBreakthrough: null,

    crossSchoolExposure: {
      offPathMaterialsEncountered: 0,
      mismatchEncountered: false,
      schoolsExposed: { bio: false, mecha: false, pure: false },
      anomalyScore: 0,
    },
    lastAnomalyToast: null,
    brokerCooldowns: {},
    pantheonBlessingPending: false,
  },

  missions: [
    {
      id: "voidfield-prowl",
      category: "operation",
      title: "Prowl the Voidfield Perimeter",
      description:
        "A short-range scavenge beyond the citadel wall. Whatever the last patrol left behind is yours — if something else hasn't claimed it first.",
      rumorFlavor:
        "Stall 4 says the last sweep team came back light. Either the field is dry or something ate the good stuff before they got there. — Lower Ring board",
      path: "neutral",
      originTag: "black-market-local",
      canonBook: "book-1",
      durationHours: 0.0125,
      reward: {
        rankXp: 30,
        masteryProgress: 6,
        conditionDelta: -7,
        influence: 1,
        resources: {
          credits: 55,
          bioSamples: 2,
          runeDust: 3,
        },
      },
    },
    {
      id: "outer-wastes-scavenge",
      category: "operation",
      title: "Strip the Outer Wastes",
      description:
        "Broken trade routes and collapsed outskirts. Credits wash out of the rubble if you know where to dig. The Mandate left precision parts in the wreckage.",
      rumorFlavor:
        "A Mandate salvage team never came back for their shipment. Their loss. Stall 12 is paying for alloy fragments, no questions. — Mercenary Guild board",
      path: "neutral",
      originTag: "mandate-salvage",
      canonBook: "book-1",
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
      title: "Track a Bonehowl Specimen",
      description:
        "A wounded beast escaped from a Bonehowl hunting party. Smells like cold iron and wet fur. Your blood already wants what it's carrying.",
      rumorFlavor:
        "A Bonehowl deserter says there's a wounded Fenrir pup in the lower tunnels. Could be bait. Could be blood worth more than you've ever held. The broker wants proof before paying. — Stall 7, Lower Ring",
      path: "bio",
      originTag: "bonehowl-remnant",
      canonBook: "book-1",
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
      title: "Recover Pharos Surplus",
      description:
        "A wrecked convoy from Ra's divine factories. Every component works perfectly. None of them feel alive. Strip what you can carry.",
      rumorFlavor:
        "A Pharos shipment got hit between checkpoints. The cargo is pristine — sun-forged alloy, divine-grade servomotors, the works. The Synod won't miss it if you're fast. — Chrome Synod defector, Mecha Foundry",
      path: "mecha",
      originTag: "pharos-surplus",
      canonBook: "book-1",
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
      id: "pure-ember-trial",
      category: "operation",
      title: "Recover a Mouth of Inti Relic",
      description:
        "A fire-touched artifact surfaced in the lower market. It whispers when you hold it. The Ember Vault wants it back — but the broker wants payment first.",
      rumorFlavor:
        "A relic dealer in the Ember Vault says she found something that remembers. Soul shards don't store spells — they store the memory of when reality once listened. She wants rune dust as payment, not credits. — Ember Vault, candle row",
      path: "pure",
      originTag: "mouth-of-inti-relic",
      canonBook: "book-1",
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
        "Mandate-bred scavengers have infested the Ash Relay trenchline. They strip alloy and ore from every wreck. Kill them and take what they've hoarded.",
      rumorFlavor:
        "The Rustfangs are back in the relay. Mandate engineering in a feral shell — their jaws strip alloy cleaner than any tool in the district. The bounty is for proof of kill and whatever ore they've swallowed. — Mercenary Guild, hunt board",
      path: "neutral",
      originTag: "mandate-salvage",
      canonBook: "book-1",
      deployZoneId: "ash-relay",
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
      title: "Sweep the Bonehowl Growth Pits",
      description:
        "The Howling Scar breeds things that shouldn't survive. Tissue, saleable residue, viable samples — the Coil's castoffs are worth more than they think.",
      rumorFlavor:
        "An Olympus tissue broker needs fresh samples from the growth pits. She's paying above rate because the last team came back with... changes. Bring containment gear. — Biotech Labs contact, lower market",
      path: "neutral",
      originTag: "olympus-castoff",
      canonBook: "book-1",
      deployZoneId: "howling-scar",
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
      title: "Flush a Rift Maw Burrower",
      description:
        "Something in the Rift Maw has been eating Thousand Hands relics and Pharos components alike. It burrows through machine nests and leaves behind fragments worth more than the bounty.",
      rumorFlavor:
        "The burrower in the Rift Maw swallowed something from a Thousand Hands shipment. The Golden Bazaar wants it back — they're paying in alloy and ore, plus bounty credit for the kill. Don't let it dig deeper. — Golden Bazaar, stall 19",
      path: "neutral",
      originTag: "thousand-hands-fragment",
      canonBook: "book-1",
      deployZoneId: "rift-maw",
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
