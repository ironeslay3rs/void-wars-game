/**
 * Guild System — shared types.
 *
 * Canon anchor:
 * - lore-canon/01 Master Canon/Locations/Black Market.md
 *     ("old guild history", "major factions")
 * - lore-canon/01 Master Canon/Locations/Black Market Lanes.md
 *     ("mixed survivor culture ... social, economic, psychological, and political zones")
 * - lore-canon/CLAUDE.md — empires are Verdant Coil / Chrome Synod / Ember Vault.
 *   "Pure" is always "Pure" (never "Spirit").
 *
 * A Guild is a player-owned Black Market crew. Members contribute toward
 * shared contracts; the ledger is pure data. Rank names pull from Black
 * Market survivor-crew flavor (Probationary → Vanguard Broker), matching
 * the existing guildScreenData voice.
 *
 * All types are pure data. No runtime coupling to reducers.
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import type { VoidZoneLootTheme } from "@/features/void-maps/zoneData";

export type GuildMemberRole = "founder" | "officer" | "member" | "initiate";

export type GuildMember = {
  id: string;
  displayName: string;
  role: GuildMemberRole;
  /** Lifetime contribution to this guild (sum across all contracts). */
  contribution: number;
  /** ISO-ish ms timestamp member joined (deterministic — caller supplies). */
  joinedAt: number;
};

/** Rank tier key — used by guildRanks + UI. */
export type GuildRankKey =
  | "probationary"
  | "bonded"
  | "vanguard"
  | "warden"
  | "blackcrown";

export type GuildPerkKey =
  | "reward_bonus_5"
  | "reward_bonus_10"
  | "reward_bonus_15"
  | "extra_contract_slot"
  | "second_extra_contract_slot"
  | "rapport_preserve";

export type GuildPerk = {
  key: GuildPerkKey;
  label: string;
  description: string;
  /** Multiplier applied to reward bundle on completeContract. 1 = no change. */
  rewardMultiplier?: number;
  /** Extra contract slots granted by this perk. */
  extraContractSlots?: number;
};

export type GuildRank = {
  key: GuildRankKey;
  label: string;
  /** Total guild contribution required to reach this rank. */
  threshold: number;
  /** Flavor line pulled from Black Market crew canon voice. */
  flavor: string;
  /** Perks granted AT this rank (cumulative with lower tiers). */
  perks: GuildPerkKey[];
};

/** Contract objective — what members contribute toward. */
export type ContractObjective =
  | {
      kind: "hunt_zone_theme";
      /** Mobs cleared in a zone of this loot theme. */
      theme: VoidZoneLootTheme;
    }
  | {
      kind: "craft_items";
      /** Any item crafted in any school counts. */
    }
  | {
      kind: "collect_material";
      /** Phase 2 named material (e.g. veinshard, heartIron, veilAsh, meldshard). */
      materialKey: ResourceKey;
    }
  | {
      kind: "clear_hollowfang";
      /** Any Hollowfang settlement counts as one. */
    }
  | {
      kind: "boss_kills";
      /** Void field boss mobs (isBoss flag). */
    };

/** Static reward bundle — reused by eventRewards.mergeResourceGrants. */
export type ContractRewardBundle = {
  /** Resources granted on completion (split by recorded contribution share). */
  resources: Partial<Record<ResourceKey, number>>;
  /** Contribution points credited to each contributor, proportional. */
  contributionGrant: number;
};

export type SharedContract = {
  id: string;
  title: string;
  /** Canon-adjacent blurb (Black Market crew voice). */
  flavor: string;
  objective: ContractObjective;
  /** Progress accumulated toward cap. */
  progress: number;
  /** Target amount; completion triggers when progress >= cap. */
  cap: number;
  reward: ContractRewardBundle;
  /** Deterministic expiry ms — caller clock, not Date.now(). */
  expiresAt: number;
  /** Tracked per-member contribution to this specific contract. */
  perMember: Record<string, number>;
  /** "active" while progress < cap && now < expiresAt. */
  status: "active" | "completed" | "expired";
};

export type Guild = {
  id: string;
  name: string;
  /** Canon flavor — optional empire allegiance (Verdant Coil etc). */
  allegiance: "verdant_coil" | "chrome_synod" | "ember_vault" | "black_city";
  members: GuildMember[];
  /** Active + completed contracts. Expired pruned by caller when desired. */
  contracts: SharedContract[];
  /** Lifetime total — sum of all member contributions. Drives rank. */
  totalContribution: number;
  rank: GuildRankKey;
  /** Base contract slots granted to every guild regardless of rank. */
  baseContractSlots: number;
};

export type GuildOutcome =
  | { ok: true; code: string; message: string }
  | { ok: false; code: string; message: string };

export type GuildStep = {
  guild: Guild;
  outcome: GuildOutcome;
};
