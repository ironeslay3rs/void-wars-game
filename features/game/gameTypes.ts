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

export type RunArchetype = "safe" | "balanced" | "greedy" | "volatile";

export type FeastHallOfferId =
  | "scavenger-broth"
  | "sample-stew"
  | "mouth-of-inti";

export type NextRunModifierId =
  | "scrap-kit"
  | "ember-stim"
  | "frost-stabilizer"
  | "void-extract"
  | "heat-sink-patch"
  | "salvage-rigging"
  | "extract-balm";

export type NextRunEffectKey =
  | "SCRAP_KIT"
  | "EMBER_STIM"
  | "FROST_STABILIZER"
  | "VOID_EXTRACT"
  | "HEAT_SINK_PATCH"
  | "SALVAGE_RIGGING"
  | "EXTRACT_BALM";

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
    /** Flat points trimmed from run heat after this settlement’s heat tick (prep kits). */
    runInstabilityGainReduction?: number;
  };
  /** Applied to shell-only combat feel (client practice). */
  applyInField?: {
    shellDamageBoostPct?: number; // e.g. 25
    floatDamageBoostPct?: number; // e.g. 25 (display-only)
    /** Orb + extract salvage amounts multiplied during the primed run. */
    fieldLootBonusPct?: number;
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

  /** M1 — citadel carry meter readout after this settlement (no hidden overload). */
  carryPressureSummary?: string;
  /** M1 — War Exchange sell-demand lines for materials in this payout window. */
  warExchangeSellPressureLines?: string[];
};

/** Queued void hunting contract — captured at pickup for readable expedition context. */
export type ExpeditionContractSnapshot = {
  contractId: string;
  targetLabel: string;
  deployZoneId?: VoidZoneId;
  expectedRewardSummary: string;
  riskStrainPotential: string;
  queuedAt: number;
};

/**
 * Single ledger object for void-field extraction (orb haul → citadel bank).
 * Produced only by `COMMIT_VOID_FIELD_EXTRACTION` in the game reducer.
 */
export type VoidFieldExtractionLedgerResult = {
  zoneName: string;
  zoneId?: string;
  resolvedAt: number;
  kills: number;
  /** Run ledger totals attempted at the gate (pre-bank). */
  ledgerLootAttempted: Partial<ResourcesState>;
  resourcesBanked: Partial<ResourcesState>;
  /** Boosted amounts that could not fit (overload / capacity gate). */
  resourcesRejected: Partial<ResourcesState>;
  pickupStrainFromBanking: number;
  extractionStrainDelta: number;
  rankXpGained: number;
  conditionSpent: number;
  carryBefore: { used: number; max: number; isOverloaded: boolean };
  carryAfter: { used: number; max: number; isOverloaded: boolean };
  /** Plain-language reason when salvage was trimmed or pack is overloaded. */
  overloadWhy: string | null;
  warExchangeSellPressureLines: string[];
  resourcesAfterBanking: ResourcesState;
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

export type MissionOriginTagId =
  | "bonehowl-remnant"
  | "olympus-castoff"
  | "crimson-altar-contraband"
  | "pharos-surplus"
  | "mandate-salvage"
  | "mouth-of-inti-relic"
  | "thousand-hands-fragment"
  | "black-market-local";

export type MissionDefinition = {
  id: string;
  category: MissionCategory;
  title: string;
  description: string;
  /** Rumor-board flavor — how this mission sounds on the Black Market rumor board. */
  rumorFlavor?: string;
  path: PathType | "neutral";
  /** Canon expansion rung for safe roadmap sequencing (Book 1-7). */
  canonBook?: CanonBookRung;
  /** Where this opportunity leaked from (nation war, local scam, faction surplus). */
  originTag?: MissionOriginTagId;
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

/** Ephemeral UI feedback after `CRAFT_RECIPE` (not persisted across hydrate). */
export type LastCraftOutcome = {
  at: number;
  recipeId: string;
  recipeName: string;
  ok: boolean;
  /** Present when `ok`; false = failed bind (mats still spent). */
  success: boolean | null;
  detail: string;
};

/** Ephemeral UI feedback after `INSTALL_MINOR_RUNE` (not persisted across hydrate). */
export type LastRuneInstallOutcome =
  | { at: number; school: PathType; ok: true; newDepth: number }
  | { at: number; school: PathType; ok: false; reason: string };

export type MythicGateBreakthroughKind =
  | "l3-rare-rune-set"
  | "rune-crafter-license"
  | "convergence-prime";

/** Ephemeral banner + pulse after `ATTEMPT_MYTHIC_UNLOCK` (cleared on save load). */
export type LastMythicGateBreakthrough = {
  at: number;
  gate: MythicGateBreakthroughKind;
  headline: string;
  detail: string;
};

/**
 * Hidden convergence tracking — seeded in PlayerState but never surfaced in UI.
 * The fusion of Body + Mind + Soul is the forbidden truth of the Sevenfold Rune
 * universe. This data exists so the architecture supports late-game discovery
 * without refactoring. No reducer writes to this yet.
 */
export type CrossSchoolExposure = {
  /** Count of off-path materials the player has held (even briefly). */
  offPathMaterialsEncountered: number;
  /** Has the player ever experienced a mismatch event? */
  mismatchEncountered: boolean;
  /** Has the player used ANY material from each school? */
  schoolsExposed: { bio: boolean; mecha: boolean; pure: boolean };
  /** Hidden counter: increments on cross-school actions. */
  anomalyScore: number;
};

export type PlayerState = {
  playerName: string;
  /**
   * True only after the player completes the New Game flow (`createNewPlayer`).
   * Used to force Puppy-first onboarding; legacy saves infer when the field is absent.
   */
  characterCreated: boolean;
  factionAlignment: FactionAlignment;
  /**
   * Phase 6 / The Open World Awakens: the player's chosen school within their
   * empire. One of the 7 canonical school ids (e.g. "bonehowl-of-fenrir") or
   * null when unbound or pre-Phase 6 saves load. The school must always belong
   * to the empire indicated by `factionAlignment`. Stored as `string | null`
   * here to avoid a circular import; consumers should validate against
   * features/schools/schoolData when reading.
   */
  affinitySchoolId: string | null;
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
  /**
   * Set on Expedition deploy when readiness band is "ready". Consumed on first
   * hunting-ground settlement: small condition cushion on closeout (client-only).
   */
  expeditionReadyStabilityPending: boolean;

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

  /**
   * Mana — the canonical positive-pressure resource opposite to voidInstability.
   * Tied to law, memory, power, and adaptation per `lore-canon/01 Master
   * Canon/Mana/Mana System.md`. Earned from mission settlements and Feast Hall
   * services; spent via the mana → void instability vent on the Status screen.
   * School-flavored display name lives in `features/mana/manaSelectors.ts`.
   */
  mana: number;
  manaMax: number;

  /**
   * Per-run "heat" (0–100): climbs during hunts, realtime raids, and gray-market moves.
   * Resets on void extraction or returning to hub. Separate from void strain.
   */
  runInstability: number;
  /** Recent run-heat events (threshold crosses + context); capped in helpers. */
  runInstabilityLog: Array<{ at: number; message: string }>;

  /**
   * Optional one-shot payout amp from intentional "push heat" (expires wall-clock).
   * Consumed on next mission/hunt settlement while valid.
   */
  runHeatPushBoost: { rewardMult: number; expiresAt: number } | null;

  /**
   * Greed streak: counts consecutive contract settlements that end with run heat ≥ 40.
   * Resets below threshold, on vent below 40, hub/extract, or meltdown.
   */
  instabilityStreakTurns: number;

  /**
   * Auto-detected run style from recent settlements (avg heat), greed streak, and vent/push usage.
   * Updated when a contract settles.
   */
  runArchetype: RunArchetype;
  /** Rolling post-settlement run heat samples (0–100) for averaging / volatility. */
  runStyleRiSamples: number[];
  /** Lifetime tally: successful vent heat actions (feeds “safe”). */
  runStyleVentCount: number;
  /** Lifetime tally: successful push heat actions (feeds “greedy”). */
  runStylePushCount: number;

  resources: ResourcesState;
  /** Field pickups accrued during the currently running hunt (cleared on run start/end). */
  fieldLootGainedThisRun: Partial<ResourcesState>;

  /**
   * M1 expedition contract snapshots (hunting-ground rows only), keyed by `queueId`.
   * Dropped when that row resolves or is removed from the queue.
   */
  expeditionContractSnapshots: Record<string, ExpeditionContractSnapshot>;

  /**
   * M1 void-field extraction outcome (single action path). Ephemeral UI payload; null on fresh hydrate.
   */
  lastVoidFieldExtractionLedger: VoidFieldExtractionLedgerResult | null;

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
  /**
   * UI / copy: concurrent run-pressure tags (queued contracts + optional field thread).
   * Derived — do not mutate directly; `gameReducer` and save load recompute.
   */
  activeRuns: string[];
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

  /** Cleared after UI reads it; always null on save hydrate. */
  lastCraftOutcome: LastCraftOutcome | null;

  /** Cleared after UI reads it; always null on save hydrate. */
  lastRuneInstallOutcome: LastRuneInstallOutcome | null;

  /** Mythic gate just cleared — strong log line + UI pulse; null on hydrate. */
  lastMythicGateBreakthrough: LastMythicGateBreakthrough | null;

  /**
   * Hidden convergence seed — tracks cross-school material exposure.
   * No reducer writes to this in Phase 1. No UI reads it.
   * Exists so the data shape supports late-game discovery without refactoring.
   */
  crossSchoolExposure: CrossSchoolExposure;

  /**
   * Ephemeral anomaly toast — fires ONCE per cross-school combination.
   * Cleared after UI reads it; null on save hydrate.
   */
  lastAnomalyToast: { text: string; school: PathType; at: number } | null;

  /** Broker interaction cooldowns — maps brokerId to last-interaction timestamp. */
  brokerCooldowns: Record<string, number>;

  /**
   * Per-broker rapport score (0-100). Gated dialogue choices + unlocks
   * read this. Block 2 — Broker Dialogue.
   */
  brokerRapport: Record<string, number>;

  /**
   * Per-broker unlocked dialogue keys. Lets dialogue trees + interaction
   * registries gate deeper offers on narrative progress (e.g. Lars's
   * canon "Moon-blessed" premium stock unlocks at rapport ≥ 50 via a
   * specific dialogue path). Block 2 — Broker Dialogue.
   */
  brokerDialogueUnlocks: Record<string, string[]>;

  /**
   * Last-contact timestamp per broker. Used by the rapport decay
   * system — brokers whose rapport stays warm only if the player
   * visits within the grace window. Advances on any broker
   * interaction or dialogue choice. Block 2 — Rapport Decay.
   */
  brokerLastContactAt: Record<string, number>;

  /**
   * Humanity Keepsakes — per-broker flag set when rapport reaches
   * 80. Grants +1% reward bonus each, stacking up to the cap. Canon
   * source: Humanity Theme.md ("strength through the sacrifices
   * made for them by others"). Not revokable — rapport decay does
   * not remove a granted Keepsake.
   */
  brokerKeepsakes: Record<string, boolean>;

  /**
   * Pantheon visit blessing — one-shot token earned by visiting the
   * pantheon HQ tied to the player's affinity school. Consumed by the
   * next mission settlement, granting a flat reward bonus
   * (`PANTHEON_BLESSING_REWARD_BONUS_PCT`). Foundation slice for the
   * walkable pantheon layer.
   */
  pantheonBlessingPending: boolean;

  /**
   * Active shell combat buffs from `ACTIVATE_SHELL_ABILITY` (e.g. Surge).
   * Each entry has an `expiresAt` timestamp; selectors prune expired
   * entries lazily so no background tick is required. Foundation slice
   * for the M3 combat engine integration; current realtime combat code
   * does not yet read this list.
   */
  activeShellBuffs: import("@/features/combat/shellAbilities").ShellBuff[];
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
  /**
   * M1 — Bank `fieldLootGainedThisRun` through one reducer path (strain, carry, War Exchange copy).
   * Server-authoritative amounts still arrive via `VOID_FIELD_ORB_COLLECTED` first.
   */
  | {
      type: "COMMIT_VOID_FIELD_EXTRACTION";
      payload: {
        kills: number;
        zoneName: string;
        zoneId?: string;
        nowMs?: number;
      };
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
  | { type: "BLACK_MARKET_BUY"; payload: { listingId: string } }
  | {
      type: "BLACK_MARKET_SELL";
      payload: { key: ResourceKey; amount: number };
    }
  | { type: "CRAFT_RECIPE"; payload: { recipeId: string } }
  | { type: "CLEAR_LAST_CRAFT_OUTCOME" }
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
  | { type: "CLEAR_LAST_RUNE_INSTALL_OUTCOME" }
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
  | { type: "RESET_GAME" }
  | {
      type: "SET_EXPEDITION_READY_STABILITY_PENDING";
      payload: { value: boolean };
    }
  | { type: "RESET_RUN_INSTABILITY" }
  | { type: "VENT_RUN_INSTABILITY" }
  | { type: "PUSH_RUN_INSTABILITY"; payload?: { nowMs?: number } }
  | { type: "BROKER_INTERACT"; payload: { brokerId: string } }
  | {
      type: "ADJUST_BROKER_RAPPORT";
      payload: { brokerId: string; delta: number };
    }
  | {
      type: "GRANT_BROKER_DIALOGUE_UNLOCK";
      payload: { brokerId: string; unlockKey: string };
    }
  | { type: "SET_AFFINITY_SCHOOL"; payload: { schoolId: string | null } }
  | {
      type: "RECORD_CROSS_SCHOOL_EVENT";
      payload: { school: PathType };
    }
  | { type: "MANA_GAIN"; payload: { amount: number; reason?: string } }
  | { type: "MANA_SPEND"; payload: { amount: number; reason?: string } }
  | { type: "MANA_RESTORE_FULL" }
  | { type: "VENT_MANA_TO_VOID_INSTABILITY" }
  | { type: "SET_MANA_MAX"; payload: { max: number } }
  | { type: "MANA_BURN_FOR_MASTERY" }
  | { type: "MANA_BURN_FOR_CONDITION" }
  | { type: "MANA_BURN_FOR_HUNGER" }
  | { type: "GRANT_PANTHEON_BLESSING"; payload: { pantheonId: string } }
  | { type: "CLEAR_PANTHEON_BLESSING" }
  | { type: "MANA_INSTALL_MINOR_RUNE"; payload: { school: PathType } }
  | {
      type: "ACTIVATE_SHELL_ABILITY";
      payload: {
        abilityId: import("@/features/combat/shellAbilities").ShellAbilityId;
        nowMs?: number;
      };
    }
  | { type: "APPLY_DEATH_PENALTY" }
  | {
      type: "TRIGGER_CONVERGENCE_REVEAL";
      payload?: { nowMs?: number };
    }
  | {
      type: "STRIKE_BLACK_MARKET_DEAL";
      payload: {
        /** Stable id for the deal — used for telemetry + toast keying. */
        dealId: string;
        /** Resource cost (already adjusted for institutional pressures). */
        costs: Partial<ResourcesState>;
        /** Resource grant (already adjusted for institutional pressures). */
        resourceGains?: Partial<ResourcesState>;
        /** Optional condition delta to apply on success. */
        conditionGain?: number;
        /** Optional hunger delta to apply on success. */
        hungerGain?: number;
      };
    };
