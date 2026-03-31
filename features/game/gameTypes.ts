import type { CharacterPortraitId } from "@/features/characters/characterPortraits";
import type {
  NavigationState,
  RouteNodeId,
} from "@/features/navigation/navigationTypes";
import type { PlayerRuneMasteryState } from "@/features/mastery/runeMasteryTypes";
import type { VoidMarketCommodity } from "@/features/bazaar/voidMarketTypes";
import type {
  DoctrinePressure,
  GuildContributionLogEntry,
} from "@/features/factions/factionWorldTypes";
import type { VoidZoneId } from "@/features/void-maps/zoneData";
import type { MythicAscensionState } from "@/features/progression/mythicAscensionTypes";
import type {
  GuildRosterState,
  SharedGuildContract,
} from "@/features/social/guildLiveTypes";

export type FactionAlignment = "unbound" | "bio" | "mecha" | "pure";
export type PathType = Exclude<FactionAlignment, "unbound">;

export type RealtimeFieldRole = "Executioner" | "Artillery" | "Pressure Specialist" | "Spotter";

export type PlayerBehaviorStats = {
  totalRealtimeHuntsWithContribution: number;
  roleCounts: Record<RealtimeFieldRole, number>;
  lastRealtimeRole: RealtimeFieldRole | null;
};

/* =========================
   RESOURCES
========================= */

export type ResourceKey =
  | "credits"
  | "ironOre"
  | "scrapAlloy"
  | "runeDust"
  | "emberCore"
  | "bioSamples"
  | "mossRations"
  /** Boss-only phase-2 named mats (void field boss kills). */
  | "coilboundLattice"
  | "ashSynodRelic"
  | "vaultLatticeShard"
  /** M6: restricted-war / mythic forge metal (boss-named pool). */
  | "ironHeart";

export type FeastHallOfferId =
  | "scavenger-broth"
  | "sample-stew"
  | "mouth-of-inti";

export type NextRunModifierId =
  | "scrap-kit"
  | "ember-stim"
  | "frost-stabilizer"
  | "void-extract";

export type NextRunEffectKey =
  | "SCRAP_KIT"
  | "EMBER_STIM"
  | "FROST_STABILIZER"
  | "VOID_EXTRACT";

export type NextRunModifiers = {
  id: NextRunModifierId;
  effectKey: NextRunEffectKey;
  title: string;
  nextRunEffect: string;
  /** Applied once when the next hunt starts. */
  applyOnStart?: {
    conditionGain?: number;
    hungerDelta?: number;
  };
  /** Applied to hunt settlement (reward + condition wear). */
  applyOnSettlement?: {
    rewardBonusPct?: number; // e.g. +15
    conditionDrainReduction?: number; // e.g. 3 (reduces drain)
    conditionDrainPenalty?: number; // e.g. 4 (adds risk)
  };
  /** Applied to shell-only combat feel (client practice). */
  applyInField?: {
    shellDamageBoostPct?: number; // e.g. 25
    floatDamageBoostPct?: number; // e.g. 25 (display-only)
  };
};

export type ResourcesState = Record<ResourceKey, number>;

export type MarketState = {
  stockByListingId: Record<string, number>;
};

export type LatestHuntResult = {
  missionId: string;
  huntTitle: string;
  resolvedAt: number;
  conditionDelta: number;
  conditionAfter: number;
  rankXpGained: number;
  masteryProgressGained: number;
  influenceGained: number;
  resourcesGained: Partial<ResourcesState>;
  /** Field pickups banked immediately during the run (separate from contract payout). */
  fieldLootGained?: Partial<ResourcesState>;
  /**
   * M2 hunger pressure tuning (resource sink):
   * - High hunger reduces payout quality and increases condition drain.
   * Stored so Hunt Result UI can explain the outcome without hidden math.
   */
  hungerPressureLabel?: "Fed" | "Low" | "Starving";
  hungerRewardPenaltyPct?: number; // 0..20
  hungerConditionDrainPenalty?: number; // extra condition drain applied to this run
  fusionRewardMultiplier?: number | null;
  fusionConditionDeltaOffset?: number;
  fusionCadenceLabel?: string | null;
  fusionPressureLabel?: string | null;
  // Base AFK reward snapshot (source of truth before realtime contribution bonus)
  baseRankXpGained?: number;
  baseMasteryProgressGained?: number;
  baseInfluenceGained?: number;
  baseResourcesGained?: Partial<ResourcesState>;

  // Realtime void-session contribution bonus applied on top of the base reward
  realtimeContributionBonusMultiplier?: number | null;
  realtimeContributionAppliedForResolvedAt?: number | null;
  realtimeRankXpBonusGained?: number;
  realtimeMasteryProgressBonusGained?: number;
  realtimeInfluenceBonusGained?: number;
  realtimeResourcesBonusGained?: Partial<ResourcesState>;

  // Realtime per-player contribution totals (used for roles/specialization later)
  realtimeTotalDamageDealt?: number;
  realtimeTotalHitsLanded?: number;
  realtimeMobsContributedTo?: number;
  realtimeMobsKilled?: number;
  realtimeExposedKills?: number;

  // Special-zone boss outcome (realtime event)
  bossDefeated?: boolean;

  // Aliases for run-complete UI readability
  kills?: number;
  damage?: number;
};

export type ActiveProcess = {
  id: string;
  kind: "exploration" | "hunt";
  status: "running" | "complete";
  title: string;
  sourceId: string | null;
  startedAt: number;
  endsAt: number;
};

/* =========================
   DISTRICT STATES
========================= */

export type ForgeStatus =
  | "idle"
  | "crafting"
  | "complete"
  | "active"
  | "locked";

export type ArenaStatus = "open" | "closed" | "locked";

export type MechaStatus =
  | "stable"
  | "upgrading"
  | "ready"
  | "unstable"
  | "locked";

export type MutationState = "dormant" | "active" | "critical";
export type AttunementState = "unbound" | "resonating" | "awakened";

export type GateStatus =
  | "sealed"
  | "available"
  | "traveling"
  | "standby"
  | "charging"
  | "open";

export type DistrictState = {
  forgeStatus: ForgeStatus;
  arenaStatus: ArenaStatus;
  mechaStatus: MechaStatus;
  mutationState: MutationState;
  attunementState: AttunementState;
  gateStatus: GateStatus;
};

/* =========================
   MISSIONS
========================= */

export type MissionReward = {
  rankXp: number;
  masteryProgress: number;
  conditionDelta: number;
  influence?: number;
  resources?: Partial<ResourcesState>;
};

export type MissionCategory = "operation" | "hunting-ground";

export type CanonBookRung =
  | "book-1"
  | "book-2"
  | "book-3"
  | "book-4"
  | "book-5"
  | "book-6"
  | "book-7"
  | "system";

export type MissionDefinition = {
  id: string;
  category: MissionCategory;
  title: string;
  description: string;
  path: PathType | "neutral";
  /** Canon expansion rung for safe roadmap sequencing (Book 1-7). */
  canonBook?: CanonBookRung;
  durationHours: number;
  reward: MissionReward;
  /** Void theatre for hunting contracts — drives doctrine pressure drift. */
  deployZoneId?: VoidZoneId;
};

export type MissionQueueEntry = {
  queueId: string;
  missionId: string;
  queuedAt: number;
  startsAt: number;
  endsAt: number;
  completedAt: number | null;
};

/* =========================
   PLAYER
========================= */

/** Stable identity for a single void deploy/redeploy (WS clientId + shard routing). */
export type VoidRealtimeBinding = {
  zoneId: string;
  sessionBucketId: number;
  clientId: string;
};

export type CareerFocus = "combat" | "gathering" | "crafting";

/** Phase 4 — one active broker work order tracked in the Crafting District. */
export type CraftWorkOrderSlot = {
  definitionId: string;
  progress: number;
};

/** Void field shell combat — rigs influence posture/expose math (`resolveShellHit`). */
export type FieldLoadoutProfile = "assault" | "support" | "breach";
export type LoadoutSlotId =
  | "weapon"
  | "armor"
  | "core"
  | "runeSet"
  | "professionBind";
export type LoadoutSlotsState = Record<LoadoutSlotId, string | null>;

export type PlayerState = {
  playerName: string;
  /**
   * True only after the player completes the New Game flow (`createNewPlayer`).
   * Used to force Puppy-first onboarding; legacy saves infer when the field is absent.
   */
  characterCreated: boolean;
  factionAlignment: FactionAlignment;
  /** Hub / profile portrait only — not used on Void Field. */
  characterPortraitId: CharacterPortraitId;
  /**
   * Player-chosen career focus. Drives light M1 modifiers: combat (+shell drill
   * damage), gathering (+field pickup amounts), crafting (−district recipe costs).
   */
  careerFocus: CareerFocus | null;

  /** Field loadout rig (local shell combat + preparation identity). */
  fieldLoadoutProfile: FieldLoadoutProfile;
  /** M3 loadout equip path: 5 slots wired to owned inventory gear. */
  loadoutSlots: LoadoutSlotsState;

  condition: number;
  hunger: number;
  conditionRecoveryAvailableAt: number;
  emergencyRationAvailableAt: number;
  lastConditionTickAt: number;
  /**
   * Feast Hall choice that sets `conditionRecoveryAvailableAt` (kitchen lockout).
   * UI uses this to show a subtle next-run handoff.
   */
  activeFeastHallOfferId: FeastHallOfferId | null;
  /** One-slot, non-stacking next-run kit crafted in Crafting District. */
  nextRunModifiers: NextRunModifiers | null;
  /** Idempotency: which hunt process already received on-start modifiers. */
  nextRunModifiersAppliedForProcessId: string | null;

  rank: string;
  rankLevel: number;
  rankXp: number;
  rankXpToNext: number;

  masteryProgress: number;
  influence: number;
  hasBiotechSpecimenLead: boolean;

  /**
   * Phase 3 — Void strain from contracts and survival pressure. High values add
   * extra condition loss on mission resolution; decays when stable, falls on recovery.
   */
  voidInstability: number;

  resources: ResourcesState;
  /** Field pickups accrued during the currently running hunt (cleared on run start/end). */
  fieldLootGainedThisRun: Partial<ResourcesState>;

  /** M3→M4: War Exchange storefront stock state. */
  market: MarketState;

  /** M3 crafting output: lightweight crafted item inventory (non-resource). */
  craftedInventory: Record<string, number>;

  /** Phase 4 — optional district work order (craft / bind quota + claim reward). */
  craftWorkOrder: CraftWorkOrderSlot | null;

  /**
   * Phase 4 — stall/workshop rent timeline (wall clock, evaluated on survival ticks).
   * When rent is due and credits are short, `stallArrearsCount` rises (broker markup).
   */
  lastStallRentResolvedAt: number;
  stallArrearsCount: number;

  knownRecipes: string[];
  unlockedRoutes: string[];
  navigation: NavigationState;

  districtState: DistrictState;
  activeProcess: ActiveProcess | null;
  lastHuntResult: LatestHuntResult | null;

  /**
   * When non-null, the client should maintain void realtime for this shard using `clientId`.
   * Set on deploy/redeploy; cleared after realtime bonus is applied for that run.
   */
  voidRealtimeBinding: VoidRealtimeBinding | null;

  // Long-term identity memory derived from realtime void sessions.
  behaviorStats: PlayerBehaviorStats;

  // Long-term zone specialization loop. Simple +1 per completed realtime run.
  zoneMastery: Record<string, number>;

  // Session retention: consecutive realtime runs completed in the same zone.
  // Updated on run completion (AFK hunt resolved + realtime bonus applied).
  lastCompletedZoneId: string | null;
  zoneRunStreak: number;

  missionQueue: MissionQueueEntry[];
  maxMissionQueueSlots: number;

  /** Hour 20–40 mastery spine: per-school depth, capacity pools, hybrid drain. */
  runeMastery: PlayerRuneMasteryState;

  /**
   * Regional doctrine control (Bio / Mecha / Pure), 0–100 triplet per void zone.
   * World sim for M1: shifts on hunt completion + realtime contribution.
   */
  zoneDoctrinePressure: Record<VoidZoneId, DoctrinePressure>;

  /** Mercenary guild ledger (Black Market collective). */
  guildContributionTotal: number;
  guildContributionLog: GuildContributionLogEntry[];
  /** M7: guild layer (local save + UI, serverless by default). */
  guild: GuildRosterState;
  guildContracts: SharedGuildContract[];

  /** Last claim for aligned faction HQ wage (ms epoch). */
  lastFactionHqStipendAt: number;

  /** M6 mythic ladder + arena rated shell. */
  mythicAscension: MythicAscensionState;
};

/* =========================
   GAME ROOT
========================= */

export type GameState = {
  player: PlayerState;
  missions: MissionDefinition[];
};

/* =========================
   ACTIONS
========================= */

export type GameAction =
  | { type: "SET_PLAYER_NAME"; payload: string }
  | { type: "SET_CHARACTER_PORTRAIT_ID"; payload: CharacterPortraitId }
  | { type: "SET_CAREER_FOCUS"; payload: CareerFocus | null }
  | { type: "SET_FIELD_LOADOUT_PROFILE"; payload: FieldLoadoutProfile }
  | { type: "EQUIP_LOADOUT_ITEM"; payload: { slot: LoadoutSlotId; itemId: string } }
  | { type: "UNEQUIP_LOADOUT_ITEM"; payload: { slot: LoadoutSlotId } }
  | { type: "SET_FACTION_ALIGNMENT"; payload: PathType }
  | { type: "ADD_RESOURCE"; payload: { key: ResourceKey; amount: number } }
  | {
      type: "ADD_FIELD_LOOT";
      payload: {
        key: ResourceKey;
        amount: number;
        /** When true, only bank resources + strain — skip `fieldLootGainedThisRun` (orb picks already recorded). */
        skipRunLedger?: boolean;
      };
    }
  | {
      type: "VOID_FIELD_ORB_COLLECTED";
      payload: { key: ResourceKey; amount: number };
    }
  | { type: "SPEND_RESOURCE"; payload: { key: ResourceKey; amount: number } }
  | { type: "GAIN_RANK_XP"; payload: number }
  | { type: "SET_RANK_LEVEL"; payload: number }
  | { type: "SET_RANK_NAME"; payload: string }
  | { type: "ADJUST_CONDITION"; payload: number }
  /** Phase 5 — ranked / tournament arena SR (clamped shell ladder). */
  | { type: "APPLY_ARENA_RANKED_SR_DELTA"; payload: number }
  | { type: "ADJUST_HUNGER"; payload: number }
  /** Phase 3 — apply Void strain delta (e.g. void field extraction). Clamped 0–100. */
  | { type: "APPLY_VOID_INSTABILITY_DELTA"; payload: number }
  | { type: "RECOVER_CONDITION" }
  | { type: "CRAFT_MOSS_RATION" }
  | { type: "CONSUME_MOSS_RATION" }
  | { type: "USE_EMERGENCY_RATION" }
  | { type: "MARKET_BUY"; payload: { listingId: string } }
  | { type: "MARKET_SELL"; payload: { key: ResourceKey; amount: number } }
  | { type: "CRAFT_RECIPE"; payload: { recipeId: string } }
  | { type: "ACCEPT_CRAFT_WORK_ORDER"; payload: { definitionId: string } }
  | { type: "CLAIM_CRAFT_WORK_ORDER" }
  | { type: "ABANDON_CRAFT_WORK_ORDER" }
  /** Phase 4 — clear stall arrears (one payment for all missed periods). */
  | { type: "PAY_STALL_ARREARS" }
  | { type: "CRAFT_NEXT_RUN_MODIFIER"; payload: { modifierId: NextRunModifierId } }
  | { type: "USE_FEAST_HALL_OFFER"; payload: { offerId: FeastHallOfferId } }
  | { type: "RESOLVE_HUNT"; payload: { missionId: string; resolvedAt?: number } }
  | {
      type: "APPLY_REALTIME_HUNT_BONUS";
      payload: {
        resolvedAt: number;
        bonusMultiplier: number;
        zoneId: string;
        totalDamageDealt?: number;
        totalHitsLanded?: number;
        mobsContributedTo?: number;
        mobsKilled?: number;
        /** M4: kills where the pack had an expose-window contribution. */
        exposedKills?: number;
        bossDefeated?: boolean;
        bossDropResourcesBase?: Partial<ResourcesState>;
        zoneThreatLevel?: number;
      };
    }
  | { type: "SET_VOID_REALTIME_BINDING"; payload: VoidRealtimeBinding | null }
  | {
      type: "START_EXPLORATION_PROCESS";
      payload: {
        id: string;
        kind?: ActiveProcess["kind"];
        title: string;
        sourceId?: string | null;
        startedAt?: number;
        endsAt: number;
      };
    }
  | { type: "RESOLVE_ACTIVE_PROCESS"; payload?: { now?: number } }
  | { type: "CLAIM_EXPLORATION_REWARD" }
  | { type: "CLEAR_ACTIVE_PROCESS" }
  | { type: "SET_MASTERY_PROGRESS"; payload: number }
  | { type: "QUEUE_MISSION"; payload: { missionId: string; queuedAt?: number } }
  | {
      type: "REMOVE_QUEUED_MISSION";
      payload: { queueId: string; removedAt?: number };
    }
  | { type: "PROCESS_MISSION_QUEUE"; payload: { now: number } }
  | { type: "CLAIM_MISSION"; payload: { queueId: string; claimedAt?: number } }
  | { type: "ADD_RECIPE"; payload: string }
  | {
      type: "VOID_MARKET_TRADE";
      payload: {
        side: "buy" | "sell";
        commodity: VoidMarketCommodity;
        units: number;
      };
    }
  | { type: "INSTALL_MINOR_RUNE"; payload: { school: PathType } }
  | { type: "UNLOCK_ROUTE"; payload: string }
  | { type: "SET_CURRENT_ROUTE"; payload: RouteNodeId }
  | { type: "REFRESH_AVAILABLE_ROUTES" }
  | { type: "ADD_INFLUENCE"; payload: number }
  | { type: "CLAIM_FACTION_HQ_STIPEND" }
  | {
      type: "ATTEMPT_MYTHIC_UNLOCK";
      payload:
        | "l3-rare-rune-set"
        | "rune-crafter-license"
        | "convergence-prime";
    }
  | {
      type: "REDEEM_RUNE_KNIGHT_VALOR";
      payload:
        | "mastery-boon"
        | "influence-seal"
        | "ivory-prestige-rite"
        | "arena-edge-sigil";
    }
  | { type: "CONSUME_ARENA_EDGE_SIGIL" }
  | { type: "GUILD_CREATE"; payload: { guildName: string } }
  | { type: "GUILD_JOIN"; payload: { guildCode: string } }
  | { type: "GUILD_LEAVE" }
  | {
      type: "GUILD_SET_PLEDGE";
      payload: { pledge: PlayerState["factionAlignment"] };
    }
  | { type: "GUILD_ADD_MEMBER"; payload: { callsign: string } }
  | { type: "GUILD_REMOVE_MEMBER"; payload: { memberId: string } }
  | { type: "GUILD_POST_CONTRACT"; payload: { templateId: string } }
  | { type: "GUILD_CLAIM_CONTRACT"; payload: { contractId: string } }
  | { type: "SET_FORGE_STATUS"; payload: ForgeStatus }
  | { type: "SET_ARENA_STATUS"; payload: ArenaStatus }
  | { type: "SET_MECHA_STATUS"; payload: MechaStatus }
  | { type: "SET_MUTATION_STATE"; payload: MutationState }
  | { type: "SET_ATTUNEMENT_STATE"; payload: AttunementState }
  | { type: "SET_GATE_STATUS"; payload: GateStatus }
  | { type: "HYDRATE_STATE"; payload: GameState }
  | { type: "RESET_GAME" };
