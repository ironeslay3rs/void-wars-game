export type FactionAlignment = "unbound" | "bio" | "mecha" | "spirit";
export type PathType = Exclude<FactionAlignment, "unbound">;

/* =========================
   RESOURCES
========================= */

export type ResourceKey =
  | "credits"
  | "ironOre"
  | "scrapAlloy"
  | "runeDust"
  | "emberCore"
  | "bioSamples";

export type ResourcesState = Record<ResourceKey, number>;

/* =========================
   DISTRICT STATES
========================= */

export type ForgeStatus = "idle" | "active" | "locked";
export type ArenaStatus = "open" | "closed" | "locked";
export type MechaStatus = "stable" | "unstable" | "locked";
export type MutationState = "dormant" | "active" | "critical";
export type AttunementState = "unbound" | "resonating" | "awakened";
export type GateStatus = "sealed" | "available" | "traveling";

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

export type MissionDefinition = {
  id: string;
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

  rank: string;
  rankLevel: number;
  rankXp: number;
  rankXpToNext: number;

  masteryProgress: number;
  influence: number;

  resources: ResourcesState;

  knownRecipes: string[];
  unlockedRoutes: string[];

  districtState: DistrictState;

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
  | { type: "ADD_INFLUENCE"; payload: number }
  | { type: "SET_FORGE_STATUS"; payload: ForgeStatus }
  | { type: "SET_ARENA_STATUS"; payload: ArenaStatus }
  | { type: "SET_MECHA_STATUS"; payload: MechaStatus }
  | { type: "SET_MUTATION_STATE"; payload: MutationState }
  | { type: "SET_ATTUNEMENT_STATE"; payload: AttunementState }
  | { type: "SET_GATE_STATUS"; payload: GateStatus }
  | { type: "HYDRATE_STATE"; payload: GameState }
  | { type: "RESET_GAME" };