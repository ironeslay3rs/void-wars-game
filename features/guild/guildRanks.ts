/**
 * Guild Ranks & Perks — pure data + lookup.
 *
 * Canon anchors:
 * - features/guild/guildScreenData.ts already uses
 *     "Probationary → Bonded contractor → Vanguard broker" voice.
 *   We extend that ladder upward with two more Black-Market-native tiers
 *   (Warden, Blackcrown) — still within the survivor-crew register, still
 *   empire-neutral (guilds sit under Black City allegiance by default).
 * - lore-canon/CLAUDE.md — empire proper names; "Pure" never "Spirit".
 *   No rank here borrows an empire name — guilds are crew-scale.
 *
 * Ranks are thresholded by guild.totalContribution. Each rank unlocks
 * perks cumulatively (a rank's perks include every lower rank's perks).
 */

import type {
  GuildPerk,
  GuildPerkKey,
  GuildRank,
  GuildRankKey,
} from "@/features/guild/guildTypes";

export const GUILD_PERKS: Record<GuildPerkKey, GuildPerk> = {
  reward_bonus_5: {
    key: "reward_bonus_5",
    label: "Fence Markup +5%",
    description: "Crew contacts squeeze an extra cut out of every contract.",
    rewardMultiplier: 1.05,
  },
  reward_bonus_10: {
    key: "reward_bonus_10",
    label: "Fence Markup +10%",
    description: "Higher-tier fences answer the crew's knock.",
    rewardMultiplier: 1.1,
  },
  reward_bonus_15: {
    key: "reward_bonus_15",
    label: "Fence Markup +15%",
    description: "Blackcity brokers front the crew credit on every payout.",
    rewardMultiplier: 1.15,
  },
  extra_contract_slot: {
    key: "extra_contract_slot",
    label: "Extra Contract Slot",
    description: "Run one more shared contract at a time.",
    extraContractSlots: 1,
  },
  second_extra_contract_slot: {
    key: "second_extra_contract_slot",
    label: "Second Extra Slot",
    description: "Blackcrown standing opens a second overflow slot.",
    extraContractSlots: 1,
  },
  rapport_preserve: {
    key: "rapport_preserve",
    label: "Rapport Preservation",
    description:
      "Guild standing blunts rapport decay across broker contacts while any contract is active.",
  },
};

export const GUILD_RANKS: GuildRank[] = [
  {
    key: "probationary",
    label: "Probationary",
    threshold: 0,
    flavor: "You knocked. The door opened. Prove the knock mattered.",
    perks: [],
  },
  {
    key: "bonded",
    label: "Bonded Contractor",
    threshold: 240,
    flavor:
      "The crew signs your name on the contracts. The fence knows your cut now.",
    perks: ["reward_bonus_5"],
  },
  {
    key: "vanguard",
    label: "Vanguard Broker",
    threshold: 900,
    flavor:
      "Vanguards walk the lanes without paying toll. You broker on behalf of the crew.",
    perks: ["reward_bonus_5", "reward_bonus_10", "extra_contract_slot"],
  },
  {
    key: "warden",
    label: "Lane Warden",
    threshold: 2400,
    flavor:
      "Black City doesn't hand out titles. Wardens are whoever the lanes stop arguing with.",
    perks: [
      "reward_bonus_5",
      "reward_bonus_10",
      "extra_contract_slot",
      "rapport_preserve",
    ],
  },
  {
    key: "blackcrown",
    label: "Blackcrown",
    threshold: 6000,
    flavor:
      "No coronation. Just the quiet day every crew in the Market calls your guild by name.",
    perks: [
      "reward_bonus_5",
      "reward_bonus_10",
      "reward_bonus_15",
      "extra_contract_slot",
      "second_extra_contract_slot",
      "rapport_preserve",
    ],
  },
];

export function rankForContribution(totalContribution: number): GuildRank {
  let current = GUILD_RANKS[0];
  for (const rank of GUILD_RANKS) {
    if (totalContribution >= rank.threshold) {
      current = rank;
    } else {
      break;
    }
  }
  return current;
}

export function getRank(key: GuildRankKey): GuildRank {
  const r = GUILD_RANKS.find((x) => x.key === key);
  // probationary is the floor fallback (threshold 0).
  return r ?? GUILD_RANKS[0];
}

export function getPerk(key: GuildPerkKey): GuildPerk {
  return GUILD_PERKS[key];
}

/** Highest reward multiplier among the rank's perks (default 1). */
export function rankRewardMultiplier(rank: GuildRank): number {
  let best = 1;
  for (const perkKey of rank.perks) {
    const mult = GUILD_PERKS[perkKey].rewardMultiplier;
    if (mult != null && mult > best) best = mult;
  }
  return best;
}

/** Total extra contract slots summed across the rank's perks. */
export function rankExtraContractSlots(rank: GuildRank): number {
  let extra = 0;
  for (const perkKey of rank.perks) {
    const slots = GUILD_PERKS[perkKey].extraContractSlots;
    if (slots != null) extra += slots;
  }
  return extra;
}

export function nextRank(current: GuildRankKey): GuildRank | null {
  const idx = GUILD_RANKS.findIndex((r) => r.key === current);
  if (idx === -1 || idx === GUILD_RANKS.length - 1) return null;
  return GUILD_RANKS[idx + 1];
}
