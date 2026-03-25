import type {
  NavigationState,
  RouteNodeId,
} from "@/features/navigation/navigationTypes";

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
  | "mossRations";

export type FeastHallOfferId =
  | "scavenger-broth"
  | "sample-stew"
  | "mouth-of-inti";

export type ResourcesState = Record<ResourceKey, number>;

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

export type MissionDefinition = {
  id: string;
  category: MissionCategory;
  title: string;
  description: string;
  path: PathType | "neutral";
  durationHours: number;
  reward: MissionReward;
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

export type PlayerState = {
  playerName: string;
  factionAlignment: FactionAlignment;

  condition: number;
  hunger: number;
  conditionRecoveryAvailableAt: number;
  lastConditionTickAt: number;

  rank: string;
  rankLevel: number;
  rankXp: number;
  rankXpToNext: number;

  masteryProgress: number;
  influence: number;
  hasBiotechSpecimenLead: boolean;

  resources: ResourcesState;

  knownRecipes: string[];
  unlockedRoutes: string[];
  navigation: NavigationState;

  districtState: DistrictState;
  activeProcess: ActiveProcess | null;
  lastHuntResult: LatestHuntResult | null;

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
  | { type: "SET_FACTION_ALIGNMENT"; payload: PathType }
  | { type: "ADD_RESOURCE"; payload: { key: ResourceKey; amount: number } }
  | { type: "SPEND_RESOURCE"; payload: { key: ResourceKey; amount: number } }
  | { type: "GAIN_RANK_XP"; payload: number }
  | { type: "SET_RANK_LEVEL"; payload: number }
  | { type: "SET_RANK_NAME"; payload: string }
  | { type: "ADJUST_CONDITION"; payload: number }
  | { type: "ADJUST_HUNGER"; payload: number }
  | { type: "RECOVER_CONDITION" }
  | { type: "CRAFT_MOSS_RATION" }
  | { type: "CONSUME_MOSS_RATION" }
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
        bossDefeated?: boolean;
        bossDropResourcesBase?: Partial<ResourcesState>;
        zoneThreatLevel?: number;
      };
    }
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
  | { type: "UNLOCK_ROUTE"; payload: string }
  | { type: "SET_CURRENT_ROUTE"; payload: RouteNodeId }
  | { type: "REFRESH_AVAILABLE_ROUTES" }
  | { type: "ADD_INFLUENCE"; payload: number }
  | { type: "SET_FORGE_STATUS"; payload: ForgeStatus }
  | { type: "SET_ARENA_STATUS"; payload: ArenaStatus }
  | { type: "SET_MECHA_STATUS"; payload: MechaStatus }
  | { type: "SET_MUTATION_STATE"; payload: MutationState }
  | { type: "SET_ATTUNEMENT_STATE"; payload: AttunementState }
  | { type: "SET_GATE_STATUS"; payload: GateStatus }
  | { type: "HYDRATE_STATE"; payload: GameState }
  | { type: "RESET_GAME" };
