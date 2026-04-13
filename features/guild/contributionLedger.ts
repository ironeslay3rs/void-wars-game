/**
 * Contribution Ledger — pure helpers over Guild state.
 *
 * Every function returns a NEW Guild (immutable). No mutation of inputs.
 * Deterministic — no Date.now, no Math.random.
 *
 * Canon voice: the ledger is the crew's tally wall. In Black Market
 * survivor culture the wall settles every argument; we treat it that way.
 */

import type {
  Guild,
  GuildMember,
  GuildOutcome,
  GuildStep,
  SharedContract,
} from "@/features/guild/guildTypes";

export type LeaderboardRow = {
  memberId: string;
  displayName: string;
  contribution: number;
};

function cloneContract(c: SharedContract): SharedContract {
  return {
    ...c,
    reward: {
      resources: { ...c.reward.resources },
      contributionGrant: c.reward.contributionGrant,
    },
    perMember: { ...c.perMember },
  };
}

function cloneMember(m: GuildMember): GuildMember {
  return { ...m };
}

export function cloneGuild(g: Guild): Guild {
  return {
    ...g,
    members: g.members.map(cloneMember),
    contracts: g.contracts.map(cloneContract),
  };
}

function ok(code: string, message: string): GuildOutcome {
  return { ok: true, code, message };
}

function fail(code: string, message: string): GuildOutcome {
  return { ok: false, code, message };
}

/**
 * Record contribution amount from a member against a specific contract.
 * Progress is clamped to cap. Member + guild totals update together.
 * Rejects if: member missing, contract missing, contract not active, amount <= 0.
 */
export function recordContribution(
  guild: Guild,
  memberId: string,
  contractId: string,
  amount: number,
): GuildStep {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { guild, outcome: fail("bad_amount", "Contribution must be > 0.") };
  }
  const memberIdx = guild.members.findIndex((m) => m.id === memberId);
  if (memberIdx === -1) {
    return {
      guild,
      outcome: fail("no_member", `Member ${memberId} not in guild.`),
    };
  }
  const contractIdx = guild.contracts.findIndex((c) => c.id === contractId);
  if (contractIdx === -1) {
    return {
      guild,
      outcome: fail("no_contract", `Contract ${contractId} not found.`),
    };
  }
  const contract = guild.contracts[contractIdx];
  if (contract.status !== "active") {
    return {
      guild,
      outcome: fail(
        "contract_inactive",
        `Contract ${contractId} is ${contract.status}.`,
      ),
    };
  }

  const applied = Math.floor(Math.min(amount, contract.cap - contract.progress));
  if (applied <= 0) {
    return {
      guild,
      outcome: fail("contract_full", `Contract ${contractId} already at cap.`),
    };
  }

  const next = cloneGuild(guild);
  const nextContract = next.contracts[contractIdx];
  nextContract.progress += applied;
  nextContract.perMember[memberId] =
    (nextContract.perMember[memberId] ?? 0) + applied;
  if (nextContract.progress >= nextContract.cap) {
    // Do not auto-flip to completed here — completion requires
    // completeContract() so callers can deliver rewards atomically.
  }

  const nextMember = next.members[memberIdx];
  nextMember.contribution += applied;
  next.totalContribution += applied;

  return {
    guild: next,
    outcome: ok(
      "contribution_recorded",
      `+${applied} from ${nextMember.displayName} → ${nextContract.title}`,
    ),
  };
}

export function totalForMember(guild: Guild, memberId: string): number {
  const m = guild.members.find((x) => x.id === memberId);
  return m?.contribution ?? 0;
}

export function totalForContract(guild: Guild, contractId: string): number {
  const c = guild.contracts.find((x) => x.id === contractId);
  return c?.progress ?? 0;
}

/** Member leaderboard — sorted descending. Ties broken by joinedAt asc (seniority). */
export function leaderboard(guild: Guild): LeaderboardRow[] {
  const rows = guild.members.map((m) => ({
    memberId: m.id,
    displayName: m.displayName,
    contribution: m.contribution,
    joinedAt: m.joinedAt,
  }));
  rows.sort((a, b) => {
    if (b.contribution !== a.contribution) {
      return b.contribution - a.contribution;
    }
    return a.joinedAt - b.joinedAt;
  });
  return rows.map(({ memberId, displayName, contribution }) => ({
    memberId,
    displayName,
    contribution,
  }));
}

/** Member's share of a specific contract's progress (fraction 0..1). */
export function contractShare(
  guild: Guild,
  contractId: string,
  memberId: string,
): number {
  const c = guild.contracts.find((x) => x.id === contractId);
  if (!c || c.progress <= 0) return 0;
  const mine = c.perMember[memberId] ?? 0;
  return mine / c.progress;
}
