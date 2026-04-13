/**
 * Guild Actions — pure state-transformer functions.
 *
 * Each action takes a Guild (+ args) and returns { guild, outcome }.
 * No reducer wiring yet. Every function is deterministic and immutable.
 *
 * Canon anchors:
 * - lore-canon/01 Master Canon/Locations/Black Market.md (guild history)
 * - lore-canon/01 Master Canon/Locations/Black Market Lanes.md (crew voice)
 * - lore-canon/CLAUDE.md — "Pure" not "Spirit"; empire proper names.
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import {
  cloneGuild,
} from "@/features/guild/contributionLedger";
import {
  instantiateContract,
  type ContractTemplate,
} from "@/features/guild/contractRegistry";
import {
  rankExtraContractSlots,
  rankForContribution,
  rankRewardMultiplier,
} from "@/features/guild/guildRanks";
import type {
  Guild,
  GuildMember,
  GuildMemberRole,
  GuildRankKey,
  GuildStep,
  SharedContract,
} from "@/features/guild/guildTypes";

function ok(code: string, message: string) {
  return { ok: true as const, code, message };
}
function fail(code: string, message: string) {
  return { ok: false as const, code, message };
}

export type NewMemberInput = {
  id: string;
  displayName: string;
  role?: GuildMemberRole;
  joinedAt: number;
};

/** Add a new member to the guild. No-op (with outcome) if member exists. */
export function joinGuild(guild: Guild, input: NewMemberInput): GuildStep {
  if (guild.members.some((m) => m.id === input.id)) {
    return { guild, outcome: fail("already_member", `${input.displayName} already in guild.`) };
  }
  const member: GuildMember = {
    id: input.id,
    displayName: input.displayName,
    role: input.role ?? "initiate",
    contribution: 0,
    joinedAt: input.joinedAt,
  };
  const next = cloneGuild(guild);
  next.members.push(member);
  return {
    guild: next,
    outcome: ok("joined", `${member.displayName} joined ${next.name}.`),
  };
}

/**
 * Remove a member. A founder can leave — rank structure allows ownership
 * transfer upstream, but the pure layer doesn't enforce it. Contribution
 * already banked stays on the ledger for totals / contract progress.
 */
export function leaveGuild(guild: Guild, memberId: string): GuildStep {
  const idx = guild.members.findIndex((m) => m.id === memberId);
  if (idx === -1) {
    return { guild, outcome: fail("no_member", `Member ${memberId} not in guild.`) };
  }
  const next = cloneGuild(guild);
  const [removed] = next.members.splice(idx, 1);
  return {
    guild: next,
    outcome: ok("left", `${removed.displayName} left ${next.name}.`),
  };
}

/**
 * Claim (post) a new contract from a template. Respects rank-derived slot cap.
 */
export function claimContract(
  guild: Guild,
  template: ContractTemplate,
  now: number,
): GuildStep {
  const activeCount = guild.contracts.filter((c) => c.status === "active").length;
  const rank = rankForContribution(guild.totalContribution);
  const slotCap = guild.baseContractSlots + rankExtraContractSlots(rank);
  if (activeCount >= slotCap) {
    return {
      guild,
      outcome: fail(
        "slots_full",
        `Contract slots full (${activeCount}/${slotCap}). Advance rank or complete a contract.`,
      ),
    };
  }
  if (guild.contracts.some((c) => c.id === template.id && c.status === "active")) {
    return {
      guild,
      outcome: fail("duplicate_contract", `${template.title} already active.`),
    };
  }
  const next = cloneGuild(guild);
  next.contracts.push(instantiateContract(template, now));
  return {
    guild: next,
    outcome: ok("claimed", `Claimed ${template.title}.`),
  };
}

export type CompletedContractReward = {
  contractId: string;
  /** Per-member resource grants (sum of splits may be < bundle due to floor). */
  perMember: Record<string, Partial<Record<ResourceKey, number>>>;
  /** Per-member contribution-point grants. */
  contributionPerMember: Record<string, number>;
  /** The rank's reward multiplier applied on top of the bundle. */
  multiplierApplied: number;
};

/**
 * Mark a contract completed and compute reward splits per member, weighted
 * by each member's share of progress on that contract. Reward resources
 * are multiplied by the current rank's reward multiplier before splitting.
 */
export function completeContract(
  guild: Guild,
  contractId: string,
): GuildStep & { reward?: CompletedContractReward } {
  const idx = guild.contracts.findIndex((c) => c.id === contractId);
  if (idx === -1) {
    return { guild, outcome: fail("no_contract", `Contract ${contractId} not found.`) };
  }
  const contract = guild.contracts[idx];
  if (contract.status !== "active") {
    return {
      guild,
      outcome: fail("not_active", `Contract ${contractId} is ${contract.status}.`),
    };
  }
  if (contract.progress < contract.cap) {
    return {
      guild,
      outcome: fail(
        "not_ready",
        `Contract ${contractId} still at ${contract.progress}/${contract.cap}.`,
      ),
    };
  }

  const rank = rankForContribution(guild.totalContribution);
  const multiplier = rankRewardMultiplier(rank);

  const totalProgress = Object.values(contract.perMember).reduce(
    (a, b) => a + b,
    0,
  );
  const perMember: Record<string, Partial<Record<ResourceKey, number>>> = {};
  const contributionPerMember: Record<string, number> = {};

  if (totalProgress > 0) {
    for (const [memberId, amount] of Object.entries(contract.perMember)) {
      const share = amount / totalProgress;
      const resources: Partial<Record<ResourceKey, number>> = {};
      for (const [k, v] of Object.entries(contract.reward.resources) as [
        ResourceKey,
        number,
      ][]) {
        if (v == null) continue;
        const scaled = Math.floor(v * multiplier * share);
        if (scaled > 0) resources[k] = scaled;
      }
      perMember[memberId] = resources;
      contributionPerMember[memberId] = Math.floor(
        contract.reward.contributionGrant * share,
      );
    }
  }

  const next = cloneGuild(guild);
  next.contracts[idx] = { ...next.contracts[idx], status: "completed" };

  // Contribution-grant bonus banks onto each member's lifetime total.
  for (const [memberId, bonus] of Object.entries(contributionPerMember)) {
    if (bonus <= 0) continue;
    const mIdx = next.members.findIndex((m) => m.id === memberId);
    if (mIdx === -1) continue;
    next.members[mIdx] = {
      ...next.members[mIdx],
      contribution: next.members[mIdx].contribution + bonus,
    };
    next.totalContribution += bonus;
  }

  return {
    guild: next,
    outcome: ok("completed", `${contract.title} cleared.`),
    reward: {
      contractId,
      perMember,
      contributionPerMember,
      multiplierApplied: multiplier,
    },
  };
}

/**
 * Promote the guild's rank to whatever rankForContribution says it should
 * be. Pure — no side effects. If already at the correct rank, returns
 * unchanged with a no-op outcome.
 */
export function advanceRank(guild: Guild): GuildStep & { newRank?: GuildRankKey } {
  const target = rankForContribution(guild.totalContribution);
  if (target.key === guild.rank) {
    return {
      guild,
      outcome: fail("no_advance", `Still ${target.label}.`),
    };
  }
  const next = cloneGuild(guild);
  next.rank = target.key;
  return {
    guild: next,
    outcome: ok("rank_advanced", `Guild rank: ${target.label}.`),
    newRank: target.key,
  };
}

/** Mark a contract expired if now >= expiresAt. Pure, deterministic. */
export function expireContract(
  guild: Guild,
  contractId: string,
  now: number,
): GuildStep {
  const idx = guild.contracts.findIndex((c) => c.id === contractId);
  if (idx === -1) {
    return { guild, outcome: fail("no_contract", `Contract ${contractId} not found.`) };
  }
  const c = guild.contracts[idx];
  if (c.status !== "active") {
    return { guild, outcome: fail("not_active", `Contract ${contractId} is ${c.status}.`) };
  }
  if (now < c.expiresAt) {
    return { guild, outcome: fail("not_yet", `Contract ${contractId} still has time.`) };
  }
  const next = cloneGuild(guild);
  next.contracts[idx] = { ...c, status: "expired" };
  return {
    guild: next,
    outcome: ok("expired", `${c.title} expired unclaimed.`),
  };
}

/** Factory — create an empty guild. Useful for tests + initial state. */
export function createGuild(input: {
  id: string;
  name: string;
  founder: NewMemberInput;
  allegiance?: Guild["allegiance"];
  baseContractSlots?: number;
}): Guild {
  const founder: GuildMember = {
    id: input.founder.id,
    displayName: input.founder.displayName,
    role: "founder",
    contribution: 0,
    joinedAt: input.founder.joinedAt,
  };
  const _sharedContracts: SharedContract[] = [];
  return {
    id: input.id,
    name: input.name,
    allegiance: input.allegiance ?? "black_city",
    members: [founder],
    contracts: _sharedContracts,
    totalContribution: 0,
    rank: "probationary",
    baseContractSlots: input.baseContractSlots ?? 2,
  };
}
